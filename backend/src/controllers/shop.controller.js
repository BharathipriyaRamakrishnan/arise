const ShopItem = require('../models/ShopItem');
const Transaction = require('../models/Transaction');
const { applyXPAndLevelUp } = require('../utils/gameLogic');

// GET /api/shop/items
const getShopItems = async (req, res) => {
  try {
    const playerClass = req.user.player?.class;
    const query = {
      available: true,
      $or: [{ classRestricted: null }, { classRestricted: playerClass }]
    };
    const items = await ShopItem.find(query).sort({ cost: 1 });
    res.json({ items, currency: req.user.player?.currency || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/shop/purchase/:itemId
const purchaseItem = async (req, res) => {
  try {
    const item = await ShopItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const player = req.user.player;
    if (!player) return res.status(404).json({ message: 'No player found' });
    if (player.currency < item.cost) return res.status(400).json({ message: 'Not enough Arise Coins' });

    // Deduct coins
    player.currency -= item.cost;

    // Apply item effect immediately or schedule
    let expiresAt = null;
    const effect = item.effect || {};
    const events = [];

    switch (item.type) {
      case 'xp_boost':
        expiresAt = new Date(Date.now() + (effect.duration || 24) * 60 * 60 * 1000);
        player.activeItems.push({ itemId: item._id, name: item.name, type: item.type, expiresAt, effect: { multiplier: effect.multiplier || 1.5 } });
        events.push({ type: 'item_applied', name: item.name, duration: effect.duration || 24 });
        break;

      case 'streak_shield':
        expiresAt = new Date(Date.now() + (player.skills.includes('silent_grind') ? 48 : 24) * 60 * 60 * 1000);
        player.activeItems.push({ itemId: item._id, name: item.name, type: item.type, expiresAt, effect: {} });
        events.push({ type: 'item_applied', name: item.name });
        break;

      case 'cheat_day':
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        player.activeItems.push({ itemId: item._id, name: item.name, type: item.type, expiresAt, effect: {} });
        events.push({ type: 'item_applied', name: item.name });
        break;

      case 'stat_elixir':
        if (effect.stat && player.stats[effect.stat] !== undefined) {
          player.stats[effect.stat] = Math.min(999, player.stats[effect.stat] + (effect.amount || 10));
          events.push({ type: 'stat_boost', stat: effect.stat, amount: effect.amount || 10 });
        }
        break;

      case 'rank_token':
        const xpBonus = applyXPAndLevelUp(player, effect.amount || 500);
        events.push(...xpBonus, { type: 'xp_bonus', amount: effect.amount || 500 });
        break;

      case 'cosmetic':
      case 'aura_frame':
        player.badges.push(`cosmetic_${item._id}`);
        events.push({ type: 'cosmetic_unlocked', name: item.name });
        break;
    }

    // Log transaction
    await Transaction.create({
      userId: req.user._id,
      itemId: item._id,
      itemName: item.name,
      itemType: item.type,
      cost: item.cost,
      status: expiresAt ? 'applied' : 'purchased',
      appliedAt: new Date(),
      expiresAt
    });

    await req.user.save();

    res.json({ events, currency: player.currency, player: { currency: player.currency, stats: player.stats, activeItems: player.activeItems } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/shop/history
const getPurchaseHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getShopItems, purchaseItem, getPurchaseHistory };
