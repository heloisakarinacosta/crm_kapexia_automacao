const express = require('express');
const router = express.Router();
const DatabaseConfigController = require('../controllers/databaseConfigController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Listar configurações de banco de dados
router.get('/', DatabaseConfigController.listDatabaseConfigs);

// Criar nova configuração de banco de dados
router.post('/', DatabaseConfigController.createDatabaseConfig);

// Atualizar configuração de banco de dados
router.put('/:id', DatabaseConfigController.updateDatabaseConfig);

// Deletar configuração de banco de dados
router.delete('/:id', DatabaseConfigController.deleteDatabaseConfig);

// Testar conexão com banco de dados
router.post('/:id/test', DatabaseConfigController.testConnection);

module.exports = router;