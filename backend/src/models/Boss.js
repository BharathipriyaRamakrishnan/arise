const mongoose = require('mongoose');

const damageLogEntry = new mongoose.Schema({
  questId: mongoose.Schema.Types.ObjectId,
  questTitle: String,
  damage: Number,
  timestamp: { type: Date, default: Date.now }
});

const bossSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['normal', 'hard', 'elite', 'legendary'], default: 'normal' },
  maxHP: { type: Number, required: true },
  currentHP: { type: Number },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['active', 'won', 'lost'], default: 'active' },
  xpReward: { type: Number, default: 500 },
  penaltyXP: { type: Number, default: 200 },
  coinReward: { type: Number, default: 100 },
  damageLog: [damageLogEntry],
  icon: { type: String, default: '💀' },
  loot: [{ type: String }],  // badge IDs awarded on win
}, { timestamps: true });

bossSchema.pre('save', function (next) {
  if (this.isNew) this.currentHP = this.maxHP;
  next();
});

module.exports = mongoose.model('Boss', bossSchema);
