const Client = require('../models/clientModel');
const { validationResult } = require('express-validator');

const ClientController = {
  // Obter todos os clientes
  async getAllClients(req, res) {
    try {
      const clients = await Client.findAll();
      res.json({ success: true, data: clients });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar clientes', 
        error: error.message 
      });
    }
  },

  // Obter cliente por ID
  async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.findById(id);
      
      if (!client) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }
      
      res.json({ success: true, data: client });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar cliente', 
        error: error.message 
      });
    }
  },

  // Criar novo cliente
  async createClient(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: errors.array() 
        });
      }
      
      const clientData = {
        name: req.body.name,
        trading_name: req.body.trading_name,
        cnpj: req.body.cnpj,
        address: req.body.address,
        phone: req.body.phone,
        profile: req.body.profile
      };
      
      const newClient = await Client.create(clientData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Cliente criado com sucesso', 
        data: newClient 
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar cliente', 
        error: error.message 
      });
    }
  },

  // Atualizar cliente existente
  async updateClient(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: errors.array() 
        });
      }
      
      const { id } = req.params;
      
      // Verificar se o cliente existe
      const existingClient = await Client.findById(id);
      if (!existingClient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }
      
      const clientData = {
        name: req.body.name,
        trading_name: req.body.trading_name,
        cnpj: req.body.cnpj,
        address: req.body.address,
        phone: req.body.phone,
        profile: req.body.profile
      };
      
      const updatedClient = await Client.update(id, clientData);
      
      res.json({ 
        success: true, 
        message: 'Cliente atualizado com sucesso', 
        data: updatedClient 
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar cliente', 
        error: error.message 
      });
    }
  },

  // Excluir cliente
  async deleteClient(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se o cliente existe
      const existingClient = await Client.findById(id);
      if (!existingClient) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }
      
      await Client.delete(id);
      
      res.json({ 
        success: true, 
        message: 'Cliente excluído com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao excluir cliente', 
        error: error.message 
      });
    }
  },

  // Obter cliente associado ao usuário atual
  async getCurrentUserClient(req, res) {
    try {
      // Obter ID do usuário do token JWT (assumindo que está disponível em req.user.id)
      const userId = req.user.id;
      
      const client = await Client.findByUserId(userId);
      
      if (!client) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao usuário atual' 
        });
      }
      
      res.json({ success: true, data: client });
    } catch (error) {
      console.error('Erro ao buscar cliente do usuário:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar cliente do usuário', 
        error: error.message 
      });
    }
  }
};

module.exports = ClientController;
