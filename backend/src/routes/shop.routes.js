const express = require('express');
const router = express.Router();
const { getShopItems, purchaseItem, getPurchaseHistory } = require('../controllers/shop.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/items', getShopItems);
router.post('/purchase/:itemId', purchaseItem);
router.get('/history', getPurchaseHistory);

module.exports = router;
