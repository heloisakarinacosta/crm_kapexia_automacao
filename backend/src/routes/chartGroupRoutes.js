const express = require('express');
const router = express.Router();
const ChartGroupController = require('../controllers/chartGroupController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para Grupos de Painéis - VERSÃO SEGURA
 * Preserva compatibilidade total com sistema anterior
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * COMPATIBILIDADE: Rota original do dashboard
 * MANTÉM FUNCIONAMENTO IDÊNTICO AO SISTEMA ANTERIOR
 */
// router.get('/dashboard', ChartGroupController.getDashboard); // Comentado para evitar conflito

/**
 * Rotas para gerenciamento de grupos
 */

// Listar grupos do cliente
router.get('/groups', ChartGroupController.listGroups);

// Buscar grupo específico
router.get('/groups/:groupId', ChartGroupController.getGroup);

// Buscar painéis de um grupo (carregamento lazy)
router.get('/groups/:groupId/charts', ChartGroupController.getGroupCharts);

// Criar novo grupo
router.post('/groups', ChartGroupController.createGroup);

// Atualizar grupo
router.put('/groups/:groupId', ChartGroupController.updateGroup);

// Duplicar grupo
router.post('/groups/:groupId/duplicate', ChartGroupController.duplicateGroup);

// Deletar grupo (soft delete)
router.delete('/groups/:groupId', ChartGroupController.deleteGroup);

// Reordenar grupos
router.put('/groups/reorder', ChartGroupController.reorderGroups);

/**
 * Rotas auxiliares
 */

// Obter modelos disponíveis
router.get('/models', ChartGroupController.getAvailableModels);

// Verificar status de drill-down
router.get('/drilldown-status', ChartGroupController.getDrillDownStatus);

/**
 * Rotas de compatibilidade adicional
 */

// Rota alternativa para dashboard (caso algum frontend use)
router.get('/charts', ChartGroupController.getDashboard);

// Rota para buscar painéis por posição (compatibilidade com drill-down)
router.get('/charts/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const clientId = req.user.client_id;
    
    // Buscar painel pela posição (compatibilidade)
    const dashboard = await ChartGroupModel.getClientDashboard(clientId);
    const chart = dashboard.charts.find(c => c.chart_position == position);
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Painel não encontrado'
      });
    }

    res.json({
      success: true,
      data: chart,
      message: 'Painel encontrado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar painel por posição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;

