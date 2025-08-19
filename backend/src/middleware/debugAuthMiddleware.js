// Middleware de debug para interceptar tokens
const jwt = require('jsonwebtoken');

const debugAuthMiddleware = (req, res, next) => {
  console.log('\n=== DEBUG AUTH MIDDLEWARE ===');
  console.log('Headers:', req.headers);
  
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    console.log('❌ Nenhum header Authorization encontrado');
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log('Token extraído:', token);
  console.log('Token length:', token.length);
  
  if (!token) {
    console.log('❌ Token vazio após extração');
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado com sucesso:', decoded);
    
    req.user = { id: decoded.user.id, username: decoded.user.username };
    console.log('User definido no req:', req.user);
    next();
  } catch (error) {
    console.log('❌ Erro na verificação do token:', error.message);
    console.log('Error type:', error.name);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = debugAuthMiddleware;

