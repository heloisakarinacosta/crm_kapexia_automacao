const bcrypt = require('bcryptjs');

// Defina a password que deseja "hashear"
const passwordToHash = '123mudar'; // <-- Substitua 'password' pela password desejada

// Número de rondas de salt (igual ao usado no backend)
const saltRounds = 10;

// Gerar o hash
bcrypt.hash(passwordToHash, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erro ao gerar o hash:', err);
    return;
  }
  console.log('Password original:', passwordToHash);
  console.log('Hash gerado:', hash);
  console.log('\nCopie este hash e use-o no comando SQL.');
});
