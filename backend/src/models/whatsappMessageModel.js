const { pool } = require('../config/db');

/**
 * Modelo para gerenciar mensagens WhatsApp
 */
const WhatsAppMessageModel = {
  /**
   * Listar mensagens de um chat
   */
  async findByChatId(chatId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      order = 'DESC' // DESC para mais recentes primeiro, ASC para cronológica
    } = options;

    const query = `
      SELECT 
        wm.*,
        a.name as sent_by_user_name,
        ar.name as read_by_user_name
      FROM whatsapp_messages wm
      LEFT JOIN administrators a ON wm.sent_by_user_id = a.id
      LEFT JOIN administrators ar ON wm.read_by_user_id = ar.id
      WHERE wm.chat_id = ?
      ORDER BY wm.created_at ${order}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [chatId, limit, offset]);
    return rows;
  },

  /**
   * Buscar mensagem por ID
   */
  async findById(id) {
    const query = `
      SELECT 
        wm.*,
        a.name as sent_by_user_name,
        ar.name as read_by_user_name,
        wc.phone_number,
        wc.contact_name
      FROM whatsapp_messages wm
      LEFT JOIN administrators a ON wm.sent_by_user_id = a.id
      LEFT JOIN administrators ar ON wm.read_by_user_id = ar.id
      LEFT JOIN whatsapp_chats wc ON wm.chat_id = wc.id
      WHERE wm.id = ?
    `;
    
    const [rows] = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Buscar mensagem por message_id do WhatsApp
   */
  async findByMessageId(messageId) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE message_id = ?
    `;
    
    const [rows] = await pool.query(query, [messageId]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Criar nova mensagem
   */
  async create(data) {
    const {
      chat_id,
      message_id,
      direction,
      message_type,
      content = null,
      media_url = null,
      media_filename = null,
      media_mimetype = null,
      media_size = null,
      sender_phone = null,
      sender_name = null,
      sent_by_user_id = null,
      status = 'pending'
    } = data;

    // Validações
    if (!chat_id || !message_id || !direction || !message_type) {
      throw new Error('Campos obrigatórios: chat_id, message_id, direction, message_type');
    }

    if (!['inbound', 'outbound'].includes(direction)) {
      throw new Error('Direction deve ser "inbound" ou "outbound"');
    }

    if (!['text', 'image', 'audio', 'video', 'document', 'sticker', 'location'].includes(message_type)) {
      throw new Error('Tipo de mensagem inválido');
    }

    const query = `
      INSERT INTO whatsapp_messages (
        chat_id, message_id, direction, message_type, content,
        media_url, media_filename, media_mimetype, media_size,
        sender_phone, sender_name, sent_by_user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      chat_id, message_id, direction, message_type, content,
      media_url, media_filename, media_mimetype, media_size,
      sender_phone, sender_name, sent_by_user_id, status
    ]);

    // Atualizar contadores do chat
    const WhatsAppChatModel = require('./whatsappChatModel');
    await WhatsAppChatModel.incrementMessageCount(chat_id, direction === 'inbound');
    
    // Atualizar preview da última mensagem
    const preview = this.generatePreview(message_type, content, media_filename);
    await WhatsAppChatModel.updateLastMessage(chat_id, preview, message_type);

    return this.findById(result.insertId);
  },

  /**
   * Atualizar mensagem
   */
  async update(id, data) {
    const allowedFields = [
      'content', 'media_url', 'media_filename', 'media_mimetype', 'media_size',
      'status', 'error_message', 'is_read', 'read_by_user_id', 'read_at',
      'sent_at', 'delivered_at'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }

    values.push(id);

    const query = `
      UPDATE whatsapp_messages 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await pool.query(query, values);
    return this.findById(id);
  },

  /**
   * Atualizar status da mensagem
   */
  async updateStatus(id, status, additionalData = {}) {
    const updateData = { status, ...additionalData };
    
    if (status === 'sent') {
      updateData.sent_at = new Date();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    return this.update(id, updateData);
  },

  /**
   * Marcar mensagem como lida
   */
  async markAsRead(id, userId) {
    return this.update(id, {
      is_read: true,
      read_by_user_id: userId,
      read_at: new Date()
    });
  },

  /**
   * Marcar múltiplas mensagens como lidas
   */
  async markMultipleAsRead(chatId, userId, messageIds = null) {
    let query = `
      UPDATE whatsapp_messages 
      SET is_read = TRUE, read_by_user_id = ?, read_at = CURRENT_TIMESTAMP 
      WHERE chat_id = ? AND direction = 'inbound' AND is_read = FALSE
    `;
    
    let params = [userId, chatId];

    if (messageIds && messageIds.length > 0) {
      query += ` AND id IN (${messageIds.map(() => '?').join(',')})`;
      params = params.concat(messageIds);
    }

    const [result] = await pool.query(query, params);
    return result.affectedRows;
  },

  /**
   * Obter mensagens não lidas de um chat
   */
  async getUnreadMessages(chatId) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE chat_id = ? AND direction = 'inbound' AND is_read = FALSE
      ORDER BY created_at ASC
    `;

    const [rows] = await pool.query(query, [chatId]);
    return rows;
  },

  /**
   * Obter última mensagem de um chat
   */
  async getLastMessage(chatId) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE chat_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [chatId]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Buscar mensagens por período
   */
  async findByDateRange(chatId, startDate, endDate) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE chat_id = ? 
        AND created_at >= ? 
        AND created_at <= ?
      ORDER BY created_at ASC
    `;

    const [rows] = await pool.query(query, [chatId, startDate, endDate]);
    return rows;
  },

  /**
   * Buscar mensagens por tipo
   */
  async findByType(chatId, messageType) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE chat_id = ? AND message_type = ?
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(query, [chatId, messageType]);
    return rows;
  },

  /**
   * Buscar mensagens com mídia
   */
  async findMediaMessages(chatId) {
    const query = `
      SELECT * FROM whatsapp_messages 
      WHERE chat_id = ? 
        AND message_type IN ('image', 'audio', 'video', 'document')
        AND media_url IS NOT NULL
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(query, [chatId]);
    return rows;
  },

  /**
   * Obter estatísticas de mensagens
   */
  async getStats(chatId = null, userId = null, dateRange = null) {
    let whereConditions = [];
    let queryParams = [];

    if (chatId) {
      whereConditions.push('chat_id = ?');
      queryParams.push(chatId);
    }

    if (userId) {
      whereConditions.push('sent_by_user_id = ?');
      queryParams.push(userId);
    }

    if (dateRange && dateRange.start && dateRange.end) {
      whereConditions.push('created_at >= ? AND created_at <= ?');
      queryParams.push(dateRange.start, dateRange.end);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_messages,
        COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_messages,
        COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN message_type IN ('image', 'audio', 'video', 'document') THEN 1 END) as media_messages,
        COUNT(CASE WHEN direction = 'inbound' AND is_read = FALSE THEN 1 END) as unread_messages,
        COUNT(CASE WHEN direction = 'outbound' AND status = 'failed' THEN 1 END) as failed_messages
      FROM whatsapp_messages
      ${whereClause}
    `;

    const [rows] = await pool.query(query, queryParams);
    const stats = rows[0];

    return {
      total_messages: parseInt(stats.total_messages) || 0,
      inbound_messages: parseInt(stats.inbound_messages) || 0,
      outbound_messages: parseInt(stats.outbound_messages) || 0,
      text_messages: parseInt(stats.text_messages) || 0,
      media_messages: parseInt(stats.media_messages) || 0,
      unread_messages: parseInt(stats.unread_messages) || 0,
      failed_messages: parseInt(stats.failed_messages) || 0
    };
  },

  /**
   * Gerar preview da mensagem para exibição na lista de chats
   */
  generatePreview(messageType, content, mediaFilename) {
    switch (messageType) {
      case 'text':
        return content ? content.substring(0, 100) : '';
      case 'image':
        return '📷 Imagem';
      case 'audio':
        return '🎵 Áudio';
      case 'video':
        return '🎥 Vídeo';
      case 'document':
        return `📄 ${mediaFilename || 'Documento'}`;
      case 'sticker':
        return '😀 Sticker';
      case 'location':
        return '📍 Localização';
      default:
        return 'Mensagem';
    }
  },

  /**
   * Deletar mensagem (soft delete não aplicável para mensagens)
   */
  async delete(id) {
    const query = 'DELETE FROM whatsapp_messages WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Limpar mensagens antigas (para manutenção)
   */
  async deleteOldMessages(daysOld = 365) {
    const query = `
      DELETE FROM whatsapp_messages 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const [result] = await pool.query(query, [daysOld]);
    return result.affectedRows;
  }
};

module.exports = WhatsAppMessageModel;

