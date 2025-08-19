// Model stub para audit_log

const db = require('../config/db');

const auditLogModel = {
  async createAuditLog(data) {
    const {
      client_id, user_id, action, details
    } = data;
    const [result] = await db.query(
      `INSERT INTO audit_log (
        client_id, user_id, action, details
      ) VALUES (?, ?, ?, ?)`,
      [client_id, user_id, action, details]
    );
    return { id: result.insertId };
  },

  async getAuditLogsByClient(client_id) {
    const [rows] = await db.query(
      'SELECT * FROM audit_log WHERE client_id = ? ORDER BY created_at DESC',
      [client_id]
    );
    return rows;
  },

  async getAuditLogById(id, client_id) {
    const [rows] = await db.query(
      'SELECT * FROM audit_log WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return rows[0] || null;
  },

  async deleteAuditLog(id, client_id) {
    const [result] = await db.query(
      'DELETE FROM audit_log WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = auditLogModel; 