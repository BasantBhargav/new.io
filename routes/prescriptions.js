// routes/prescriptions.js

const express = require('express');
const router = express.Router();
const Prescription = require('../schema/Prescription');
const User = require('../schema/user');

// ✅ Get patient details for prescriptions
router.get('/patients/:id', async (req, res) => {
  try {
    const patientId = req.params.id.trim();
    const patient = await User.findOne({
      _id: { $regex: new RegExp(`^${patientId}$`, "i") },
      role: 'patient'
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Get all prescriptions for a patient
router.get('/patient/:id/prescriptions', async (req, res) => {
  try {
    const patientId = req.params.id;
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name email speciality')
      .sort({ date: -1 });
    
    res.json({ success: true, prescriptions });
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get a single prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name email speciality');
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Create new prescription
router.post('/', async (req, res) => {
  try {
    const { patientId, diagnosis, medications, notes, followUpDate } = req.body;

    // ✅ Get doctor ID from session
    const doctorId = req.session.userId;
    const doctorRole = req.session.role;

    // ✅ Verify user is logged in and is a doctor
    if (!doctorId || doctorRole !== 'doctor') {
      return res.status(403).json({ message: 'Unauthorized: Only doctors can create prescriptions' });
    }

    // ✅ Verify patient exists
    const patient = await User.findOne({
      _id: { $regex: new RegExp(`^${patientId}$`, "i") },
      role: 'patient'
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // ✅ Save prescription
    const prescription = new Prescription({
      patientId: patient._id,
      doctorId: doctorId,
      diagnosis,
      medications,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    await prescription.save();
    res.status(201).json({ message: 'Prescription saved successfully', prescription });
  } catch (error) {
    console.error('❌ Error saving prescription:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
