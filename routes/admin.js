// const express = require('express');
// const User = require('../schema/user'); // User schema (Doctor, Patient, Hospital)
// const Report = require('../schema/report'); // Report schema
// const router = express.Router();

// // Admin Dashboard Stats
// router.get('/stats', async (req, res) => {
//   try {
//     const totalDoctors = await User.countDocuments({ role: 'doctor' });
//     const totalPatients = await User.countDocuments({ role: 'patient' });
//     const totalHospitals = await User.countDocuments({ role: 'hospital_staff' });
//     const totalReports = await Report.countDocuments();
//     res.json({ totalDoctors, totalPatients, totalHospitals, totalReports });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// //// CRUD for Doctors ////
// // Get all doctors
// router.get('/doctors', async (req, res) => {
//   try {
//     const doctors = await User.find({ role: 'doctor' });
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch doctors' });
//   }
// });

// // Add new doctor
// router.post('/doctors', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newDoctor = new User({ _id, role: 'doctor', name, email, password });
//     await newDoctor.save();
//     res.json({ message: 'Doctor added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add doctor' });
//   }
// });

// // Update doctor
// router.put('/doctors/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'doctor' }, req.body);
//     res.json({ message: 'Doctor updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update doctor' });
//   }
// });

// // Delete doctor
// router.delete('/doctors/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'doctor' });
//     res.json({ message: 'Doctor deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete doctor' });
//   }
// });


// //// CRUD for Patients ////
// // Get all patients
// router.get('/patients', async (req, res) => {
//   try {
//     const patients = await User.find({ role: 'patient' });
//     res.json(patients);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch patients' });
//   }
// });

// // Add new patient
// router.post('/patients', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newPatient = new User({ _id, role: 'patient', name, email, password });
//     await newPatient.save();
//     res.json({ message: 'Patient added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add patient' });
//   }
// });

// // Update patient
// router.put('/patients/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'patient' }, req.body);
//     res.json({ message: 'Patient updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update patient' });
//   }
// });

// // Delete patient
// router.delete('/patients/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'patient' });
//     res.json({ message: 'Patient deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete patient' });
//   }
// });


// //// CRUD for Hospital Staff ////
// // Get all hospital staff
// router.get('/hospitals', async (req, res) => {
//   try {
//     const hospitals = await User.find({ role: 'hospital_staff' });
//     res.json(hospitals);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch hospitals' });
//   }
// });

// // Add new hospital staff
// router.post('/hospitals', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newHospital = new User({ _id, role: 'hospital_staff', name, email, password });
//     await newHospital.save();
//     res.json({ message: 'Hospital staff added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add hospital staff' });
//   }
// });

// // Update hospital staff
// router.put('/hospitals/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'hospital_staff' }, req.body);
//     res.json({ message: 'Hospital staff updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update hospital staff' });
//   }
// });

// // Delete hospital staff
// router.delete('/hospitals/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'hospital_staff' });
//     res.json({ message: 'Hospital staff deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete hospital staff' });
//   }
// });


// //// Manage Reports ////
// // Get all reports
// router.get('/reports', async (req, res) => {
//   try {
//     const reports = await Report.find();
//     res.json(reports);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch reports' });
//   }
// });

// // Delete a report
// router.delete('/reports/:id', async (req, res) => {
//   try {
//     await Report.deleteOne({ _id: req.params.id });
//     res.json({ message: 'Report deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete report' });
//   }
// });

// module.exports = router;


///////// 22222222222222 //////////////


// const express = require('express');
// const User = require('../schema/user'); // User schema (Doctor, Patient, Hospital)
// const Report = require('../schema/report'); // Report schema
// const PendingUser = require('../schema/pendingUser'); // 🆕 PendingUser schema
// const Doctor = require('../schema/doctor'); // 🆕 For doctor details
// const Hospital = require('../schema/hospital'); // 🆕 For hospital details
// const Counter = require('../schema/counter'); // 🆕 For generating IDs
// const router = express.Router();


