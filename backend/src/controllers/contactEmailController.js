const ContactEmailModel = require('../models/contactEmailModel');

const listByContact = async (req, res) => {
  try {
    const { contact_id } = req.query;
    if (!contact_id) return res.status(400).json({ success: false, message: 'contact_id é obrigatório' });
    const rows = await ContactEmailModel.listByContact(contact_id);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar e-mails', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { contact_id, email, email_type, is_primary, notes } = req.body;
    if (!contact_id || !email) return res.status(400).json({ success: false, message: 'contact_id e email são obrigatórios' });
    const novo = await ContactEmailModel.create({ contact_id, email, email_type, is_primary, notes });
    res.json({ success: true, data: novo });
  } catch (err) {
    console.error('Erro ao cadastrar e-mail:', err);
    res.status(500).json({ success: false, message: 'Erro ao cadastrar e-mail', error: err.message });
  }
};

module.exports = { listByContact, create }; 