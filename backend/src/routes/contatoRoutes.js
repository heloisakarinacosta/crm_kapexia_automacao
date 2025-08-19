const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contatoController');

// GET /api/contatos/conversas?period=week|month|range&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/conversas', contatoController.getConversasPorPeriodo);
router.get('/', contatoController.listContacts);

module.exports = router; 