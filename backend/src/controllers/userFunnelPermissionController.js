// Controller stub para user_funnel_permissions

const userFunnelPermissionModel = require('../models/userFunnelPermissionModel');

const userFunnelPermissionController = {
  async createUserFunnelPermission(req, res) {
    try {
      const client_id = req.user.client_id;
      const funnel_id = req.params.funnel_id;
      const data = { ...req.body, funnel_id };
      const result = await userFunnelPermissionModel.createUserFunnelPermission(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar permissão', error: error.message });
    }
  },

  async getUserFunnelPermissionsByFunnel(req, res) {
    try {
      const client_id = req.user.client_id;
      const funnel_id = req.params.funnel_id;
      const result = await userFunnelPermissionModel.getUserFunnelPermissionsByFunnel(funnel_id, client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar permissões', error: error.message });
    }
  },

  async getUserFunnelPermissionById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { permission_id } = req.params;
      const result = await userFunnelPermissionModel.getUserFunnelPermissionById(permission_id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Permissão não encontrada' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar permissão', error: error.message });
    }
  },

  async updateUserFunnelPermission(req, res) {
    try {
      const client_id = req.user.client_id;
      const { permission_id } = req.params;
      const updated = await userFunnelPermissionModel.updateUserFunnelPermission(permission_id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Permissão não encontrada ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar permissão', error: error.message });
    }
  },

  async deleteUserFunnelPermission(req, res) {
    try {
      const client_id = req.user.client_id;
      const { permission_id } = req.params;
      const deleted = await userFunnelPermissionModel.deleteUserFunnelPermission(permission_id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Permissão não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar permissão', error: error.message });
    }
  },
};

module.exports = userFunnelPermissionController; 