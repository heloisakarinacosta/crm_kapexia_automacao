const { pool } = require('../config/db');

const ContactPhoneModel = {
  async listByContact(contact_id) {
    const [rows] = await pool.query('SELECT * FROM contact_phones WHERE contact_id = ? AND is_active = 1', [contact_id]);
    return rows;
  },
  async create(phoneData) {
    const { contact_id, phone, phone_type = 'mobile', is_primary = false, is_whatsapp = false, notes = null } = phoneData;
    const [result] = await pool.query(
      'INSERT INTO contact_phones (contact_id, phone, phone_type, is_primary, is_whatsapp, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [contact_id, phone, phone_type, is_primary, is_whatsapp, notes]
    );
    const [rows] = await pool.query('SELECT * FROM contact_phones WHERE id = ?', [result.insertId]);
    return rows[0];
  },
};

module.exports = ContactPhoneModel; 