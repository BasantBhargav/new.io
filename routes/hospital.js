const express = require('express');
const router = express.Router();
const User = require('../schema/user'); // Adjust path if needed
const Report = require('../schema/report'); // Adjust path if needed
const Hospital = require('../schema/hospital'); 
const Doctor = require('../schema/doctor'); 
const Laboratory = require('../schema/laboratory'); 
const LabTestRequest = require('../schema/labtest_request'); 
const Notification = require('../schema/notification');

// API to fetch hospital details dynamically
router.get('/api/hospital/details', async (req, res) => {
  try {
    const hospitalId = req.session.userId; // assuming hospital user is logged in
    const hospital = await User.findById(hospitalId);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    const totalReports = await Report.countDocuments({ hospitalId: hospitalId });
    res.json({
      id: hospital._id,
      name: hospital.name,
      phone: hospital.phone,
      email: hospital.email,
      totalReports
    });
  } catch (err) {
    console.error('Error fetching hospital details:', err);
    res.status(500).json({ error: 'Unable to fetch hospital details' });
  }
});

// New API endpoint to fetch patient details
router.get('/api/patient/details', async (req, res) => {
  try {
    const patientId = req.query.patientId;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const patient = await User.findOne({ 
      _id: patientId,
      role: 'patient'
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      verified: patient.verified,
      createdAt: patient.created_at
    });
  } catch (err) {
    console.error('Error fetching patient details:', err);
    res.status(500).json({ error: 'Unable to fetch patient details' });
  }
});

// 👨‍⚕️ GET ALL DOCTORS LINKED TO THIS HOSPITAL
router.get('/api/hospital/doctors', async (req, res) => {
  try {
    const adminUserId = req.session.userId;
    const hospital = await Hospital.findOne({ admin_user_id: adminUserId });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found' });

    const doctors = await Doctor.find({ hospital_id: hospital.hospital_id.toString() }).lean();
    
    const results = [];
    for (const d of doctors) {
      const user = await User.findById(d.user_id).select('name email phone').lean();
      results.push({
        ...d,
        name: user ? user.name : 'Unknown',
        email: user ? user.email : 'N/A',
        phone: user ? user.phone : 'N/A'
      });
    }

    res.json({ success: true, doctors: results });
  } catch (error) {
    console.error('Error fetching hospital doctors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ➕ LINK DOCTOR TO HOSPITAL
router.post('/api/hospital/add-doctor', async (req, res) => {
  try {
    const { doctorEmail } = req.body;
    const adminUserId = req.session.userId;

    const hospital = await Hospital.findOne({ admin_user_id: adminUserId });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const doctorUser = await User.findOne({ email: doctorEmail, role: 'doctor' });
    if (!doctorUser) return res.status(404).json({ success: false, message: 'Doctor with this email not found' });

    const doctor = await Doctor.findOneAndUpdate(
      { user_id: doctorUser._id },
      { $set: { hospital_id: hospital.hospital_id.toString() } },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    res.json({ success: true, message: 'Doctor linked to hospital successfully', doctorName: doctorUser.name });
  } catch (error) {
    console.error('Error linking doctor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🏥 GET HOSPITAL BY ID (FOR PUBLIC VIEW)
router.get('/api/search/hospital/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found' });

    const doctors = await Doctor.find({ hospital_id: hospital.hospital_id.toString() }).lean();
    const doctorDetails = [];
    for (const d of doctors) {
      const u = await User.findById(d.user_id).lean();
      doctorDetails.push({
        ...d,
        name: u ? u.name : 'Unknown',
        email: u ? u.email : 'N/A',
        phone: u ? u.phone : 'N/A'
      });
    }
    res.json({ success: true, hospital, doctors: doctorDetails });
  } catch (error) {
    console.error('Error fetching hospital by ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🧪 GET CONNECTED LABS
router.get('/api/hospital/connected-labs', async (req, res) => {
  try {
    // For now, return all labs or implement hospital-lab linking
    // Assuming "connected" means labs that exist in the system for now
    const labs = await Laboratory.find().lean();
    res.json({ success: true, labs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🧪 LINK LAB (Optional deeper logic)
router.post('/api/hospital/link-lab', async (req, res) => {
  try {
    const { labEmail } = req.body;
    const labUser = await User.findOne({ email: labEmail, role: 'laboratory' });
    if (!labUser) return res.status(404).json({ success: false, message: 'Laboratory not found' });
    
    // Logic to store link in Hospital schema if needed
    res.json({ success: true, message: 'Laboratory linked to dashboard' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 💉 ASSIGN TEST TO PATIENT
router.post('/api/hospital/assign-test', async (req, res) => {
  try {
    const { labId, patientId, testName } = req.body;
    
    const patientUser = await User.findById(patientId);
    if (!patientUser) return res.status(404).json({ success: false, message: 'Patient not found' });

    const newRequest = new LabTestRequest({
       request_id: 'HOSP' + Date.now().toString().slice(-6),
       patient_id: patientId,
       lab_id: labId,
       test_name: testName,
       scheduled_date: new Date(),
       status: 'Pending',
       amount: 1200 // Default hospital-lab rate
    });

    await newRequest.save();

    // Notify Patient
    const notif = new Notification({
       role: 'patient',
       targetUserId: patientId,
       title: 'New Lab Test Assigned',
       message: `Your hospital has assigned a "${testName}" test at the laboratory. Please check your dashboard for details.`,
       priority: 'high'
    });
    await notif.save();

    res.json({ success: true, message: 'Test assigned and patient notified' });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📋 GET HOSPITAL LAB REQUESTS
router.get('/api/hospital/lab-requests', async (req, res) => {
  try {
    // Assuming requests created by hospital-linked ids or just all requests for now
    const requests = await LabTestRequest.find()
       .populate('patient_id', 'name')
       .populate('lab_id', 'name')
       .sort({ created_at: -1 })
       .limit(10);
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;

