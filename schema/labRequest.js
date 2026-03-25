const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema({
  patientId: { type: String, ref: 'User', required: true },
  doctorId: { type: String, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  appointmentId: { type: mongoose.Schema.Types.String, ref: 'Appointment' },
  testType: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Requested', 'Sample Collected', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending' 
  },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  reportFile: { type: String }, // Path to uploaded PDF
  labNotes: { type: String },
  estimatedTime: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

labRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LabRequest', labRequestSchema);
