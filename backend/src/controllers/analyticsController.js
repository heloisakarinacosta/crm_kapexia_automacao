const Client = require('../models/clientModel');
const ChartConfig = require('../models/chartConfigModel');
const DatabaseConfig = require('../models/databaseConfigModel');
const ChartGroupModel = require('../models/chartGroupModel');
const { pool } = require('../config/db');

const AnalyticsController = {
  // Obter todos os dados para o dashboard do cliente atual
  async getDashboardData(req, res) {
    try {
      // Obter ID do cliente associado ao utilizador atual
      const userId = req.user.id;
      const client = await Client.findByUserId(userId);
      
      if (!client) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      // Obter todas as configurações de gráficos do cliente
      const chartConfigs = await ChartConfig.findByClientId(client.id);
      
      if (!chartConfigs || chartConfigs.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhuma configuração de gráfico encontrada para este cliente' 
        });
      }
      
      // Obter configuração de BD do cliente
      const dbConfig = await DatabaseConfig.findByClientId(client.id);
      
      // Array para armazenar os dados de todos os gráficos
      const dashboardData = [];
      
      // Para cada configuração de gráfico, executar a query e obter os dados
      for (const config of chartConfigs) {
        if (config.is_active) {
          const result = await ChartConfig.testSqlQuery(config.sql_query, client.id, dbConfig);
          
          if (result.valid) {
            dashboardData.push({
              chart_id: config.id,
              position: config.chart_position,
              title: config.chart_title,
              subtitle: config.chart_subtitle,
              description: config.chart_description,
              type: config.chart_type,
              data: result.data,
              x_axis_field: config.x_axis_field,
              y_axis_field: config.y_axis_field,
              demo: result.demo
            });
          } else {
            dashboardData.push({
              chart_id: config.id,
              position: config.chart_position,
              title: config.chart_title,
              subtitle: config.chart_subtitle,
              description: config.chart_description,
              type: config.chart_type,
              error: result.message,
              x_axis_field: config.x_axis_field,
              y_axis_field: config.y_axis_field,
              demo: result.demo
            });
          }
        }
      }
      
      // Ordenar os dados por posição do gráfico
      dashboardData.sort((a, b) => a.position - b.position);
      
      res.json({ 
        success: true, 
        data: dashboardData,
        client: {
          id: client.id,
          name: client.name
        }
      });
    } catch (error) {
      console.error('Erro ao obter dados do dashboard:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao obter dados do dashboard', 
        error: error.message 
      });
    }
  },

  // Obter dados para um gráfico específico
  async getChartData(req, res) {
    try {
      const { position } = req.params;
      const { groupId, period } = req.query;
      console.log('[DEBUG] req.query.period:', period);
      const periodValue = typeof period === 'string' ? period : '';
      const clientId = req.user.client_id;
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      let chartConfig;
      let isDrillDown = false;
      if (groupId) {
        // Verificar se o grupo é drill-down
        const group = await ChartGroupModel.findById(groupId, clientId);
        if (group && group.is_drilldown) {
          isDrillDown = true;
        }
      }
      if (isDrillDown) {
        // Buscar configuração do gráfico drill-down
        const [result] = await pool.execute(
          'SELECT * FROM chart_drilldown_configs WHERE client_id = ? AND chart_position = ? AND group_id = ? AND is_active = TRUE',
          [clientId, position, groupId]
        );
        chartConfig = result;
      } else if (groupId) {
        // Buscar configuração específica do grupo (normal)
        const result = await pool.execute(
          'SELECT * FROM chart_configs WHERE client_id = ? AND chart_position = ? AND group_id = ? AND is_active = TRUE',
          [clientId, position, groupId]
        );
        chartConfig = result[0];
      } else {
        // Buscar sem filtro de grupo (compatibilidade)
        let result = await pool.execute(
          'SELECT * FROM chart_configs WHERE client_id = ? AND chart_position = ? AND is_active = TRUE',
          [clientId, position]
        );
        chartConfig = result[0];
        if (!chartConfig || chartConfig.length === 0) {
          result = await pool.execute(
            'SELECT * FROM chart_configs WHERE client_id = ? AND chart_position = ? AND (group_id IS NULL OR group_id = 0) AND is_active = TRUE',
            [clientId, position]
          );
          chartConfig = result[0];
        }
      }
      if (!chartConfig || chartConfig.length === 0) {
        console.log(`[DEBUG] Nenhuma configuração encontrada para position ${position} e client ${clientId}`);
        // Debug: listar todas as configurações do cliente
        const [allConfigs] = await pool.execute(
          "SELECT chart_position, chart_title, is_active, group_id FROM chart_configs WHERE client_id = ? ORDER BY chart_position",
          [clientId]
        );
        console.log(`[DEBUG] Configurações disponíveis para client ${clientId}:`, allConfigs);
        return res.status(404).json({ 
          success: false, 
          message: `Configuração de gráfico não encontrada para a posição ${position}`,
          debug: {
            requestedPosition: position,
            clientId: clientId,
            availableConfigs: allConfigs.map(c => ({ position: c.chart_position, title: c.chart_title, active: c.is_active, groupId: c.group_id }))
          }
        });
      }
      const config = chartConfig[0];
      // Obter configuração de BD do cliente
      const dbConfig = await DatabaseConfig.findByClientId(clientId);
      let result;
      if (isDrillDown) {
        // Executar a query SQL do drill-down
        if (!config.sql_query) {
          return res.status(400).json({
            success: false,
            message: 'Painel drill-down sem sql_query configurado.'
          });
        }
        // Aqui você pode montar os parâmetros conforme o detail_sql_params do drill-down
        const paramsObj = { period: periodValue, client_id: clientId };
        console.log('[DEBUG] Parâmetros enviados para SQL (drilldown):', paramsObj);
        result = await ChartConfig.testSqlQuery(config.sql_query, paramsObj, dbConfig);
      } else {
        // Para painéis normais, montar o objeto de parâmetros nomeados
        const paramsObj = { period: periodValue, client_id: clientId };
        console.log('[DEBUG] Parâmetros enviados para SQL:', paramsObj);
        result = await ChartConfig.testSqlQuery(config.sql_query, paramsObj, dbConfig);
      }
      if (result.valid) {
        console.log(`[DEBUG] Chart ${position} response - Title: "${config.chart_title}", Subtitle: "${config.chart_subtitle}", Type: ${config.chart_type}, Data count: ${result.data?.length || 0}`);
        // Desabilitar cache para forçar dados atualizados
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': false
        });
        res.json({ 
          success: true, 
          data: {
            chart_id: config.id,
            position: config.chart_position,
            title: config.chart_title,
            subtitle: config.chart_subtitle,
            description: config.chart_description,
            type: config.chart_type,
            data: result.data,
            x_axis_field: config.x_axis_field,
            y_axis_field: config.y_axis_field,
            demo: result.demo
          }
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message,
          chart_info: {
            chart_id: config.id,
            position: config.chart_position,
            title: config.chart_title,
            subtitle: config.chart_subtitle,
            type: config.chart_type
          },
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
  },

  // Obter dados históricos para comparação
  async getHistoricalData(req, res) {
    try {
      const { period } = req.params; // 'day', 'week', 'month', 'quarter', 'year'
      
      // Obter ID do cliente associado ao utilizador atual
      const userId = req.user.id;
      const client = await Client.findByUserId(userId);
      
      if (!client) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      // Definir a query SQL com base no período
      let sqlQuery;
      switch (period) {
        case 'day':
          sqlQuery = `
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS time_period,
              COUNT(*) AS total_leads
            FROM demo_leads
            WHERE 
              client_id = ? AND
              DATE(created_at) = CURRENT_DATE()
            GROUP BY time_period
            ORDER BY time_period
          `;
          break;
        case 'week':
          sqlQuery = `
            SELECT 
              DATE(created_at) AS time_period,
              COUNT(*) AS total_leads
            FROM demo_leads
            WHERE 
              client_id = ? AND
              created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
            GROUP BY time_period
            ORDER BY time_period
          `;
          break;
        case 'month':
          sqlQuery = `
            SELECT 
              DATE(created_at) AS time_period,
              COUNT(*) AS total_leads
            FROM demo_leads
            WHERE 
              client_id = ? AND
              MONTH(created_at) = MONTH(CURRENT_DATE()) AND
              YEAR(created_at) = YEAR(CURRENT_DATE())
            GROUP BY time_period
            ORDER BY time_period
          `;
          break;
        case 'quarter':
          sqlQuery = `
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m') AS time_period,
              COUNT(*) AS total_leads
            FROM demo_leads
            WHERE 
              client_id = ? AND
              created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
            GROUP BY time_period
            ORDER BY time_period
          `;
          break;
        case 'year':
          sqlQuery = `
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m') AS time_period,
              COUNT(*) AS total_leads
            FROM demo_leads
            WHERE 
              client_id = ? AND
              created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 YEAR)
            GROUP BY time_period
            ORDER BY time_period
          `;
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Período inválido. Use day, week, month, quarter ou year.' 
          });
      }
      
      // Obter configuração de BD do cliente
      const dbConfig = await DatabaseConfig.findByClientId(client.id);
      
      // Executar a query e obter os dados
      const result = await ChartConfig.testSqlQuery(sqlQuery, client.id, dbConfig);
      
      if (result.valid) {
        res.json({ 
          success: true, 
          period: period,
          data: result.data,
          demo: result.demo
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message,
          period: period,
          demo: result.demo
        });
      }
    } catch (error) {
      console.error('Erro ao obter dados históricos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao obter dados históricos', 
        error: error.message 
      });
    }
  }
};

module.exports = AnalyticsController;
