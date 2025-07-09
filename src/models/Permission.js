const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  resource: { type: String, required: true }, // 'products', 'users', 'orders', etc.
  action: { type: String, required: true }, // 'create', 'read', 'update', 'delete'
  conditions: {
    ownOnly: { type: Boolean, default: false },
    status: [{ type: String }],
    custom: { type: mongoose.Schema.Types.Mixed }
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Permission', permissionSchema);