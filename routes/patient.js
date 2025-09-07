// const express = require('express');
// const router = express.Router();
// const User = require('../schema/user');
// const Report = require('../schema/report');
// const fs = require('fs');
// const path = require('path');

// // GET patient dashboard data
// router.get('/api/patient-dashboard', async (req, res) => {
//   try {
//     const userId = req.session.userId;

//     const user = await User.findById(userId).lean();
//     const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

//     if (!user || user.role !== 'patient') {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     res.json({ user, reports });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // DELETE report by ID
// router.delete('/delete-report/:id', async (req, res) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }

//     // Delete file from filesystem
//     const filePath = path.join(__dirname, '../', report.filePath); // assuming filePath is relative like 'public/uploads/xyz.pdf'
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     // Delete report document from DB
//     await Report.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Report deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting report:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;



///// 222222222222 ///////////
const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const Report = require('../schema/report');
const Prescription = require('../schema/Prescription');
const fs = require('fs');
const path = require('path');

// GET patient dashboard data
router.get('/api/patient-dashboard', async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();
    const reports = await Report.find({ patientId: userId }).sort({ uploadedAt: -1 }).lean();

    if (!user || user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ user, reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔄 Get patient prescriptions
router.get('/api/patient/:patientId/prescriptions', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Verify patient exists and get current user session
    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;
    
    // Allow access if user is the patient themselves or a doctor/admin
    const canAccess = (currentUserId === patientId) || 
                     (currentUserRole === 'doctor') || 
                     (currentUserRole === 'admin');
    
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Get prescriptions without populate to avoid model issues
    const prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
    
    // Manually get doctor details
    const prescriptionsWithDoctors = [];
    for (const prescription of prescriptions) {
      const doctor = await User.findById(prescription.doctorId).select('name email');
      prescriptionsWithDoctors.push({
        ...prescription.toObject(),
        doctorId: doctor || { name: 'Unknown', email: 'N/A' }
      });
    }

    res.json({ success: true, prescriptions: prescriptionsWithDoctors });
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 🔄 Get single prescription details
router.get('/api/prescriptions/:prescriptionId', async (req, res) => {
  try {
    const prescriptionId = req.params.prescriptionId;
    
    // Get prescription without populate
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Authorization check
    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;
    
    const canAccess = (currentUserId === prescription.patientId) || 
                     (currentUserId === prescription.doctorId) || 
                     (currentUserRole === 'admin');
    
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Manually get doctor and patient details
    const doctor = await User.findById(prescription.doctorId).select('name email');
    const patient = await User.findById(prescription.patientId).select('name email phone');

    const prescriptionWithDetails = {
      ...prescription.toObject(),
      doctorId: doctor || { name: 'Unknown', email: 'N/A' },
      patientId: patient || { name: 'Unknown', email: 'N/A', phone: 'N/A' }
    };

    res.json({ success: true, prescription: prescriptionWithDetails });
  } catch (error) {
    console.error('❌ Error fetching prescription:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 🔄 NEW: DELETE prescription by ID
router.delete('/api/prescriptions/:prescriptionId', async (req, res) => {
  try {
    const prescriptionId = req.params.prescriptionId;
    const currentUserId = req.session.userId;
    const currentUserRole = req.session.role;
    
    // Get prescription to verify ownership
    const prescription = await Prescription.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    // Authorization: Only patient can delete their own prescriptions or admin
    const canDelete = (currentUserId === prescription.patientId) || 
                     (currentUserRole === 'admin');
    
    if (!canDelete) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own prescriptions' });
    }
    
    // Delete prescription from database
    await Prescription.findByIdAndDelete(prescriptionId);
    
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting prescription:', error);
    res.status(500).json({ success: false, message: 'Failed to delete prescription' });
  }
});

// DELETE report by ID
router.delete('/delete-report/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../', report.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete report document from DB
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

