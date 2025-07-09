const mongoose = require('mongoose');

const digitalAssetSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DigitalAsset', digitalAssetSchema);