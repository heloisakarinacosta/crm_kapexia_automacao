module.exports = {
  apps : [{
    name   : "crm-frontend",
    script : "next", // Executar o comando next diretamente
    args   : "start -p 3001", // Argumentos para o comando next: start na porta 3001
    env: {
      "NODE_ENV": "production"
    }
  }]
}

