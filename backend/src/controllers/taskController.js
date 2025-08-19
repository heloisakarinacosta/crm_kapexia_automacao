// Controller stub para tasks

const taskModel = require('../models/taskModel');

const taskController = {
  async createTask(req, res) {
    try {
      const client_id = req.user.client_id;
      const created_by_user_id = req.user.id;
      const data = { ...req.body, client_id, created_by_user_id };
      const result = await taskModel.createTask(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar tarefa', error: error.message });
    }
  },

  async getTasksByClient(req, res) {
    try {
      const client_id = req.user.client_id;
      const result = await taskModel.getTasksByClient(client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar tarefas', error: error.message });
    }
  },

  async getTaskById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const result = await taskModel.getTaskById(id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar tarefa', error: error.message });
    }
  },

  async updateTask(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const updated = await taskModel.updateTask(id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Tarefa não encontrada ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar tarefa', error: error.message });
    }
  },

  async deleteTask(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const deleted = await taskModel.deleteTask(id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar tarefa', error: error.message });
    }
  },
};

module.exports = taskController; 