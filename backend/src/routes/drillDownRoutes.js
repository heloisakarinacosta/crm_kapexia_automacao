const express = require('express');
const router = express.Router();
const DrillDownController = require('../controllers/drillDownController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para Drill-Down nos Gráficos
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route   POST /api/chart-drilldown/execute
 * @desc    Executar drill-down em um gráfico
 * @access  Private
 * @body    { chartPosition: number, clickedData: object }
 */
router.post('/execute', DrillDownController.execute);

/**
 * @route   GET /api/chart-drilldown/check/:chartPosition
 * @desc    Verificar se um gráfico tem drill-down configurado
 * @access  Private
 * @params  chartPosition: number (1-10)
 */
router.get('/check/:chartPosition', DrillDownController.checkDrillDown);

/**
 * @route   GET /api/chart-drilldown/configs
 * @desc    Listar todas as configurações de drill-down do cliente
 * @access  Private
 */
router.get('/configs', DrillDownController.listConfigs);

/**
 * @route   GET /api/chart-drilldown
 * @desc    Listar todas as configurações de drill-down do cliente (alias para /configs)
 * @access  Private
 */
router.get('/', DrillDownController.listConfigs);

/**
 * @route   GET /api/chart-drilldown/config/:chartPosition
 * @desc    Obter configuração específica de drill-down
 * @access  Private
 * @params  chartPosition: number (1-10)
 */
router.get('/config/:chartPosition', DrillDownController.getConfig);

/**
 * @route   GET /api/chart-drilldown/stats
 * @desc    Obter estatísticas de uso do drill-down
 * @access  Private
 */
router.get('/stats', DrillDownController.getStats);

/**
 * @route   POST /api/chart-drilldown/test
 * @desc    Testar configuração de drill-down (apenas desenvolvimento)
 * @access  Private (Development only)
 * @body    { chartPosition: number, testData?: object }
 */
router.post('/test', DrillDownController.testConfig);

/**
 * @route   POST /api/chart-drilldown
 * @desc    Criar nova configuração de drill-down
 * @access  Private
 * @body    { chart_position: number, group_id: string, detail_sql_query: string, ... }
 */
router.post('/', DrillDownController.createConfig);

/**
 * @route   PUT /api/chart-drilldown/:id
 * @desc    Atualizar configuração de drill-down
 * @access  Private
 * @params  id: number
 * @body    { chart_position: number, group_id: string, detail_sql_query: string, ... }
 */
router.put('/:id', DrillDownController.updateConfig);

/**
 * @route   DELETE /api/chart-drilldown/:id
 * @desc    Excluir configuração de drill-down
 * @access  Private
 * @params  id: number
 */
router.delete('/:id', DrillDownController.deleteConfig);

module.exports = router;

