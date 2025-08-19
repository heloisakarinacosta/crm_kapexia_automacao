const { pool } = require("../config/db");

const Client = {
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT * FROM clients ORDER BY name"
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM clients WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async create(clientData) {
    const { name, trading_name, cnpj, address, phone, profile } = clientData;
    
    const [result] = await pool.execute(
      "INSERT INTO clients (name, trading_name, cnpj, address, phone, profile) VALUES (?, ?, ?, ?, ?, ?)",
      [name, trading_name, cnpj, address, phone, profile]
    );
    
    return { id: result.insertId, ...clientData };
  },

  async update(id, clientData) {
    const { name, trading_name, cnpj, address, phone, profile } = clientData;
    
    await pool.execute(
      "UPDATE clients SET name = ?, trading_name = ?, cnpj = ?, address = ?, phone = ?, profile = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, trading_name, cnpj, address, phone, profile, id]
    );
    
    return { id, ...clientData };
  },

  async delete(id) {
    await pool.execute(
      "DELETE FROM clients WHERE id = ?",
      [id]
    );
    
    return { id };
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      "SELECT c.* FROM clients c INNER JOIN administrators a ON c.id = a.client_id WHERE a.id = ?",
      [userId]
    );
    return rows[0];
  }
};

module.exports = Client;
