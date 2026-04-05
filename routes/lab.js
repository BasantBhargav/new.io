const express = require('express');
const router = express.Router();
const Laboratory = require('../schema/laboratory');
const LabTestRequest = require('../schema/labtest_request');
const LabRequest = require('../schema/labRequest');
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

// 🧪 GET TEST REQUESTS (patient self-booked)
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

// 🧪 GET ALL REQUESTS — Merged: patient self-booked + doctor-assigned
router.get('/api/lab/all-requests', requireLabRole, async (req, res) => {
    try {
        const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
        if (!lab) return res.json({ success: true, requests: [] });

        // 1) Patient self-booked home visits (LabTestRequest schema)
        const selfBooked = await LabTestRequest.find({ lab_id: lab._id })
            .populate('patient_id', 'name email phone')
            .sort({ created_at: -1 });

        const selfBookedNorm = selfBooked.map(r => ({
            _id: r._id,
            source: 'self',
            patientName: r.patient_id?.name || 'Unknown Patient',
            patientPhone: r.patient_id?.phone || 'N/A',
            doctorName: null,
            testType: r.test_name,
            status: r.status,
            priority: 'Normal',
            notes: r.notes || '',
            collectionType: r.collection_type,
            reportUrl: r.report_url || null,
            createdAt: r.created_at,
            scheduledDate: r.scheduled_date,
        }));

        // 2) Doctor-assigned requests (LabRequest schema)
        const User = require('../schema/user');
        const doctorAssigned = await LabRequest.find({ labId: lab._id, status: { $ne: 'Cancelled' } })
            .populate({ path: 'patientId', select: 'name email phone' })
            .populate({ path: 'doctorId', select: 'name' })
            .sort({ createdAt: -1 });

        const doctorNorm = doctorAssigned.map(r => ({
            _id: r._id,
            source: 'doctor',
            patientName: r.patientId?.name || 'Unknown Patient',
            patientPhone: r.patientId?.phone || 'N/A',
            doctorName: r.doctorId?.name || null,
            testType: r.testType,
            status: r.status,
            priority: r.priority || 'Normal',
            notes: r.notes || '',
            collectionType: 'Lab Visit',
            reportUrl: r.reportFile || null,
            createdAt: r.createdAt,
            scheduledDate: null,
        }));

        // Merge & sort newest first
        const all = [...selfBookedNorm, ...doctorNorm].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json({ success: true, requests: all });
    } catch (err) {
        console.error('❌ all-requests error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching requests' });
    }
});

// 🧪 UPLOAD LAB REPORT (old route - uses request_id string)
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
            message: `Your lab results for "${labRequest.test_name}" from ${labRequest.lab_id?.name || 'the lab'} are now available.`,
            priority: 'urgent'
        });
        await patientNotif.save();

        res.json({ success: true, message: 'Report uploaded and patient notified', labRequest });
    } catch (err) {
        console.error("❌ Upload error:", err);
        res.status(500).json({ success: false, message: 'Failed to upload report' });
    }
});

// 🧪 UPLOAD LAB REPORT for self-booked request (uses MongoDB _id)
router.post('/api/lab/test-request/:id/upload', requireLabRole, upload.single('report'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const reportUrl = `/uploads/reports/${req.file.filename}`;

        const labRequest = await LabTestRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Completed', report_url: reportUrl },
            { new: true }
        ).populate('patient_id', 'name');

        if (!labRequest) return res.status(404).json({ success: false, message: 'Request not found' });

        // 🔔 Notify Patient
        const patientNotif = new Notification({
            role: 'patient',
            targetUserId: labRequest.patient_id?._id || labRequest.patient_id,
            title: '📄 Lab Report Ready!',
            message: `Your ${labRequest.test_name} report is now available in your dashboard.`,
            priority: 'high'
        });
        await patientNotif.save();

        res.json({ success: true, message: 'Report uploaded and patient notified', labRequest });
    } catch (err) {
        console.error("❌ Self-booked upload error:", err);
        res.status(500).json({ success: false, message: 'Failed to upload report' });
    }
});

// 🧪 BOOK LAB TEST
router.post('/api/lab/book-test', async (req, res) => {
    try {
        const { labId, testName, date, collectionType, address } = req.body;
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

        // Use notes field to store address if it's a home sample collection
        if (collectionType === 'Home Sample' && address) {
            newRequest.notes = `Address for collection: ${address}`;
        }

        await newRequest.save();
        res.json({ success: true, message: 'Test booked successfully', request: newRequest });
    } catch (err) {
        console.error("❌ Booking error:", err);
        res.status(500).json({ success: false, message: 'Failed to book test' });
    }
});

// 🧪 UPDATE STATUS of a self-booked (LabTestRequest) by lab
router.patch('/api/lab/test-request/:id/status', requireLabRole, async (req, res) => {
    try {
        const { status } = req.body;
        const request = await LabTestRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        // 🔔 Notify patient on important status changes
        if (['Sample Collected', 'Processing', 'Completed'].includes(status)) {
            const notif = new Notification({
                role: 'patient',
                targetUserId: request.patient_id,
                title: `Lab Test Status: ${status}`,
                message: `Your ${request.test_name} status has been updated to ${status}.`,
                priority: 'normal'
            });
            await notif.save();
        }

        res.json({ success: true, message: 'Status updated', request });
    } catch (err) {
        console.error("❌ Status update error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 🧪 TODAY'S COMPLETED REPORTS — merged (self-booked + doctor-assigned)
router.get('/api/lab/today-all-reports', requireLabRole, async (req, res) => {
    try {
        const lab = await Laboratory.findOne({ admin_user_id: req.session.userId });
        if (!lab) return res.json({ success: true, reports: [] });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 1) Self-booked completed today
        const selfBooked = await LabTestRequest.find({
            lab_id: lab._id,
            status: 'Completed',
            created_at: { $gte: startOfDay, $lte: endOfDay }
        }).populate('patient_id', 'name email');

        const selfNorm = selfBooked.map(r => ({
            _id: r._id,
            source: 'self',
            patientName: r.patient_id?.name || 'N/A',
            patientEmail: r.patient_id?.email || '',
            testType: r.test_name,
            doctorName: null,
            completedAt: r.created_at,
            reportUrl: r.report_url || null,
        }));

        // 2) Doctor-assigned completed today
        const doctorAssigned = await LabRequest.find({
            labId: lab._id,
            status: 'Completed',
            updatedAt: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate({ path: 'patientId', select: 'name email' })
        .populate({ path: 'doctorId', select: 'name' });

        const doctorNorm = doctorAssigned.map(r => ({
            _id: r._id,
            source: 'doctor',
            patientName: r.patientId?.name || 'N/A',
            patientEmail: r.patientId?.email || '',
            testType: r.testType,
            doctorName: r.doctorId?.name || null,
            completedAt: r.updatedAt,
            reportUrl: r.reportFile || null,
        }));

        const all = [...selfNorm, ...doctorNorm].sort(
            (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        );

        res.json({ success: true, reports: all });
    } catch (err) {
        console.error('❌ today-all-reports error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


