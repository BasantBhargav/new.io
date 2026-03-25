const express = require('express');
const router = express.Router();
const LabRequest = require('../schema/labRequest');
const Laboratory = require('../schema/laboratory');
const Appointment = require('../schema/appointment');
const Notification = require('../schema/notification');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 🧪 GET all laboratories
router.get('/api/laboratories', async (req, res) => {
  try {
    const laboratories = await Laboratory.find({}, 'name location contact');
    res.json({ success: true, laboratories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching labs' });
  }
});

// Auth middleware (simplified here, but should use requireAuth from index.js)
const requireAuth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

// 📂 Multer setup for Lab Report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/lab_reports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'lab-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 👨‍⚕️ DOCTOR: Create new Lab Request
router.post('/api/lab-requests', requireAuth, async (req, res) => {
  try {
    if (req.session.role !== 'doctor') return res.status(403).json({ success: false, message: 'Only doctors can initiate lab requests' });

    const { patientId, labId, appointmentId, testType, notes, priority } = req.body;
    const doctorUserId = req.session.userId;

    if (!labId) return res.status(400).json({ success: false, message: 'Please select a laboratory' });

    const request = new LabRequest({
      patientId,
      doctorId: doctorUserId,
      labId,
      appointmentId,
      testType,
      notes,
      priority: priority || 'Normal'
    });

    await request.save();

    // 🔔 Notify Patient
    const notif = new Notification({
       role: 'patient',
       targetUserId: patientId,
       title: "New Lab Test Requested",
       message: `Dr. ${req.session.userName || 'Your Doctor'} has requested a ${testType} test for you. Please check your dashboard for details.`,
       priority: priority === 'Urgent' ? 'high' : 'normal'
    });
    await notif.save();

    res.json({ success: true, message: 'Lab request submitted successfully', request });
  } catch (error) {
    console.error('Error creating lab request:', error);
    res.status(500).json({ success: false, message: 'Failed to create lab request' });
  }
});

// 👨‍⚕️ DOCTOR: Get my requests
router.get('/api/doctor/lab-requests', requireAuth, async (req, res) => {
  try {
    const requests = await LabRequest.find({ doctorId: req.session.userId })
       .populate({ path: 'patientId', select: 'name email phone' })
       .populate({ path: 'labId', select: 'name' })
       .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🧪 LAB: Get all pending requests
router.get('/api/lab/lab-requests', requireAuth, async (req, res) => {
  try {
    const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

    const requests = await LabRequest.find({ labId: lab._id, status: { $ne: 'Completed' } })
       .populate({ path: 'patientId', select: 'name email phone' })
       .populate({ path: 'doctorId', select: 'name' })
       .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch lab requests error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🧪 LAB: Update status
router.patch('/api/lab-requests/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, labNotes, estimatedTime } = req.body;
    const request = await LabRequest.findByIdAndUpdate(req.params.id, 
       { status, labNotes, estimatedTime }, 
       { new: true }
    );
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // 🔔 Notify Patient only if important status change
    if (['Sample Collected', 'Processing', 'Completed'].includes(status)) {
       const notif = new Notification({
          role: 'patient',
          targetUserId: request.patientId,
          title: `Lab Test Status: ${status}`,
          message: `Your ${request.testType} status has been updated to ${status}.`,
          priority: 'normal'
       });
       await notif.save();
    }

    res.json({ success: true, message: 'Status updated', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🧪 LAB: Upload full report
router.post('/api/lab-request/:id/upload', requireAuth, upload.single('report'), async (req, res) => {
  try {
     if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

     const request = await LabRequest.findByIdAndUpdate(req.params.id, {
        reportFile: req.file.path,
        status: 'Completed'
     }, { new: true }).populate({ path: 'doctorId', select: 'name _id' });

     // 🔔 Notify Patient
     const patientNotif = new Notification({
        role: 'patient',
        targetUserId: request.patientId,
        title: "📄 Lab Report Ready!",
        message: `Your ${request.testType} report is now available in your dashboard.`,
        priority: 'high'
     });
     await patientNotif.save();

     // 🔔 Notify Doctor
     if (request.doctorId) {
        const doctorNotif = new Notification({
           role: 'doctor',
           targetUserId: request.doctorId._id,
           title: "🧪 Lab Report Submitted",
           message: `Lab report for ${request.testType} has been completed and sent to the patient.`,
           priority: 'normal'
        });
        await doctorNotif.save();
     }

     res.json({ success: true, message: 'Report uploaded successfully', request });
  } catch (error) {
     console.error('Upload error:', error);
     res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// 🧪 LAB: Get today's completed reports
router.get('/api/lab/today-reports', requireAuth, async (req, res) => {
  try {
     const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
     if (!lab) return res.status(404).json({ success: false, message: 'Lab profile not found' });

     const startOfDay = new Date();
     startOfDay.setHours(0, 0, 0, 0);
     const endOfDay = new Date();
     endOfDay.setHours(23, 59, 59, 999);

     const reports = await LabRequest.find({
        labId: lab._id,
        status: 'Completed',
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
     })
     .populate({ path: 'patientId', select: 'name email phone' })
     .populate({ path: 'doctorId', select: 'name' })
     .sort({ updatedAt: -1 });

     res.json({ success: true, reports });
  } catch (error) {
     console.error("Fetch today reports error:", error);
     res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 👤 PATIENT: Get my lab tests
router.get('/api/patient/lab-results', requireAuth, async (req, res) => {
   try {
      const requests = await LabRequest.find({ patientId: req.session.userId })
         .populate({ path: 'doctorId', select: 'name' })
         .sort({ createdAt: -1 });
      res.json({ success: true, requests });
   } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
   }
});

module.exports = router;
