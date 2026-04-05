const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patient_id: { type: Number, required: true, unique: true }, // Auto-generated
  user_id: { type: String, ref: 'User', required: true, unique: true },    // Links to User._id
  age: Number,
  gender: String,
  address: String,
  contact_number: String,
  medical_history: [String], // Optional
  blood_group: String,
  emergency_contact: String,
  allergies: [String],
  current_medications: [String],
  location: {
    address_line: String,
    city: String,
    state: String,
    pin_code: String,
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