// // Admin Dashboard Stats
// router.get('/stats', async (req, res) => {
//   try {
//     const totalDoctors = await User.countDocuments({ role: 'doctor' });
//     const totalPatients = await User.countDocuments({ role: 'patient' });
//     const totalHospitals = await User.countDocuments({ role: 'hospital_staff' });
//     const totalReports = await Report.countDocuments();
//     res.json({ totalDoctors, totalPatients, totalHospitals, totalReports });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// //// CRUD for Doctors ////
// // Get all doctors
// router.get('/doctors', async (req, res) => {
//   try {
//     const doctors = await User.find({ role: 'doctor' });
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch doctors' });
//   }
// });

// // Add new doctor
// router.post('/doctors', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newDoctor = new User({ _id, role: 'doctor', name, email, password });
//     await newDoctor.save();
//     res.json({ message: 'Doctor added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add doctor' });
//   }
// });

// // Update doctor
// router.put('/doctors/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'doctor' }, req.body);
//     res.json({ message: 'Doctor updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update doctor' });
//   }
// });

// // Delete doctor
// router.delete('/doctors/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'doctor' });
//     res.json({ message: 'Doctor deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete doctor' });
//   }
// });


// //// CRUD for Patients ////
// // Get all patients
// router.get('/patients', async (req, res) => {
//   try {
//     const patients = await User.find({ role: 'patient' });
//     res.json(patients);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch patients' });
//   }
// });

// // Add new patient
// router.post('/patients', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newPatient = new User({ _id, role: 'patient', name, email, password });
//     await newPatient.save();
//     res.json({ message: 'Patient added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add patient' });
//   }
// });

// // Update patient
// router.put('/patients/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'patient' }, req.body);
//     res.json({ message: 'Patient updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update patient' });
//   }
// });

// // Delete patient
// router.delete('/patients/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'patient' });
//     res.json({ message: 'Patient deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete patient' });
//   }
// });


// //// CRUD for Hospital Staff ////
// // Get all hospital staff
// router.get('/hospitals', async (req, res) => {
//   try {
//     const hospitals = await User.find({ role: 'hospital_staff' });
//     res.json(hospitals);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch hospitals' });
//   }
// });

// // Add new hospital staff
// router.post('/hospitals', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newHospital = new User({ _id, role: 'hospital_staff', name, email, password });
//     await newHospital.save();
//     res.json({ message: 'Hospital staff added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add hospital staff' });
//   }
// });

// // Update hospital staff
// router.put('/hospitals/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'hospital_staff' }, req.body);
//     res.json({ message: 'Hospital staff updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update hospital staff' });
//   }
// });

// // Delete hospital staff
// router.delete('/hospitals/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'hospital_staff' });
//     res.json({ message: 'Hospital staff deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete hospital staff' });
//   }
// });


// //// Manage Reports ////
// // Get all reports
// router.get('/reports', async (req, res) => {
//   try {
//     const reports = await Report.find();
//     res.json(reports);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch reports' });
//   }
// });

// // Delete a report
// router.delete('/reports/:id', async (req, res) => {
//   try {
//     await Report.deleteOne({ _id: req.params.id });
//     res.json({ message: 'Report deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete report' });
//   }
// });


// //// 🆕 Manage Pending Requests ////
// // Get all pending requests
// router.get('/pending-requests', async (req, res) => {
//   try {
//     const requests = await PendingUser.find();
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch pending requests' });
//   }
// });

// // Accept a pending request
// router.post('/pending-requests/accept/:id', async (req, res) => {
//   try {
//     const pending = await PendingUser.findById(req.params.id);
//     if (!pending) return res.status(404).send('Request not found');

//     // Save user in main User collection
//     const newUser = new User({
//       _id: pending._id,
//       name: pending.name,
//       email: pending.email,
//       phone: pending.phone,
//       role: pending.role,
//       password_hash: pending.password_hash,
//       verified: true,
//       created_at: new Date()
//     });
//     await newUser.save();

