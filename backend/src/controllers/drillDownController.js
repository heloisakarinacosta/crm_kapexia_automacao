const DrillDownService = require('../services/drillDownService');

/**
 * Controller para APIs de Drill-Down nos Gráficos
 */
const DrillDownController = {
  /**
   * Executar drill-down em um gráfico
   * POST /api/chart-drilldown/execute
   */
  async execute(req, res) {
    try {
      const { client_id } = req.user; // Extraído do middleware de autenticação
      const { chartPosition, clickedData } = req.body;

      // Validações
      if (!chartPosition || chartPosition < 1 || chartPosition > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      if (!clickedData || typeof clickedData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Dados do elemento clicado são obrigatórios'
        });
      }

      // Executar drill-down
      const result = await DrillDownService.executeDrillDown(
        client_id, 
        chartPosition, 
        clickedData
      );

      res.json(result);
    } catch (error) {
      console.error('Erro no controller de drill-down:', error);
      
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Drill-down não configurado para este gráfico'
        });
      }

      if (error.message.includes('não permitidos') || error.message.includes('inválida')) {
        return res.status(400).json({
          success: false,
          message: 'Configuração de drill-down inválida'
        });
      }

      if (error.message.includes('timeout') || error.message.includes('demorou')) {
        return res.status(408).json({
          success: false,
          message: 'A consulta demorou muito para ser executada. Tente filtrar os dados.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Verificar se um gráfico tem drill-down configurado
   * GET /api/chart-drilldown/check/:chartPosition
   */
  async checkDrillDown(req, res) {
    try {
      const { client_id } = req.user;
      const { chartPosition } = req.params;

      // Validações
      const position = parseInt(chartPosition);
      if (isNaN(position) || position < 1 || position > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      // Verificar se tem drill-down
      const hasDrillDown = await DrillDownService.hasDrillDown(client_id, position);

      res.json({
        success: true,
        data: {
          chartPosition: position,
          hasDrillDown,
          enabled: hasDrillDown
        }
      });
    } catch (error) {
      console.error('Erro ao verificar drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar configurações de drill-down do cliente
   * GET /api/chart-drilldown/configs
   */
  async listConfigs(req, res) {
    try {
      const { client_id } = req.user;

      const configs = await DrillDownService.listDrillDownConfigs(client_id);

      res.json({
        success: true,
        data: configs,
        total: configs.length
      });
    } catch (error) {
      console.error('Erro ao listar configurações de drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Obter configuração específica de drill-down
   * GET /api/chart-drilldown/config/:chartPosition
   */
  async getConfig(req, res) {
    try {
      const { client_id } = req.user;
      const { chartPosition } = req.params;

      // Validações
      const position = parseInt(chartPosition);
      if (isNaN(position) || position < 1 || position > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      // Obter configuração
      const config = await DrillDownService.getDrillDownConfig(client_id, position);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de drill-down não encontrada para este gráfico'
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Erro ao obter configuração de drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Testar configuração de drill-down (para desenvolvimento/debug)
   * POST /api/chart-drilldown/test
   */
  async testConfig(req, res) {
    try {
      // Só permitir em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Endpoint de teste não disponível em produção'
        });
      }

      const { client_id } = req.user;
      const { chartPosition, testData } = req.body;

      // Validações
      if (!chartPosition || chartPosition < 1 || chartPosition > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      // Dados de teste padrão se não fornecidos
      const defaultTestData = {
        clicked_date: '2025-07-07',
        clicked_product: 'Produto A',
        period_start: '2025-07-01',
        period_end: '2025-07-07',
        value: 100,
        category: 'teste'
      };

      const clickedData = testData || defaultTestData;

      // Executar drill-down com dados de teste
      const result = await DrillDownService.executeDrillDown(
        client_id, 
        chartPosition, 
        clickedData
      );

      res.json({
        success: true,
        message: 'Teste de drill-down executado com sucesso',
        testData: clickedData,
        result
      });
    } catch (error) {
      console.error('Erro no teste de drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro no teste de drill-down',
        error: error.message
      });
    }
  },

  /**
   * Obter estatísticas de uso do drill-down
   * GET /api/chart-drilldown/stats
   */
  async getStats(req, res) {
    try {
      const { client_id } = req.user;

      // Obter estatísticas básicas
      const configs = await DrillDownService.listDrillDownConfigs(client_id);
      
      const stats = {
        totalConfigs: configs.length,
        activeConfigs: configs.filter(c => c.is_active).length,
        inactiveConfigs: configs.filter(c => !c.is_active).length,
        configsByPosition: configs.reduce((acc, config) => {
          acc[config.chart_position] = {
            title: config.detail_grid_title,
            active: config.is_active,
            maxResults: config.max_results
          };
          return acc;
        }, {}),
        lastUpdated: configs.length > 0 
          ? Math.max(...configs.map(c => new Date(c.updated_at).getTime()))
          : null
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar nova configuração de drill-down
   * POST /api/chart-drilldown
   */
  async createConfig(req, res) {
    try {
      const { client_id } = req.user;
      const {
        chart_position,
        group_id,
        chart_name,
        chart_type,
        chart_title,
        chart_subtitle,
        x_axis_field,
        y_axis_field,
        database_config_id,
        sql_query,
        detail_sql_query,
        detail_sql_params,
        detail_grid_title,
        detail_grid_columns,
        detail_link_column,
        detail_link_template,
        detail_link_text_column,
        modal_size,
        max_results,
        query_timeout_seconds,
        is_active
      } = req.body;

      // Validações
      if (!chart_position || chart_position < 1 || chart_position > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      if (!group_id || !chart_name || !chart_title || !detail_sql_query || !detail_grid_title || !detail_grid_columns) {
        return res.status(400).json({
          success: false,
          message: 'Grupo, nome do gráfico, título do gráfico, consulta SQL, título do drill-down e colunas são obrigatórios'
        });
      }

      // Criar configuração
      const result = await DrillDownService.createDrillDownConfig(client_id, {
        chart_position,
        group_id,
        chart_name,
        chart_type: chart_type || 'bar',
        chart_title,
        chart_subtitle: chart_subtitle || null,
        x_axis_field: x_axis_field || null,
        y_axis_field: y_axis_field || null,
        database_config_id: database_config_id || null,
        sql_query: sql_query || null,
        detail_sql_query,
        detail_sql_params: detail_sql_params || '{}',
        detail_grid_title,
        detail_grid_columns,
        detail_link_column: detail_link_column || null,
        detail_link_template: detail_link_template || null,
        detail_link_text_column: detail_link_text_column || null,
        modal_size: modal_size || 'large',
        max_results: max_results || 100,
        query_timeout_seconds: query_timeout_seconds || 30,
        is_active: is_active !== undefined ? is_active : true
      });

      res.status(201).json({
        success: true,
        message: 'Configuração de drill-down criada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao criar configuração de drill-down:', error);
      
      if (error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma configuração de drill-down para esta posição neste grupo'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar configuração de drill-down
   * PUT /api/chart-drilldown/:id
   */
  async updateConfig(req, res) {
    try {
      const { client_id } = req.user;
      const { id } = req.params;
      const {
        chart_position,
        group_id,
        chart_name,
        chart_type,
        chart_title,
        chart_subtitle,
        x_axis_field,
        y_axis_field,
        database_config_id,
        sql_query,
        detail_sql_query,
        detail_sql_params,
        detail_grid_title,
        detail_grid_columns,
        detail_link_column,
        detail_link_template,
        detail_link_text_column,
        modal_size,
        max_results,
        query_timeout_seconds,
        is_active
      } = req.body;

      // Validações
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!chart_position || chart_position < 1 || chart_position > 10) {
        return res.status(400).json({
          success: false,
          message: 'Posição do gráfico deve estar entre 1 e 10'
        });
      }

      if (!group_id || !chart_name || !chart_title || !detail_sql_query || !detail_grid_title || !detail_grid_columns) {
        return res.status(400).json({
          success: false,
          message: 'Grupo, nome do gráfico, título do gráfico, consulta SQL, título do drill-down e colunas são obrigatórios'
        });
      }

      // Atualizar configuração
      const result = await DrillDownService.updateDrillDownConfig(client_id, parseInt(id), {
        chart_position,
        group_id,
        chart_name,
        chart_type: chart_type || 'bar',
        chart_title,
        chart_subtitle: chart_subtitle || null,
        x_axis_field: x_axis_field || null,
        y_axis_field: y_axis_field || null,
        database_config_id: database_config_id || null,
        sql_query: sql_query || null,
        detail_sql_query,
        detail_sql_params: detail_sql_params || '{}',
        detail_grid_title,
        detail_grid_columns,
        detail_link_column: detail_link_column || null,
        detail_link_template: detail_link_template || null,
        detail_link_text_column: detail_link_text_column || null,
        modal_size: modal_size || 'large',
        max_results: max_results || 100,
        query_timeout_seconds: query_timeout_seconds || 30,
        is_active: is_active !== undefined ? is_active : true
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de drill-down não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Configuração de drill-down atualizada com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração de drill-down:', error);
      
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de drill-down não encontrada'
        });
      }

      if (error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma configuração de drill-down para esta posição neste grupo'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir configuração de drill-down
   * DELETE /api/chart-drilldown/:id
   */
  async deleteConfig(req, res) {
    try {
      const { client_id } = req.user;
      const { id } = req.params;

      // Validações
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      // Excluir configuração
      const result = await DrillDownService.deleteDrillDownConfig(client_id, parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de drill-down não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Configuração de drill-down excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir configuração de drill-down:', error);
      
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Configuração de drill-down não encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = DrillDownController;

