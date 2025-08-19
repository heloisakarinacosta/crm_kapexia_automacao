// Controller stub para client_funnel_settings

const clientFunnelSettingsModel = require('../models/clientFunnelSettingsModel');

const clientFunnelSettingsController = {
  async createClientFunnelSettings(req, res) {
    try {
      const client_id = req.user.client_id;
      const data = { ...req.body, client_id };
      const result = await clientFunnelSettingsModel.createClientFunnelSettings(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar configuração de funil do cliente', error: error.message });
    }
  },

  async getClientFunnelSettingsByClient(req, res) {
    try {
      const client_id = req.user.client_id;
      const result = await clientFunnelSettingsModel.getClientFunnelSettingsByClient(client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar configurações de funil do cliente', error: error.message });
    }
  },

  async getClientFunnelSettingsById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const result = await clientFunnelSettingsModel.getClientFunnelSettingsById(id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Configuração não encontrada' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar configuração', error: error.message });
    }
  },

  async updateClientFunnelSettings(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const updated = await clientFunnelSettingsModel.updateClientFunnelSettings(id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Configuração não encontrada ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar configuração', error: error.message });
    }
  },

  async deleteClientFunnelSettings(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const deleted = await clientFunnelSettingsModel.deleteClientFunnelSettings(id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Configuração não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar configuração', error: error.message });
    }
  },
};

module.exports = clientFunnelSettingsController; 