//     // Save role-specific details
//     if (pending.role === 'doctor') {
//       const doctorId = await Counter.findOneAndUpdate(
//         { name: 'doctor' },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       const newDoctor = new Doctor({
//         doc_id: doctorId.seq,
//         user_id: pending._id,
//         license_number: pending.extraData.license_number,
//         specialization: pending.extraData.specialization,
//         hospital_id: pending.extraData.hospital_id,
//         contact_number: pending.extraData.contact_number,
//         experience_years: pending.extraData.experience_years
//       });
//       await newDoctor.save();
//     } else if (pending.role === 'hospital_staff') {
//       const hospitalId = await Counter.findOneAndUpdate(
//         { name: 'hospital' },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       const newHospital = new Hospital({
//         hospital_id: hospitalId.seq,
//         name: pending.extraData.hospital_name,
//         location: {
//           address_line: pending.extraData.address_line,
//           city: pending.extraData.city,
//           state: pending.extraData.state,
//           country: 'India',
//           pin_code: pending.extraData.pin_code
//         },
//         contact: {
//           phone: pending.extraData.hospital_phone,
//           email: pending.extraData.hospital_email
//         },
//         admin_user_id: pending._id
//       });
//       await newHospital.save();
//     }

//     await PendingUser.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Request accepted and user created.' });
//   } catch (err) {
//     console.error("❌ Accept error:", err);
//     res.status(500).send('Failed to accept request');
//   }
// });

// // Decline a pending request
// router.delete('/pending-requests/decline/:id', async (req, res) => {
//   try {
//     await PendingUser.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Request declined and removed.' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to decline request' });
//   }
// });


// module.exports = router;


////////  33333333333333333333  //////////////



// const express = require('express');
// const User = require('../schema/user'); // User schema
// const Report = require('../schema/report'); // Report schema
// const PendingUser = require('../schema/pendingUser'); // PendingUser schema
// const Doctor = require('../schema/doctor'); // Doctor details
// const Hospital = require('../schema/hospital'); // Hospital details
// const Counter = require('../schema/counter'); // Counter for IDs
// const router = express.Router();


// // ✅ Admin Dashboard Stats
// router.get('/stats', async (req, res) => {
//   try {
//     const totalDoctors = await User.countDocuments({ role: 'doctor' });
//     const totalPatients = await User.countDocuments({ role: 'patient' });
//     const totalHospitals = await User.countDocuments({ role: 'hospital_staff' });
//     const totalReports = await Report.countDocuments();
//     res.json({ totalDoctors, totalPatients, totalHospitals, totalReports });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// //// ✅ CRUD for Doctors ////
// router.get('/doctors', async (req, res) => {
//   try {
//     const doctors = await User.find({ role: 'doctor' });
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch doctors' });
//   }
// });

// router.post('/doctors', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newDoctor = new User({ _id, role: 'doctor', name, email, password });
//     await newDoctor.save();
//     res.json({ message: 'Doctor added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add doctor' });
//   }
// });

// router.put('/doctors/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'doctor' }, req.body);
//     res.json({ message: 'Doctor updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update doctor' });
//   }
// });

// router.delete('/doctors/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'doctor' });
//     res.json({ message: 'Doctor deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete doctor' });
//   }
// });


// //// ✅ CRUD for Patients ////
// router.get('/patients', async (req, res) => {
//   try {
//     const patients = await User.find({ role: 'patient' });
//     res.json(patients);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch patients' });
//   }
// });

// router.post('/patients', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newPatient = new User({ _id, role: 'patient', name, email, password });
//     await newPatient.save();
//     res.json({ message: 'Patient added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add patient' });
//   }
// });

// router.put('/patients/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'patient' }, req.body);
//     res.json({ message: 'Patient updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update patient' });
//   }
// });

// router.delete('/patients/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'patient' });
//     res.json({ message: 'Patient deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete patient' });
//   }
// });


// //// ✅ CRUD for Hospital Staff ////
// router.get('/hospitals', async (req, res) => {
//   try {
//     const hospitals = await User.find({ role: 'hospital_staff' });
//     res.json(hospitals);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch hospitals' });
//   }
// });

// router.post('/hospitals', async (req, res) => {
//   try {
//     const { _id, name, email, password } = req.body;
//     const newHospital = new User({ _id, role: 'hospital_staff', name, email, password });
//     await newHospital.save();
//     res.json({ message: 'Hospital staff added successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to add hospital staff' });
//   }
// });

// router.put('/hospitals/:id', async (req, res) => {
//   try {
//     await User.updateOne({ _id: req.params.id, role: 'hospital_staff' }, req.body);
//     res.json({ message: 'Hospital staff updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update hospital staff' });
//   }
// });

// router.delete('/hospitals/:id', async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id, role: 'hospital_staff' });
//     res.json({ message: 'Hospital staff deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete hospital staff' });
//   }
// });


