const { pool } = require('../config/db');

const OpenAIConfig = {
  async findByClientId(clientId) {
    const [rows] = await pool.execute(
      'SELECT * FROM openai_configs WHERE client_id = ? AND is_active = true',
      [clientId]
    );
    return rows[0];
  },

  async create(configData) {
    const { 
      client_id, 
      api_key,
      assistant_id, 
      model, 
      system_prompt,
      is_active 
    } = configData;
    
    const [result] = await pool.execute(
      `INSERT INTO openai_configs 
       (client_id, api_key, assistant_id, model, system_prompt, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [client_id, api_key, assistant_id, model || 'gpt-4', system_prompt, is_active !== undefined ? is_active : true]
    );
    
    return { id: result.insertId, ...configData };
  },

  async update(clientId, configData) {
    const { 
      api_key,
      assistant_id, 
      model, 
      system_prompt,
      is_active 
    } = configData;
    
    await pool.execute(
      `UPDATE openai_configs SET 
       api_key = ?,
       assistant_id = ?, 
       model = ?, 
       system_prompt = ?,
       is_active = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE client_id = ?`,
      [api_key, assistant_id, model || 'gpt-4', system_prompt, is_active !== undefined ? is_active : true, clientId]
    );
    
    return { client_id: clientId, ...configData };
  },

  async delete(clientId) {
    await pool.execute(
      "DELETE FROM openai_configs WHERE client_id = ?",
      [clientId]
    );
    return { success: true };
  }
};

module.exports = OpenAIConfig;

