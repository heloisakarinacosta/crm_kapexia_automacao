const express = require('express');
const { body } = require('express-validator');
const OpenAIController = require('../controllers/openaiController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Obter configuração OpenAI por cliente
router.get('/', OpenAIController.getConfigByClientId);

// Criar ou atualizar configuração OpenAI
router.post('/', [
  body('api_key').notEmpty().withMessage('API Key é obrigatória'),
  body('model').optional().isLength({ min: 1 }).withMessage('Modelo inválido')
], OpenAIController.upsertConfig);

// Excluir configuração OpenAI
router.delete('/', OpenAIController.deleteConfig);

// Listar assistants disponíveis
router.post('/assistants', OpenAIController.listAssistants);

// Listar modelos disponíveis
router.post('/models', OpenAIController.listModels);

// Enviar mensagem para chat
router.post('/chat', OpenAIController.sendMessage);

module.exports = router;

