const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ChartConfigController = require('../controllers/chartConfigController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Middleware para verificar se o utilizador está autenticado
router.use(authMiddleware);

// Obter todas as configurações de gráficos
router.get('/', ChartConfigController.getAllConfigs);

// Obter todas as configurações de gráficos por ID de cliente
router.get('/client/:clientId', ChartConfigController.getConfigsByClientId);

// Obter configuração de gráfico por ID
router.get('/:id', ChartConfigController.getConfigById);

// Obter dados do gráfico por ID da configuração
router.get('/data/:id', ChartConfigController.getChartData);

// Rotas que requerem privilégios de administrador
router.use(adminMiddleware);

// Criar nova configuração de gráfico
router.post('/', [
  body('client_id').isNumeric().withMessage('ID do cliente inválido'),
  body('chart_name').notEmpty().withMessage('Nome do gráfico é obrigatório'),
  body('chart_type').isIn(['bar', 'line', 'pie', 'area', 'scatter', 'donut']).withMessage('Tipo de gráfico inválido'),
  body('chart_title').notEmpty().withMessage('Título do gráfico é obrigatório'),
  body('sql_query').notEmpty().withMessage('Query SQL é obrigatória')
], ChartConfigController.createConfig);

// Atualizar configuração de gráfico existente
router.put('/:id', [
  body('chart_name').notEmpty().withMessage('Nome do gráfico é obrigatório'),
  body('chart_type').isIn(['bar', 'line', 'pie', 'area', 'scatter', 'donut']).withMessage('Tipo de gráfico inválido'),
  body('chart_title').notEmpty().withMessage('Título do gráfico é obrigatório'),
  body('sql_query').notEmpty().withMessage('Query SQL é obrigatória')
], ChartConfigController.updateConfig);

// Excluir configuração de gráfico
router.delete('/:id', ChartConfigController.deleteConfig);

// Testar query SQL
router.post('/test-query', [
  body('sql_query').notEmpty().withMessage('Query SQL é obrigatória'),
  body('client_id').isNumeric().withMessage('ID do cliente inválido')
], ChartConfigController.testSqlQuery);

module.exports = router;

