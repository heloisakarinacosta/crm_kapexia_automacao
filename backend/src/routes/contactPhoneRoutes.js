const express = require('express');
const router = express.Router();

// Exemplo de rota para contatos telefônicos
router.get('/', (req, res) => {
  res.json({ message: 'Rota de contatos telefônicos funcionando!' });
});

module.exports = router;
