const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const User = {
  async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM administrators WHERE username = ?",
      [username]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT a.*, c.name as client_name FROM administrators a LEFT JOIN clients c ON a.client_id = c.id WHERE a.id = ?",
      [id]
    );
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.execute(
      "SELECT a.id, a.username, a.email, a.client_id, a.created_at, a.updated_at, c.name as client_name FROM administrators a LEFT JOIN clients c ON a.client_id = c.id ORDER BY a.username"
    );
    return rows;
  },

  async createUser(username, password, email) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await pool.execute(
      "INSERT INTO administrators (username, password_hash, email) VALUES (?, ?, ?)",
      [username, hashedPassword, email]
    );
    return { id: result.insertId, username, email };
  },

  async update(id, userData) {
    const { username, email, client_id } = userData;
    
    await pool.execute(
      "UPDATE administrators SET username = ?, email = ?, client_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [username, email, client_id, id]
    );
    
    return this.findById(id);
  },

  async associateWithClient(userId, clientId) {
    await pool.execute(
      "UPDATE administrators SET client_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [clientId, userId]
    );
    
    return this.findById(userId);
  },

  // Method to compare password (useful for login)
  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = User;

