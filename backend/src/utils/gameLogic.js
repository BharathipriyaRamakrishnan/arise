// ─── XP & LEVEL THRESHOLDS ────────────────────────────────────────────────────
const XP_FOR_LEVEL = (level) => Math.floor(100 * Math.pow(level, 1.5));

const RANKS = [
  { rank: 'E', minLevel: 1 },
  { rank: 'D', minLevel: 5 },
  { rank: 'C', minLevel: 15 },
  { rank: 'B', minLevel: 30 },
  { rank: 'A', minLevel: 50 },
  { rank: 'S', minLevel: 75 },
  { rank: 'SS', minLevel: 100 },
  { rank: 'SSS', minLevel: 150 },
];

const getRank = (level) => {
  let rank = 'E';
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r.rank;
  }
  return rank;
};

// ─── CLASS BASE STATS ─────────────────────────────────────────────────────────
const CLASS_BASE_STATS = {
  warrior:  { strength: 15, intelligence: 5,  discipline: 10, charisma: 5,  health: 15 },
  scholar:  { strength: 5,  intelligence: 15, discipline: 10, charisma: 5,  health: 15 },
  shadow:   { strength: 5,  intelligence: 10, discipline: 15, charisma: 15, health: 5  },
  sage:     { strength: 10, intelligence: 10, discipline: 10, charisma: 10, health: 10 },
};

// ─── CLASS XP BONUS MULTIPLIERS ───────────────────────────────────────────────
const CLASS_XP_BONUS = {
  warrior: (stat) => stat === 'strength' ? 1.5 : 1.0,
  scholar: (stat) => stat === 'intelligence' ? 1.5 : 1.0,
  shadow:  (stat) => (stat === 'discipline' || stat === 'charisma') ? 1.4 : 1.0,
  sage:    (stat) => 1.25,
};

// ─── STREAK MULTIPLIERS ───────────────────────────────────────────────────────
const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.8;
  if (streak >= 7)  return 1.5;
  if (streak >= 3)  return 1.2;
  return 1.0;
};

// ─── DIFFICULTY XP BASE ───────────────────────────────────────────────────────
const DIFFICULTY_XP = {
  easy: 20,
  medium: 50,
  hard: 100,
  legendary: 250,
};

// ─── COIN REWARDS ─────────────────────────────────────────────────────────────
const DIFFICULTY_COINS = {
  easy: 5,
  medium: 10,
  hard: 20,
  legendary: 50,
};

