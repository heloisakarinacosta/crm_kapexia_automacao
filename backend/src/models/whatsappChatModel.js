const { pool } = require('../config/db');

/**
 * Modelo para gerenciar chats WhatsApp
 */
const WhatsAppChatModel = {
  /**
   * Listar chats de uma instância com filtros
   */
  async findByInstance(instanceId, filters = {}) {
    const {
      status = null,
      assigned_user_id = null,
      unread_only = false,
      search = null,
      limit = 50,
      offset = 0
    } = filters;

    let whereConditions = ['wc.instance_id = ?', 'wc.is_active = TRUE'];
    let queryParams = [instanceId];

    // Filtros
    if (status) {
      whereConditions.push('wc.status = ?');
      queryParams.push(status);
    }

    if (assigned_user_id) {
      whereConditions.push('wc.assigned_user_id = ?');
      queryParams.push(assigned_user_id);
    }

    if (unread_only) {
      whereConditions.push('wc.unread_count > 0');
    }

    if (search) {
      whereConditions.push('(wc.contact_name LIKE ? OR wc.phone_number LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT 
        wc.*,
        a.name as assigned_user_name,
        c.name as contact_full_name,
        c.email as contact_email
      FROM whatsapp_chats wc
      LEFT JOIN administrators a ON wc.assigned_user_id = a.id
      LEFT JOIN contacts c ON wc.contact_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY wc.last_message_at DESC, wc.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);
    const [rows] = await pool.query(query, queryParams);
    
    return rows;
  },

  /**
   * Buscar chat por ID
   */
  async findById(id) {
    const query = `
      SELECT 
        wc.*,
        a.name as assigned_user_name,
        c.name as contact_full_name,
        c.email as contact_email,
        wi.instance_name,
        wi.provider
      FROM whatsapp_chats wc
      LEFT JOIN administrators a ON wc.assigned_user_id = a.id
      LEFT JOIN contacts c ON wc.contact_id = c.id
      LEFT JOIN whatsapp_instances wi ON wc.instance_id = wi.id
      WHERE wc.id = ? AND wc.is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Buscar ou criar chat por telefone
   */
  async findOrCreateByPhone(instanceId, phoneNumber, contactName = null) {
    // Primeiro, tentar encontrar chat existente
    let chat = await this.findByPhone(instanceId, phoneNumber);
    
    if (chat) {
      return chat;
    }

    // Se não existe, criar novo chat
    const instance = await pool.query(
      'SELECT client_id FROM whatsapp_instances WHERE id = ?',
      [instanceId]
    );

    if (instance[0].length === 0) {
      throw new Error('Instância não encontrada');
    }

    const clientId = instance[0][0].client_id;

    const insertQuery = `
      INSERT INTO whatsapp_chats (
        instance_id, client_id, phone_number, contact_name, 
        status, first_message_at
      ) VALUES (?, ?, ?, ?, 'unassigned', CURRENT_TIMESTAMP)
    `;

    const [result] = await pool.query(insertQuery, [
      instanceId,
      clientId,
      phoneNumber,
      contactName
    ]);

    return this.findById(result.insertId);
  },

  /**
   * Buscar chat por telefone
   */
  async findByPhone(instanceId, phoneNumber) {
    const query = `
      SELECT 
        wc.*,
        a.name as assigned_user_name,
        c.name as contact_full_name,
        c.email as contact_email
      FROM whatsapp_chats wc
      LEFT JOIN administrators a ON wc.assigned_user_id = a.id
      LEFT JOIN contacts c ON wc.contact_id = c.id
      WHERE wc.instance_id = ? AND wc.phone_number = ? AND wc.is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [instanceId, phoneNumber]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Atualizar chat
   */
  async update(id, data) {
    const allowedFields = [
      'contact_name', 'contact_id', 'assigned_user_id', 'status', 
      'priority', 'unread_count', 'total_messages', 'last_message_at',
      'last_message_preview', 'last_message_type', 'is_archived', 'resolved_at'
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

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE whatsapp_chats 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND is_active = TRUE
    `;

    await pool.query(query, values);
    return this.findById(id);
  },

  /**
   * Atribuir chat a um usuário
   */
  async assignToUser(chatId, userId, transferredBy = null, reason = 'manual', notes = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obter chat atual
      const [chatRows] = await connection.query(
        'SELECT assigned_user_id FROM whatsapp_chats WHERE id = ?',
        [chatId]
      );

      if (chatRows.length === 0) {
        throw new Error('Chat não encontrado');
      }

      const currentUserId = chatRows[0].assigned_user_id;

      // Atualizar chat
      await connection.query(
        `UPDATE whatsapp_chats 
         SET assigned_user_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [userId, chatId]
      );

      // Registrar transferência se houve mudança de usuário
      if (currentUserId !== userId) {
        await connection.query(
          `INSERT INTO whatsapp_chat_transfers (
            chat_id, from_user_id, to_user_id, transferred_by_user_id, 
            transfer_reason, notes
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [chatId, currentUserId, userId, transferredBy || userId, reason, notes]
        );
      }

      await connection.commit();
      return this.findById(chatId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Transferir chat entre usuários
   */
  async transfer(chatId, fromUserId, toUserId, transferredBy, reason = 'manual', notes = null) {
    return this.assignToUser(chatId, toUserId, transferredBy, reason, notes);
  },

  /**
   * Marcar chat como resolvido
   */
  async resolve(chatId, resolvedBy) {
    return this.update(chatId, {
      status: 'resolved',
      resolved_at: new Date()
    });
  },

  /**
   * Arquivar chat
   */
  async archive(chatId) {
    return this.update(chatId, {
      is_archived: true,
      status: 'closed'
    });
  },

  /**
   * Incrementar contador de mensagens
   */
  async incrementMessageCount(chatId, isInbound = true) {
    const query = `
      UPDATE whatsapp_chats 
      SET 
        total_messages = total_messages + 1,
        ${isInbound ? 'unread_count = unread_count + 1,' : ''}
        last_message_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [chatId]);
  },

  /**
   * Atualizar preview da última mensagem
   */
  async updateLastMessage(chatId, messagePreview, messageType) {
    return this.update(chatId, {
      last_message_preview: messagePreview,
      last_message_type: messageType,
      last_message_at: new Date()
    });
  },

  /**
   * Marcar mensagens como lidas
   */
  async markAsRead(chatId, userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Zerar contador de não lidas
      await connection.query(
        'UPDATE whatsapp_chats SET unread_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [chatId]
      );

      // Marcar mensagens como lidas
      await connection.query(
        `UPDATE whatsapp_messages 
         SET is_read = TRUE, read_by_user_id = ?, read_at = CURRENT_TIMESTAMP 
         WHERE chat_id = ? AND is_read = FALSE AND direction = 'inbound'`,
        [userId, chatId]
      );

      await connection.commit();
      return this.findById(chatId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Vincular chat a um contato do CRM
   */
  async linkToContact(chatId, contactId) {
    return this.update(chatId, {
      contact_id: contactId
    });
  },

  /**
   * Obter chats não atribuídos para distribuição automática
   */
  async getUnassignedChats(instanceId, limit = 10) {
    const query = `
      SELECT * FROM whatsapp_chats 
      WHERE instance_id = ? 
        AND status = 'unassigned' 
        AND is_active = TRUE
      ORDER BY created_at ASC
      LIMIT ?
    `;

    const [rows] = await pool.query(query, [instanceId, limit]);
    return rows;
  },

  /**
   * Obter estatísticas de chats
   */
  async getStats(instanceId, userId = null) {
    let whereCondition = 'wc.instance_id = ? AND wc.is_active = TRUE';
    let queryParams = [instanceId];

    if (userId) {
      whereCondition += ' AND wc.assigned_user_id = ?';
      queryParams.push(userId);
    }

    const query = `
      SELECT 
        COUNT(*) as total_chats,
        COUNT(CASE WHEN wc.status = 'unassigned' THEN 1 END) as unassigned_chats,
        COUNT(CASE WHEN wc.status = 'assigned' THEN 1 END) as assigned_chats,
        COUNT(CASE WHEN wc.status = 'in_progress' THEN 1 END) as in_progress_chats,
        COUNT(CASE WHEN wc.status = 'resolved' THEN 1 END) as resolved_chats,
        COUNT(CASE WHEN wc.unread_count > 0 THEN 1 END) as unread_chats,
        SUM(wc.unread_count) as total_unread_messages,
        AVG(wc.total_messages) as avg_messages_per_chat
      FROM whatsapp_chats wc
      WHERE ${whereCondition}
    `;

    const [rows] = await pool.query(query, queryParams);
    const stats = rows[0];

    return {
      total_chats: parseInt(stats.total_chats) || 0,
      unassigned_chats: parseInt(stats.unassigned_chats) || 0,
      assigned_chats: parseInt(stats.assigned_chats) || 0,
      in_progress_chats: parseInt(stats.in_progress_chats) || 0,
      resolved_chats: parseInt(stats.resolved_chats) || 0,
      unread_chats: parseInt(stats.unread_chats) || 0,
      total_unread_messages: parseInt(stats.total_unread_messages) || 0,
      avg_messages_per_chat: parseFloat(stats.avg_messages_per_chat) || 0
    };
  },

  /**
   * Soft delete do chat
   */
  async delete(id) {
    const query = `
      UPDATE whatsapp_chats 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = WhatsAppChatModel;

