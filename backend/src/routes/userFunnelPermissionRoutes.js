const express = require('express');
const router = express.Router({ mergeParams: true });
const userFunnelPermissionController = require('../controllers/userFunnelPermissionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/funnels/:funnel_id/permissions
router.post('/', userFunnelPermissionController.createUserFunnelPermission);
router.get('/', userFunnelPermissionController.getUserFunnelPermissionsByFunnel);
router.get('/:permission_id', userFunnelPermissionController.getUserFunnelPermissionById);
router.put('/:permission_id', userFunnelPermissionController.updateUserFunnelPermission);
router.delete('/:permission_id', userFunnelPermissionController.deleteUserFunnelPermission);

module.exports = router; 