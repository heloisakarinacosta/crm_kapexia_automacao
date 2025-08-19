const ContactPhoneModel = require('../models/contactPhoneModel');

const listByContact = async (req, res) => {
  try {
    const { contact_id } = req.query;
    if (!contact_id) return res.status(400).json({ success: false, message: 'contact_id é obrigatório' });
    const rows = await ContactPhoneModel.listByContact(contact_id);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar telefones', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { contact_id, phone, phone_type, is_primary, is_whatsapp, notes } = req.body;
    if (!contact_id || !phone) return res.status(400).json({ success: false, message: 'contact_id e phone são obrigatórios' });
    const novo = await ContactPhoneModel.create({ contact_id, phone, phone_type, is_primary, is_whatsapp, notes });
    res.json({ success: true, data: novo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao cadastrar telefone', error: err.message });
  }
};

module.exports = { listByContact, create }; 