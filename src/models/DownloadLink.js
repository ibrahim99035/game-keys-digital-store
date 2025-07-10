const mongoose = require('mongoose');
const crypto = require('crypto');

const downloadLinkSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  downloadHistory: [{
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate token
downloadLinkSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

downloadLinkSchema.index({ token: 1 });
downloadLinkSchema.index({ expiresAt: 1 });
downloadLinkSchema.index({ user: 1, product: 1 });

module.exports = mongoose.model('DownloadLink', downloadLinkSchema);