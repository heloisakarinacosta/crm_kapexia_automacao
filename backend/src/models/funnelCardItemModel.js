// Model stub para funnel_card_items

const db = require('../config/db');

const funnelCardItemModel = {
  async createCardItem(data) {
    const {
      funnel_card_id, product_service_id, quantity, unit_price, discount_percentage, discount_amount, total_amount, notes
    } = data;
    const [result] = await db.query(
      `INSERT INTO funnel_card_items (
        funnel_card_id, product_service_id, quantity, unit_price, discount_percentage, discount_amount, total_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [funnel_card_id, product_service_id, quantity, unit_price, discount_percentage, discount_amount, total_amount, notes]
    );
    return { id: result.insertId };
  },

  async getCardItemsByCard(funnel_card_id, client_id) {
    const [rows] = await db.query(
      `SELECT i.* FROM funnel_card_items i
       JOIN funnel_cards c ON i.funnel_card_id = c.id
       WHERE i.funnel_card_id = ? AND c.client_id = ?`,
      [funnel_card_id, client_id]
    );
    return rows;
  },

  async getCardItemById(id, client_id) {
    const [rows] = await db.query(
      `SELECT i.* FROM funnel_card_items i
       JOIN funnel_cards c ON i.funnel_card_id = c.id
       WHERE i.id = ? AND c.client_id = ?`,
      [id, client_id]
    );
    return rows[0] || null;
  },

  async updateCardItem(id, data, client_id) {
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
      `UPDATE funnel_card_items i
       JOIN funnel_cards c ON i.funnel_card_id = c.id
       SET ${fields.join(', ')}
       WHERE i.id = ? AND c.client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteCardItem(id, client_id) {
    const [result] = await db.query(
      `DELETE i FROM funnel_card_items i
       JOIN funnel_cards c ON i.funnel_card_id = c.id
       WHERE i.id = ? AND c.client_id = ?`,
      [id, client_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = funnelCardItemModel; 