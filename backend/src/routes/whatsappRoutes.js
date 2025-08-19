const express = require('express');
const router = express.Router();

// Importar todas as rotas do módulo WhatsApp
const whatsappInstanceRoutes = require('./whatsappInstanceRoutes');
const whatsappChatRoutes = require('./whatsappChatRoutes');
const whatsappMessageRoutes = require('./whatsappMessageRoutes');
const whatsappWebhookRoutes = require('./whatsappWebhookRoutes');
const whatsappUserInstanceRoutes = require('./whatsappUserInstanceRoutes');

/**
 * Rotas principais do módulo WhatsApp
 * Base: /api/whatsapp
 */

// Rotas de instâncias
router.use('/instances', whatsappInstanceRoutes);

// Rotas de chats
router.use('/chats', whatsappChatRoutes);

// Rotas de mensagens
router.use('/messages', whatsappMessageRoutes);

// Rotas de webhooks
router.use('/webhook', whatsappWebhookRoutes);

// Rotas de usuários nas instâncias
router.use('/', whatsappUserInstanceRoutes);

module.exports = router;

