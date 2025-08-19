const express = require('express');
const router = express.Router({ mergeParams: true });
const funnelCardItemController = require('../controllers/funnelCardItemController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/funnels/:funnel_id/cards/:card_id/items
router.post('/', funnelCardItemController.createCardItem);
router.get('/', funnelCardItemController.getCardItemsByCard);
router.get('/:item_id', funnelCardItemController.getCardItemById);
router.put('/:item_id', funnelCardItemController.updateCardItem);
router.delete('/:item_id', funnelCardItemController.deleteCardItem);

module.exports = router; 