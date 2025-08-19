const ContatoModel = require('../models/contatoModel');

const getConversasPorPeriodo = async (req, res) => {
  try {
    const { period, start, end } = req.query;
    const results = await ContatoModel.getConversasPorPeriodo({ period, start, end });
    // Resposta no padrão MCP
    res.json({
      context: 'conversas_por_lead',
      period,
      start,
      end,
      results
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listContacts = async (req, res) => {
  try {
    const clientId = req.query.client_id;
    const rows = await ContatoModel.listContacts(clientId);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar contatos', error: err.message });
  }
};

module.exports = {
  getConversasPorPeriodo,
  listContacts,
}; 