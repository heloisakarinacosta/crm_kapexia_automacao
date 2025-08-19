const WhatsAppUserInstanceModel = require('../models/whatsappUserInstanceModel');
const WhatsAppInstanceModel = require('../models/whatsappInstanceModel');

/**
 * Controller para gerenciar usuários nas instâncias WhatsApp
 */
const WhatsAppUserInstanceController = {
  /**
   * Listar usuários de uma instância
   */
  async listUsers(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário tem permissão (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem listar usuários'
        });
      }

      const users = await WhatsAppUserInstanceModel.findByInstanceId(instance_id);

      res.json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      console.error('Erro ao listar usuários da instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Adicionar usuário à instância
   */
  async addUser(req, res) {
    try {
      const { instance_id } = req.params;
      const { 
        user_id: target_user_id,
        can_receive_chats = true,
        can_send_messages = true,
        can_transfer_chats = false,
        is_supervisor = false,
        max_concurrent_chats = 10
      } = req.body;
      const { client_id, id: user_id } = req.user;

      if (!target_user_id) {
        return res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório'
        });
      }

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário atual tem permissão (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem adicionar usuários'
        });
      }

      // Verificar se o usuário alvo já está na instância
      const existingUserInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(target_user_id, instance_id);
      if (existingUserInstance) {
        return res.status(409).json({
          success: false,
          message: 'Usuário já está vinculado a esta instância'
        });
      }

      // Verificar se o usuário alvo existe e pertence ao mesmo cliente
      const [userRows] = await require('../config/db').pool.query(
        'SELECT id, name, email FROM administrators WHERE id = ? AND client_id = ?',
        [target_user_id, client_id]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado ou não pertence ao mesmo cliente'
        });
      }

      const userData = {
        instance_id,
        user_id: target_user_id,
        can_receive_chats,
        can_send_messages,
        can_transfer_chats,
        is_supervisor,
        max_concurrent_chats
      };

      const userInstanceData = await WhatsAppUserInstanceModel.create(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário adicionado à instância com sucesso',
        data: {
          ...userInstanceData,
          user_name: userRows[0].name,
          user_email: userRows[0].email
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar usuário à instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar permissões do usuário na instância
   */
  async updateUserPermissions(req, res) {
    try {
      const { instance_id, target_user_id } = req.params;
      const updateData = req.body;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário atual tem permissão (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem atualizar permissões'
        });
      }

      // Verificar se o usuário alvo está na instância
      const targetUserInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(target_user_id, instance_id);
      if (!targetUserInstance) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado na instância'
        });
      }

      // Não permitir que o usuário remova suas próprias permissões de supervisor
      if (user_id === parseInt(target_user_id) && updateData.is_supervisor === false) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível remover suas próprias permissões de supervisor'
        });
      }

      const updatedUserInstance = await WhatsAppUserInstanceModel.updatePermissions(
        target_user_id,
        instance_id,
        updateData
      );

      res.json({
        success: true,
        message: 'Permissões atualizadas com sucesso',
        data: updatedUserInstance
      });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Remover usuário da instância
   */
  async removeUser(req, res) {
    try {
      const { instance_id, target_user_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário atual tem permissão (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem remover usuários'
        });
      }

      // Verificar se o usuário alvo está na instância
      const targetUserInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(target_user_id, instance_id);
      if (!targetUserInstance) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado na instância'
        });
      }

      // Não permitir que o usuário remova a si mesmo se for o único supervisor
      if (user_id === parseInt(target_user_id)) {
        const supervisors = await WhatsAppUserInstanceModel.getSupervisors(instance_id);
        if (supervisors.length <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Não é possível remover o último supervisor da instância'
          });
        }
      }

      // Verificar se o usuário tem chats ativos
      const activeChats = await require('../models/whatsappChatModel').countActiveChats(target_user_id, instance_id);
      if (activeChats > 0) {
        return res.status(400).json({
          success: false,
          message: `Usuário possui ${activeChats} chat(s) ativo(s). Transfira os chats antes de remover o usuário.`
        });
      }

      await WhatsAppUserInstanceModel.remove(target_user_id, instance_id);

      res.json({
        success: true,
        message: 'Usuário removido da instância com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover usuário da instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter estatísticas do usuário na instância
   */
  async getUserStats(req, res) {
    try {
      const { instance_id, target_user_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado à instância'
        });
      }

      // Se não é supervisor, só pode ver suas próprias estatísticas
      if (!userInstance.is_supervisor && user_id !== parseInt(target_user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Só pode ver suas próprias estatísticas'
        });
      }

      const stats = await WhatsAppUserInstanceModel.getUserStats(target_user_id, instance_id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter usuários disponíveis para receber chats
   */
  async getAvailableUsers(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário tem acesso à instância
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado à instância'
        });
      }

      const availableUsers = await WhatsAppUserInstanceModel.getAvailableUsers(instance_id);

      res.json({
        success: true,
        data: availableUsers,
        total: availableUsers.length
      });
    } catch (error) {
      console.error('Erro ao obter usuários disponíveis:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar status de disponibilidade do usuário
   */
  async updateAvailability(req, res) {
    try {
      const { instance_id } = req.params;
      const { is_available } = req.body;
      const { client_id, id: user_id } = req.user;

      if (typeof is_available !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Status de disponibilidade deve ser true ou false'
        });
      }

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário está na instância
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado na instância'
        });
      }

      const updatedUserInstance = await WhatsAppUserInstanceModel.updateAvailability(
        user_id,
        instance_id,
        is_available
      );

      res.json({
        success: true,
        message: `Status atualizado para ${is_available ? 'disponível' : 'indisponível'}`,
        data: updatedUserInstance
      });
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter supervisores da instância
   */
  async getSupervisors(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário tem acesso à instância
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado à instância'
        });
      }

      const supervisors = await WhatsAppUserInstanceModel.getSupervisors(instance_id);

      res.json({
        success: true,
        data: supervisors,
        total: supervisors.length
      });
    } catch (error) {
      console.error('Erro ao obter supervisores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter carga de trabalho dos usuários
   */
  async getWorkload(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário tem acesso à instância (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem ver a carga de trabalho'
        });
      }

      const workload = await WhatsAppUserInstanceModel.getWorkload(instance_id);

      res.json({
        success: true,
        data: workload,
        total: workload.length
      });
    } catch (error) {
      console.error('Erro ao obter carga de trabalho:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Listar usuários do cliente que podem ser adicionados à instância
   */
  async getAvailableUsersToAdd(req, res) {
    try {
      const { instance_id } = req.params;
      const { client_id, id: user_id } = req.user;

      // Verificar se a instância existe e pertence ao cliente
      const instance = await WhatsAppInstanceModel.findById(instance_id);
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se o usuário tem permissão (deve ser supervisor)
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem ver usuários disponíveis'
        });
      }

      // Buscar usuários do cliente que não estão na instância
      const [rows] = await require('../config/db').pool.query(`
        SELECT a.id, a.name, a.email, a.created_at
        FROM administrators a
        WHERE a.client_id = ?
        AND a.id NOT IN (
          SELECT wui.user_id 
          FROM whatsapp_user_instances wui 
          WHERE wui.instance_id = ?
        )
        ORDER BY a.name
      `, [client_id, instance_id]);

      res.json({
        success: true,
        data: rows,
        total: rows.length
      });
    } catch (error) {
      console.error('Erro ao obter usuários disponíveis para adicionar:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = WhatsAppUserInstanceController;

