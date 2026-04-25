const Boss = require('../models/Boss');
const User = require('../models/User');
const { applyXPAndLevelUp, BADGES } = require('../utils/gameLogic');

// GET /api/bosses
const getBosses = async (req, res) => {
  try {
    const bosses = await Boss.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ bosses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bosses
const createBoss = async (req, res) => {
  try {
    const { name, description, difficulty, deadline, icon } = req.body;

    const hpMap = { normal: 200, hard: 500, elite: 1000, legendary: 2000 };
    const xpMap = { normal: 300, hard: 700, elite: 1500, legendary: 3000 };
    const coinMap = { normal: 50, hard: 100, elite: 200, legendary: 500 };

    const boss = await Boss.create({
      userId: req.user._id,
      name, description, difficulty,
      maxHP: hpMap[difficulty] || 200,
      deadline: new Date(deadline),
      xpReward: xpMap[difficulty] || 300,
      penaltyXP: Math.floor((xpMap[difficulty] || 300) * 0.4),
      coinReward: coinMap[difficulty] || 50,
      icon: icon || '💀',
      loot: []
    });

    // Story log entry
    const player = req.user.player;
    if (player) {
      player.storyLog.push({
        chapter: 'Boss Encountered',
        text: `${player.name} faces the boss: ${name}. The clock is ticking.`,
        type: 'boss',
        date: new Date()
      });
      await req.user.save();
    }

    res.status(201).json({ boss });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bosses/:id/resolve  — manually resolve (win or lose)
const resolveBoss = async (req, res) => {
  try {
    const boss = await Boss.findOne({ _id: req.params.id, userId: req.user._id });
    if (!boss) return res.status(404).json({ message: 'Boss not found' });
    if (boss.status !== 'active') return res.status(400).json({ message: 'Boss already resolved' });

    const { outcome } = req.body; // 'won' | 'lost'
    boss.status = outcome;

    const player = req.user.player;
    const events = [];

    if (outcome === 'won') {
      player.currency += boss.coinReward;
      const xpEvents = applyXPAndLevelUp(player, boss.xpReward);
      events.push(...xpEvents);

      if (!player.badges.includes('boss_slayer')) {
        player.badges.push('boss_slayer');
        events.push({ type: 'badge', badge: BADGES.boss_slayer });
      }

      player.storyLog.push({
        chapter: 'Victory',
        text: `${player.name} defeated ${boss.name}! The spoils of war are claimed.`,
        type: 'boss', date: new Date()
      });
    } else {
      const xpLost = boss.penaltyXP;
      player.currentXP = Math.max(0, player.currentXP - xpLost);
      player.totalXP = Math.max(0, player.totalXP - xpLost);
      player.debuffs.push({ type: 'weakened', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
      events.push({ type: 'boss_loss', xpLost });

      player.storyLog.push({
        chapter: 'Defeat',
        text: `${player.name} was defeated by ${boss.name}. The hunter recovers in silence.`,
        type: 'boss', date: new Date()
      });
    }

    await boss.save();
    await req.user.save();

    res.json({ boss, events, player: { level: player.level, currentXP: player.currentXP, currency: player.currency } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bosses/:id
const deleteBoss = async (req, res) => {
  try {
    await Boss.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Boss deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBosses, createBoss, resolveBoss, deleteBoss };
