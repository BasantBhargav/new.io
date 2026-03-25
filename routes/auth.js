// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('../schema/user'); 
const PendingUser = require('../schema/pendingUser'); 
const Counter = require('../schema/counter'); 

async function getNextSequence(name) {
    const counter = await Counter.findOneAndUpdate(
        { name: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

// 📧 Setup for Forgot Password (OTP)
const nodemailer = require('nodemailer');
const otpStore = {}; 

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "basantbhargav335@gmail.com",
        pass: "mqsk yvka xzms knof" 
    }
});

// ================= SIGNUP =================
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/signup.html'));
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const userId = await getNextSequence('user');
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔒 IMPORTANT FIX: destroy any old session
        if (req.session) {
            req.session.destroy(() => {});
        }

        // ===== PATIENT SIGNUP =====
        if (role === 'patient') {
            const newUser = new User({
                _id: userId,
                name,
                email,
                phone,
                role: 'patient',
                password_hash: hashedPassword,
                verified: true, // Auto-verified for now
                created_at: new Date()
            });

            await newUser.save();

            // Auto-login after signup
            // req.session.userId = newUser._id;
            // req.session.role = newUser.role;
            // req.session.name = newUser.name;

            return res.redirect('/login');
        }

        // ===== DOCTOR / HOSPITAL / LABORATORY SIGNUP =====
        if (role === 'doctor' || role === 'hospital_staff' || role === 'laboratory') {
            const pendingUser = new PendingUser({
                _id: userId,
                name,
                email,
                phone,
                role,
                password_hash: hashedPassword,
                extraData: { ...req.body },
                created_at: new Date()
            });
            await pendingUser.save();

            return res.send(`
                <script>
                    alert('Your signup request has been sent for admin approval.');
                    window.location.href='/login';
                </script>
            `);
        }


        res.status(400).send("Invalid role: " + role);

    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).send("Signup failed");
    }
});

// ================= LOGIN =================
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/login.html'));
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ email: username }, { name: username }]
        });

        if (!user) return res.status(401).send("User not found");

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).send("Invalid password");

        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.name = user.name;
        
        console.log(`✅ Login Success: User ${user.name} (${user._id}) as role: ${user.role}`);

        if (user.role === 'admin') return res.redirect('/admindashboard');
        if (user.role === 'doctor') return res.redirect('/doctordashboard');
        if (user.role === 'patient') return res.redirect('/patientdashboard');
        if (user.role === 'hospital_staff') return res.redirect('/hospitaldashboard');
        if (user.role === 'laboratory') return res.redirect('/labdashboard');

        res.redirect('/home');

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).send("Login failed");
    }
});

// ================= FORGOT PASSWORD =================
router.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/forgot-password.html'));
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Email not found." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore[email] = { otp, expires: Date.now() + 300000 }; 

        await transporter.sendMail({
            from: '"MediVault Security" <basantbhargav335@gmail.com>',
            to: email,
            subject: "MediVault Password Reset OTP",
            text: `Hello, Your MediVault Password Reset OTP is ${otp}. Valid for 5 minutes.`
        });

        console.log(`✅ OTP sent to ${email}: ${otp}`);
        res.status(200).json({ success: true, message: "✅ OTP sent to your email." });
    } catch (err) {
        console.error("❌ Error sending OTP:", err);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record || record.expires < Date.now() || record.otp != otp) {
        return res.status(400).json({ success: false });
    }

    otpStore[email].verified = true;
    res.json({ success: true });
});

router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!otpStore[email]?.verified) {
        return res.status(403).json({ success: false });
    }

    try {
        const user = await User.findOne({ email });
        user.password_hash = await bcrypt.hash(newPassword, 10);
        await user.save();
        delete otpStore[email];
        res.json({ success: true });
    } catch {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
