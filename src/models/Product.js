const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'EGP' },
  category: { type: String, required: true },
  tags: [{ type: String }],
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  files: [{
    name: { type: String },
    cloudinaryId: { type: String },
    url: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  }],
  thumbnails: [{
    url: { type: String },
    cloudinaryId: { type: String }
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);