const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['fawry', 'vodafone_cash', 'orange_money', 'instapay', 'credit_card', 'bank_transfer']
  },
  gatewayReference: {
    type: String
  },
  transactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayReference: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);