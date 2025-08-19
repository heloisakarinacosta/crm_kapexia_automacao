const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const debugAuthMiddleware = require('../middleware/debugAuthMiddleware');
const User = require('../models/userModel');

// Middleware para verificar autenticação
router.use(debugAuthMiddleware);

// Obter todos os usuários (administradores)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar usuários', 
      error: error.message 
    });
  }
});

// Obter usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar usuário', 
      error: error.message 
    });
  }
});

// Atualizar usuário (incluindo associação com cliente)
router.put('/:id', [
  body('username').optional().notEmpty().withMessage('Nome de usuário não pode estar vazio'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('client_id').optional().isInt().withMessage('ID do cliente deve ser um número')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, client_id } = req.body;
    
    // Verificar se o usuário existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    const updatedUser = await User.update(id, { username, email, client_id });
    
    res.json({ 
      success: true, 
      message: 'Usuário atualizado com sucesso', 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar usuário', 
      error: error.message 
    });
  }
});

// Associar usuário a um cliente
router.put('/:id/client', [
  body('client_id').isInt().withMessage('ID do cliente é obrigatório e deve ser um número')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id } = req.body;
    
    // Verificar se o usuário existe
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    const updatedUser = await User.associateWithClient(id, client_id);
    
    res.json({ 
      success: true, 
      message: 'Usuário associado ao cliente com sucesso', 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Erro ao associar usuário ao cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao associar usuário ao cliente', 
      error: error.message 
    });
  }
});

module.exports = router;

