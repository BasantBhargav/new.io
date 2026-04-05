const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doc_id: { type: Number, required: true, unique: true },     // Auto-generated
  user_id: { type: String, ref: 'User', required: true, unique: true },    // Links to User._id
  license_number: String,
  specialization: String,
  hospital_id: String,     // Hospital where doctor works
  workingHours: String,     // E.g., "10:00 AM - 4:00 PM"
  availableSlots: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String, // E.g., "10:00"
    endTime: String    // E.g., "16:00"
  }],
  current_token: { type: Number, default: 0 }, // 🔢 Track currently called patient
  last_token_number: { type: Number, default: 0 }, // 🎟️ Track highest issued token today
  last_token_date: { type: Date }, // 📅 Tracks which day the tokens apply to
  avg_time_per_patient: { type: Number, default: 15 }, // ⏱️ In minutes
  contact_number: String,
  experience_years: Number,
  created_at: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Doctor', doctorSchema);
