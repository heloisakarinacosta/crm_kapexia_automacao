// Controller stub para task_shares

const taskShareModel = require('../models/taskShareModel');

const taskShareController = {
  async createTaskShare(req, res) {
    try {
      const client_id = req.user.client_id;
      const task_id = req.params.task_id;
      const shared_by_user_id = req.user.id;
      const data = { ...req.body, task_id, shared_by_user_id };
      const result = await taskShareModel.createTaskShare(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao compartilhar tarefa', error: error.message });
    }
  },

  async getTaskSharesByTask(req, res) {
    try {
      const client_id = req.user.client_id;
      const task_id = req.params.task_id;
      const result = await taskShareModel.getTaskSharesByTask(task_id, client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar compartilhamentos', error: error.message });
    }
  },

  async getTaskShareById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { share_id } = req.params;
      const result = await taskShareModel.getTaskShareById(share_id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Compartilhamento não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar compartilhamento', error: error.message });
    }
  },

  async updateTaskShare(req, res) {
    try {
      const client_id = req.user.client_id;
      const { share_id } = req.params;
      const updated = await taskShareModel.updateTaskShare(share_id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Compartilhamento não encontrado ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar compartilhamento', error: error.message });
    }
  },

  async deleteTaskShare(req, res) {
    try {
      const client_id = req.user.client_id;
      const { share_id } = req.params;
      const deleted = await taskShareModel.deleteTaskShare(share_id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Compartilhamento não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar compartilhamento', error: error.message });
    }
  },
};

module.exports = taskShareController; 