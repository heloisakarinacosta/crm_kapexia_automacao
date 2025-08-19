const express = require('express');
const router = express.Router();
const contactEmailController = require('../controllers/contactEmailController');

router.get('/', contactEmailController.listByContact);
router.post('/', contactEmailController.create);

module.exports = router; 