const express = require('express');
const router = express.Router({ mergeParams: true });
const taskShareController = require('../controllers/taskShareController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/tasks/:task_id/shares
router.post('/', taskShareController.createTaskShare);
router.get('/', taskShareController.getTaskSharesByTask);
router.get('/:share_id', taskShareController.getTaskShareById);
router.put('/:share_id', taskShareController.updateTaskShare);
router.delete('/:share_id', taskShareController.deleteTaskShare);

module.exports = router; 