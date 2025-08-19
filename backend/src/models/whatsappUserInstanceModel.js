const { pool } = require('../config/db');

/**
 * Modelo para gerenciar usuários vinculados às instâncias WhatsApp
 */
const WhatsAppUserInstanceModel = {
  /**
   * Listar usuários de uma instância
   */
  async findByInstanceId(instanceId) {
    const query = `
      SELECT 
        wui.*,
        a.name as user_name,
        a.email as user_email,
        COUNT(wc.id) as assigned_chats,
        SUM(wc.unread_count) as total_unread
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      LEFT JOIN whatsapp_chats wc ON wui.user_id = wc.assigned_user_id 
        AND wc.instance_id = wui.instance_id 
        AND wc.is_active = TRUE
        AND wc.status IN ('assigned', 'in_progress')
      WHERE wui.instance_id = ? AND wui.is_active = TRUE
      GROUP BY wui.id, a.id
      ORDER BY wui.is_supervisor DESC, a.name ASC
    `;
    
    const [rows] = await pool.query(query, [instanceId]);
    return rows.map(row => ({
      ...row,
      assigned_chats: parseInt(row.assigned_chats) || 0,
      total_unread: parseInt(row.total_unread) || 0
    }));
  },

  /**
   * Listar instâncias de um usuário
   */
  async findByUserId(userId) {
    const query = `
      SELECT 
        wui.*,
        wi.instance_name,
        wi.status as instance_status,
        wi.phone_number,
        wi.provider,
        COUNT(wc.id) as assigned_chats,
        SUM(wc.unread_count) as total_unread
      FROM whatsapp_user_instances wui
      JOIN whatsapp_instances wi ON wui.instance_id = wi.id
      LEFT JOIN whatsapp_chats wc ON wui.user_id = wc.assigned_user_id 
        AND wc.instance_id = wui.instance_id 
        AND wc.is_active = TRUE
        AND wc.status IN ('assigned', 'in_progress')
      WHERE wui.user_id = ? AND wui.is_active = TRUE AND wi.is_active = TRUE
      GROUP BY wui.id, wi.id
      ORDER BY wi.instance_name ASC
    `;
    
    const [rows] = await pool.query(query, [userId]);
    return rows.map(row => ({
      ...row,
      assigned_chats: parseInt(row.assigned_chats) || 0,
      total_unread: parseInt(row.total_unread) || 0
    }));
  },

  /**
   * Buscar vinculação específica
   */
  async findByUserAndInstance(userId, instanceId) {
    const query = `
      SELECT 
        wui.*,
        a.name as user_name,
        a.email as user_email,
        wi.instance_name
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      JOIN whatsapp_instances wi ON wui.instance_id = wi.id
      WHERE wui.user_id = ? AND wui.instance_id = ? AND wui.is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [userId, instanceId]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Vincular usuário à instância
   */
  async create(data) {
    const {
      instance_id,
      user_id,
      can_receive_chats = true,
      can_send_messages = true,
      can_transfer_chats = true,
      is_supervisor = false,
      max_concurrent_chats = 5,
      auto_assign_new_chats = true
    } = data;

    // Validações
    if (!instance_id || !user_id) {
      throw new Error('Campos obrigatórios: instance_id, user_id');
    }

    // Verificar se já existe vinculação
    const existing = await this.findByUserAndInstance(user_id, instance_id);
    if (existing) {
      throw new Error('Usuário já está vinculado a esta instância');
    }

    const query = `
      INSERT INTO whatsapp_user_instances (
        instance_id, user_id, can_receive_chats, can_send_messages,
        can_transfer_chats, is_supervisor, max_concurrent_chats, auto_assign_new_chats
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      instance_id, user_id, can_receive_chats, can_send_messages,
      can_transfer_chats, is_supervisor, max_concurrent_chats, auto_assign_new_chats
    ]);

    return this.findById(result.insertId);
  },

  /**
   * Buscar por ID
   */
  async findById(id) {
    const query = `
      SELECT 
        wui.*,
        a.name as user_name,
        a.email as user_email,
        wi.instance_name
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      JOIN whatsapp_instances wi ON wui.instance_id = wi.id
      WHERE wui.id = ? AND wui.is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Atualizar vinculação
   */
  async update(id, data) {
    const allowedFields = [
      'can_receive_chats', 'can_send_messages', 'can_transfer_chats',
      'is_supervisor', 'max_concurrent_chats', 'auto_assign_new_chats',
      'is_online'
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
      UPDATE whatsapp_user_instances 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND is_active = TRUE
    `;

    await pool.query(query, values);
    return this.findById(id);
  },

  /**
   * Atualizar status online do usuário
   */
  async updateOnlineStatus(userId, instanceId, isOnline) {
    const query = `
      UPDATE whatsapp_user_instances 
      SET is_online = ?, last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND instance_id = ? AND is_active = TRUE
    `;

    const [result] = await pool.query(query, [isOnline, userId, instanceId]);
    return result.affectedRows > 0;
  },

  /**
   * Atualizar última atividade
   */
  async updateLastActivity(userId, instanceId) {
    const query = `
      UPDATE whatsapp_user_instances 
      SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND instance_id = ? AND is_active = TRUE
    `;

    const [result] = await pool.query(query, [userId, instanceId]);
    return result.affectedRows > 0;
  },

  /**
   * Obter usuários disponíveis para receber novos chats
   */
  async getAvailableUsers(instanceId) {
    const query = `
      SELECT 
        wui.*,
        a.name as user_name,
        COUNT(wc.id) as current_chats
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      LEFT JOIN whatsapp_chats wc ON wui.user_id = wc.assigned_user_id 
        AND wc.instance_id = wui.instance_id 
        AND wc.is_active = TRUE
        AND wc.status IN ('assigned', 'in_progress')
      WHERE wui.instance_id = ? 
        AND wui.is_active = TRUE
        AND wui.can_receive_chats = TRUE
        AND wui.auto_assign_new_chats = TRUE
        AND wui.is_online = TRUE
      GROUP BY wui.id, a.id
      HAVING current_chats < wui.max_concurrent_chats
      ORDER BY current_chats ASC, wui.last_activity_at DESC
    `;

    const [rows] = await pool.query(query, [instanceId]);
    return rows.map(row => ({
      ...row,
      current_chats: parseInt(row.current_chats) || 0
    }));
  },

  /**
   * Obter supervisores de uma instância
   */
  async getSupervisors(instanceId) {
    const query = `
      SELECT 
        wui.*,
        a.name as user_name,
        a.email as user_email
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      WHERE wui.instance_id = ? 
        AND wui.is_active = TRUE
        AND wui.is_supervisor = TRUE
      ORDER BY a.name ASC
    `;

    const [rows] = await pool.query(query, [instanceId]);
    return rows;
  },

  /**
   * Verificar se usuário tem permissão específica
   */
  async hasPermission(userId, instanceId, permission) {
    const validPermissions = [
      'can_receive_chats', 'can_send_messages', 'can_transfer_chats', 'is_supervisor'
    ];

    if (!validPermissions.includes(permission)) {
      throw new Error('Permissão inválida');
    }

    const query = `
      SELECT ${permission} FROM whatsapp_user_instances 
      WHERE user_id = ? AND instance_id = ? AND is_active = TRUE
    `;

    const [rows] = await pool.query(query, [userId, instanceId]);
    return rows.length > 0 ? Boolean(rows[0][permission]) : false;
  },

  /**
   * Verificar se usuário é supervisor
   */
  async isSupervisor(userId, instanceId) {
    return this.hasPermission(userId, instanceId, 'is_supervisor');
  },

  /**
   * Obter carga de trabalho do usuário
   */
  async getUserWorkload(userId, instanceId) {
    const query = `
      SELECT 
        wui.max_concurrent_chats,
        COUNT(wc.id) as current_chats,
        SUM(wc.unread_count) as total_unread,
        COUNT(CASE WHEN wc.status = 'unassigned' THEN 1 END) as unassigned_chats,
        COUNT(CASE WHEN wc.status = 'in_progress' THEN 1 END) as in_progress_chats
      FROM whatsapp_user_instances wui
      LEFT JOIN whatsapp_chats wc ON wui.user_id = wc.assigned_user_id 
        AND wc.instance_id = wui.instance_id 
        AND wc.is_active = TRUE
        AND wc.status IN ('assigned', 'in_progress')
      WHERE wui.user_id = ? AND wui.instance_id = ? AND wui.is_active = TRUE
      GROUP BY wui.id
    `;

    const [rows] = await pool.query(query, [userId, instanceId]);
    if (rows.length === 0) return null;

    const workload = rows[0];
    return {
      max_concurrent_chats: parseInt(workload.max_concurrent_chats) || 0,
      current_chats: parseInt(workload.current_chats) || 0,
      total_unread: parseInt(workload.total_unread) || 0,
      unassigned_chats: parseInt(workload.unassigned_chats) || 0,
      in_progress_chats: parseInt(workload.in_progress_chats) || 0,
      capacity_percentage: workload.max_concurrent_chats > 0 
        ? Math.round((workload.current_chats / workload.max_concurrent_chats) * 100)
        : 0
    };
  },

  /**
   * Obter estatísticas de todos os usuários de uma instância
   */
  async getInstanceUserStats(instanceId) {
    const query = `
      SELECT 
        wui.user_id,
        a.name as user_name,
        wui.is_online,
        wui.is_supervisor,
        wui.max_concurrent_chats,
        COUNT(wc.id) as assigned_chats,
        SUM(wc.unread_count) as total_unread,
        COUNT(CASE WHEN wc.status = 'in_progress' THEN 1 END) as in_progress_chats,
        wui.last_activity_at
      FROM whatsapp_user_instances wui
      JOIN administrators a ON wui.user_id = a.id
      LEFT JOIN whatsapp_chats wc ON wui.user_id = wc.assigned_user_id 
        AND wc.instance_id = wui.instance_id 
        AND wc.is_active = TRUE
        AND wc.status IN ('assigned', 'in_progress')
      WHERE wui.instance_id = ? AND wui.is_active = TRUE
      GROUP BY wui.id, a.id
      ORDER BY wui.is_supervisor DESC, a.name ASC
    `;

    const [rows] = await pool.query(query, [instanceId]);
    return rows.map(row => ({
      ...row,
      assigned_chats: parseInt(row.assigned_chats) || 0,
      total_unread: parseInt(row.total_unread) || 0,
      in_progress_chats: parseInt(row.in_progress_chats) || 0,
      capacity_percentage: row.max_concurrent_chats > 0 
        ? Math.round((row.assigned_chats / row.max_concurrent_chats) * 100)
        : 0
    }));
  },

  /**
   * Remover vinculação (soft delete)
   */
  async delete(id) {
    const query = `
      UPDATE whatsapp_user_instances 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Remover vinculação por usuário e instância
   */
  async deleteByUserAndInstance(userId, instanceId) {
    const query = `
      UPDATE whatsapp_user_instances 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND instance_id = ?
    `;
    
    const [result] = await pool.query(query, [userId, instanceId]);
    return result.affectedRows > 0;
  }
};

module.exports = WhatsAppUserInstanceModel;

