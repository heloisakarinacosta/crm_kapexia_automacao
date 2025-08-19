const express = require('express');
const router = express.Router();
const WhatsAppWebhookController = require('../controllers/whatsappWebhookController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para webhooks WhatsApp
 */

/**
 * @route POST /api/whatsapp/webhook/:instance_key
 * @desc Processar webhook recebido (endpoint público para provedores)
 * @access Public (com validação de token)
 */
router.post('/:instance_key', WhatsAppWebhookController.processWebhook);

/**
 * @route GET /api/whatsapp/instances/:instance_id/webhook-logs
 * @desc Obter logs de webhook (apenas para usuários autenticados)
 * @access Private
 */
router.get('/instances/:instance_id/webhook-logs', 
  authMiddleware, 
  WhatsAppWebhookController.getLogs
);

module.exports = router;

