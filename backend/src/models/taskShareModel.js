const db = require('../config/db');

// Model stub para task_shares

const taskShareModel = {
  async createTaskShare(data) {
    const {
      task_id, shared_with_user_id, shared_by_user_id, can_edit, can_complete, share_message
    } = data;
    const [result] = await db.query(
      `INSERT INTO task_shares (
        task_id, shared_with_user_id, shared_by_user_id, can_edit, can_complete, share_message
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [task_id, shared_with_user_id, shared_by_user_id, can_edit, can_complete, share_message]
    );
    return { id: result.insertId };
  },

  async getTaskSharesByTask(task_id, client_id) {
    const [rows] = await db.query(
      `SELECT s.* FROM task_shares s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.task_id = ? AND t.client_id = ?`,
      [task_id, client_id]
    );
    return rows;
  },

  async getTaskShareById(id, client_id) {
    const [rows] = await db.query(
      `SELECT s.* FROM task_shares s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id = ? AND t.client_id = ?`,
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateTaskShare(id, data, client_id) {
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
      `UPDATE task_shares s
       JOIN tasks t ON s.task_id = t.id
       SET ${fields.join(', ')}
       WHERE s.id = ? AND t.client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteTaskShare(id, client_id) {
    const [result] = await db.query(
      `DELETE s FROM task_shares s
       JOIN tasks t ON s.task_id = t.id
       WHERE s.id = ? AND t.client_id = ?`,
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = taskShareModel; 