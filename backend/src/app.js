require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./utils/db');

const authRoutes   = require('./routes/auth.routes');
const playerRoutes = require('./routes/player.routes');
const questRoutes  = require('./routes/quest.routes');
const bossRoutes   = require('./routes/boss.routes');
const shopRoutes   = require('./routes/shop.routes');

const Quest = require('./models/Quest');
const Boss  = require('./models/Boss');
const User  = require('./models/User');
const { DEFAULT_DAILY_QUESTS, DIFFICULTY_XP, DIFFICULTY_COINS } = require('./utils/gameLogic');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'https://ariselevelup.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean), 
  credentials: true 
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/bosses', bossRoutes);
app.use('/api/shop',   shopRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Daily Reset Cron (midnight) ─────────────────────────────────────────────
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily reset...');
  try {
    const users = await User.find({ 'player.onboardingComplete': true });

    for (const user of users) {
      const player = user.player;
      if (!player) continue;

      // Reset today's daily quests
      await Quest.updateMany(
        { userId: user._id, type: 'daily', status: 'active' },
        { $set: { status: 'expired' } }
      );

      // Apply missed-quest penalties
      const missedQuests = await Quest.find({ userId: user._id, type: 'daily', status: 'active' });
      for (const q of missedQuests) {
        if (q.statTarget && player.stats[q.statTarget] !== undefined) {
          player.stats[q.statTarget] = Math.max(0, player.stats[q.statTarget] - 5);
        }
      }

      // Seed fresh default daily quests
      const defaults = DEFAULT_DAILY_QUESTS[player.class] || [];
      for (const template of defaults) {
        await Quest.create({
          userId: user._id,
          type: 'daily',
          title: template.title,
          description: template.description,
          icon: template.icon,
          statTarget: template.statTarget,
          difficulty: template.difficulty,
          xpReward: DIFFICULTY_XP[template.difficulty],
          coinReward: DIFFICULTY_COINS[template.difficulty],
          statXpReward: Math.floor(DIFFICULTY_XP[template.difficulty] * 0.3),
          isDefault: true,
          bossDamage: template.difficulty === 'easy' ? 10 : template.difficulty === 'medium' ? 25 : 50
        });
      }

      // Seed random side quests (pick 3)
      const SIDE_QUESTS = [
        { title: 'Read 10 Pages', icon: '📖', statTarget: 'intelligence', difficulty: 'easy' },
        { title: 'Talk to Someone New', icon: '💬', statTarget: 'charisma', difficulty: 'easy' },
        { title: 'No Phone for 2 Hours', icon: '📵', statTarget: 'discipline', difficulty: 'medium' },
        { title: '20-Minute Walk', icon: '🚶', statTarget: 'health', difficulty: 'easy' },
        { title: 'Write 500 Words', icon: '✍️', statTarget: 'intelligence', difficulty: 'medium' },
        { title: 'Cold Shower', icon: '🚿', statTarget: 'discipline', difficulty: 'medium' },
        { title: 'Learn Something New', icon: '🔍', statTarget: 'intelligence', difficulty: 'easy' },
        { title: '100 Push-ups', icon: '💪', statTarget: 'strength', difficulty: 'hard' },
      ];
      await Quest.deleteMany({ userId: user._id, type: 'side' });
      const shuffled = SIDE_QUESTS.sort(() => Math.random() - 0.5).slice(0, 3);
      for (const sq of shuffled) {
        await Quest.create({
          userId: user._id, type: 'side',
          title: sq.title, icon: sq.icon, statTarget: sq.statTarget,
          difficulty: sq.difficulty, xpReward: DIFFICULTY_XP[sq.difficulty],
          coinReward: DIFFICULTY_COINS[sq.difficulty],
          statXpReward: Math.floor(DIFFICULTY_XP[sq.difficulty] * 0.3),
          bossDamage: sq.difficulty === 'easy' ? 10 : 25
        });
      }

      // Check overdue bosses
      const overdueBosses = await Boss.find({ userId: user._id, status: 'active', deadline: { $lt: new Date() } });
      for (const boss of overdueBosses) {
        boss.status = 'lost';
        const xpLost = boss.penaltyXP;
        player.currentXP = Math.max(0, player.currentXP - xpLost);
        player.totalXP = Math.max(0, player.totalXP - xpLost);
        player.debuffs.push({ type: 'weakened', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
        await boss.save();
      }

      await user.save();
    }

    console.log('✅ Daily reset complete');
  } catch (err) {
    console.error('❌ Daily reset error:', err.message);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
connectDB();

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Arise API running on port ${process.env.PORT || 5000}`);
  });
}

module.exports = app;
