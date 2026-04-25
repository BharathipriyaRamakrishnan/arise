const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const debuffSchema = new mongoose.Schema({
  type: { type: String, enum: ['fatigue', 'weakened', 'cursed'], required: true },
  expiresAt: { type: Date, required: true }
});

const storyEntrySchema = new mongoose.Schema({
  chapter: String,
  text: String,
  type: { type: String, enum: ['milestone', 'daily', 'boss', 'levelup', 'skill'] },
  date: { type: Date, default: Date.now }
});

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, enum: ['warrior', 'scholar', 'shadow', 'sage'], required: true },
  level: { type: Number, default: 1 },
  totalXP: { type: Number, default: 0 },
  currentXP: { type: Number, default: 0 },
  rank: { type: String, enum: ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'], default: 'E' },
  stats: {
    strength: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    discipline: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    health: { type: Number, default: 10 }
  },
  statXP: {
    strength: { type: Number, default: 0 },
    intelligence: { type: Number, default: 0 },
    discipline: { type: Number, default: 0 },
    charisma: { type: Number, default: 0 },
    health: { type: Number, default: 0 }
  },
  skills: [{ type: String }],
  debuffs: [debuffSchema],
  streaks: {
    overall: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    perQuest: { type: Map, of: Number, default: {} }
  },
  badges: [{ type: String }],
  currency: { type: Number, default: 0 },   // Arise Coins
  activeItems: [{
    itemId: mongoose.Schema.Types.ObjectId,
    name: String,
    type: String,
    expiresAt: Date,
    effect: mongoose.Schema.Types.Mixed
  }],
  storyLog: [storyEntrySchema],
  onboardingComplete: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  player: { type: playerSchema, default: null },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
