const express = require('express');
const router = express.Router();
const funnelProductServiceController = require('../controllers/funnelProductServiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas: /api/products-services
router.post('/', funnelProductServiceController.createProductService);
router.get('/', funnelProductServiceController.getProductServicesByClient);
router.get('/:id', funnelProductServiceController.getProductServiceById);
router.put('/:id', funnelProductServiceController.updateProductService);
router.delete('/:id', funnelProductServiceController.deleteProductService);

module.exports = router; 