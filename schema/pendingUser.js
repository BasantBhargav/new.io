const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  role: { type: String, enum: ['doctor', 'hospital_staff', 'laboratory'], required: true },

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  extraData: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
