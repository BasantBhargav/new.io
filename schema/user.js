const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    unique: true // Permanent Health ID / Doctor ID
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'hospital_staff','admin', 'laboratory'],
    required: true
  },
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
