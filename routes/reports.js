// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const Report = require('../schema/report');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// router.post('/upload-report', upload.single('report'), async (req, res) => {
//   const { patientId, reportType } = req.body;

//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   try {
//     const newReport = new Report({
//       patientId,
//       reportType,
//       filePath: req.file.path
//     });

//     await newReport.save();
//     res.send('Report uploaded successfully!');
//   } catch (error) {
//     console.error('Error uploading report:', error);
//     res.status(500).send('Error uploading report');
//   }
// });

// module.exports = router;





//////////////////////////// pooraa details or reports ke saath //////////////////////


const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Report = require('../schema/report');
const User = require('../schema/user'); // ✅ For fetching patient info

const router = express.Router();

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ✅ Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * ✅ Upload report endpoint
 */
router.post('/upload-report', upload.single('report'), async (req, res) => {
  const { patientId, reportType } = req.body;

  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const newReport = new Report({
      report_id: uuidv4(),
      patientId,
      reportType,
      filename: req.file.filename,
      filePath: `uploads/${req.file.filename}`, // ✅ relative path
      uploadedAt: new Date()
    });
    await newReport.save();
    res.send('✅ Report uploaded successfully!');
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).send('Error uploading report');
  }
});

/**
 * ✅ Fetch patient details endpoint
 */
router.get('/api/patient/details', async (req, res) => {
  try {
    const patientId = req.query.patientId;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
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

/**
 * ✅ Fetch reports for patient
 */
router.get('/api/reports/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching reports for', patientId); // Debug log
    const reports = await Report.find({ patientId });
    console.log('Reports fetched:', reports);       // Debug log
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Unable to fetch reports' });
  }
});

module.exports = router;
