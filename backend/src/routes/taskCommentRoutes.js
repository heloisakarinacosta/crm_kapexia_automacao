const express = require('express');
const router = express.Router({ mergeParams: true });
const taskCommentController = require('../controllers/taskCommentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/tasks/:task_id/comments
router.post('/', taskCommentController.createTaskComment);
router.get('/', taskCommentController.getTaskCommentsByTask);
router.get('/:comment_id', taskCommentController.getTaskCommentById);
router.put('/:comment_id', taskCommentController.updateTaskComment);
router.delete('/:comment_id', taskCommentController.deleteTaskComment);

module.exports = router; 