const mongoose = require('mongoose');

const labTestRequestSchema = new mongoose.Schema({
  request_id: { type: String, required: true, unique: true },
  patient_id: { type: String, ref: 'User', required: true },
  lab_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  test_name: { type: String, required: true },
  scheduled_date: { type: Date, required: true },
  collection_type: { type: String, enum: ['Home Sample', 'Lab Visit'], default: 'Lab Visit' },
  status: { 
    type: String, 
    enum: ['Pending', 'Sample Collected', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  report_url: String, // Link to PDF result
  payment_status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  amount: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LabTestRequest', labTestRequestSchema);
