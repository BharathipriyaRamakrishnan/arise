const express = require('express');
const router = express.Router();
const { createPlayer, getPlayer, getStory, getStatsSummary, resetPlayer } = require('../controllers/player.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/create', createPlayer);
router.get('/', getPlayer);
router.get('/story', getStory);
router.get('/stats', getStatsSummary);
router.put('/reset', resetPlayer);

module.exports = router;
