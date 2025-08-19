const express = require('express');
const router = express.Router();
const clientFunnelSettingsController = require('../controllers/clientFunnelSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas: /api/client-funnel-settings
router.post('/', clientFunnelSettingsController.createClientFunnelSettings);
router.get('/', clientFunnelSettingsController.getClientFunnelSettingsByClient);
router.get('/:id', clientFunnelSettingsController.getClientFunnelSettingsById);
router.put('/:id', clientFunnelSettingsController.updateClientFunnelSettings);
router.delete('/:id', clientFunnelSettingsController.deleteClientFunnelSettings);

module.exports = router; 