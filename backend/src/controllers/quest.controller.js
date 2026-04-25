const Quest = require('../models/Quest');
const Boss = require('../models/Boss');
const User = require('../models/User');
const {
  calculateXPGain, calculatePenalty, applyXPAndLevelUp,
  checkSkillUnlocks, DIFFICULTY_XP, DIFFICULTY_COINS,
  BADGES, getStreakMultiplier, DEFAULT_DAILY_QUESTS
} = require('../utils/gameLogic');

// GET /api/quests?type=daily|main|side
const getQuests = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const quests = await Quest.find(filter).sort({ createdAt: -1 });
    res.json({ quests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quests
const createQuest = async (req, res) => {
  try {
    const { type, title, description, difficulty, statTarget, dueDate, subtasks, icon } = req.body;
    const xpReward = DIFFICULTY_XP[difficulty] || 50;
    const coinReward = DIFFICULTY_COINS[difficulty] || 10;

    const quest = await Quest.create({
      userId: req.user._id,
      type, title, description, difficulty, statTarget,
      xpReward, coinReward,
      statXpReward: Math.floor(xpReward * 0.3),
      dueDate, subtasks: subtasks || [],
      icon: icon || '⚡',
      bossDamage: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : difficulty === 'hard' ? 50 : 100
    });

    res.status(201).json({ quest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/quests/:id/complete
const completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });
    if (quest.status === 'completed') return res.status(400).json({ message: 'Quest already completed' });

    const player = req.user.player;
    if (!player) return res.status(404).json({ message: 'No player found' });

    // Update streak for this quest
    const questStreak = (player.streaks.perQuest?.get?.(quest._id.toString()) || 0) + 1;
    player.streaks.perQuest.set(quest._id.toString(), questStreak);

    // Overall streak
    const today = new Date().toDateString();
    const lastActive = player.streaks.lastActiveDate ? new Date(player.streaks.lastActiveDate).toDateString() : null;
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive === yesterday.toDateString()) {
        player.streaks.overall += 1;
      } else if (lastActive !== today) {
        player.streaks.overall = 1;
      }
      player.streaks.lastActiveDate = new Date();
    }

    // XP calculation
    const { total: xpGained } = calculateXPGain({
      difficulty: quest.difficulty,
      statTarget: quest.statTarget,
      streak: questStreak,
      playerClass: player.class,
      activeItems: player.activeItems
    });

    // Scholar bonus on side quests
    let finalXP = xpGained;
    if (player.class === 'scholar' && quest.type === 'side' && player.skills.includes('analytical_mind')) {
      finalXP = Math.floor(finalXP * 1.25);
    }
    // Eureka: scholar main quest bonus
    if (player.class === 'scholar' && quest.type === 'main' && player.skills.includes('eureka')) {
      finalXP += 50;
    }

    // Apply XP to player
    const events = applyXPAndLevelUp(player, finalXP);
    player.statXP[quest.statTarget] = (player.statXP[quest.statTarget] || 0) + Math.floor(finalXP * 0.3);
    player.stats[quest.statTarget] = Math.min(999, (player.stats[quest.statTarget] || 0) + Math.floor(finalXP / 50));
    player.currency += quest.coinReward || 10;

    // First quest badge
    const allCompleted = await Quest.countDocuments({ userId: req.user._id, status: 'completed' });
    if (allCompleted === 0 && !player.badges.includes('first_quest')) {
      player.badges.push('first_quest');
      events.push({ type: 'badge', badge: BADGES.first_quest });
    }

    // Streak badges
    if (player.streaks.overall === 7 && !player.badges.includes('week_streak')) {
      player.badges.push('week_streak');
      events.push({ type: 'badge', badge: BADGES.week_streak });
    }
    if (player.streaks.overall === 30 && !player.badges.includes('no_days_off')) {
      player.badges.push('no_days_off');
      events.push({ type: 'badge', badge: BADGES.no_days_off });
    }

    // Skill unlocks
    const newSkills = checkSkillUnlocks(player);
    if (newSkills.length > 0) events.push({ type: 'skills', skills: newSkills });

    // Story log entry
    if (events.some(e => e.type === 'levelup')) {
      player.storyLog.push({
        chapter: `Level ${player.level}`,
        text: `${player.name} ascended to level ${player.level}. The hunter grows stronger.`,
        type: 'levelup',
        date: new Date()
      });
    }

    // Active boss damage
    const activeBoss = await Boss.findOne({ userId: req.user._id, status: 'active' });
    let bossDamageDealt = 0;
    if (activeBoss) {
      bossDamageDealt = quest.bossDamage || 20;
      activeBoss.currentHP = Math.max(0, activeBoss.currentHP - bossDamageDealt);
      activeBoss.damageLog.push({ questId: quest._id, questTitle: quest.title, damage: bossDamageDealt });

      if (activeBoss.currentHP <= 0) {
        activeBoss.status = 'won';
        player.currency += activeBoss.coinReward || 100;
        const bossXP = applyXPAndLevelUp(player, activeBoss.xpReward);
        events.push(...bossXP, { type: 'boss_win', boss: activeBoss.name });

        if (!player.badges.includes('boss_slayer')) {
          player.badges.push('boss_slayer');
          events.push({ type: 'badge', badge: BADGES.boss_slayer });
        }

        player.storyLog.push({
          chapter: `Boss Defeated`,
          text: `${player.name} defeated ${activeBoss.name}! A legendary victory echoes through the void.`,
          type: 'boss',
          date: new Date()
        });
      }
      await activeBoss.save();
    }

    // Mark quest complete
    quest.status = 'completed';
    quest.streak = questStreak;
    quest.lastCompletedAt = new Date();
    await quest.save();
    await req.user.save();

    res.json({
      quest,
      xpGained: finalXP,
      coinGained: quest.coinReward,
      events,
      bossDamageDealt,
      player: {
        level: player.level,
        currentXP: player.currentXP,
        totalXP: player.totalXP,
        currency: player.currency,
        stats: player.stats,
        rank: player.rank,
        skills: player.skills
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/quests/:id/fail
const failQuest = async (req, res) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });

    const player = req.user.player;
    if (!player) return res.status(404).json({ message: 'No player found' });

    const events = [];

    // Shadow ghost protocol — first miss per week
    const isShadow = player.class === 'shadow' && player.skills.includes('ghost_protocol');
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const ghostUsedThisWeek = player.storyLog.some(e =>
      e.type === 'daily' && e.text?.includes('Ghost Protocol') && new Date(e.date) >= weekStart
    );

    let penaltyApplied = 0;
    if (!(isShadow && !ghostUsedThisWeek)) {
      penaltyApplied = calculatePenalty({
        difficulty: quest.difficulty,
        statTarget: quest.statTarget,
        playerClass: player.class,
        skills: player.skills
      });

      // Apply stat drop
      if (quest.statTarget && player.stats[quest.statTarget] !== undefined) {
        let floor = player.class === 'sage' && player.skills.includes('equilibrium') ? 5 : 0;
        player.stats[quest.statTarget] = Math.max(floor, player.stats[quest.statTarget] - penaltyApplied);
      }

      // XP decay
      const xpLost = Math.floor(quest.xpReward * 0.2);
      player.currentXP = Math.max(0, player.currentXP - xpLost);
      player.totalXP = Math.max(0, player.totalXP - xpLost);
      events.push({ type: 'penalty', stat: quest.statTarget, amount: penaltyApplied, xpLost });
    } else {
      player.storyLog.push({ chapter: 'Ghost Protocol', text: `${player.name} activated Ghost Protocol. One miss forgiven.`, type: 'daily', date: new Date() });
    }

    // Fatigue debuff after 3 fails of same quest
    const recentFails = await Quest.countDocuments({ userId: req.user._id, title: quest.title, status: 'failed' });
    if (recentFails >= 2) {
      const duration = player.class === 'shadow' ? 12 : player.class === 'scholar' && player.skills.includes('memory_palace') ? 12 : 24;
      const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
      const existingFatigue = player.debuffs.find(d => d.type === 'fatigue');
      if (!existingFatigue) {
        player.debuffs.push({ type: 'fatigue', expiresAt });
        events.push({ type: 'debuff', debuff: 'fatigue', duration });
      }
    }

    // Reset quest streak
    player.streaks.perQuest.set(quest._id.toString(), 0);

    quest.status = 'failed';
    quest.streak = 0;
    await quest.save();
    await req.user.save();

    res.json({ quest, penaltyApplied, events, player: { stats: player.stats, debuffs: player.debuffs } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/quests/:id
const deleteQuest = async (req, res) => {
  try {
    await Quest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Quest deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/quests/:id/subtask/:subtaskId
const toggleSubtask = async (req, res) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) return res.status(404).json({ message: 'Quest not found' });

    const subtask = quest.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.done = !subtask.done;
    await quest.save();
    res.json({ quest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getQuests, createQuest, completeQuest, failQuest, deleteQuest, toggleSubtask };
