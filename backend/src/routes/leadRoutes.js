const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// GET /api/leads/count?period=today|week|month|range&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/count', leadController.getLeadsCountPorPeriodo);
// GET /api/leads/list?period=today|week|month|range&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/list', leadController.getLeadsPorPeriodo);

module.exports = router; 