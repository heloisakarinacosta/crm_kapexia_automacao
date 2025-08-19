const { pool } = require('../config/db');

/**
 * Modelo para gerenciar instâncias WhatsApp
 */
const WhatsAppInstanceModel = {
  /**
   * Listar todas as instâncias de um cliente
   */
  async findByClientId(clientId) {
    const query = `
      SELECT 
        wi.*,
        COUNT(wui.id) as connected_users,
        COUNT(wc.id) as active_chats,
        SUM(wc.unread_count) as total_unread
      FROM whatsapp_instances wi
      LEFT JOIN whatsapp_user_instances wui ON wi.id = wui.instance_id AND wui.is_active = TRUE
      LEFT JOIN whatsapp_chats wc ON wi.id = wc.instance_id AND wc.is_active = TRUE
      WHERE wi.client_id = ? AND wi.is_active = TRUE
      GROUP BY wi.id
      ORDER BY wi.created_at DESC
    `;
    
    const [rows] = await pool.query(query, [clientId]);
    return rows.map(row => ({
      ...row,
      provider_config: typeof row.provider_config === 'string' 
        ? JSON.parse(row.provider_config) 
        : row.provider_config,
      connected_users: parseInt(row.connected_users) || 0,
      active_chats: parseInt(row.active_chats) || 0,
      total_unread: parseInt(row.total_unread) || 0
    }));
  },

  /**
   * Buscar instância por ID
   */
  async findById(id) {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE id = ? AND is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    
    const instance = rows[0];
    return {
      ...instance,
      provider_config: typeof instance.provider_config === 'string' 
        ? JSON.parse(instance.provider_config) 
        : instance.provider_config
    };
  },

  /**
   * Buscar instância por ID e cliente
   */
  async findByIdAndClientId(id, clientId) {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE id = ? AND client_id = ? AND is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [id, clientId]);
    if (rows.length === 0) return null;
    
    const instance = rows[0];
    return {
      ...instance,
      provider_config: typeof instance.provider_config === 'string' 
        ? JSON.parse(instance.provider_config) 
        : instance.provider_config
    };
  },

  /**
   * Buscar instância por chave
   */
  async findByInstanceKey(instanceKey) {
    const query = `
      SELECT * FROM whatsapp_instances 
      WHERE instance_key = ? AND is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [instanceKey]);
    if (rows.length === 0) return null;
    
    const instance = rows[0];
    return {
      ...instance,
      provider_config: typeof instance.provider_config === 'string' 
        ? JSON.parse(instance.provider_config) 
        : instance.provider_config
    };
  },

  /**
   * Criar nova instância
   */
  async create(data) {
    const {
      client_id,
      instance_name,
      instance_key,
      provider = 'pipego',
      provider_config,
      api_base_url,
      api_token = null
    } = data;

    // Validações
    if (!client_id || !instance_name || !instance_key) {
      throw new Error('Campos obrigatórios: client_id, instance_name, instance_key');
    }

    const query = `
      INSERT INTO whatsapp_instances (
        client_id, instance_name, instance_key, provider, 
        provider_config, api_base_url, api_token, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'inactive')
    `;

    const [result] = await pool.query(query, [
      client_id,
      instance_name,
      instance_key,
      provider,
      JSON.stringify(provider_config || {}),
      api_base_url,
      api_token
    ]);

    return this.findById(result.insertId);
  },

  /**
   * Atualizar instância
   */
  async update(id, data) {
    const allowedFields = [
      'instance_name', 'provider', 'provider_config', 'api_base_url', 
      'api_token', 'status', 'phone_number', 'qr_code', 'qr_expires_at',
      'webhook_url', 'webhook_token', 'webhook_active', 'last_connected_at', 'last_error'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        
        // Converter JSON para string se necessário
        if (key === 'provider_config' && typeof data[key] === 'object') {
          values.push(JSON.stringify(data[key]));
        } else {
          values.push(data[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE whatsapp_instances 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND is_active = TRUE
    `;

    await pool.query(query, values);
    return this.findById(id);
  },

  /**
   * Atualizar status da instância
   */
  async updateStatus(id, status, additionalData = {}) {
    const updateData = { status, ...additionalData };
    
    if (status === 'connected') {
      updateData.last_connected_at = new Date();
      updateData.last_error = null;
    }

    return this.update(id, updateData);
  },

  /**
   * Configurar webhook
   */
  async configureWebhook(id, webhookUrl, webhookToken) {
    return this.update(id, {
      webhook_url: webhookUrl,
      webhook_token: webhookToken,
      webhook_active: true
    });
  },

  /**
   * Desativar webhook
   */
  async disableWebhook(id) {
    return this.update(id, {
      webhook_active: false
    });
  },

  /**
   * Soft delete da instância
   */
  async delete(id) {
    const query = `
      UPDATE whatsapp_instances 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Obter configurações HTTP de uma instância
   */
  async getHttpConfigs(instanceId) {
    const query = `
      SELECT * FROM whatsapp_http_configs 
      WHERE instance_id = ? AND is_active = TRUE
      ORDER BY operation_type
    `;
    
    const [rows] = await pool.query(query, [instanceId]);
    return rows.map(row => ({
      ...row,
      headers: typeof row.headers === 'string' ? JSON.parse(row.headers) : row.headers,
      body_template: typeof row.body_template === 'string' ? JSON.parse(row.body_template) : row.body_template,
      response_mapping: typeof row.response_mapping === 'string' ? JSON.parse(row.response_mapping) : row.response_mapping,
      success_conditions: typeof row.success_conditions === 'string' ? JSON.parse(row.success_conditions) : row.success_conditions
    }));
  },

  /**
   * Obter configuração HTTP específica
   */
  async getHttpConfig(instanceId, operationType) {
    const query = `
      SELECT * FROM whatsapp_http_configs 
      WHERE instance_id = ? AND operation_type = ? AND is_active = TRUE
    `;
    
    const [rows] = await pool.query(query, [instanceId, operationType]);
    if (rows.length === 0) return null;
    
    const config = rows[0];
    return {
      ...config,
      headers: typeof config.headers === 'string' ? JSON.parse(config.headers) : config.headers,
      body_template: typeof config.body_template === 'string' ? JSON.parse(config.body_template) : config.body_template,
      response_mapping: typeof config.response_mapping === 'string' ? JSON.parse(config.response_mapping) : config.response_mapping,
      success_conditions: typeof config.success_conditions === 'string' ? JSON.parse(config.success_conditions) : config.success_conditions
    };
  },

  /**
   * Criar ou atualizar configuração HTTP
   */
  async upsertHttpConfig(instanceId, operationType, config) {
    const {
      http_method,
      endpoint_url,
      headers = null,
      body_template = null,
      response_mapping = null,
      success_conditions = null,
      timeout_seconds = 30,
      retry_attempts = 3
    } = config;

    const query = `
      INSERT INTO whatsapp_http_configs (
        instance_id, operation_type, http_method, endpoint_url,
        headers, body_template, response_mapping, success_conditions,
        timeout_seconds, retry_attempts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        http_method = VALUES(http_method),
        endpoint_url = VALUES(endpoint_url),
        headers = VALUES(headers),
        body_template = VALUES(body_template),
        response_mapping = VALUES(response_mapping),
        success_conditions = VALUES(success_conditions),
        timeout_seconds = VALUES(timeout_seconds),
        retry_attempts = VALUES(retry_attempts),
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [
      instanceId,
      operationType,
      http_method,
      endpoint_url,
      headers ? JSON.stringify(headers) : null,
      body_template ? JSON.stringify(body_template) : null,
      response_mapping ? JSON.stringify(response_mapping) : null,
      success_conditions ? JSON.stringify(success_conditions) : null,
      timeout_seconds,
      retry_attempts
    ]);

    return this.getHttpConfig(instanceId, operationType);
  },

  /**
   * Obter estatísticas da instância
   */
  async getStats(instanceId) {
    const query = `
      SELECT 
        COUNT(DISTINCT wc.id) as total_chats,
        COUNT(DISTINCT CASE WHEN wc.status IN ('unassigned', 'assigned', 'in_progress') THEN wc.id END) as active_chats,
        COUNT(DISTINCT CASE WHEN wc.unread_count > 0 THEN wc.id END) as unread_chats,
        SUM(wc.unread_count) as total_unread_messages,
        COUNT(DISTINCT wui.user_id) as connected_users,
        COUNT(DISTINCT CASE WHEN wui.is_online = TRUE THEN wui.user_id END) as online_users
      FROM whatsapp_instances wi
      LEFT JOIN whatsapp_chats wc ON wi.id = wc.instance_id AND wc.is_active = TRUE
      LEFT JOIN whatsapp_user_instances wui ON wi.id = wui.instance_id AND wui.is_active = TRUE
      WHERE wi.id = ?
      GROUP BY wi.id
    `;

    const [rows] = await pool.query(query, [instanceId]);
    if (rows.length === 0) {
      return {
        total_chats: 0,
        active_chats: 0,
        unread_chats: 0,
        total_unread_messages: 0,
        connected_users: 0,
        online_users: 0
      };
    }

    const stats = rows[0];
    return {
      total_chats: parseInt(stats.total_chats) || 0,
      active_chats: parseInt(stats.active_chats) || 0,
      unread_chats: parseInt(stats.unread_chats) || 0,
      total_unread_messages: parseInt(stats.total_unread_messages) || 0,
      connected_users: parseInt(stats.connected_users) || 0,
      online_users: parseInt(stats.online_users) || 0
    };
  }
};

module.exports = WhatsAppInstanceModel;

