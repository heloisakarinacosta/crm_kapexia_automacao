const DashboardCardConfig = require('../models/dashboardCardConfigModel');
const { validationResult } = require('express-validator');

const DashboardCardController = {
  // Obter configurações de cards por cliente
  async getCardsByClientId(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const cards = await DashboardCardConfig.findByClientId(clientId);
      
      res.json({
        success: true,
        data: cards
      });
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Obter dados de um card específico
  async getCardData(req, res) {
    try {
      const clientId = req.user.client_id;
      const { position } = req.params;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const cardData = await DashboardCardConfig.executeCardQuery(clientId, parseInt(position));
      
      res.json({
        success: true,
        data: cardData
      });
    } catch (error) {
      console.error('Erro ao buscar dados do card:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Criar nova configuração de card
  async createCard(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const configData = {
        client_id: clientId,
        card_position: req.body.card_position,
        card_title: req.body.card_title,
        sql_query: req.body.sql_query,
        icon: req.body.icon,
        is_active: req.body.is_active
      };

      const newCard = await DashboardCardConfig.create(configData);
      
      res.status(201).json({
        success: true,
        message: 'Configuração de card criada com sucesso',
        data: newCard
      });
    } catch (error) {
      console.error('Erro ao criar configuração de card:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Atualizar configuração de card
  async updateCard(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const configData = {
        card_position: req.body.card_position,
        card_title: req.body.card_title,
        sql_query: req.body.sql_query,
        icon: req.body.icon,
        is_active: req.body.is_active
      };

      const updatedCard = await DashboardCardConfig.update(id, configData);
      
      res.json({
        success: true,
        message: 'Configuração de card atualizada com sucesso',
        data: updatedCard
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração de card:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Excluir configuração de card
  async deleteCard(req, res) {
    try {
      const { id } = req.params;
      
      await DashboardCardConfig.delete(id);
      
      res.json({
        success: true,
        message: 'Configuração de card excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir configuração de card:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = DashboardCardController;