// //// ✅ Manage Reports ////
// router.get('/reports', async (req, res) => {
//   try {
//     const reports = await Report.find();
//     res.json(reports);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch reports' });
//   }
// });

// router.delete('/reports/:id', async (req, res) => {
//   try {
//     await Report.deleteOne({ _id: req.params.id });
//     res.json({ message: 'Report deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete report' });
//   }
// });


// //// ✅ Manage Pending Requests ////
// router.get('/pending-requests', async (req, res) => {
//   try {
//     const requests = await PendingUser.find();
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch pending requests' });
//   }
// });

// // ✅ Accept a pending request
// router.post('/pending-requests/accept/:id', async (req, res) => {
//   try {
//     const pending = await PendingUser.findById(req.params.id);
//     if (!pending) return res.status(404).send('Request not found');

//     // Save user in main User collection
//     const newUser = new User({
//       _id: pending._id,
//       name: pending.name,
//       email: pending.email,
//       phone: pending.phone,
//       role: pending.role,
//       password_hash: pending.password_hash,
//       verified: true,
//       created_at: new Date()
//     });
//     await newUser.save();

//     // Save role-specific details
//     if (pending.role === 'doctor') {
//       const doctorId = await Counter.findOneAndUpdate(
//         { name: 'doctor' },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       const newDoctor = new Doctor({
//         doc_id: doctorId.seq,
//         user_id: pending._id,
//         license_number: pending.extraData.license_number,
//         specialization: pending.extraData.specialization,
//         hospital_id: pending.extraData.hospital_id,
//         contact_number: pending.extraData.contact_number,
//         experience_years: pending.extraData.experience_years
//       });
//       await newDoctor.save();
//     } else if (pending.role === 'hospital_staff') {
//       const hospitalId = await Counter.findOneAndUpdate(
//         { name: 'hospital' },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       const newHospital = new Hospital({
//         hospital_id: hospitalId.seq,
//         name: pending.extraData.hospital_name,
//         location: {
//           address_line: pending.extraData.address_line,
//           city: pending.extraData.city,
//           state: pending.extraData.state,
//           country: 'India',
//           pin_code: pending.extraData.pin_code
//         },
//         contact: {
//           phone: pending.extraData.hospital_phone,
//           email: pending.extraData.hospital_email
//         },
//         admin_user_id: pending._id
//       });
//       await newHospital.save();
//     }

//     await PendingUser.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Request accepted and user created.' });
//   } catch (err) {
//     console.error("❌ Accept error:", err);
//     res.status(500).send('Failed to accept request');
//   }
// });

// // ✅ Decline a pending request
// router.delete('/pending-requests/decline/:id', async (req, res) => {
//   try {
//     await PendingUser.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Request declined and removed.' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to decline request' });
//   }
// });

// module.exports = router;


//////////// 444444444444444 ///////////////////////
const express = require('express');

const User = require('../schema/user'); // User schema
const Report = require('../schema/report'); // Report schema
const PendingUser = require('../schema/pendingUser'); // PendingUser schema
const Doctor = require('../schema/doctor'); // Doctor details
const Hospital = require('../schema/hospital'); // Hospital details
const Laboratory = require('../schema/laboratory'); // 🧪 Laboratory details
const Counter = require('../schema/counter'); // Counter for IDs

const router = express.Router();

