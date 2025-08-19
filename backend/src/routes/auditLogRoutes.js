const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas: /api/audit-logs
router.post('/', auditLogController.createAuditLog);
router.get('/', auditLogController.getAuditLogsByClient);
router.get('/:id', auditLogController.getAuditLogById);
router.delete('/:id', auditLogController.deleteAuditLog);

module.exports = router; 