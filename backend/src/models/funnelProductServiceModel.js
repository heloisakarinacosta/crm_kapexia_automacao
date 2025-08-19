// Model stub para products_services

const db = require('../config/db');

const funnelProductServiceModel = {
  async createProductService(data) {
    const {
      client_id, name, description, sku, type, category, base_price, cost_price, currency,
      is_active, is_recurring, recurring_period, track_inventory, current_stock, min_stock_alert
    } = data;
    const [result] = await db.query(
      `INSERT INTO products_services (
        client_id, name, description, sku, type, category, base_price, cost_price, currency,
        is_active, is_recurring, recurring_period, track_inventory, current_stock, min_stock_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, name, description, sku, type, category, base_price, cost_price, currency,
        is_active, is_recurring, recurring_period, track_inventory, current_stock, min_stock_alert]
    );
    return { id: result.insertId };
  },

  async getProductServicesByClient(clientId) {
    const [rows] = await db.query(
      'SELECT * FROM products_services WHERE client_id = ?',
      [clientId]
    );
    return rows;
  },

  async getProductServiceById(id, clientId) {
    const [rows] = await db.query(
      'SELECT * FROM products_services WHERE id = ? AND client_id = ?',
      [id, clientId]
    );
    return rows[0] || null;
  },

  async updateProductService(id, data, clientId) {
    const fields = [];
    const values = [];
    for (const key in data) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return false;
    values.push(id, clientId);
    const [result] = await db.query(
      `UPDATE products_services SET ${fields.join(', ')} WHERE id = ? AND client_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteProductService(id, clientId) {
    const [result] = await db.query(
      'DELETE FROM products_services WHERE id = ? AND client_id = ?',
      [id, clientId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = funnelProductServiceModel; 