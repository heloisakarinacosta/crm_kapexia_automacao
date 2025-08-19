const express = require('express');
const router = express.Router();
const RAGController = require('../controllers/ragController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Listar documentos RAG
router.get('/documents', RAGController.getDocuments);

// Upload de documento RAG
router.post('/documents', RAGController.uploadMiddleware, RAGController.uploadDocument);

// Excluir documento RAG
router.delete('/documents/:id', RAGController.deleteDocument);

module.exports = router;

