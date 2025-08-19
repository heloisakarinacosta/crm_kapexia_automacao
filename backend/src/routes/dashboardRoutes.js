const express = require('express');
const { body } = require('express-validator');
const DashboardCardController = require('../controllers/dashboardCardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter configurações de cards por cliente
router.get('/cards', DashboardCardController.getCardsByClientId);

// Obter dados de um card específico
router.get('/cards/:position/data', DashboardCardController.getCardData);

// Criar nova configuração de card
router.post('/cards', [
  body('card_position').isInt({ min: 1, max: 3 }).withMessage('Posição do card deve ser 1, 2 ou 3'),
  body('card_title').notEmpty().withMessage('Título do card é obrigatório'),
  body('sql_query').notEmpty().withMessage('Query SQL é obrigatória')
], DashboardCardController.createCard);

// Atualizar configuração de card
router.put('/cards/:id', [
  body('card_position').isInt({ min: 1, max: 3 }).withMessage('Posição do card deve ser 1, 2 ou 3'),
  body('card_title').notEmpty().withMessage('Título do card é obrigatório'),
  body('sql_query').notEmpty().withMessage('Query SQL é obrigatória')
], DashboardCardController.updateCard);

// Excluir configuração de card
router.delete('/cards/:id', DashboardCardController.deleteCard);

module.exports = router;

