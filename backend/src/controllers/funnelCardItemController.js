// Controller stub para funnel_card_items

const funnelCardItemModel = require('../models/funnelCardItemModel');

const funnelCardItemController = {
  async createCardItem(req, res) {
    try {
      const client_id = req.user.client_id;
      const funnel_card_id = req.params.card_id;
      const data = { ...req.body, funnel_card_id };
      const result = await funnelCardItemModel.createCardItem(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar item do card', error: error.message });
    }
  },

  async getCardItemsByCard(req, res) {
    try {
      const client_id = req.user.client_id;
      const funnel_card_id = req.params.card_id;
      const result = await funnelCardItemModel.getCardItemsByCard(funnel_card_id, client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar itens do card', error: error.message });
    }
  },

  async getCardItemById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { item_id } = req.params;
      const result = await funnelCardItemModel.getCardItemById(item_id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Item do card não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar item do card', error: error.message });
    }
  },

  async updateCardItem(req, res) {
    try {
      const client_id = req.user.client_id;
      const { item_id } = req.params;
      const updated = await funnelCardItemModel.updateCardItem(item_id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Item do card não encontrado ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar item do card', error: error.message });
    }
  },

  async deleteCardItem(req, res) {
    try {
      const client_id = req.user.client_id;
      const { item_id } = req.params;
      const deleted = await funnelCardItemModel.deleteCardItem(item_id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item do card não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar item do card', error: error.message });
    }
  },
};

module.exports = funnelCardItemController; 