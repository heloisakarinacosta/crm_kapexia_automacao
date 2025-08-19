const WhatsAppChatModel = require('../models/whatsappChatModel');
const WhatsAppMessageModel = require('../models/whatsappMessageModel');
const WhatsAppUserInstanceModel = require('../models/whatsappUserInstanceModel');

/**
 * Controller para gerenciar chats WhatsApp
 */
const WhatsAppChatController = {
  /**
   * Listar chats de uma instância
   */
  async list(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;
      const {
        status,
        assigned_user_id,
        unread_only,
        search,
        limit = 50,
        offset = 0
      } = req.query;

      // Verificar se o usuário tem acesso à instância
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado à instância'
        });
      }

      // Filtros baseados nas permissões do usuário
      const filters = {
        status,
        unread_only: unread_only === 'true',
        search,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Se não é supervisor, só pode ver seus próprios chats
      if (!userInstance.is_supervisor) {
        filters.assigned_user_id = user_id;
      } else if (assigned_user_id) {
        filters.assigned_user_id = assigned_user_id;
      }

      const chats = await WhatsAppChatModel.findByInstance(instance_id, filters);

      res.json({
        success: true,
        data: chats,
        total: chats.length,
        filters: filters
      });
    } catch (error) {
      console.error('Erro ao listar chats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter chat por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const { client_id, id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar se o usuário tem acesso ao chat
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Se não é supervisor, só pode ver seus próprios chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado a este chat'
        });
      }

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('Erro ao obter chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar chat
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;
      const updateData = req.body;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Se não é supervisor, só pode atualizar seus próprios chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado a este chat'
        });
      }

      const updatedChat = await WhatsAppChatModel.update(id, updateData);

      res.json({
        success: true,
        message: 'Chat atualizado com sucesso',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao atualizar chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atribuir chat a um usuário
   */
  async assign(req, res) {
    try {
      const { id } = req.params;
      const { assigned_user_id, notes } = req.body;
      const { id: user_id } = req.user;

      if (!assigned_user_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar se o usuário atual tem permissão para transferir
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || !userInstance.can_transfer_chats) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para transferir chats'
        });
      }

      // Verificar se o usuário de destino existe na instância
      const targetUserInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(assigned_user_id, chat.instance_id);
      if (!targetUserInstance || !targetUserInstance.can_receive_chats) {
        return res.status(400).json({
          success: false,
          message: 'Usuário de destino não pode receber chats'
        });
      }

      const updatedChat = await WhatsAppChatModel.assignToUser(
        id, 
        assigned_user_id, 
        user_id, 
        'manual', 
        notes
      );

      res.json({
        success: true,
        message: 'Chat atribuído com sucesso',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao atribuir chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Transferir chat entre usuários
   */
  async transfer(req, res) {
    try {
      const { id } = req.params;
      const { to_user_id, notes } = req.body;
      const { id: user_id } = req.user;

      if (!to_user_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário de destino é obrigatório'
        });
      }

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || !userInstance.can_transfer_chats) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para transferir chats'
        });
      }

      // Verificar se o usuário de destino pode receber chats
      const targetUserInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(to_user_id, chat.instance_id);
      if (!targetUserInstance || !targetUserInstance.can_receive_chats) {
        return res.status(400).json({
          success: false,
          message: 'Usuário de destino não pode receber chats'
        });
      }

      const updatedChat = await WhatsAppChatModel.transfer(
        id,
        chat.assigned_user_id,
        to_user_id,
        user_id,
        'manual',
        notes
      );

      res.json({
        success: true,
        message: 'Chat transferido com sucesso',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao transferir chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Marcar chat como resolvido
   */
  async resolve(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Se não é supervisor, só pode resolver seus próprios chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Só pode resolver seus próprios chats'
        });
      }

      const updatedChat = await WhatsAppChatModel.resolve(id, user_id);

      res.json({
        success: true,
        message: 'Chat marcado como resolvido',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao resolver chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Arquivar chat
   */
  async archive(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Se não é supervisor, só pode arquivar seus próprios chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Só pode arquivar seus próprios chats'
        });
      }

      const updatedChat = await WhatsAppChatModel.archive(id);

      res.json({
        success: true,
        message: 'Chat arquivado com sucesso',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao arquivar chat:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Marcar chat como lido
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const updatedChat = await WhatsAppChatModel.markAsRead(id, user_id);

      // Atualizar última atividade do usuário
      await WhatsAppUserInstanceModel.updateLastActivity(user_id, chat.instance_id);

      res.json({
        success: true,
        message: 'Chat marcado como lido',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao marcar chat como lido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Vincular chat a um contato do CRM
   */
  async linkToContact(req, res) {
    try {
      const { id } = req.params;
      const { contact_id } = req.body;
      const { id: user_id } = req.user;

      if (!contact_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do contato é obrigatório'
        });
      }

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const updatedChat = await WhatsAppChatModel.linkToContact(id, contact_id);

      res.json({
        success: true,
        message: 'Chat vinculado ao contato com sucesso',
        data: updatedChat
      });
    } catch (error) {
      console.error('Erro ao vincular chat ao contato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter mensagens de um chat
   */
  async getMessages(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0, order = 'DESC' } = req.query;
      const { id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Se não é supervisor, só pode ver mensagens dos seus chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado às mensagens deste chat'
        });
      }

      const messages = await WhatsAppMessageModel.findByChatId(id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        order
      });

      res.json({
        success: true,
        data: messages,
        total: messages.length
      });
    } catch (error) {
      console.error('Erro ao obter mensagens:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter estatísticas de chats
   */
  async getStats(req, res) {
    try {
      const { instance_id } = req.params;
      const { id: user_id } = req.user;

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado à instância'
        });
      }

      // Se não é supervisor, só pode ver suas próprias estatísticas
      const statsUserId = userInstance.is_supervisor ? null : user_id;
      
      const stats = await WhatsAppChatModel.getStats(instance_id, statsUserId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Distribuir chats não atribuídos automaticamente
   */
  async autoAssignChats(req, res) {
    try {
      const { instance_id } = req.params;
      const { id: user_id } = req.user;

      // Verificar se é supervisor
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem distribuir chats automaticamente'
        });
      }

      // Obter chats não atribuídos
      const unassignedChats = await WhatsAppChatModel.getUnassignedChats(instance_id, 20);
      
      // Obter usuários disponíveis
      const availableUsers = await WhatsAppUserInstanceModel.getAvailableUsers(instance_id);

      if (availableUsers.length === 0) {
        return res.json({
          success: true,
          message: 'Nenhum usuário disponível para receber chats',
          assigned: 0
        });
      }

      let assigned = 0;
      let userIndex = 0;

      for (const chat of unassignedChats) {
        const targetUser = availableUsers[userIndex % availableUsers.length];
        
        await WhatsAppChatModel.assignToUser(
          chat.id,
          targetUser.user_id,
          user_id,
          'auto_assign',
          'Distribuição automática'
        );

        assigned++;
        userIndex++;
      }

      res.json({
        success: true,
        message: `${assigned} chats distribuídos automaticamente`,
        assigned
      });
    } catch (error) {
      console.error('Erro na distribuição automática:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = WhatsAppChatController;

