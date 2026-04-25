const User = require('../models/User');
const {
  CLASS_BASE_STATS, applyXPAndLevelUp, checkSkillUnlocks,
  BADGES, XP_FOR_LEVEL
} = require('../utils/gameLogic');

// POST /api/player/create  — called after class selection in onboarding
const createPlayer = async (req, res) => {
  try {
    const { name, playerClass } = req.body;
    if (!name || !playerClass) return res.status(400).json({ message: 'Name and class required' });

    const baseStats = CLASS_BASE_STATS[playerClass];
    if (!baseStats) return res.status(400).json({ message: 'Invalid class' });

    req.user.player = {
      name,
      class: playerClass,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      rank: 'E',
      stats: { ...baseStats },
      statXP: { strength: 0, intelligence: 0, discipline: 0, charisma: 0, health: 0 },
      skills: [],
      debuffs: [],
      streaks: { overall: 0, perQuest: {} },
      badges: [],
      currency: 100, // starting bonus coins
      activeItems: [],
      storyLog: [{
        chapter: 'Prologue',
        text: `A new hunter awakens. ${name} chose the path of the ${playerClass}. The journey begins now.`,
        type: 'milestone',
        date: new Date()
      }],
      onboardingComplete: true
    };

    await req.user.save();
    res.json({ player: req.user.player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/player  — full player profile
const getPlayer = async (req, res) => {
  try {
    const player = req.user.player;
    if (!player) return res.status(404).json({ message: 'Player not created yet' });

    const xpNeeded = XP_FOR_LEVEL(player.level);
    res.json({ player, xpNeeded });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/player/story
const getStory = async (req, res) => {
  try {
    const log = req.user.player?.storyLog || [];
    res.json({ storyLog: log.sort((a, b) => new Date(b.date) - new Date(a.date)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/player/stats-summary
const getStatsSummary = async (req, res) => {
  try {
    const player = req.user.player;
    if (!player) return res.status(404).json({ message: 'No player found' });

    const xpNeeded = XP_FOR_LEVEL(player.level);
    const progress = Math.min((player.currentXP / xpNeeded) * 100, 100).toFixed(1);

    // Clean expired debuffs
    const now = new Date();
    player.debuffs = player.debuffs.filter(d => new Date(d.expiresAt) > now);

    // Clean expired active items
    player.activeItems = player.activeItems.filter(i => new Date(i.expiresAt) > now);

    await req.user.save();

    res.json({
      stats: player.stats,
      statXP: player.statXP,
      level: player.level,
      rank: player.rank,
      currentXP: player.currentXP,
      xpNeeded,
      progress,
      skills: player.skills,
      debuffs: player.debuffs,
      currency: player.currency,
      badges: player.badges,
      streaks: player.streaks,
      activeItems: player.activeItems
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPlayer, getPlayer, getStory, getStatsSummary };
