// Model stub para user_funnel_permissions

const db = require('../config/db');

const userFunnelPermissionModel = {
  async createUserFunnelPermission(data) {
    const {
      funnel_id, user_id, can_view, can_edit, can_delete, can_manage_stages, can_manage_cards
    } = data;
    const [result] = await db.query(
      `INSERT INTO user_funnel_permissions (
        funnel_id, user_id, can_view, can_edit, can_delete, can_manage_stages, can_manage_cards
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [funnel_id, user_id, can_view, can_edit, can_delete, can_manage_stages, can_manage_cards]
    );
    return { id: result.insertId };
  },

  async getUserFunnelPermissionsByFunnel(funnel_id, client_id) {
    const [rows] = await db.query(
      `SELECT p.* FROM user_funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.funnel_id = ? AND f.client_id = ?`,
      [funnel_id, client_id]
    );
    return rows;
  },

  async getUserFunnelPermissionById(id, client_id) {
    const [rows] = await db.query(
      `SELECT p.* FROM user_funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.id = ? AND f.client_id = ?`,
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateUserFunnelPermission(id, data, client_id) {
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
      `UPDATE user_funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       SET ${fields.join(', ')}
       WHERE p.id = ? AND f.client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteUserFunnelPermission(id, client_id) {
    const [result] = await db.query(
      `DELETE p FROM user_funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.id = ? AND f.client_id = ?`,
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = userFunnelPermissionModel; 