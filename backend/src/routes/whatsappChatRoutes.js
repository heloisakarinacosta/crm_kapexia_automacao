const express = require('express');
const router = express.Router();
const WhatsAppChatController = require('../controllers/whatsappChatController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciar chats WhatsApp
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/whatsapp/instances/:instance_id/chats
 * @desc Listar chats de uma instância
 * @access Private
 */
router.get('/instances/:instance_id/chats', WhatsAppChatController.list);

/**
 * @route GET /api/whatsapp/chats/:id
 * @desc Obter chat por ID
 * @access Private
 */
router.get('/:id', WhatsAppChatController.getById);

/**
 * @route PUT /api/whatsapp/chats/:id
 * @desc Atualizar chat
 * @access Private
 */
router.put('/:id', WhatsAppChatController.update);

/**
 * @route POST /api/whatsapp/chats/:id/assign
 * @desc Atribuir chat a um usuário
 * @access Private
 */
router.post('/:id/assign', WhatsAppChatController.assign);

/**
 * @route POST /api/whatsapp/chats/:id/transfer
 * @desc Transferir chat entre usuários
 * @access Private
 */
router.post('/:id/transfer', WhatsAppChatController.transfer);

/**
 * @route POST /api/whatsapp/chats/:id/resolve
 * @desc Marcar chat como resolvido
 * @access Private
 */
router.post('/:id/resolve', WhatsAppChatController.resolve);

/**
 * @route POST /api/whatsapp/chats/:id/archive
 * @desc Arquivar chat
 * @access Private
 */
router.post('/:id/archive', WhatsAppChatController.archive);

/**
 * @route POST /api/whatsapp/chats/:id/mark-read
 * @desc Marcar chat como lido
 * @access Private
 */
router.post('/:id/mark-read', WhatsAppChatController.markAsRead);

/**
 * @route POST /api/whatsapp/chats/:id/link-contact
 * @desc Vincular chat a um contato do CRM
 * @access Private
 */
router.post('/:id/link-contact', WhatsAppChatController.linkToContact);

/**
 * @route GET /api/whatsapp/chats/:id/messages
 * @desc Obter mensagens de um chat
 * @access Private
 */
router.get('/:id/messages', WhatsAppChatController.getMessages);

/**
 * @route GET /api/whatsapp/instances/:instance_id/chats/stats
 * @desc Obter estatísticas de chats
 * @access Private
 */
router.get('/instances/:instance_id/chats/stats', WhatsAppChatController.getStats);

/**
 * @route POST /api/whatsapp/instances/:instance_id/chats/auto-assign
 * @desc Distribuir chats não atribuídos automaticamente
 * @access Private
 */
router.post('/instances/:instance_id/chats/auto-assign', WhatsAppChatController.autoAssignChats);

module.exports = router;

