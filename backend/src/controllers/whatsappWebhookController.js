const WhatsAppInstanceModel = require('../models/whatsappInstanceModel');
const WhatsAppChatModel = require('../models/whatsappChatModel');
const WhatsAppMessageModel = require('../models/whatsappMessageModel');
const WhatsAppUserInstanceModel = require('../models/whatsappUserInstanceModel');
const { pool } = require('../config/db');

/**
 * Controller para processar webhooks WhatsApp
 */
const WhatsAppWebhookController = {
  /**
   * Processar webhook recebido
   */
  async processWebhook(req, res) {
    try {
      const { instance_key } = req.params;
      const webhookData = req.body;
      const headers = req.headers;

      console.log('Webhook recebido:', { instance_key, webhookData, headers });

      // Buscar instância pela chave
      const instance = await WhatsAppInstanceModel.findByInstanceKey(instance_key);
      if (!instance) {
        console.error('Instância não encontrada:', instance_key);
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar token do webhook se configurado
      if (instance.webhook_token) {
        const receivedToken = headers['x-webhook-token'] || headers['authorization'];
        if (!receivedToken || !receivedToken.includes(instance.webhook_token)) {
          console.error('Token de webhook inválido');
          return res.status(401).json({
            success: false,
            message: 'Token de webhook inválido'
          });
        }
      }

      // Determinar tipo de webhook
      const webhookType = this.determineWebhookType(webhookData);

      // Registrar log do webhook
      const logId = await this.logWebhook(instance.id, webhookType, webhookData, headers);

      // Processar webhook baseado no tipo
      let result = null;
      switch (webhookType) {
        case 'message':
          result = await this.processMessageWebhook(instance, webhookData);
          break;
        case 'status':
          result = await this.processStatusWebhook(instance, webhookData);
          break;
        case 'connection':
          result = await this.processConnectionWebhook(instance, webhookData);
          break;
        default:
          console.log('Tipo de webhook não reconhecido:', webhookType);
          result = { processed: false, reason: 'Tipo não reconhecido' };
      }

      // Atualizar log com resultado do processamento
      await this.updateWebhookLog(logId, result);

      res.json({
        success: true,
        message: 'Webhook processado com sucesso',
        type: webhookType,
        processed: result.processed
      });

    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Processar webhook de mensagem
   */
  async processMessageWebhook(instance, webhookData) {
    try {
      const messageData = this.extractMessageData(webhookData);
      if (!messageData) {
        return { processed: false, reason: 'Dados de mensagem inválidos' };
      }

      const {
        messageId,
        phoneNumber,
        senderName,
        messageType,
        content,
        mediaUrl,
        mediaFilename,
        mediaMimetype,
        mediaSize,
        timestamp
      } = messageData;

      // Verificar se a mensagem já foi processada
      const existingMessage = await WhatsAppMessageModel.findByMessageId(messageId);
      if (existingMessage) {
        return { processed: false, reason: 'Mensagem já processada' };
      }

      // Buscar ou criar chat
      const chat = await WhatsAppChatModel.findOrCreateByPhone(
        instance.id,
        phoneNumber,
        senderName
      );

      // Criar mensagem
      const message = await WhatsAppMessageModel.create({
        chat_id: chat.id,
        message_id: messageId,
        direction: 'inbound',
        message_type: messageType,
        content: content,
        media_url: mediaUrl,
        media_filename: mediaFilename,
        media_mimetype: mediaMimetype,
        media_size: mediaSize,
        sender_phone: phoneNumber,
        sender_name: senderName,
        status: 'delivered'
      });

      // Atribuir chat automaticamente se não estiver atribuído
      if (chat.status === 'unassigned') {
        await this.autoAssignChat(chat);
      }

      // Tentar vincular a um contato do CRM se ainda não estiver vinculado
      if (!chat.contact_id) {
        await this.tryLinkToContact(chat, phoneNumber);
      }

      return {
        processed: true,
        chat_id: chat.id,
        message_id: message.id,
        auto_assigned: chat.status === 'unassigned'
      };

    } catch (error) {
      console.error('Erro ao processar webhook de mensagem:', error);
      return { processed: false, reason: error.message };
    }
  },

  /**
   * Processar webhook de status de mensagem
   */
  async processStatusWebhook(instance, webhookData) {
    try {
      const statusData = this.extractStatusData(webhookData);
      if (!statusData) {
        return { processed: false, reason: 'Dados de status inválidos' };
      }

      const { messageId, status, timestamp } = statusData;

      // Buscar mensagem pelo ID
      const message = await WhatsAppMessageModel.findByMessageId(messageId);
      if (!message) {
        return { processed: false, reason: 'Mensagem não encontrada' };
      }

      // Atualizar status da mensagem
      const updateData = { status };
      
      if (status === 'delivered') {
        updateData.delivered_at = new Date(timestamp);
      } else if (status === 'read') {
        updateData.delivered_at = updateData.delivered_at || new Date(timestamp);
      }

      await WhatsAppMessageModel.update(message.id, updateData);

      return {
        processed: true,
        message_id: message.id,
        new_status: status
      };

    } catch (error) {
      console.error('Erro ao processar webhook de status:', error);
      return { processed: false, reason: error.message };
    }
  },

  /**
   * Processar webhook de conexão
   */
  async processConnectionWebhook(instance, webhookData) {
    try {
      const connectionData = this.extractConnectionData(webhookData);
      if (!connectionData) {
        return { processed: false, reason: 'Dados de conexão inválidos' };
      }

      const { status, phoneNumber, qrCode } = connectionData;

      // Atualizar status da instância
      const updateData = { status };
      
      if (status === 'connected' && phoneNumber) {
        updateData.phone_number = phoneNumber;
        updateData.last_connected_at = new Date();
        updateData.qr_code = null;
        updateData.qr_expires_at = null;
      } else if (status === 'qr_pending' && qrCode) {
        updateData.qr_code = qrCode;
        updateData.qr_expires_at = new Date(Date.now() + 60000); // 1 minuto
      } else if (status === 'disconnected') {
        updateData.phone_number = null;
      }

      await WhatsAppInstanceModel.update(instance.id, updateData);

      return {
        processed: true,
        instance_id: instance.id,
        new_status: status
      };

    } catch (error) {
      console.error('Erro ao processar webhook de conexão:', error);
      return { processed: false, reason: error.message };
    }
  },

  /**
   * Determinar tipo de webhook baseado nos dados
   */
  determineWebhookType(webhookData) {
    // Lógica para diferentes provedores
    if (webhookData.event) {
      // Formato comum com campo 'event'
      if (webhookData.event === 'message' || webhookData.event === 'message.received') {
        return 'message';
      }
      if (webhookData.event === 'message.status' || webhookData.event === 'message.ack') {
        return 'status';
      }
      if (webhookData.event === 'connection' || webhookData.event === 'qr' || webhookData.event === 'ready') {
        return 'connection';
      }
    }

    // PipeGo format
    if (webhookData.type) {
      if (webhookData.type === 'message') return 'message';
      if (webhookData.type === 'ack') return 'status';
      if (webhookData.type === 'qr' || webhookData.type === 'ready') return 'connection';
    }

    // Z-API format
    if (webhookData.messageReceived) return 'message';
    if (webhookData.messageStatus) return 'status';
    if (webhookData.connected !== undefined || webhookData.qrcode) return 'connection';

    return 'other';
  },

  /**
   * Extrair dados de mensagem do webhook
   */
  extractMessageData(webhookData) {
    try {
      let messageData = {};

      // Formato PipeGo
      if (webhookData.data && webhookData.data.message) {
        const msg = webhookData.data.message;
        messageData = {
          messageId: msg.id || msg.messageId,
          phoneNumber: this.cleanPhoneNumber(msg.from || msg.phone),
          senderName: msg.fromName || msg.senderName || msg.pushName,
          messageType: this.mapMessageType(msg.type || msg.messageType),
          content: msg.body || msg.text || msg.content,
          mediaUrl: msg.mediaUrl || msg.media?.url,
          mediaFilename: msg.media?.filename || msg.filename,
          mediaMimetype: msg.media?.mimetype || msg.mimetype,
          mediaSize: msg.media?.size || msg.size,
          timestamp: msg.timestamp || webhookData.timestamp || Date.now()
        };
      }
      // Formato Z-API
      else if (webhookData.messageReceived) {
        const msg = webhookData.messageReceived;
        messageData = {
          messageId: msg.messageId,
          phoneNumber: this.cleanPhoneNumber(msg.phone),
          senderName: msg.senderName,
          messageType: this.mapMessageType(msg.messageType),
          content: msg.text?.message || msg.content,
          mediaUrl: msg.image?.imageUrl || msg.audio?.audioUrl || msg.video?.videoUrl,
          mediaFilename: msg.image?.filename || msg.audio?.filename || msg.video?.filename,
          mediaMimetype: msg.image?.mimeType || msg.audio?.mimeType || msg.video?.mimeType,
          timestamp: msg.timestamp || Date.now()
        };
      }
      // Formato genérico
      else if (webhookData.message) {
        const msg = webhookData.message;
        messageData = {
          messageId: msg.id,
          phoneNumber: this.cleanPhoneNumber(msg.from),
          senderName: msg.fromName,
          messageType: this.mapMessageType(msg.type),
          content: msg.body,
          mediaUrl: msg.mediaUrl,
          mediaFilename: msg.filename,
          mediaMimetype: msg.mimetype,
          timestamp: msg.timestamp || Date.now()
        };
      }

      // Validar dados essenciais
      if (!messageData.messageId || !messageData.phoneNumber) {
        return null;
      }

      return messageData;
    } catch (error) {
      console.error('Erro ao extrair dados da mensagem:', error);
      return null;
    }
  },

  /**
   * Extrair dados de status do webhook
   */
  extractStatusData(webhookData) {
    try {
      let statusData = {};

      // Formato PipeGo
      if (webhookData.data && webhookData.data.ack) {
        const ack = webhookData.data.ack;
        statusData = {
          messageId: ack.messageId || ack.id,
          status: this.mapMessageStatus(ack.status || ack.ack),
          timestamp: ack.timestamp || webhookData.timestamp || Date.now()
        };
      }
      // Formato Z-API
      else if (webhookData.messageStatus) {
        const status = webhookData.messageStatus;
        statusData = {
          messageId: status.messageId,
          status: this.mapMessageStatus(status.status),
          timestamp: status.timestamp || Date.now()
        };
      }

      if (!statusData.messageId || !statusData.status) {
        return null;
      }

      return statusData;
    } catch (error) {
      console.error('Erro ao extrair dados de status:', error);
      return null;
    }
  },

  /**
   * Extrair dados de conexão do webhook
   */
  extractConnectionData(webhookData) {
    try {
      let connectionData = {};

      // Formato PipeGo
      if (webhookData.type === 'qr') {
        connectionData = {
          status: 'qr_pending',
          qrCode: webhookData.data?.qr || webhookData.qr
        };
      } else if (webhookData.type === 'ready') {
        connectionData = {
          status: 'connected',
          phoneNumber: this.cleanPhoneNumber(webhookData.data?.phone || webhookData.phone)
        };
      }
      // Formato Z-API
      else if (webhookData.qrcode) {
        connectionData = {
          status: 'qr_pending',
          qrCode: webhookData.qrcode
        };
      } else if (webhookData.connected !== undefined) {
        connectionData = {
          status: webhookData.connected ? 'connected' : 'disconnected',
          phoneNumber: webhookData.connected ? this.cleanPhoneNumber(webhookData.phone) : null
        };
      }

      return connectionData;
    } catch (error) {
      console.error('Erro ao extrair dados de conexão:', error);
      return null;
    }
  },

  /**
   * Mapear tipo de mensagem para formato padrão
   */
  mapMessageType(type) {
    const typeMap = {
      'text': 'text',
      'image': 'image',
      'audio': 'audio',
      'video': 'video',
      'document': 'document',
      'sticker': 'sticker',
      'location': 'location',
      'ptt': 'audio', // Push to talk
      'voice': 'audio'
    };

    return typeMap[type] || 'text';
  },

  /**
   * Mapear status de mensagem para formato padrão
   */
  mapMessageStatus(status) {
    const statusMap = {
      '1': 'sent',
      '2': 'delivered',
      '3': 'read',
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed'
    };

    return statusMap[status] || 'sent';
  },

  /**
   * Limpar número de telefone
   */
  cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remover caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = '55' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      cleaned = '55' + cleaned;
    }
    
    return cleaned;
  },

  /**
   * Atribuir chat automaticamente
   */
  async autoAssignChat(chat) {
    try {
      const availableUsers = await WhatsAppUserInstanceModel.getAvailableUsers(chat.instance_id);
      
      if (availableUsers.length > 0) {
        // Escolher usuário com menor carga de trabalho
        const targetUser = availableUsers[0];
        
        await WhatsAppChatModel.assignToUser(
          chat.id,
          targetUser.user_id,
          null,
          'auto_assign',
          'Atribuição automática via webhook'
        );
        
        console.log(`Chat ${chat.id} atribuído automaticamente ao usuário ${targetUser.user_id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro na atribuição automática:', error);
      return false;
    }
  },

  /**
   * Tentar vincular chat a um contato do CRM
   */
  async tryLinkToContact(chat, phoneNumber) {
    try {
      // Buscar contato pelo telefone
      const [rows] = await pool.query(
        'SELECT id FROM contacts WHERE client_id = ? AND phone = ? LIMIT 1',
        [chat.client_id, phoneNumber]
      );

      if (rows.length > 0) {
        await WhatsAppChatModel.linkToContact(chat.id, rows[0].id);
        console.log(`Chat ${chat.id} vinculado ao contato ${rows[0].id}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao vincular contato:', error);
      return false;
    }
  },

  /**
   * Registrar log do webhook
   */
  async logWebhook(instanceId, webhookType, payload, headers) {
    try {
      const query = `
        INSERT INTO whatsapp_webhook_logs (
          instance_id, webhook_type, payload, headers
        ) VALUES (?, ?, ?, ?)
      `;

      const [result] = await pool.query(query, [
        instanceId,
        webhookType,
        JSON.stringify(payload),
        JSON.stringify(headers)
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Erro ao registrar log do webhook:', error);
      return null;
    }
  },

  /**
   * Atualizar log do webhook com resultado
   */
  async updateWebhookLog(logId, result) {
    try {
      if (!logId) return;

      const query = `
        UPDATE whatsapp_webhook_logs 
        SET 
          processed = ?, 
          processed_at = CURRENT_TIMESTAMP,
          processing_error = ?,
          created_chat_id = ?,
          created_message_id = ?
        WHERE id = ?
      `;

      await pool.query(query, [
        result.processed,
        result.processed ? null : result.reason,
        result.chat_id || null,
        result.message_id || null,
        logId
      ]);
    } catch (error) {
      console.error('Erro ao atualizar log do webhook:', error);
    }
  },

  /**
   * Obter logs de webhook (para debug)
   */
  async getLogs(req, res) {
    try {
      const { instance_id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const { client_id, id: user_id } = req.user;

      // Verificar se o usuário tem acesso à instância
      const userInstance = await WhatsAppUserInstanceModel.findByUserAndInstance(user_id, instance_id);
      if (!userInstance || !userInstance.is_supervisor) {
        return res.status(403).json({
          success: false,
          message: 'Apenas supervisores podem ver logs de webhook'
        });
      }

      const query = `
        SELECT * FROM whatsapp_webhook_logs 
        WHERE instance_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await pool.query(query, [instance_id, parseInt(limit), parseInt(offset)]);

      res.json({
        success: true,
        data: rows.map(row => ({
          ...row,
          payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
          headers: typeof row.headers === 'string' ? JSON.parse(row.headers) : row.headers
        })),
        total: rows.length
      });
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = WhatsAppWebhookController;

