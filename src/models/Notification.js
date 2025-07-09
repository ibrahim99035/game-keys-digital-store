const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date }
});

module.exports = mongoose.model('Notification', notificationSchema);