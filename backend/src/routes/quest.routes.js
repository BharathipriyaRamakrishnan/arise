const express = require('express');
const router = express.Router();
const { getQuests, createQuest, completeQuest, failQuest, deleteQuest, toggleSubtask } = require('../controllers/quest.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getQuests);
router.post('/', createQuest);
router.put('/:id/complete', completeQuest);
router.put('/:id/fail', failQuest);
router.put('/:id/subtask/:subtaskId', toggleSubtask);
router.delete('/:id', deleteQuest);

module.exports = router;
