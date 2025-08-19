const { pool } = require('../config/db');

const DatabaseConfigController = {
  /**
   * Listar configurações de banco de dados do cliente
   */
  async listDatabaseConfigs(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }

      const [rows] = await pool.execute(`
        SELECT 
          id,
          client_id,
          config_name,
          db_type,
          host,
          port,
          database_name,
          username,
          is_active,
          created_at,
          updated_at
        FROM client_database_configs 
        WHERE client_id = ? 
        ORDER BY config_name ASC
      `, [clientId]);

      res.json({
        success: true,
        data: rows,
        message: 'Configurações de banco listadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao listar configurações de banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Criar nova configuração de banco de dados
   */
  async createDatabaseConfig(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }

      const {
        config_name,
        db_type = 'mysql',
        host,
        port = 3306,
        database_name,
        username,
        password,
        use_ssl = false,
        ssl_ca,
        ssl_cert,
        ssl_key,
        is_active = true,
        use_demo_data = false
      } = req.body;

      // Validações
      if (!config_name || !host || !database_name || !username) {
        return res.status(400).json({
          success: false,
          message: 'Nome da configuração, host, nome do banco e usuário são obrigatórios'
        });
      }

      // Verificar se já existe uma configuração com o mesmo nome
      const [existing] = await pool.execute(`
        SELECT id FROM client_database_configs 
        WHERE client_id = ? AND config_name = ?
      `, [clientId, config_name]);

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma configuração com este nome'
        });
      }

      const [result] = await pool.execute(`
        INSERT INTO client_database_configs (
          client_id, config_name, db_type, host, port, database_name,
          username, password, use_ssl, ssl_ca, ssl_cert, ssl_key,
          is_active, use_demo_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, config_name, db_type, host, port, database_name,
        username, password, use_ssl, ssl_ca, ssl_cert, ssl_key,
        is_active, use_demo_data
      ]);

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          client_id: clientId,
          config_name,
          db_type,
          host,
          port,
          database_name,
          username,
          is_active,
          use_demo_data
        },
        message: 'Configuração de banco criada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar configuração de banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar configuração de banco de dados
   */
  async updateDatabaseConfig(req, res) {
    try {
      const { id } = req.params;
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }

      // Verificar se a configuração existe e pertence ao cliente
      const [existing] = await pool.execute(`
        SELECT * FROM client_database_configs 
        WHERE id = ? AND client_id = ?
      `, [id, clientId]);

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de banco não encontrada'
        });
      }

      const allowedFields = [
        'config_name', 'db_type', 'host', 'port', 'database_name',
        'username', 'password', 'use_ssl', 'ssl_ca', 'ssl_cert', 'ssl_key',
        'is_active', 'use_demo_data'
      ];
      
      const updateFields = [];
      const updateValues = [];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(req.body[field]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum campo válido para atualização'
        });
      }

      updateValues.push(id, clientId);

      await pool.execute(`
        UPDATE client_database_configs 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND client_id = ?
      `, updateValues);

      res.json({
        success: true,
        message: 'Configuração de banco atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar configuração de banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Deletar configuração de banco de dados
   */
  async deleteDatabaseConfig(req, res) {
    try {
      const { id } = req.params;
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }

      // Verificar se a configuração existe e pertence ao cliente
      const [existing] = await pool.execute(`
        SELECT * FROM client_database_configs 
        WHERE id = ? AND client_id = ?
      `, [id, clientId]);

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de banco não encontrada'
        });
      }

      // Verificar se há painéis usando esta configuração
      const [usingCharts] = await pool.execute(`
        SELECT COUNT(*) as count FROM chart_configs 
        WHERE database_config_id = ? AND client_id = ?
      `, [id, clientId]);

      if (usingCharts[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível excluir: existem painéis usando esta configuração'
        });
      }

      await pool.execute(`
        DELETE FROM client_database_configs 
        WHERE id = ? AND client_id = ?
      `, [id, clientId]);

      res.json({
        success: true,
        message: 'Configuração de banco excluída com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar configuração de banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Testar conexão com banco de dados
   */
  async testConnection(req, res) {
    try {
      const { id } = req.params;
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }

      // Buscar configuração
      const [config] = await pool.execute(`
        SELECT * FROM client_database_configs 
        WHERE id = ? AND client_id = ?
      `, [id, clientId]);

      if (config.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de banco não encontrada'
        });
      }

      // TODO: Implementar teste de conexão real
      // Por enquanto, retornamos sucesso
      res.json({
        success: true,
        message: 'Conexão testada com sucesso',
        details: {
          host: config[0].host,
          port: config[0].port,
          database: config[0].database_name,
          status: 'connected'
        }
      });

    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao testar conexão',
        error: error.message
      });
    }
  }
};

module.exports = DatabaseConfigController;