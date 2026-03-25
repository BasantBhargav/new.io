const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  lab_id: { type: Number, required: true, unique: true }, // Auto-generated
  admin_user_id: { type: String, required: true, unique: true }, // Links to User._id
  name: { type: String, required: true },
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
  contact: {
    phone: String,
    email: String
  },
  test_catalog: [{
    name: String,
    category: String, // Blood, X-ray, etc.
    price: Number,
    turnaround_time: String // E.g. "24 hours"
  }],
  created_at: { type: Date, default: Date.now }
});

laboratorySchema.index({ "location.geo": "2dsphere" });

module.exports = mongoose.model('Laboratory', laboratorySchema);
