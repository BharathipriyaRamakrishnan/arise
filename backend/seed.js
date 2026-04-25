require('dotenv').config();
const mongoose = require('mongoose');
const ShopItem = require('./src/models/ShopItem');
const Quest = require('./src/models/Quest');
const connectDB = require('./src/utils/db');

const SHOP_ITEMS = [
  {
    name: 'XP Boost (24h)',
    description: 'Gain 1.5x XP on all actions for 24 hours.',
    type: 'xp_boost',
    cost: 50,
    effect: { duration: 24, multiplier: 1.5 },
    icon: '⚡',
    rarity: 'common'
  },
  {
    name: 'Streak Shield',
    description: 'Protects your streak from breaking once. Lasts 24 hours.',
    type: 'streak_shield',
    cost: 80,
    effect: {},
    icon: '🛡️',
    rarity: 'common'
  },
  {
    name: 'Cheat Day Pass',
    description: 'Skip one daily quest with absolutely no penalties.',
    type: 'cheat_day',
    cost: 100,
    effect: {},
    icon: '🎭',
    rarity: 'rare'
  },
  {
    name: 'Strength Elixir',
    description: 'Instantly boost your Strength stat by +10.',
    type: 'stat_elixir',
    cost: 60,
    effect: { stat: 'strength', amount: 10 },
    icon: '💊',
    rarity: 'common'
  },
  {
    name: 'Intelligence Elixir',
    description: 'Instantly boost your Intelligence stat by +10.',
    type: 'stat_elixir',
    cost: 60,
    effect: { stat: 'intelligence', amount: 10 },
    icon: '🧪',
    rarity: 'common'
  },
  {
    name: 'Discipline Elixir',
    description: 'Instantly boost your Discipline stat by +10.',
    type: 'stat_elixir',
    cost: 60,
    effect: { stat: 'discipline', amount: 10 },
    icon: '🔮',
    rarity: 'common'
  },
  {
    name: 'Health Elixir',
    description: 'Instantly boost your Health stat by +10.',
    type: 'stat_elixir',
    cost: 60,
    effect: { stat: 'health', amount: 10 },
    icon: '❤️',
    rarity: 'common'
  },
  {
    name: 'Rank Boost Token',
    description: 'Gain +500 bonus XP toward your next level immediately.',
    type: 'rank_token',
    cost: 200,
    effect: { amount: 500 },
    icon: '🔮',
    rarity: 'epic'
  },
  {
    name: 'Obsidian Aura Frame',
    description: 'A dark obsidian glow around your character avatar.',
    type: 'aura_frame',
    cost: 120,
    effect: {},
    icon: '🖤',
    rarity: 'rare'
  },
  {
    name: 'Crimson Aura Frame',
    description: 'A blazing crimson aura radiates around your avatar.',
    type: 'aura_frame',
    cost: 120,
    effect: {},
    icon: '❤️‍🔥',
    rarity: 'rare'
  },
  {
    name: 'Phantom Aura Frame',
    description: 'A ghostly violet shimmer, exclusive to Shadow class hunters.',
    type: 'aura_frame',
    cost: 150,
    effect: {},
    icon: '👻',
    classRestricted: 'shadow',
    rarity: 'epic'
  },
  {
    name: 'Scholar\'s Tome',
    description: 'A legendary boost: +1000 XP and +15 Intelligence. Only for Scholars.',
    type: 'rank_token',
    cost: 350,
    effect: { amount: 1000, stat: 'intelligence', statAmount: 15 },
    icon: '📜',
    classRestricted: 'scholar',
    rarity: 'legendary'
  },
  {
    name: 'Warrior\'s War Cry',
    description: 'A legendary boost: +1000 XP and +15 Strength. Only for Warriors.',
    type: 'rank_token',
    cost: 350,
    effect: { amount: 1000, stat: 'strength', statAmount: 15 },
    icon: '⚔️',
    classRestricted: 'warrior',
    rarity: 'legendary'
  },
  {
    name: 'Sage\'s Equilibrium',
    description: 'Legendary: +1000 XP and +5 to all stats. Only for Sages.',
    type: 'rank_token',
    cost: 400,
    effect: { amount: 1000 },
    icon: '✨',
    classRestricted: 'sage',
    rarity: 'legendary'
  },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding shop items...');
  await ShopItem.deleteMany({});
  await ShopItem.insertMany(SHOP_ITEMS);
  console.log(`✅ ${SHOP_ITEMS.length} shop items seeded`);

  console.log('✅ Seed complete');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
