const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointment_id: {
    type: String,
    required: true,
    unique: true
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  token_number: { type: Number, default: null },
  // Token is issued on check-in, not while booking.
  queue_session: { type: String, default: 'default', trim: true },

  scheduled_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'BOOKED', 'CHECKED_IN', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED'],
    default: 'BOOKED'
  },
  paymentStatus: { // 🆕 Added for payment tracking
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  amountPaid: { // 🆕 Optional: amount for tracking
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }

}, { timestamps: true });

appointmentSchema.index(
  { doctor_id: 1, scheduled_time: 1, queue_session: 1, token_number: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
