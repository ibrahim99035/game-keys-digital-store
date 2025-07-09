const mongoose = require('mongoose');

const downloadLinkSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  downloadCount: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DownloadLink', downloadLinkSchema);