const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar informações do usuário no banco de dados
    const [rows] = await pool.execute(
      'SELECT id, username, email, client_id FROM administrators WHERE id = ?',
      [decoded.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = authMiddleware;

