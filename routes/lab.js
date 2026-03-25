const express = require('express');
const router = express.Router();
const Laboratory = require('../schema/laboratory');
const LabTestRequest = require('../schema/labtest_request');
const User = require('../schema/user');
const Notification = require('../schema/notification');
const path = require('path');
const multer = require('multer');

// ✅ Middleware to check role
const requireLabRole = (req, res, next) => {
    if (!req.session.userId || req.session.role !== 'laboratory') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
};

// Multer Storage Configuration (Modified for Reports)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/reports';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 🧪 GET LAB INFO
router.get('/api/lab/info', requireLabRole, async (req, res) => {
    try {
        const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
        if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

        const pendingCount = await LabTestRequest.countDocuments({ lab_id: lab._id, status: 'Pending' });
        const completedCount = await LabTestRequest.countDocuments({ 
            lab_id: lab._id, 
            status: 'Completed',
            created_at: { $gte: new Date().setHours(0,0,0,0) }
        });
        const revenue = await LabTestRequest.aggregate([
            { $match: { lab_id: lab._id, status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            success: true,
            lab,
            stats: {
                pending: pendingCount,
                completedToday: completedCount,
                revenue: revenue.length > 0 ? revenue[0].total : 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 🧪 GET TEST REQUESTS
router.get('/api/lab/test-requests', requireLabRole, async (req, res) => {
    try {
        const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
        if (!lab) return res.json({ success: true, requests: [] });

        const requests = await LabTestRequest.find({ lab_id: lab._id })
            .populate('patient_id', 'name email phone')
            .sort({ scheduled_date: 1 });

        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 🧪 UPLOAD LAB REPORT
router.post('/api/lab/upload-report', requireLabRole, upload.single('report'), async (req, res) => {
    try {
        const { request_id } = req.body;
        const reportUrl = `/uploads/reports/${req.file.filename}`;

        const labRequest = await LabTestRequest.findOneAndUpdate(
            { request_id },
            { 
               status: 'Completed', 
               report_url: reportUrl 
            },
            { new: true }
        ).populate('lab_id').populate('patient_id');

        if (!labRequest) return res.status(404).json({ success: false, message: 'Request not found' });

        // ✅ Notify Patient
        const patientNotif = new Notification({
            role: 'patient',
            targetUserId: labRequest.patient_id,
            title: 'Lab Report Ready!',
            message: `Your lab results for "${labRequest.test_name}" from ${labRequest.lab_id.name} are now available.`,
            priority: 'urgent'
        });
        await patientNotif.save();

        res.json({ success: true, message: 'Report uploaded and patient notified', labRequest });
    } catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).json({ success: false, message: 'Failed to upload report' });
    }
});

// 🧪 BOOK LAB TEST
router.post('/api/lab/book-test', async (req, res) => {
    try {
        const { labId, testName, date, collectionType } = req.body;
        const patientUserId = req.session.userId;

        const newRequest = new LabTestRequest({
            request_id: 'LAB' + Date.now().toString().slice(-6),
            patient_id: patientUserId,
            lab_id: labId,
            test_name: testName,
            scheduled_date: new Date(date),
            collection_type: collectionType || 'Lab Visit',
            status: 'Pending',
            amount: 1000 // Sample amount
        });

        await newRequest.save();
        res.json({ success: true, message: 'Test booked successfully', request: newRequest });
    } catch (err) {
        console.error("❌ Booking error:", err);
        res.status(500).json({ success: false, message: 'Failed to book test' });
    }
});

module.exports = router;

