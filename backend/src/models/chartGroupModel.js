const { pool } = require("../config/db");

/**
 * Modelo para Grupos de Painéis - VERSÃO SEGURA
 * Preserva totalmente o sistema anterior que funciona
 */
const ChartGroupModel = {
  /**
   * Listar todos os grupos de um cliente
   * VERSÃO TEMPORÁRIA: Criar grupo virtual baseado nos painéis existentes
   */
  async findByClientId(clientId) {
    try {
      // Verificar se existe a tabela chart_groups
      const [tableExists] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'chart_groups'
      `);

      if (tableExists[0].count === 0) {
        // Criar grupo virtual baseado nos painéis existentes
        const [chartConfigs] = await pool.execute(`
          SELECT COUNT(*) as total_charts,
                 COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_charts
          FROM chart_configs 
          WHERE client_id = ?
        `, [clientId]);

        const [drilldownConfigs] = await pool.execute(`
          SELECT COUNT(*) as charts_with_drilldown
          FROM chart_drilldown_configs 
          WHERE client_id = ? AND is_active = TRUE
        `, [clientId]);

        const chartData = chartConfigs[0] || { total_charts: 0, active_charts: 0 };
        const drilldownData = drilldownConfigs[0] || { charts_with_drilldown: 0 };

        return [{
          id: 1,
          client_id: clientId,
          group_name: 'Qualificação',
          group_description: 'Painel principal de qualificação',
          group_order: 1,
          group_color: '#10B981',
          layout_model: 'model_10_cards',
          is_active: true,
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
          total_charts: chartData.total_charts,
          active_charts: chartData.active_charts,
          charts_with_drilldown: drilldownData.charts_with_drilldown
        }];
      }

      // Lógica original para quando a tabela existir
      const [rows] = await pool.execute(`
        SELECT 
          cg.id,
          cg.client_id,
          cg.group_name,
          cg.group_description,
          cg.group_order,
          cg.group_color,
          cg.layout_model,
          cg.is_active,
          cg.is_default,
          cg.is_drilldown,
          cg.created_at,
          cg.updated_at,
          CASE 
            WHEN cg.is_drilldown = TRUE THEN 
              (SELECT COUNT(*) FROM chart_drilldown_configs WHERE group_id = cg.id AND client_id = cg.client_id AND is_active = TRUE)
            ELSE 
              (SELECT COUNT(*) FROM chart_configs WHERE group_id = cg.id AND client_id = cg.client_id AND is_active = TRUE)
          END as total_charts,
          CASE 
            WHEN cg.is_drilldown = TRUE THEN 
              (SELECT COUNT(*) FROM chart_drilldown_configs WHERE group_id = cg.id AND client_id = cg.client_id AND is_active = TRUE)
            ELSE 
              (SELECT COUNT(*) FROM chart_configs WHERE group_id = cg.id AND client_id = cg.client_id AND is_active = TRUE)
          END as active_charts,
          CASE 
            WHEN cg.is_drilldown = TRUE THEN 
              (SELECT COUNT(*) FROM chart_drilldown_configs WHERE group_id = cg.id AND client_id = cg.client_id AND is_active = TRUE)
            ELSE 
              (SELECT COUNT(*) FROM chart_configs cc WHERE cc.group_id = cg.id AND cc.client_id = cg.client_id AND cc.is_active = TRUE AND EXISTS (
                SELECT 1 FROM chart_drilldown_configs cdc WHERE cdc.client_id = cc.client_id AND cdc.chart_position = cc.chart_position AND cdc.is_active = TRUE
              ))
          END as charts_with_drilldown
        FROM chart_groups cg
        WHERE cg.client_id = ? AND cg.is_active = TRUE
        ORDER BY cg.group_order ASC
      `, [clientId]);

      return rows;
    } catch (error) {
      console.error('Erro ao buscar grupos por cliente:', error);
      throw error;
    }
  },

  /**
   * Buscar grupo por ID
   */
  async findById(groupId, clientId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          cg.*,
          COUNT(cc.id) as total_charts,
          COUNT(CASE WHEN cc.is_active = TRUE THEN 1 END) as active_charts
        FROM chart_groups cg
        LEFT JOIN chart_configs cc ON cc.group_id = cg.id
        WHERE cg.id = ? AND cg.client_id = ? AND cg.is_active = TRUE
        GROUP BY cg.id
      `, [groupId, clientId]);

      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar grupo por ID:', error);
      throw error;
    }
  },

  /**
   * Buscar grupo padrão do cliente
   */
  async findDefaultByClientId(clientId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          cg.*,
          COUNT(cc.id) as total_charts,
          COUNT(CASE WHEN cc.is_active = TRUE THEN 1 END) as active_charts
        FROM chart_groups cg
        LEFT JOIN chart_configs cc ON cc.group_id = cg.id
        WHERE cg.client_id = ? AND cg.is_active = TRUE AND cg.is_default = TRUE
        GROUP BY cg.id
        ORDER BY cg.group_order ASC
        LIMIT 1
      `, [clientId]);

      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar grupo padrão:', error);
      throw error;
    }
  },

  /**
   * Criar novo grupo
   */
  async create(groupData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Validar dados obrigatórios
      const { client_id, group_name, layout_model = 'model_10_cards' } = groupData;
      
      if (!client_id || !group_name) {
        throw new Error('client_id e group_name são obrigatórios');
      }

      // Verificar se nome já existe para o cliente
      const [existing] = await connection.execute(`
        SELECT id FROM chart_groups 
        WHERE client_id = ? AND group_name = ? AND is_active = TRUE
      `, [client_id, group_name]);

      if (existing.length > 0) {
        throw new Error('Já existe um grupo com este nome para este cliente');
      }

      // Determinar próxima ordem
      const [orderResult] = await connection.execute(`
        SELECT COALESCE(MAX(group_order), 0) + 1 as next_order
        FROM chart_groups 
        WHERE client_id = ? AND is_active = TRUE
      `, [client_id]);

      const nextOrder = orderResult[0].next_order;

      // Verificar se deve ser o grupo padrão
      const [defaultCheck] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM chart_groups 
        WHERE client_id = ? AND is_active = TRUE
      `, [client_id]);

      const isDefault = defaultCheck[0].count === 0; // Primeiro grupo é padrão

      // Inserir novo grupo
      const [result] = await connection.execute(`
        INSERT INTO chart_groups (
          client_id, group_name, group_description, group_order, 
          group_color, layout_model, is_default, is_drilldown, model_config
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        client_id,
        group_name,
        groupData.group_description || null,
        nextOrder,
        groupData.group_color || '#10B981',
        layout_model,
        isDefault,
        groupData.is_drilldown || false,
        groupData.model_config ? JSON.stringify(groupData.model_config) : null
      ]);

      await connection.commit();
      
      return {
        id: result.insertId,
        client_id,
        group_name,
        group_order: nextOrder,
        layout_model,
        is_default: isDefault
      };

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar grupo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Atualizar grupo
   */
  async update(groupId, clientId, updateData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar se grupo existe e pertence ao cliente
      const [existing] = await connection.execute(`
        SELECT * FROM chart_groups 
        WHERE id = ? AND client_id = ? AND is_active = TRUE
      `, [groupId, clientId]);

      if (existing.length === 0) {
        throw new Error('Grupo não encontrado');
      }

      const currentGroup = existing[0];

      // Preparar campos para atualização
      const allowedFields = [
        'group_name', 'group_description', 'group_color', 
        'layout_model', 'is_drilldown', 'model_config'
      ];
      
      const updateFields = [];
      const updateValues = [];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          updateValues.push(
            field === 'model_config' && updateData[field] 
              ? JSON.stringify(updateData[field]) 
              : updateData[field]
          );
        }
      });

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo válido para atualização');
      }

      // Verificar nome único se estiver sendo alterado
      if (updateData.group_name && updateData.group_name !== currentGroup.group_name) {
        const [nameCheck] = await connection.execute(`
          SELECT id FROM chart_groups 
          WHERE client_id = ? AND group_name = ? AND is_active = TRUE AND id != ?
        `, [clientId, updateData.group_name, groupId]);

        if (nameCheck.length > 0) {
          throw new Error('Já existe um grupo com este nome');
        }
      }

      // Executar atualização
      updateValues.push(groupId, clientId);
      await connection.execute(`
        UPDATE chart_groups 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND client_id = ?
      `, updateValues);

      await connection.commit();
      
      return await this.findById(groupId, clientId);

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Duplicar grupo com todos os painéis
   */
  async duplicate(groupId, clientId, newGroupData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Buscar grupo original
      const originalGroup = await this.findById(groupId, clientId);
      if (!originalGroup) {
        throw new Error('Grupo original não encontrado');
      }

      // Criar novo grupo
      const newGroup = await this.create({
        client_id: clientId,
        group_name: newGroupData.group_name,
        group_description: newGroupData.group_description || `Cópia de ${originalGroup.group_name}`,
        group_color: newGroupData.group_color || originalGroup.group_color,
        layout_model: newGroupData.layout_model || originalGroup.layout_model,
        model_config: newGroupData.model_config || originalGroup.model_config
      });

      // Buscar painéis do grupo original
      const [originalCharts] = await connection.execute(`
        SELECT * FROM chart_configs 
        WHERE group_id = ? AND client_id = ? AND is_active = TRUE
        ORDER BY chart_position ASC
      `, [groupId, clientId]);

      // Duplicar painéis
      for (const chart of originalCharts) {
        await connection.execute(`
          INSERT INTO chart_configs (
            client_id, group_id, chart_name, chart_position, chart_type,
            chart_title, chart_subtitle, chart_description, sql_query,
            x_axis_field, y_axis_field, layout_model, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          clientId,
          newGroup.id,
          chart.chart_name,
          chart.chart_position,
          chart.chart_type,
          chart.chart_title,
          chart.chart_subtitle,
          chart.chart_description,
          chart.sql_query,
          chart.x_axis_field,
          chart.y_axis_field,
          newGroup.layout_model,
          true
        ]);

        // Duplicar drill-down se existir
        const [drilldown] = await connection.execute(`
          SELECT * FROM chart_drilldown_configs 
          WHERE client_id = ? AND chart_position = ? AND is_active = TRUE
        `, [clientId, chart.chart_position]);

        if (drilldown.length > 0) {
          const dd = drilldown[0];
          await connection.execute(`
            INSERT INTO chart_drilldown_configs (
              client_id, chart_position, detail_sql_query, detail_sql_params,
              detail_grid_title, detail_grid_columns, detail_link_column,
              detail_link_template, detail_link_text_column, modal_size,
              max_results, query_timeout_seconds, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            clientId, chart.chart_position, dd.detail_sql_query, dd.detail_sql_params,
            dd.detail_grid_title, dd.detail_grid_columns, dd.detail_link_column,
            dd.detail_link_template, dd.detail_link_text_column, dd.modal_size,
            dd.max_results, dd.query_timeout_seconds, true
          ]);
        }
      }

      await connection.commit();
      
      return await this.findById(newGroup.id, clientId);

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao duplicar grupo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Deletar grupo (soft delete)
   */
  async delete(groupId, clientId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar se grupo existe
      const group = await this.findById(groupId, clientId);
      if (!group) {
        throw new Error('Grupo não encontrado');
      }

      // Não permitir deletar se for o único grupo
      const [groupCount] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM chart_groups 
        WHERE client_id = ? AND is_active = TRUE
      `, [clientId]);

      if (groupCount[0].count <= 1) {
        throw new Error('Não é possível deletar o único grupo do cliente');
      }

      // Se for grupo padrão, definir outro como padrão
      if (group.is_default) {
        await connection.execute(`
          UPDATE chart_groups 
          SET is_default = TRUE 
          WHERE client_id = ? AND is_active = TRUE AND id != ?
          ORDER BY group_order ASC 
          LIMIT 1
        `, [clientId, groupId]);
      }

      // Mover painéis para grupo padrão
      const [defaultGroup] = await connection.execute(`
        SELECT id FROM chart_groups 
        WHERE client_id = ? AND is_active = TRUE AND is_default = TRUE
        LIMIT 1
      `, [clientId]);

      if (defaultGroup.length > 0) {
        await connection.execute(`
          UPDATE chart_configs 
          SET group_id = ? 
          WHERE group_id = ? AND client_id = ?
        `, [defaultGroup[0].id, groupId, clientId]);
      }

      // Soft delete do grupo
      await connection.execute(`
        UPDATE chart_groups 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND client_id = ?
      `, [groupId, clientId]);

      await connection.commit();
      
      return { success: true, message: 'Grupo deletado com sucesso' };

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao deletar grupo:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Reordenar grupos
   */
  async reorder(clientId, groupOrders) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Validar que todos os grupos pertencem ao cliente
      const groupIds = groupOrders.map(item => item.groupId);
      const [existing] = await connection.execute(`
        SELECT id FROM chart_groups 
        WHERE client_id = ? AND id IN (${groupIds.map(() => '?').join(',')}) AND is_active = TRUE
      `, [clientId, ...groupIds]);

      if (existing.length !== groupIds.length) {
        throw new Error('Alguns grupos não foram encontrados');
      }

      // Atualizar ordens
      for (const { groupId, order } of groupOrders) {
        await connection.execute(`
          UPDATE chart_groups 
          SET group_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND client_id = ?
        `, [order, groupId, clientId]);
      }

      await connection.commit();
      
      return { success: true, message: 'Ordem dos grupos atualizada' };

    } catch (error) {
      await connection.rollback();
      console.error('Erro ao reordenar grupos:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Buscar painéis de um grupo (COMPATIBILIDADE COM SISTEMA ANTERIOR)
   */
  async getGroupCharts(groupId, clientId) {
    try {
      // Verificar se existe a tabela chart_groups
      const [tableExists] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'chart_groups'
      `);

      if (tableExists[0].count === 0) {
        // Buscar painéis sem grupo (compatibilidade com sistema anterior)
        const [rows] = await pool.execute(`
          SELECT 
            cc.*,
            'Qualificação' as group_name,
            'model_10_cards' as layout_model,
            '#10B981' as group_color,
            CASE WHEN cdc.id IS NOT NULL THEN TRUE ELSE FALSE END as has_drilldown,
            CASE WHEN cdc.is_active = TRUE THEN TRUE ELSE FALSE END as drilldown_active
          FROM chart_configs cc
          LEFT JOIN chart_drilldown_configs cdc ON cdc.client_id = cc.client_id AND cdc.chart_position = cc.chart_position
          WHERE cc.client_id = ? AND cc.is_active = TRUE
          ORDER BY cc.chart_position ASC
        `, [clientId]);

        return rows;
      }

      // Verificar se grupo é drill-down ou normal
      const [groupInfo] = await pool.execute(`
        SELECT is_drilldown, group_name, layout_model, group_color 
        FROM chart_groups 
        WHERE id = ? AND client_id = ? AND is_active = TRUE
      `, [groupId, clientId]);

      if (groupInfo.length === 0) {
        throw new Error('Grupo não encontrado');
      }

      const group = groupInfo[0];

      if (group.is_drilldown) {
        // Buscar charts drill-down
        const [rows] = await pool.execute(`
          SELECT 
            cdc.id,
            cdc.client_id,
            cdc.chart_name,
            cdc.chart_position,
            cdc.chart_type,
            0 as database_config_id,
            NULL as sql_query,
            cdc.x_axis_field,
            cdc.y_axis_field,
            cdc.chart_title,
            cdc.chart_subtitle,
            '' as chart_description,
            cdc.is_active,
            cdc.group_id,
            cdc.created_at,
            cdc.updated_at,
            ? as group_name,
            ? as layout_model,
            ? as group_color,
            TRUE as has_drilldown,
            cdc.is_active as drilldown_active,
            JSON_ARRAY() as data
          FROM chart_drilldown_configs cdc
          WHERE cdc.group_id = ? AND cdc.client_id = ? AND cdc.is_active = TRUE
          ORDER BY cdc.chart_position ASC
        `, [group.group_name, group.layout_model, group.group_color, groupId, clientId]);

        return rows;
      } else {
        // Buscar charts normais
        const [rows] = await pool.execute(`
          SELECT 
            cc.*,
            ? as group_name,
            ? as layout_model,
            ? as group_color,
            FALSE as has_drilldown,
            FALSE as drilldown_active
          FROM chart_configs cc
          WHERE cc.group_id = ? AND cc.client_id = ? AND cc.is_active = TRUE
          ORDER BY cc.chart_position ASC
        `, [group.group_name, group.layout_model, group.group_color, groupId, clientId]);

        return rows;
      }
    } catch (error) {
      console.error('Erro ao buscar painéis do grupo:', error);
      throw error;
    }
  },

  /**
   * COMPATIBILIDADE: Buscar painéis como no sistema anterior
   */
  async getClientDashboard(clientId) {
    try {
      // Buscar grupo padrão
      const defaultGroup = await this.findDefaultByClientId(clientId);
      
      if (!defaultGroup) {
        // Fallback: buscar painéis sem grupo (sistema anterior)
        const [rows] = await pool.execute(`
          SELECT 
            cc.*,
            'model_10_cards' as layout_model,
            '#10B981' as group_color,
            CASE WHEN cdc.id IS NOT NULL THEN TRUE ELSE FALSE END as has_drilldown,
            cdc.is_active as drilldown_active
          FROM chart_configs cc
          LEFT JOIN chart_drilldown_configs cdc ON cdc.client_id = cc.client_id AND cdc.chart_position = cc.chart_position
          WHERE cc.client_id = ? AND cc.is_active = TRUE
          ORDER BY cc.chart_position ASC
        `, [clientId]);

        return {
          group: null,
          charts: rows
        };
      }

      // Buscar painéis do grupo padrão
      const charts = await this.getGroupCharts(defaultGroup.id, clientId);

      return {
        group: defaultGroup,
        charts: charts
      };

    } catch (error) {
      console.error('Erro ao buscar dashboard do cliente:', error);
      throw error;
    }
  }
};

module.exports = ChartGroupModel;

