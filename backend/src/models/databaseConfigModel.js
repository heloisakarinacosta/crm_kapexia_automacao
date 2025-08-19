const { pool } = require("../config/db");
const crypto = require('crypto');

const DatabaseConfig = {
  async findByClientId(clientId) {
    const [rows] = await pool.execute(
      "SELECT * FROM client_database_configs WHERE client_id = ?",
      [clientId]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM client_database_configs WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async create(configData) {
    const { 
      client_id, 
      host, 
      port, 
      database_name, 
      username, 
      password, 
      use_ssl, 
      ssl_ca, 
      ssl_cert, 
      ssl_key, 
      is_active, 
      use_demo_data 
    } = configData;
    
    // Encriptar a senha antes de armazenar
    const encryptedPassword = this.encryptPassword(password);
    
    const [result] = await pool.execute(
      `INSERT INTO client_database_configs 
       (client_id, host, port, database_name, username, password, use_ssl, 
        ssl_ca, ssl_cert, ssl_key, is_active, use_demo_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, host, port || 3306, database_name, username, encryptedPassword, 
       use_ssl || false, ssl_ca, ssl_cert, ssl_key, is_active || false, use_demo_data || true]
    );
    
    return { id: result.insertId, ...configData, password: '[ENCRYPTED]' };
  },

  async update(id, configData) {
    const { 
      host, 
      port, 
      database_name, 
      username, 
      password, 
      use_ssl, 
      ssl_ca, 
      ssl_cert, 
      ssl_key, 
      is_active, 
      use_demo_data 
    } = configData;
    
    let query = `UPDATE client_database_configs SET 
                host = ?, 
                port = ?, 
                database_name = ?, 
                username = ?, 
                use_ssl = ?, 
                ssl_ca = ?, 
                ssl_cert = ?, 
                ssl_key = ?, 
                is_active = ?, 
                use_demo_data = ?, 
                updated_at = CURRENT_TIMESTAMP`;
    
    const params = [
      host, 
      port || 3306, 
      database_name, 
      username, 
      use_ssl || false, 
      ssl_ca, 
      ssl_cert, 
      ssl_key, 
      is_active || false, 
      use_demo_data || true
    ];
    
    // Só atualiza a senha se uma nova for fornecida
    if (password) {
      query += `, password = ?`;
      const encryptedPassword = this.encryptPassword(password);
      params.push(encryptedPassword);
    }
    
    query += ` WHERE id = ?`;
    params.push(id);
    
    await pool.execute(query, params);
    
    return { id, ...configData, password: password ? '[ENCRYPTED]' : undefined };
  },

  async delete(id) {
    await pool.execute(
      "DELETE FROM client_database_configs WHERE id = ?",
      [id]
    );
    
    return { id };
  },

  async testConnection(configData) {
    try {
      const { host, port, database_name, username, password, use_ssl, ssl_ca, ssl_cert, ssl_key } = configData;
      
      // Criar uma conexão temporária para teste
      const mysql = require('mysql2/promise');
      
      const sslOptions = use_ssl ? {
        ca: ssl_ca,
        cert: ssl_cert,
        key: ssl_key
      } : undefined;
      
      const connection = await mysql.createConnection({
        host,
        port: port || 3306,
        database: database_name,
        user: username,
        password,
        ssl: sslOptions,
        connectTimeout: 10000 // 10 segundos de timeout
      });
      
      // Testar a conexão com uma query simples
      await connection.execute('SELECT 1');
      
      // Fechar a conexão
      await connection.end();
      
      return { success: true, message: 'Conexão estabelecida com sucesso!' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Falha ao conectar ao banco de dados', 
        error: error.message 
      };
    }
  },

  // Método para encriptar a senha
  encryptPassword(password) {
    // Em produção, usar variáveis de ambiente para a chave e iv
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'kapexia-encryption-key-must-be-32-chars';
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retorna o IV e o texto cifrado concatenados
    return iv.toString('hex') + ':' + encrypted;
  },

  // Método para decriptar a senha
  decryptPassword(encryptedPassword) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = process.env.ENCRYPTION_KEY || 'kapexia-encryption-key-must-be-32-chars';
      
      const parts = encryptedPassword.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erro ao decriptar senha:', error);
      return null;
    }
  }
};

module.exports = DatabaseConfig;
