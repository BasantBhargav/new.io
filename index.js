const express = require('express');
const http = require('http'); // 🌍 Added HTTP Server
const { Server } = require('socket.io'); // 🌍 Added Socket.IO
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app); // 🌍 Attach Express to HTTP server
const io = new Server(server); // 🌍 Initialize Socket.IO
const port = 3000;

// 🌍 Socket logic
io.on('connection', (socket) => {
  console.log('🔗 A user connected:', socket.id);
  
  socket.on('joinDoctorQueue', (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`📡 User joined queue room: doctor_${doctorId}`);
  });

  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📡 Private user room joined: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// 🌍 Share io with routes
app.set('socketio', io);

// Import Routes and Schemas
const adminRoutes = require('./routes/admin');        
const authRoutes = require('./routes/auth');          
const uploadRoutes = require('./routes/upload');      
const reportsRoutes = require('./routes/reports');    
const hospitalRoutes = require('./routes/hospital');  
const patientRoutes = require('./routes/patient');
const prescriptionRoutes = require('./routes/prescriptions');
const notificationsRoutes = require('./routes/notifications');
const hospitalSettingsRoutes = require('./routes/hospitalSettings');
const appointmentsRoutes = require('./routes/appointments');
const labRoutes = require('./routes/lab'); // 🆕 Added Lab Routes
const searchRoutes = require('./routes/search');
const labRequestsRoutes = require('./routes/labRequests'); // 🆕 Added Lab Request Routes

const User = require('./schema/user');                
const Report = require('./schema/report');            

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Serve frontend files from /front folder
app.use(express.static(path.join(__dirname, 'front')));

// Serve uploaded report files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Atlas Connection
// ... (connection part remains same)
mongoose.connect('mongodb+srv://basantbhargav335:basant@cluster0.thdcvhb.mongodb.net/medivault?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB Atlas Connection Error:", err));

// Role-Based Middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    console.log("⚠️ Not logged in, redirecting from " + req.url + " to /login");
    return res.redirect('/login');
  }
  console.log(`✅ Auth successful for user: ${req.session.userId}, role: ${req.session.role} on ${req.url}`);
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') {
    console.log(`⛔ Admin access only for ${req.url}. Current user: ${req.session.userId}, role: ${req.session.role}. Redirecting...`);
    return res.redirect('/login');
  }
  next();
};

// Authentication Routes
app.use('/', authRoutes);

// Protected API Routes
app.use('/api/admin', requireAdmin, adminRoutes);
app.use('/', uploadRoutes);
app.use('/', reportsRoutes);
app.use('/', hospitalRoutes);
app.use('/', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/', hospitalSettingsRoutes);
app.use('/', appointmentsRoutes);
app.use('/', labRoutes);
app.use('/', labRequestsRoutes); // 🆕 Use Lab Request Routes
app.use('/', searchRoutes);



// Dashboards and Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front/home.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'front/dashboard.html'));
});

app.get('/doctordashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'doctor') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/doctordashboard.html'));
});

app.get('/patientdashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'patient') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/patientdashboard.html'));
});

app.get('/hospitaldetails', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'front/hospitaldetails.html'));
});

app.get('/hospitaldashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'hospital_staff') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/hospitaldashboard.html'));
});

app.get('/labdashboard', requireAuth, (req, res) => {
  if (req.session.role !== 'laboratory') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/labdashboard.html'));
});


app.get('/admindashboard', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'front/admindashboard.html'));
});

app.get('/hospital-settings', requireAuth, (req, res) => {
  if (req.session.role !== 'hospital_staff') return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'front/hospital-settings.html'));
});

// APIs
app.get('/api/patient-dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

    if (!user) {
      console.log(`❌ User not found for session ID: ${userId}`);
      return res.status(403).json({ message: 'Unauthorized: User not found' });
    }
    if (user.role !== 'patient') {
      console.log(`❌ User found but role is not patient. Role is: ${user.role} for session ID: ${userId}`);
      return res.status(403).json({ message: 'Unauthorized: Not a patient' });
    }

    res.json({ user, reports });
  } catch (error) {
    console.error('❌ Error fetching patient dashboard data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Start Server
server.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
