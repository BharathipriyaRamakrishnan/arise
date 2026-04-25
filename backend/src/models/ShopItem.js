const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['xp_boost', 'streak_shield', 'cheat_day', 'stat_elixir', 'cosmetic', 'rank_token', 'aura_frame'],
    required: true
  },
  cost: { type: Number, required: true },
  effect: {
    stat: String,
    amount: Number,
    duration: Number,  // hours
    multiplier: Number
  },
  icon: { type: String, default: '🎁' },
  imageKey: { type: String },
  classRestricted: { type: String, default: null },  // 'warrior'|'scholar'|'shadow'|'sage'|null
  available: { type: Boolean, default: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { timestamps: true });

module.exports = mongoose.model('ShopItem', shopItemSchema);
