const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const questSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['daily', 'main', 'side'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'legendary'], default: 'medium' },
  statTarget: { type: String, enum: ['strength', 'intelligence', 'discipline', 'charisma', 'health', 'all'] },
  xpReward: { type: Number, required: true },
  statXpReward: { type: Number, default: 10 },
  coinReward: { type: Number, default: 5 },
  status: { type: String, enum: ['active', 'completed', 'failed', 'expired'], default: 'active' },
  streak: { type: Number, default: 0 },
  lastCompletedAt: { type: Date },
  dueDate: { type: Date },
  subtasks: [subtaskSchema],
  isDefault: { type: Boolean, default: false },  // system-generated daily quests
  icon: { type: String, default: '⚡' },
  bossDamage: { type: Number, default: 0 }, // damage dealt to active boss when completed
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
