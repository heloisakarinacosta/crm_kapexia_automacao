// Model stub para tasks

const db = require('../config/db');

const taskModel = {
  async createTask(data) {
    const {
      client_id, funnel_card_id, contact_id, title, description, task_type, priority, due_date, completed_at, status,
      assigned_to_user_id, created_by_user_id, is_recurring, recurring_pattern
    } = data;
    const [result] = await db.query(
      `INSERT INTO tasks (
        client_id, funnel_card_id, contact_id, title, description, task_type, priority, due_date, completed_at, status,
        assigned_to_user_id, created_by_user_id, is_recurring, recurring_pattern
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, funnel_card_id, contact_id, title, description, task_type, priority, due_date, completed_at, status,
        assigned_to_user_id, created_by_user_id, is_recurring, recurring_pattern]
    );
    return { id: result.insertId };
  },

  async getTasksByClient(client_id) {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE client_id = ?',
      [client_id]
    );
    return rows;
  },

  async getTaskById(id, client_id) {
    const [rows] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateTask(id, data, client_id) {
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
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteTask(id, client_id) {
    const [result] = await db.query(
      'DELETE FROM tasks WHERE id = ? AND client_id = ?',
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = taskModel; 