// ─── SKILL DEFINITIONS (class-specific + shared) ──────────────────────────────
const SKILLS = {
  // Warrior skills
  iron_will:      { id: 'iron_will',      name: 'Iron Will',       class: 'warrior', description: '+10% Strength XP gain', icon: '🔩', statBonus: { stat: 'strength', xpMultiplier: 0.1 }, unlockCondition: { type: 'streak', questStat: 'strength', days: 7 } },
  battle_hardened:{ id: 'battle_hardened',name: 'Battle Hardened', class: 'warrior', description: 'Strength penalties reduced 30%', icon: '🛡️', passive: true, unlockCondition: { type: 'level', value: 5 } },
  endurance_king: { id: 'endurance_king', name: 'Endurance King',  class: 'warrior', description: '+20% Health XP gain', icon: '💪', statBonus: { stat: 'health', xpMultiplier: 0.2 }, unlockCondition: { type: 'statXP', stat: 'strength', value: 500 } },
  berserker:      { id: 'berserker',      name: 'Berserker Mode',  class: 'warrior', description: '2x Strength XP for 1h after any quest', icon: '⚔️', unlockCondition: { type: 'level', value: 20 } },

  // Scholar skills
  deep_focus:     { id: 'deep_focus',     name: 'Deep Focus',      class: 'scholar', description: '+10% Intelligence XP gain', icon: '🧠', statBonus: { stat: 'intelligence', xpMultiplier: 0.1 }, unlockCondition: { type: 'streak', questStat: 'intelligence', days: 7 } },
  analytical_mind:{ id: 'analytical_mind',name: 'Analytical Mind', class: 'scholar', description: 'Side quest XP +25%', icon: '🔬', passive: true, unlockCondition: { type: 'level', value: 5 } },
  memory_palace:  { id: 'memory_palace',  name: 'Memory Palace',   class: 'scholar', description: 'Fatigue debuff duration halved', icon: '🏛️', unlockCondition: { type: 'statXP', stat: 'intelligence', value: 500 } },
  eureka:         { id: 'eureka',         name: 'Eureka Protocol', class: 'scholar', description: 'Completing main quests grants +50 bonus XP', icon: '💡', unlockCondition: { type: 'level', value: 20 } },

  // Shadow skills
  ghost_protocol: { id: 'ghost_protocol', name: 'Ghost Protocol',  class: 'shadow', description: 'First missed quest/week has no penalty', icon: '👻', passive: true, unlockCondition: { type: 'level', value: 5 } },
  night_owl:      { id: 'night_owl',      name: 'Night Owl',       class: 'shadow', description: 'Discipline quests completed after 10pm give 1.3x XP', icon: '🦉', unlockCondition: { type: 'streak', questStat: 'discipline', days: 7 } },
  social_cipher:  { id: 'social_cipher',  name: 'Social Cipher',   class: 'shadow', description: '+15% Charisma XP gain', icon: '🎭', statBonus: { stat: 'charisma', xpMultiplier: 0.15 }, unlockCondition: { type: 'statXP', stat: 'charisma', value: 300 } },
  silent_grind:   { id: 'silent_grind',   name: 'Silent Grind',    class: 'shadow', description: 'Streak shields last 2 days instead of 1', icon: '🌑', unlockCondition: { type: 'level', value: 20 } },

  // Sage skills
  aura_mastery:   { id: 'aura_mastery',   name: 'Aura Mastery',    class: 'sage', description: 'All stat XP +5%', icon: '🔮', unlockCondition: { type: 'level', value: 5 } },
  equilibrium:    { id: 'equilibrium',    name: 'Equilibrium',     class: 'sage', description: 'No stat can drop below 5 (passive)', icon: '⚖️', passive: true, unlockCondition: { type: 'level', value: 10 } },
  inner_peace:    { id: 'inner_peace',    name: 'Inner Peace',     class: 'sage', description: 'Debuffs expire 25% faster', icon: '🌿', unlockCondition: { type: 'statXP', stat: 'discipline', value: 400 } },
  transcendence:  { id: 'transcendence',  name: 'Transcendence',   class: 'sage', description: 'After level 50: all XP gain +30%', icon: '✨', unlockCondition: { type: 'level', value: 50 } },
};

// ─── BADGE DEFINITIONS ────────────────────────────────────────────────────────
const BADGES = {
  first_quest:    { id: 'first_quest',   name: 'First Step',      icon: '👣', description: 'Complete your first quest' },
  week_streak:    { id: 'week_streak',   name: 'Seven Strong',    icon: '🔥', description: '7-day overall streak' },
  boss_slayer:    { id: 'boss_slayer',   name: 'Boss Slayer',     icon: '⚔️', description: 'Defeat your first boss' },
  level_10:       { id: 'level_10',      name: 'Rising Hunter',   icon: '⬆️', description: 'Reach level 10' },
  scholar_elite:  { id: 'scholar_elite', name: 'Scholar Elite',   icon: '📚', description: 'Intelligence stat reaches 100' },
  iron_body:      { id: 'iron_body',     name: 'Iron Body',       icon: '💪', description: 'Strength stat reaches 100' },
  no_days_off:    { id: 'no_days_off',   name: 'No Days Off',     icon: '📅', description: '30-day overall streak' },
  rank_s:         { id: 'rank_s',        name: 'Rank S',          icon: '⭐', description: 'Achieve Rank S' },
};

// ─── DEFAULT DAILY QUESTS PER CLASS ──────────────────────────────────────────
const DEFAULT_DAILY_QUESTS = {
  warrior: [
    { title: 'Morning Workout', icon: '🏋️', statTarget: 'strength', difficulty: 'medium', description: 'Complete your physical training' },
    { title: 'Stay Hydrated', icon: '💧', statTarget: 'health', difficulty: 'easy', description: 'Drink 8 glasses of water' },
    { title: 'Early Rise', icon: '🌅', statTarget: 'discipline', difficulty: 'easy', description: 'Wake up before 7am' },
  ],
  scholar: [
    { title: 'Study Session', icon: '📖', statTarget: 'intelligence', difficulty: 'medium', description: 'Study for at least 2 hours' },
    { title: 'Read 20 Pages', icon: '📚', statTarget: 'intelligence', difficulty: 'easy', description: 'Read 20 pages of any book' },
    { title: 'Sleep by 11pm', icon: '🌙', statTarget: 'health', difficulty: 'easy', description: 'Get proper rest' },
  ],
  shadow: [
    { title: 'Social Connection', icon: '🤝', statTarget: 'charisma', difficulty: 'easy', description: 'Have a meaningful conversation' },
    { title: 'No Procrastination', icon: '⏰', statTarget: 'discipline', difficulty: 'hard', description: 'Complete all planned tasks on time' },
    { title: 'Journaling', icon: '📝', statTarget: 'charisma', difficulty: 'easy', description: 'Write a journal entry' },
  ],
  sage: [
    { title: 'Meditation', icon: '🧘', statTarget: 'health', difficulty: 'easy', description: '10 minutes of mindfulness' },
    { title: 'Learning & Working', icon: '🌟', statTarget: 'intelligence', difficulty: 'medium', description: 'Make progress on a main goal' },
    { title: 'Physical Activity', icon: '🚶', statTarget: 'strength', difficulty: 'easy', description: 'At least 30 mins of movement' },
  ],
};

