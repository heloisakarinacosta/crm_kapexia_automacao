const express = require('express');
const router = express.Router({ mergeParams: true });
const funnelCardCommentController = require('../controllers/funnelCardCommentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/funnels/:funnel_id/cards/:card_id/comments
router.post('/', funnelCardCommentController.createComment);
router.get('/', funnelCardCommentController.getCommentsByCard);
router.get('/:comment_id', funnelCardCommentController.getCommentById);
router.put('/:comment_id', funnelCardCommentController.updateComment);
router.delete('/:comment_id', funnelCardCommentController.deleteComment);

module.exports = router; 