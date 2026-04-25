const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem', required: true },
  itemName: String,
  itemType: String,
  cost: Number,
  status: { type: String, enum: ['purchased', 'applied', 'expired'], default: 'purchased' },
  appliedAt: Date,
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
