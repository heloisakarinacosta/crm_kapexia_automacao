// Model stub para client_funnel_settings

const db = require('../config/db');

const clientFunnelSettingsModel = {
  async createClientFunnelSettings(data) {
    const {
      client_id, funnel_id, settings_json
    } = data;
    const [result] = await db.query(
      `INSERT INTO client_funnel_settings (
        client_id, funnel_id, settings_json
      ) VALUES (?, ?, ?)`,
      [client_id, funnel_id, settings_json]
    );
    return { id: result.insertId };
  },

  async getClientFunnelSettingsByClient(client_id) {
    const [rows] = await db.query(
      'SELECT * FROM client_funnel_settings WHERE client_id = ?',
      [client_id]
    );
    return rows;
  },

  async getClientFunnelSettingsById(id, client_id) {
    const [rows] = await db.query(
      'SELECT * FROM client_funnel_settings WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateClientFunnelSettings(id, data, client_id) {
    const fields = [];
    const values = [];
    for (const key in data) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id, client_id);
    const [result] = await db.query(
      `UPDATE client_funnel_settings SET ${fields.join(', ')} WHERE id = ? AND client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteClientFunnelSettings(id, client_id) {
    const [result] = await db.query(
      'DELETE FROM client_funnel_settings WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = clientFunnelSettingsModel; 