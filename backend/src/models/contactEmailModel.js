const { pool } = require('../config/db');

const ContactEmailModel = {
  async listByContact(contact_id) {
    const [rows] = await pool.query('SELECT * FROM contact_emails WHERE contact_id = ? AND is_active = 1', [contact_id]);
    return rows;
  },
  async create(emailData) {
    const { contact_id, email, email_type = 'personal', is_primary = false, notes = null } = emailData;
    const [result] = await pool.query(
      'INSERT INTO contact_emails (contact_id, email, email_type, is_primary, notes) VALUES (?, ?, ?, ?, ?)',
      [contact_id, email, email_type, is_primary, notes]
    );
    const [rows] = await pool.query('SELECT * FROM contact_emails WHERE id = ?', [result.insertId]);
    return rows[0];
  },
};

module.exports = ContactEmailModel; 