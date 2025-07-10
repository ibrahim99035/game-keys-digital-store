const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  resource: {
    type: String,
    required: true,
    enum: ['users', 'products', 'orders', 'payments', 'downloads', 'roles', 'permissions', 'notifications']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  conditions: {
    ownOnly: {
      type: Boolean,
      default: false
    },
    status: [{
      type: String
    }],
    custom: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ name: 1 });

module.exports = mongoose.model('Permission', permissionSchema);