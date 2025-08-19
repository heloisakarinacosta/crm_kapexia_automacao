const express = require('express');
const router = express.Router();
const WhatsAppInstanceController = require('../controllers/whatsappInstanceController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciar instâncias WhatsApp
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/whatsapp/instances
 * @desc Listar instâncias do cliente
 * @access Private
 */
router.get('/', WhatsAppInstanceController.list);

/**
 * @route POST /api/whatsapp/instances
 * @desc Criar nova instância
 * @access Private
 */
router.post('/', WhatsAppInstanceController.create);

/**
 * @route GET /api/whatsapp/instances/:id
 * @desc Obter instância por ID
 * @access Private
 */
router.get('/:id', WhatsAppInstanceController.getById);

/**
 * @route PUT /api/whatsapp/instances/:id
 * @desc Atualizar instância
 * @access Private
 */
router.put('/:id', WhatsAppInstanceController.update);

/**
 * @route DELETE /api/whatsapp/instances/:id
 * @desc Deletar instância
 * @access Private
 */
router.delete('/:id', WhatsAppInstanceController.delete);

/**
 * @route GET /api/whatsapp/instances/:id/qr
 * @desc Obter QR Code para conectar instância
 * @access Private
 */
router.get('/:id/qr', WhatsAppInstanceController.getQRCode);

/**
 * @route GET /api/whatsapp/instances/:id/connection
 * @desc Verificar status da conexão
 * @access Private
 */
router.get('/:id/connection', WhatsAppInstanceController.checkConnection);

/**
 * @route POST /api/whatsapp/instances/:id/webhook
 * @desc Configurar webhook
 * @access Private
 */
router.post('/:id/webhook', WhatsAppInstanceController.configureWebhook);

/**
 * @route GET /api/whatsapp/instances/:id/http-configs
 * @desc Obter configurações HTTP
 * @access Private
 */
router.get('/:id/http-configs', WhatsAppInstanceController.getHttpConfigs);

/**
 * @route PUT /api/whatsapp/instances/:id/http-configs/:operation
 * @desc Atualizar configuração HTTP específica
 * @access Private
 */
router.put('/:id/http-configs/:operation', WhatsAppInstanceController.updateHttpConfig);

module.exports = router;

