const { pool } = require('../config/db');

const LeadModel = {
  async getLeadsCountPorPeriodo({ period, start, end }) {
    let query = '';
    let params = [];
    if (period === 'today') {
      query = `SELECT COUNT(*) AS total FROM kapexia_whatsapp.leads WHERE DATE(data_hora) = CURDATE()`;
    } else if (period === 'week') {
      query = `SELECT COUNT(*) AS total FROM kapexia_whatsapp.leads WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (period === 'month') {
      query = `SELECT COUNT(*) AS total FROM kapexia_whatsapp.leads WHERE YEAR(data_hora) = YEAR(CURDATE()) AND MONTH(data_hora) = MONTH(CURDATE())`;
    } else if (period === 'range' && start && end) {
      query = `SELECT COUNT(*) AS total FROM kapexia_whatsapp.leads WHERE data_hora BETWEEN ? AND ?`;
      params = [start + ' 00:00:00', end + ' 23:59:59'];
    } else if (period === 'range') {
      throw new Error('Para period=range, start e end são obrigatórios');
    } else {
      throw new Error('Parâmetros de período inválidos');
    }
    const [rows] = await pool.query(query, params);
    return rows[0];
  },

  async getLeadsPorPeriodo({ period, start, end }) {
    let query = '';
    let params = [];
    if (period === 'today') {
      query = `SELECT nome, telefone, email FROM kapexia_whatsapp.leads WHERE DATE(data_hora) = CURDATE()`;
    } else if (period === 'week') {
      query = `SELECT nome, telefone, email FROM kapexia_whatsapp.leads WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (period === 'month') {
      query = `SELECT nome, telefone, email FROM kapexia_whatsapp.leads WHERE YEAR(data_hora) = YEAR(CURDATE()) AND MONTH(data_hora) = MONTH(CURDATE())`;
    } else if (period === 'range' && start && end) {
      query = `SELECT nome, telefone, email FROM kapexia_whatsapp.leads WHERE data_hora BETWEEN ? AND ?`;
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

module.exports = LeadModel; 