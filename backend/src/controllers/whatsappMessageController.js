const WhatsAppMessageModel = require('../models/whatsappMessageModel');
const WhatsAppChatModel = require('../models/whatsappChatModel');
const WhatsAppInstanceModel = require('../models/whatsappInstanceModel');
const WhatsAppUserInstanceModel = require('../models/whatsappUserInstanceModel');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/whatsapp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: function (req, file, cb) {
    // Permitir apenas tipos de arquivo específicos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|mp4|wav|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

/**
 * Controller para gerenciar mensagens WhatsApp
 */
const WhatsAppMessageController = {
  /**
   * Middleware para upload de arquivos
   */
  uploadMiddleware: upload.single('media'),

  /**
   * Listar mensagens de um chat
   */
  async list(req, res) {
    try {
      const { chat_id } = req.params;
      const { id: user_id } = req.user;
      const { limit = 50, offset = 0, order = 'DESC' } = req.query;

      // Verificar se o chat existe e se o usuário tem acesso
      const chat = await WhatsAppChatModel.findById(chat_id);
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

      const messages = await WhatsAppMessageModel.findByChatId(chat_id, {
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
      console.error('Erro ao listar mensagens:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter mensagem por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const message = await WhatsAppMessageModel.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Verificar se o usuário tem acesso ao chat da mensagem
      const chat = await WhatsAppChatModel.findById(message.chat_id);
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Erro ao obter mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Enviar mensagem de texto
   */
  async sendText(req, res) {
    try {
      const { chat_id } = req.params;
      const { content } = req.body;
      const { id: user_id } = req.user;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Conteúdo da mensagem é obrigatório'
        });
      }

      // Verificar se o chat existe e se o usuário tem permissão
      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || !userInstance.can_send_messages) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para enviar mensagens'
        });
      }

      // Se não é supervisor, só pode enviar em seus próprios chats
      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Só pode enviar mensagens em seus próprios chats'
        });
      }

      // Gerar ID único para a mensagem
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Criar mensagem no banco
      const message = await WhatsAppMessageModel.create({
        chat_id,
        message_id: messageId,
        direction: 'outbound',
        message_type: 'text',
        content: content.trim(),
        sent_by_user_id: user_id,
        status: 'pending'
      });

      // Enviar mensagem via API do provedor
      try {
        await this.sendMessageToProvider(chat.instance_id, chat.phone_number, content, 'text');
        
        // Atualizar status para enviado
        await WhatsAppMessageModel.updateStatus(message.id, 'sent');
        
        // Atualizar status do chat para "em progresso"
        if (chat.status === 'assigned') {
          await WhatsAppChatModel.update(chat_id, { status: 'in_progress' });
        }

        // Atualizar última atividade do usuário
        await WhatsAppUserInstanceModel.updateLastActivity(user_id, chat.instance_id);

      } catch (providerError) {
        console.error('Erro ao enviar via provedor:', providerError);
        await WhatsAppMessageModel.updateStatus(message.id, 'failed', {
          error_message: providerError.message
        });
      }

      const updatedMessage = await WhatsAppMessageModel.findById(message.id);

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: updatedMessage
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Enviar mensagem com mídia
   */
  async sendMedia(req, res) {
    try {
      const { chat_id } = req.params;
      const { caption = '' } = req.body;
      const { id: user_id } = req.user;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo de mídia é obrigatório'
        });
      }

      // Verificar permissões (mesmo processo do sendText)
      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || !userInstance.can_send_messages) {
        return res.status(403).json({
          success: false,
          message: 'Sem permissão para enviar mensagens'
        });
      }

      if (!userInstance.is_supervisor && chat.assigned_user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'Só pode enviar mensagens em seus próprios chats'
        });
      }

      // Determinar tipo de mídia baseado no arquivo
      const mediaType = this.getMediaType(req.file.mimetype);
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Criar mensagem no banco
      const message = await WhatsAppMessageModel.create({
        chat_id,
        message_id: messageId,
        direction: 'outbound',
        message_type: mediaType,
        content: caption,
        media_url: `/uploads/whatsapp/${req.file.filename}`,
        media_filename: req.file.originalname,
        media_mimetype: req.file.mimetype,
        media_size: req.file.size,
        sent_by_user_id: user_id,
        status: 'pending'
      });

      // Enviar mídia via API do provedor
      try {
        await this.sendMessageToProvider(
          chat.instance_id, 
          chat.phone_number, 
          req.file.path, 
          mediaType,
          caption
        );
        
        await WhatsAppMessageModel.updateStatus(message.id, 'sent');
        
        if (chat.status === 'assigned') {
          await WhatsAppChatModel.update(chat_id, { status: 'in_progress' });
        }

        await WhatsAppUserInstanceModel.updateLastActivity(user_id, chat.instance_id);

      } catch (providerError) {
        console.error('Erro ao enviar mídia via provedor:', providerError);
        await WhatsAppMessageModel.updateStatus(message.id, 'failed', {
          error_message: providerError.message
        });
      }

      const updatedMessage = await WhatsAppMessageModel.findById(message.id);

      res.status(201).json({
        success: true,
        message: 'Mídia enviada com sucesso',
        data: updatedMessage
      });
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Marcar mensagem como lida
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const message = await WhatsAppMessageModel.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Verificar permissões
      const chat = await WhatsAppChatModel.findById(message.chat_id);
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const updatedMessage = await WhatsAppMessageModel.markAsRead(id, user_id);

      res.json({
        success: true,
        message: 'Mensagem marcada como lida',
        data: updatedMessage
      });
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Marcar múltiplas mensagens como lidas
   */
  async markMultipleAsRead(req, res) {
    try {
      const { chat_id } = req.params;
      const { message_ids } = req.body;
      const { id: user_id } = req.user;

      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      // Verificar permissões
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const affectedRows = await WhatsAppMessageModel.markMultipleAsRead(
        chat_id, 
        user_id, 
        message_ids
      );

      // Atualizar contador do chat
      await WhatsAppChatModel.markAsRead(chat_id, user_id);

      res.json({
        success: true,
        message: `${affectedRows} mensagens marcadas como lidas`,
        affected_rows: affectedRows
      });
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Buscar mensagens por tipo
   */
  async searchByType(req, res) {
    try {
      const { chat_id, type } = req.params;
      const { id: user_id } = req.user;

      // Verificar permissões
      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const messages = await WhatsAppMessageModel.findByType(chat_id, type);

      res.json({
        success: true,
        data: messages,
        total: messages.length
      });
    } catch (error) {
      console.error('Erro ao buscar mensagens por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter mensagens com mídia
   */
  async getMediaMessages(req, res) {
    try {
      const { chat_id } = req.params;
      const { id: user_id } = req.user;

      // Verificar permissões
      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const messages = await WhatsAppMessageModel.findMediaMessages(chat_id);

      res.json({
        success: true,
        data: messages,
        total: messages.length
      });
    } catch (error) {
      console.error('Erro ao obter mensagens com mídia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter estatísticas de mensagens
   */
  async getStats(req, res) {
    try {
      const { chat_id } = req.params;
      const { id: user_id } = req.user;
      const { start_date, end_date } = req.query;

      // Verificar permissões
      const chat = await WhatsAppChatModel.findById(chat_id);
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat não encontrado'
        });
      }

      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      if (!userInstance || (!userInstance.is_supervisor && chat.assigned_user_id !== user_id)) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const dateRange = start_date && end_date ? { start: start_date, end: end_date } : null;
      const stats = await WhatsAppMessageModel.getStats(chat_id, null, dateRange);

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
   * Deletar mensagem
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { id: user_id } = req.user;

      const message = await WhatsAppMessageModel.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Mensagem não encontrada'
        });
      }

      // Verificar permissões (apenas supervisores podem deletar)
      const chat = await WhatsAppChatModel.findById(message.chat_id);
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, chat.instance_id);
      
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem deletar mensagens'
        });
      }

      // Deletar arquivo de mídia se existir
      if (message.media_url) {
        const filePath = path.join(__dirname, '../../', message.media_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await WhatsAppMessageModel.delete(id);

      res.json({
        success: true,
        message: 'Mensagem deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Enviar mensagem via API do provedor
   */
  async sendMessageToProvider(instanceId, phoneNumber, content, messageType, caption = '') {
    try {
      const instance = await WhatsAppInstanceModel.findById(instanceId);
      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const operationType = messageType === 'text' ? 'send_message' : 'send_media';
      const httpConfig = await WhatsAppInstanceModel.getHttpConfig(instanceId, operationType);
      
      if (!httpConfig) {
        throw new Error(`Configuração HTTP não encontrada para ${operationType}`);
      }

      // Preparar dados da requisição
      const requestData = {
        phone_number: phoneNumber,
        message_content: messageType === 'text' ? content : caption,
        media_file: messageType !== 'text' ? content : undefined
      };

      // Fazer requisição usando o método do controller de instâncias
      const WhatsAppInstanceController = require('./whatsappInstanceController');
      const response = await WhatsAppInstanceController.makeHttpRequest(
        instance, 
        httpConfig, 
        requestData
      );

      return response;
    } catch (error) {
      console.error('Erro ao enviar via provedor:', error);
      throw error;
    }
  },

  /**
   * Determinar tipo de mídia baseado no MIME type
   */
  getMediaType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.startsWith('video/')) return 'video';
    return 'document';
  }
};

module.exports = WhatsAppMessageController;

