const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ClientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Middleware para verificar se o utilizador é administrador
router.use(authMiddleware);

// Rotas que requerem privilégios de administrador
router.use(adminMiddleware);

// Obter todos os clientes
router.get('/', ClientController.getAllClients);

// Obter cliente por ID
router.get('/:id', ClientController.getClientById);

// Criar novo cliente
router.post('/', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone inválido')
], ClientController.createClient);

// Atualizar cliente existente
router.put('/:id', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('cnpj').optional().isLength({ min: 14, max: 18 }).withMessage('CNPJ inválido'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Telefone inválido')
], ClientController.updateClient);

// Excluir cliente
router.delete('/:id', ClientController.deleteClient);

// Obter cliente do usuário atual (não requer privilégios de administrador)
router.get('/user/current', authMiddleware, ClientController.getCurrentUserClient);

module.exports = router;
