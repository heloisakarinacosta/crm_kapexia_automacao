// Model stub para stage_task_templates

const db = require('../config/db');

const stageTaskTemplateModel = {
  async createStageTaskTemplate(data) {
    const {
      funnel_id, stage_id, title, description, task_type, priority, due_days_offset, is_active
    } = data;
    const [result] = await db.query(
      `INSERT INTO stage_task_templates (
        funnel_id, stage_id, title, description, task_type, priority, due_days_offset, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [funnel_id, stage_id, title, description, task_type, priority, due_days_offset, is_active]
    );
    return { id: result.insertId };
  },

  async getStageTaskTemplatesByStage(stage_id, client_id) {
    const [rows] = await db.query(
      `SELECT t.* FROM stage_task_templates t
       JOIN funnels f ON t.funnel_id = f.id
       JOIN funnel_stages s ON t.stage_id = s.id
       WHERE t.stage_id = ? AND f.client_id = ?`,
      [stage_id, client_id]
    );
    return rows;
  },

  async getStageTaskTemplateById(id, client_id) {
    const [rows] = await db.query(
      `SELECT t.* FROM stage_task_templates t
       JOIN funnels f ON t.funnel_id = f.id
       WHERE t.id = ? AND f.client_id = ?`,
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateStageTaskTemplate(id, data, client_id) {
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
      `UPDATE stage_task_templates t
       JOIN funnels f ON t.funnel_id = f.id
       SET ${fields.join(', ')}
       WHERE t.id = ? AND f.client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteStageTaskTemplate(id, client_id) {
    const [result] = await db.query(
      `DELETE t FROM stage_task_templates t
       JOIN funnels f ON t.funnel_id = f.id
       WHERE t.id = ? AND f.client_id = ?`,
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = stageTaskTemplateModel; 