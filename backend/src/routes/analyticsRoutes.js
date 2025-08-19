const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para verificar se o utilizador está autenticado
router.use(authMiddleware);

// Obter todos os dados de análise para o dashboard do cliente atual
router.get('/dashboard', analyticsController.getDashboardData);

// Obter dados para um gráfico específico
router.get('/chart/:position', analyticsController.getChartData);

// Obter dados históricos para comparação
router.get('/history/:period', analyticsController.getHistoricalData);

module.exports = router;
