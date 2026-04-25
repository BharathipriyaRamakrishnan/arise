const express = require('express');
const router = express.Router();
const { getBosses, createBoss, resolveBoss, deleteBoss } = require('../controllers/boss.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getBosses);
router.post('/', createBoss);
router.put('/:id/resolve', resolveBoss);
router.delete('/:id', deleteBoss);

module.exports = router;
