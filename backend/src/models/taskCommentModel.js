const db = require('../config/db');

// Model stub para task_comments

const taskCommentModel = {
  async createTaskComment(data) {
    const {
      task_id, user_id, comment, attachment_path, attachment_name
    } = data;
    const [result] = await db.query(
      `INSERT INTO task_comments (
        task_id, user_id, comment, attachment_path, attachment_name
      ) VALUES (?, ?, ?, ?, ?)`,
      [task_id, user_id, comment, attachment_path, attachment_name]
    );
    return { id: result.insertId };
  },

  async getTaskCommentsByTask(task_id, client_id) {
    const [rows] = await db.query(
      `SELECT c.* FROM task_comments c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.task_id = ? AND t.client_id = ?
       ORDER BY c.created_at ASC`,
      [task_id, client_id]
    );
    return rows;
  },

  async getTaskCommentById(id, client_id) {
    const [rows] = await db.query(
      `SELECT c.* FROM task_comments c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.id = ? AND t.client_id = ?`,
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateTaskComment(id, data, client_id) {
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
      `UPDATE task_comments c
       JOIN tasks t ON c.task_id = t.id
       SET ${fields.join(', ')}
       WHERE c.id = ? AND t.client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteTaskComment(id, client_id) {
    const [result] = await db.query(
      `DELETE c FROM task_comments c
       JOIN tasks t ON c.task_id = t.id
       WHERE c.id = ? AND t.client_id = ?`,
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = taskCommentModel; 