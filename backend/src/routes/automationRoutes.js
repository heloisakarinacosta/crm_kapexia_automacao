const express = require('express');
const router = express.Router();

// Exemplo de rota de automação
router.get('/', (req, res) => {
  res.send('Automação funcionando!');
});

module.exports = router;
