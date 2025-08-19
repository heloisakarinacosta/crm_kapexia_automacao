const express = require('express');
const router = express.Router();
const WhatsAppUserInstanceController = require('../controllers/whatsappUserInstanceController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciar usuários nas instâncias WhatsApp
 * Todas as rotas requerem autenticação
 */

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users
 * @desc Listar usuários de uma instância
 * @access Private (Supervisores)
 */
router.get('/instances/:instance_id/users', WhatsAppUserInstanceController.listUsers);

/**
 * @route POST /api/whatsapp/instances/:instance_id/users
 * @desc Adicionar usuário à instância
 * @access Private (Supervisores)
 */
router.post('/instances/:instance_id/users', WhatsAppUserInstanceController.addUser);

/**
 * @route PUT /api/whatsapp/instances/:instance_id/users/:target_user_id
 * @desc Atualizar permissões do usuário na instância
 * @access Private (Supervisores)
 */
router.put('/instances/:instance_id/users/:target_user_id', WhatsAppUserInstanceController.updateUserPermissions);

/**
 * @route DELETE /api/whatsapp/instances/:instance_id/users/:target_user_id
 * @desc Remover usuário da instância
 * @access Private (Supervisores)
 */
router.delete('/instances/:instance_id/users/:target_user_id', WhatsAppUserInstanceController.removeUser);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users/:target_user_id/stats
 * @desc Obter estatísticas do usuário na instância
 * @access Private
 */
router.get('/instances/:instance_id/users/:target_user_id/stats', WhatsAppUserInstanceController.getUserStats);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users/available
 * @desc Obter usuários disponíveis para receber chats
 * @access Private
 */
router.get('/instances/:instance_id/users/available', WhatsAppUserInstanceController.getAvailableUsers);

/**
 * @route PUT /api/whatsapp/instances/:instance_id/users/availability
 * @desc Atualizar status de disponibilidade do usuário atual
 * @access Private
 */
router.put('/instances/:instance_id/users/availability', WhatsAppUserInstanceController.updateAvailability);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users/supervisors
 * @desc Obter supervisores da instância
 * @access Private
 */
router.get('/instances/:instance_id/users/supervisors', WhatsAppUserInstanceController.getSupervisors);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users/workload
 * @desc Obter carga de trabalho dos usuários
 * @access Private (Supervisores)
 */
router.get('/instances/:instance_id/users/workload', WhatsAppUserInstanceController.getWorkload);

/**
 * @route GET /api/whatsapp/instances/:instance_id/users/available-to-add
 * @desc Listar usuários do cliente que podem ser adicionados à instância
 * @access Private (Supervisores)
 */
router.get('/instances/:instance_id/users/available-to-add', WhatsAppUserInstanceController.getAvailableUsersToAdd);

module.exports = router;

