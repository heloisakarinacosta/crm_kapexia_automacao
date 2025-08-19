// Controller stub para task_comments

const taskCommentModel = require('../models/taskCommentModel');

const taskCommentController = {
  async createTaskComment(req, res) {
    try {
      const client_id = req.user.client_id;
      const user_id = req.user.id;
      const task_id = req.params.task_id;
      const data = { ...req.body, task_id, user_id };
      const result = await taskCommentModel.createTaskComment(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar comentário', error: error.message });
    }
  },

  async getTaskCommentsByTask(req, res) {
    try {
      const client_id = req.user.client_id;
      const task_id = req.params.task_id;
      const result = await taskCommentModel.getTaskCommentsByTask(task_id, client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar comentários', error: error.message });
    }
  },

  async getTaskCommentById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { comment_id } = req.params;
      const result = await taskCommentModel.getTaskCommentById(comment_id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar comentário', error: error.message });
    }
  },

  async updateTaskComment(req, res) {
    try {
      const client_id = req.user.client_id;
      const { comment_id } = req.params;
      const updated = await taskCommentModel.updateTaskComment(comment_id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Comentário não encontrado ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar comentário', error: error.message });
    }
  },

  async deleteTaskComment(req, res) {
    try {
      const client_id = req.user.client_id;
      const { comment_id } = req.params;
      const deleted = await taskCommentModel.deleteTaskComment(comment_id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Comentário não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar comentário', error: error.message });
    }
  },
};

module.exports = taskCommentController; 