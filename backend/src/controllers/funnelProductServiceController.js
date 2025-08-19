// Controller stub para products_services

const funnelProductServiceModel = require('../models/funnelProductServiceModel');

const funnelProductServiceController = {
  async createProductService(req, res) {
    try {
      const client_id = req.user.client_id;
      const data = { ...req.body, client_id };
      const result = await funnelProductServiceModel.createProductService(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar produto/serviço', error: error.message });
    }
  },

  async getProductServicesByClient(req, res) {
    try {
      const client_id = req.user.client_id;
      const result = await funnelProductServiceModel.getProductServicesByClient(client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar produtos/serviços', error: error.message });
    }
  },

  async getProductServiceById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const result = await funnelProductServiceModel.getProductServiceById(id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Produto/serviço não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar produto/serviço', error: error.message });
    }
  },

  async updateProductService(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const updated = await funnelProductServiceModel.updateProductService(id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Produto/serviço não encontrado ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar produto/serviço', error: error.message });
    }
  },

  async deleteProductService(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const deleted = await funnelProductServiceModel.deleteProductService(id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Produto/serviço não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar produto/serviço', error: error.message });
    }
  },
};

module.exports = funnelProductServiceController; 