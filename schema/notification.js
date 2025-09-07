// schema/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  role: { type: String, required: true }, // doctor, patient, hospital, all
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, default: 'normal' },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  // 🆕 Per-user read tracking
  readBy: [{ 
    userId: String, 
    readAt: { type: Date, default: Date.now } 
  }],
  // 🆕 Per-user hide tracking (individual delete)
  hiddenBy: [{ 
    userId: String, 
    hiddenAt: { type: Date, default: Date.now } 
  }]
});

module.exports = mongoose.model('Notification', notificationSchema);
