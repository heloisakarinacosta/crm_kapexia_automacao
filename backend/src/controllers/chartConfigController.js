const ChartConfig = require('../models/chartConfigModel');
const DatabaseConfig = require('../models/databaseConfigModel');
const { validationResult } = require('express-validator');

const ChartConfigController = {
  // Obter todas as configurações de gráficos
  async getAllConfigs(req, res) {
    try {
      const configs = await ChartConfig.findAll();
      res.json({ success: true, data: configs });
    } catch (error) {
      console.error('Erro ao buscar configurações de gráficos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar configurações de gráficos', 
        error: error.message 
      });
    }
  },

  // Obter todas as configurações de gráficos por ID de cliente
  async getConfigsByClientId(req, res) {
    try {
      const { clientId } = req.params;
      const configs = await ChartConfig.findByClientId(clientId);
      
      res.json({ success: true, data: configs });
    } catch (error) {
      console.error('Erro ao buscar configurações de gráficos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar configurações de gráficos', 
        error: error.message 
      });
    }
  },

  // Obter configuração de gráfico por ID
  async getConfigById(req, res) {
    try {
      const { id } = req.params;
      const config = await ChartConfig.findById(id);
      
      if (!config) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configuração de gráfico não encontrada' 
        });
      }
      
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Erro ao buscar configuração de gráfico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar configuração de gráfico', 
        error: error.message 
      });
    }
  },

  // Criar nova configuração de gráfico
  async createConfig(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: errors.array() 
        });
      }
      
      // Validar a query SQL
      const sqlValidation = await ChartConfig.validateSqlQuery(req.body.sql_query);
      if (!sqlValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: sqlValidation.message 
        });
      }
      
      const configData = {
        client_id: req.body.client_id,
        chart_name: req.body.chart_name,
        chart_type: req.body.chart_type,
        chart_title: req.body.chart_title,
        database_config_id: req.body.database_config_id,
        sql_query: req.body.sql_query,
        x_axis_field: req.body.x_axis_field,
        y_axis_field: req.body.y_axis_field,
        is_active: req.body.is_active
      };
      
      const newConfig = await ChartConfig.create(configData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Configuração de gráfico criada com sucesso', 
        data: newConfig 
      });
    } catch (error) {
      console.error('Erro ao criar configuração de gráfico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar configuração de gráfico', 
        error: error.message 
      });
    }
  },

  // Atualizar configuração de gráfico existente
  async updateConfig(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: errors.array() 
        });
      }
      
      const { id } = req.params;
      
      // Verificar se a configuração existe
      const existingConfig = await ChartConfig.findById(id);
      if (!existingConfig) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configuração de gráfico não encontrada' 
        });
      }
      
      // Validar a query SQL
      const sqlValidation = await ChartConfig.validateSqlQuery(req.body.sql_query);
      if (!sqlValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: sqlValidation.message 
        });
      }
      
      const configData = {
        chart_name: req.body.chart_name,
        chart_type: req.body.chart_type,
        chart_title: req.body.chart_title,
        database_config_id: req.body.database_config_id,
        sql_query: req.body.sql_query,
        x_axis_field: req.body.x_axis_field,
        y_axis_field: req.body.y_axis_field,
        is_active: req.body.is_active
      };
      
      const updatedConfig = await ChartConfig.update(id, configData);
      
      res.json({ 
        success: true, 
        message: 'Configuração de gráfico atualizada com sucesso', 
        data: updatedConfig 
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração de gráfico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar configuração de gráfico', 
        error: error.message 
      });
    }
  },

  // Excluir configuração de gráfico
  async deleteConfig(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a configuração existe
      const existingConfig = await ChartConfig.findById(id);
      if (!existingConfig) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configuração de gráfico não encontrada' 
        });
      }
      
      await ChartConfig.delete(id);
      
      res.json({ 
        success: true, 
        message: 'Configuração de gráfico excluída com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao excluir configuração de gráfico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao excluir configuração de gráfico', 
        error: error.message 
      });
    }
  },

  // Testar query SQL
  async testSqlQuery(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: errors.array() 
        });
      }
      
      const { sql_query, client_id } = req.body;
      
      // Validar a query SQL
      const sqlValidation = await ChartConfig.validateSqlQuery(sql_query);
      if (!sqlValidation.valid) {
        return res.status(400).json({ 
          success: false, 
          message: sqlValidation.message 
        });
      }
      
      // Obter configuração de BD do cliente
      const dbConfig = await DatabaseConfig.findByClientId(client_id);
      
      // Testar a query
      const result = await ChartConfig.testSqlQuery(sql_query, client_id, dbConfig);
      
      if (result.valid) {
        res.json({ 
          success: true, 
          message: result.message,
          data: result.data,
          demo: result.demo
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message,
          demo: result.demo
        });
      }
    } catch (error) {
      console.error('Erro ao testar query SQL:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao testar query SQL', 
        error: error.message 
      });
    }
  },

  // Executar query SQL para dados do gráfico
  async getChartData(req, res) {
    try {
      const { id } = req.params;
      
      // Obter configuração do gráfico
      const chartConfig = await ChartConfig.findById(id);
      if (!chartConfig) {
        return res.status(404).json({ 
          success: false, 
          message: 'Configuração de gráfico não encontrada' 
        });
      }
      
      // Obter configuração de BD do cliente
      const dbConfig = await DatabaseConfig.findByClientId(chartConfig.client_id);
      
      // Executar a query
      const result = await ChartConfig.testSqlQuery(chartConfig.sql_query, chartConfig.client_id, dbConfig);
      
      if (result.valid) {
        res.json({ 
          success: true, 
          data: result.data,
          chart_config: {
            title: chartConfig.chart_title,
            subtitle: chartConfig.chart_subtitle,
            type: chartConfig.chart_type,
            position: chartConfig.chart_position
          },
          demo: result.demo
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message,
          demo: result.demo
        });
      }
    } catch (error) {
      console.error('Erro ao obter dados do gráfico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao obter dados do gráfico', 
        error: error.message 
      });
    }
  }
};

module.exports = ChartConfigController;
