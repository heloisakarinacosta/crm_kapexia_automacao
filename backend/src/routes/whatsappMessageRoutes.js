const express = require('express');
const router = express.Router();
const WhatsAppMessageController = require('../controllers/whatsappMessageController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciar mensagens WhatsApp
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/whatsapp/chats/:chat_id/messages
 * @desc Listar mensagens de um chat
 * @access Private
 */
router.get('/chats/:chat_id/messages', WhatsAppMessageController.list);

/**
 * @route GET /api/whatsapp/messages/:id
 * @desc Obter mensagem por ID
 * @access Private
 */
router.get('/:id', WhatsAppMessageController.getById);

/**
 * @route POST /api/whatsapp/chats/:chat_id/messages/text
 * @desc Enviar mensagem de texto
 * @access Private
 */
router.post('/chats/:chat_id/messages/text', WhatsAppMessageController.sendText);

/**
 * @route POST /api/whatsapp/chats/:chat_id/messages/media
 * @desc Enviar mensagem com mídia
 * @access Private
 */
router.post('/chats/:chat_id/messages/media', 
  WhatsAppMessageController.uploadMiddleware,
  WhatsAppMessageController.sendMedia
);

/**
 * @route POST /api/whatsapp/messages/:id/mark-read
 * @desc Marcar mensagem como lida
 * @access Private
 */
router.post('/:id/mark-read', WhatsAppMessageController.markAsRead);

/**
 * @route POST /api/whatsapp/chats/:chat_id/messages/mark-multiple-read
 * @desc Marcar múltiplas mensagens como lidas
 * @access Private
 */
router.post('/chats/:chat_id/messages/mark-multiple-read', WhatsAppMessageController.markMultipleAsRead);

/**
 * @route GET /api/whatsapp/chats/:chat_id/messages/type/:type
 * @desc Buscar mensagens por tipo
 * @access Private
 */
router.get('/chats/:chat_id/messages/type/:type', WhatsAppMessageController.searchByType);

/**
 * @route GET /api/whatsapp/chats/:chat_id/messages/media
 * @desc Obter mensagens com mídia
 * @access Private
 */
router.get('/chats/:chat_id/messages/media', WhatsAppMessageController.getMediaMessages);

/**
 * @route GET /api/whatsapp/chats/:chat_id/messages/stats
 * @desc Obter estatísticas de mensagens
 * @access Private
 */
router.get('/chats/:chat_id/messages/stats', WhatsAppMessageController.getStats);

/**
 * @route DELETE /api/whatsapp/messages/:id
 * @desc Deletar mensagem (apenas supervisores)
 * @access Private
 */
router.delete('/:id', WhatsAppMessageController.delete);

module.exports = router;