// ─── CORE XP CALCULATOR ───────────────────────────────────────────────────────
const calculateXPGain = ({ difficulty, statTarget, streak, playerClass, activeItems }) => {
  const base = DIFFICULTY_XP[difficulty] || 50;
  const streakMult = getStreakMultiplier(streak);
  const classMult = CLASS_XP_BONUS[playerClass]?.(statTarget) || 1.0;

  let itemMult = 1.0;
  if (activeItems) {
    const xpBoost = activeItems.find(i => i.type === 'xp_boost' && new Date(i.expiresAt) > new Date());
    if (xpBoost) itemMult = xpBoost.effect?.multiplier || 1.5;
  }

  const total = Math.floor(base * streakMult * classMult * itemMult);
  return { total, base, streakMult, classMult, itemMult };
};

// ─── PENALTY CALCULATOR ───────────────────────────────────────────────────────
const calculatePenalty = ({ difficulty, statTarget, playerClass, skills }) => {
  const base = { easy: 5, medium: 10, hard: 20, legendary: 40 }[difficulty] || 10;
  let reduction = 1.0;

  // Warrior passive: reduces strength penalties
  if (playerClass === 'warrior' && statTarget === 'strength' && skills?.includes('battle_hardened')) {
    reduction = 0.7;
  }
  // Shadow passive: ghost protocol handled in controller (first miss logic)
  // Sage passive: equilibrium - min stat floor of 5

  return Math.floor(base * reduction);
};

// ─── LEVEL UP LOGIC ───────────────────────────────────────────────────────────
const applyXPAndLevelUp = (player, xpGained) => {
  player.totalXP += xpGained;
  player.currentXP += xpGained;

  const events = [];

  while (player.currentXP >= XP_FOR_LEVEL(player.level)) {
    player.currentXP -= XP_FOR_LEVEL(player.level);
    player.level += 1;
    events.push({ type: 'levelup', level: player.level });

    // Check rank upgrade
    const newRank = getRank(player.level);
    if (newRank !== player.rank) {
      player.rank = newRank;
      events.push({ type: 'rankup', rank: newRank });
    }

    // Badge: level 10
    if (player.level === 10 && !player.badges.includes('level_10')) {
      player.badges.push('level_10');
      events.push({ type: 'badge', badge: BADGES.level_10 });
    }

    // Check rank S badge
    if (player.rank === 'S' && !player.badges.includes('rank_s')) {
      player.badges.push('rank_s');
      events.push({ type: 'badge', badge: BADGES.rank_s });
    }
  }

  return events;
};

// ─── SKILL UNLOCK CHECK ───────────────────────────────────────────────────────
const checkSkillUnlocks = (player) => {
  const unlocked = [];
  const classSkills = Object.values(SKILLS).filter(s => s.class === player.class);

  for (const skill of classSkills) {
    if (player.skills.includes(skill.id)) continue;

    const { type, value, stat, days, questStat } = skill.unlockCondition;
    let earned = false;

    if (type === 'level' && player.level >= value) earned = true;
    if (type === 'statXP' && player.statXP[stat] >= value) earned = true;
    if (type === 'streak' && player.streaks.overall >= days) earned = true;

    if (earned) {
      player.skills.push(skill.id);
      unlocked.push(skill);
    }
  }

  return unlocked;
};

module.exports = {
  XP_FOR_LEVEL, getRank, CLASS_BASE_STATS, CLASS_XP_BONUS,
  getStreakMultiplier, DIFFICULTY_XP, DIFFICULTY_COINS,
  SKILLS, BADGES, DEFAULT_DAILY_QUESTS,
  calculateXPGain, calculatePenalty, applyXPAndLevelUp, checkSkillUnlocks
};
