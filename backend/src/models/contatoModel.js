const { pool } = require('../config/db');

const ContatoModel = {
  async listContacts(clientId) {
    let query = 'SELECT id, name FROM contacts';
    let params = [];
    if (clientId) {
      query += ' WHERE client_id = ?';
      params.push(clientId);
    }
    const [rows] = await pool.query(query, params);
    return rows;
  },
  async getConversasPorPeriodo({ period, start, end }) {
    let query = '';
    let params = [];
    if (period === 'week') {
      query = `SELECT nome, telefone, email, COUNT(*) AS quantidade FROM kapexia_whatsapp.contatos WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1) GROUP BY telefone`;
    } else if (period === 'month') {
      query = `SELECT nome, telefone, email, COUNT(*) AS quantidade FROM kapexia_whatsapp.contatos WHERE YEAR(data_hora) = YEAR(CURDATE()) AND MONTH(data_hora) = MONTH(CURDATE()) GROUP BY telefone`;
    } else if (period === 'range' && start && end) {
      query = `SELECT nome, telefone, email, COUNT(*) AS quantidade FROM kapexia_whatsapp.contatos WHERE data_hora BETWEEN ? AND ? GROUP BY telefone`;
      params = [start + ' 00:00:00', end + ' 23:59:59'];
    } else if (period === 'range') {
      throw new Error('Para period=range, start e end são obrigatórios');
    } else {
      throw new Error('Parâmetros de período inválidos');
    }
    const [rows] = await pool.query(query, params);
    return rows;
  }
};

module.exports = ContatoModel; 