const ChartGroupModel = require('../models/chartGroupModel');

/**
 * Controller para Grupos de Painéis - VERSÃO SEGURA
 * Preserva totalmente a compatibilidade com sistema anterior
 */
const ChartGroupController = {
  /**
   * Listar grupos do cliente
   */
  async listGroups(req, res) {
    try {
      // Obter ID do cliente do token (mais consistente)
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      const groups = await ChartGroupModel.findByClientId(clientId);
      
      res.json({
        success: true,
        data: groups,
        message: 'Grupos listados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Buscar grupo específico
   */
  async getGroup(req, res) {
    try {
      const { groupId } = req.params;
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      const group = await ChartGroupModel.findById(groupId, clientId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo não encontrado'
        });
      }

      res.json({
        success: true,
        data: group,
        message: 'Grupo encontrado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Buscar painéis de um grupo
   */
  async getGroupCharts(req, res) {
    try {
      const { groupId } = req.params;
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      // Verificar se grupo existe e pertence ao cliente
      const group = await ChartGroupModel.findById(groupId, clientId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo não encontrado'
        });
      }

      // Buscar painéis do grupo
      const charts = await ChartGroupModel.getGroupCharts(groupId, clientId);
      
      res.json({
        success: true,
        data: {
          group: group,
          charts: charts
        },
        message: 'Painéis do grupo carregados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao buscar painéis do grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * COMPATIBILIDADE: Endpoint dashboard original
   * Mantém funcionamento idêntico ao sistema anterior
   */
  async getDashboard(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(404).json({ 
          success: false, 
          message: 'Nenhum cliente associado ao utilizador atual' 
        });
      }
      
      const dashboard = await ChartGroupModel.getClientDashboard(clientId);
      
      // Formato compatível com sistema anterior
      const response = {
        success: true,
        data: dashboard.charts,
        message: 'Dashboard carregado com sucesso'
      };

      // Adicionar informações do grupo se existir
      if (dashboard.group) {
        response.group = dashboard.group;
        response.layout_model = dashboard.group.layout_model;
      }

      res.json(response);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Criar novo grupo
   */
  async createGroup(req, res) {
    try {
      const clientId = req.user.client_id;
      const groupData = {
        ...req.body,
        client_id: clientId
      };

      // Validações
      if (!groupData.group_name) {
        return res.status(400).json({
          success: false,
          message: 'Nome do grupo é obrigatório'
        });
      }

      if (groupData.layout_model && !['model_10_cards', 'model_8_cards'].includes(groupData.layout_model)) {
        return res.status(400).json({
          success: false,
          message: 'Modelo de layout inválido'
        });
      }

      // Validar is_drilldown se fornecido
      if (groupData.is_drilldown !== undefined && typeof groupData.is_drilldown !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Campo is_drilldown deve ser boolean'
        });
      }

      const newGroup = await ChartGroupModel.create(groupData);
      
      res.status(201).json({
        success: true,
        data: newGroup,
        message: 'Grupo criado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      
      if (error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar grupo
   */
  async updateGroup(req, res) {
    try {
      const { groupId } = req.params;
      const clientId = req.user.client_id;
      const updateData = req.body;

      // Validações
      if (updateData.layout_model && !['model_10_cards', 'model_8_cards'].includes(updateData.layout_model)) {
        return res.status(400).json({
          success: false,
          message: 'Modelo de layout inválido'
        });
      }

      const updatedGroup = await ChartGroupModel.update(groupId, clientId, updateData);
      
      res.json({
        success: true,
        data: updatedGroup,
        message: 'Grupo atualizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('já existe')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Duplicar grupo
   */
  async duplicateGroup(req, res) {
    try {
      const { groupId } = req.params;
      const clientId = req.user.client_id;
      const { group_name, group_description, group_color, layout_model } = req.body;

      if (!group_name) {
        return res.status(400).json({
          success: false,
          message: 'Nome do novo grupo é obrigatório'
        });
      }

      const duplicatedGroup = await ChartGroupModel.duplicate(groupId, clientId, {
        group_name,
        group_description,
        group_color,
        layout_model
      });
      
      res.status(201).json({
        success: true,
        data: duplicatedGroup,
        message: 'Grupo duplicado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao duplicar grupo:', error);
      
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Deletar grupo
   */
  async deleteGroup(req, res) {
    try {
      const { groupId } = req.params;
      const clientId = req.user.client_id;

      const result = await ChartGroupModel.delete(groupId, clientId);
      
      res.json({
        success: true,
        data: result,
        message: 'Grupo deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('único grupo')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Reordenar grupos
   */
  async reorderGroups(req, res) {
    try {
      const clientId = req.user.client_id;
      const { groupOrders } = req.body;

      if (!Array.isArray(groupOrders)) {
        return res.status(400).json({
          success: false,
          message: 'groupOrders deve ser um array'
        });
      }

      // Validar formato
      for (const item of groupOrders) {
        if (!item.groupId || typeof item.order !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Cada item deve ter groupId e order'
          });
        }
      }

      const result = await ChartGroupModel.reorder(clientId, groupOrders);
      
      res.json({
        success: true,
        data: result,
        message: 'Ordem dos grupos atualizada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao reordenar grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter modelos disponíveis
   */
  async getAvailableModels(req, res) {
    try {
      const models = [
        {
          id: 'model_10_cards',
          name: 'Modelo 10 Cards',
          description: 'Layout original com 10 painéis em grid responsivo',
          grid_config: {
            total_positions: 10,
            layout: 'responsive',
            breakpoints: {
              lg: 'grid-cols-3',
              md: 'grid-cols-2', 
              sm: 'grid-cols-1'
            }
          },
          preview_image: '/images/model-10-cards-preview.png'
        },
        {
          id: 'model_8_cards',
          name: 'Modelo 8 Cards',
          description: 'Layout compacto com 8 painéis otimizado para performance',
          grid_config: {
            total_positions: 8,
            layout: 'compact',
            breakpoints: {
              lg: 'grid-cols-2',
              md: 'grid-cols-2',
              sm: 'grid-cols-1'
            }
          },
          preview_image: '/images/model-8-cards-preview.png'
        }
      ];

      res.json({
        success: true,
        data: models,
        message: 'Modelos disponíveis listados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao listar modelos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Verificar status de drill-down dos grupos
   */
  async getDrillDownStatus(req, res) {
    try {
      const clientId = req.user.client_id;
      
      // Buscar todos os grupos do cliente
      const groups = await ChartGroupModel.findByClientId(clientId);
      
      // Para cada grupo, verificar quais painéis têm drill-down
      const groupsWithDrillDown = await Promise.all(
        groups.map(async (group) => {
          const charts = await ChartGroupModel.getGroupCharts(group.id, clientId);
          const chartsWithDrillDown = charts.filter(chart => chart.has_drilldown && chart.drilldown_active);
          
          return {
            group_id: group.id,
            group_name: group.group_name,
            layout_model: group.layout_model,
            total_charts: charts.length,
            charts_with_drilldown: chartsWithDrillDown.length,
            drilldown_positions: chartsWithDrillDown.map(chart => chart.chart_position)
          };
        })
      );

      res.json({
        success: true,
        data: groupsWithDrillDown,
        message: 'Status de drill-down obtido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao verificar status de drill-down:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = ChartGroupController;