// ✅ Admin Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalHospitals = await User.countDocuments({ role: 'hospital_staff' });
    const totalReports = await Report.countDocuments();
    res.json({ totalDoctors, totalPatients, totalHospitals, totalReports });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//// ✅ CRUD for Doctors ////
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const { _id, name, email, password } = req.body;
    const newDoctor = new User({ _id, role: 'doctor', name, email, password });
    await newDoctor.save();
    res.json({ message: 'Doctor added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

router.put('/doctors/:id', async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id, role: 'doctor' }, req.body);
    res.json({ message: 'Doctor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id, role: 'doctor' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

//// ✅ CRUD for Patients ////
router.get('/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const { _id, name, email, password } = req.body;
    const newPatient = new User({ _id, role: 'patient', name, email, password });
    await newPatient.save();
    res.json({ message: 'Patient added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

router.put('/patients/:id', async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id, role: 'patient' }, req.body);
    res.json({ message: 'Patient updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id, role: 'patient' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

//// ✅ CRUD for Hospital Staff ////
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital_staff' });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

router.post('/hospitals', async (req, res) => {
  try {
    const { _id, name, email, password } = req.body;
    const newHospital = new User({ _id, role: 'hospital_staff', name, email, password });
    await newHospital.save();
    res.json({ message: 'Hospital staff added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add hospital staff' });
  }
});

router.put('/hospitals/:id', async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id, role: 'hospital_staff' }, req.body);
    res.json({ message: 'Hospital staff updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hospital staff' });
  }
});

router.delete('/hospitals/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id, role: 'hospital_staff' });
    res.json({ message: 'Hospital staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete hospital staff' });
  }
});

//// ✅ Manage Reports ////
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    await Report.deleteOne({ _id: req.params.id });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

//// ✅ Manage Pending Requests ////
router.get('/pending-requests', async (req, res) => {
  try {
    const requests = await PendingUser.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// ✅ Accept a pending request (FIXED)
router.post('/pending-requests/accept/:id', async (req, res) => {
  try {
    const pending = await PendingUser.findById(req.params.id);
    if (!pending) return res.status(404).json({ error: 'Request not found or already processed.' });

    const existingUser = await User.findOne({
      $or: [{ email: pending.email }, { phone: pending.phone }]
    });

    if (!existingUser) {
      const newUser = new User({
        _id: pending._id,
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        role: pending.role,
        password_hash: pending.password_hash,
        verified: true,
        created_at: new Date()
      });
      await newUser.save();

      if (pending.role === 'doctor') {
        const doctorId = await Counter.findOneAndUpdate(
          { name: 'doctor' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const newDoctor = new Doctor({
          doc_id: doctorId.seq,
          user_id: pending._id,
          license_number: pending.extraData.license_number,
          specialization: pending.extraData.specialization,
          hospital_id: pending.extraData.hospital_id,
          workingHours: pending.extraData.workingHours || "9:00 AM - 5:00 PM", // Default if missing
          contact_number: pending.extraData.contact_number,
          experience_years: pending.extraData.experience_years
        });
        await newDoctor.save();
      } else if (pending.role === 'hospital_staff') {
        const hospitalId = await Counter.findOneAndUpdate(
          { name: 'hospital' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const newHospital = new Hospital({
          hospital_id: hospitalId.seq,
          name: pending.extraData.hospital_name,
          location: {
            address_line: pending.extraData.address_line,
            city: pending.extraData.city,
            state: pending.extraData.state,
            pin_code: pending.extraData.pin_code,
            country: "India",
            geo: {
              type: 'Point',
              coordinates: [parseFloat(pending.extraData.lng) || 0, parseFloat(pending.extraData.lat) || 0]
            }
          },
          contact: {
            phone: pending.extraData.hospital_phone,
            email: pending.extraData.hospital_email
          },
          admin_user_id: pending._id
        });
        await newHospital.save();
      } else if (pending.role === 'laboratory') {
        const labId = await Counter.findOneAndUpdate(
          { name: 'laboratory' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const newLab = new Laboratory({
          lab_id: labId.seq,
          admin_user_id: pending._id,
          name: pending.extraData.lab_name || pending.name,
          location: {
            address_line: pending.extraData.address_line,
            city: pending.extraData.city,
            state: pending.extraData.state,
            pin_code: pending.extraData.pin_code,
            geo: {
              type: 'Point',
              coordinates: [parseFloat(pending.extraData.lng) || 0, parseFloat(pending.extraData.lat) || 0]
            }
          },
          contact: {
            phone: pending.extraData.lab_phone || pending.phone,
            email: pending.extraData.lab_email || pending.email
          }
        });
        await newLab.save();
      }
    }

    const deleteResult = await PendingUser.findByIdAndDelete(req.params.id);

    if (!deleteResult) {
      return res.status(400).json({ error: 'Failed to delete pending request.' });
    }

    return res.status(200).json({ message: 'Request accepted successfully!' });

  } catch (err) {
    console.error("❌ Accept error:", err);
    return res.status(500).json({ error: 'Failed to accept request.' });
  }
});

// ✅ Decline a pending request
router.delete('/pending-requests/decline/:id', async (req, res) => {
  try {
    await PendingUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request declined and removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
});

module.exports = router;