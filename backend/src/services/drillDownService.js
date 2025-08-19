/**
 * Serviço para Drill-Down nos Gráficos
 * Implementa funcionalidade segura de drill-down com validações robustas
 */

const { pool } = require('../config/db');

class DrillDownService {
  /**
   * Validar se uma query SQL é segura para execução
   * @param {string} query - Query SQL para validar
   * @returns {boolean} - True se a query é segura
   */
  static isQuerySafe(query) {
    if (!query || typeof query !== 'string') {
      return false;
    }

    const forbiddenKeywords = [
      'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE',
      'TRUNCATE', 'EXEC', 'EXECUTE', 'CALL', 'DECLARE', 'GRANT',
      'REVOKE', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'SET',
      'SHOW', 'DESCRIBE', 'EXPLAIN', 'USE', 'LOAD', 'OUTFILE',
      'INFILE', 'BACKUP', 'RESTORE', 'HANDLER', 'PREPARE',
      'DEALLOCATE', 'RESET', 'PURGE', 'FLUSH', 'KILL'
    ];
    
    const upperQuery = query.toUpperCase().trim();
    
    // Deve começar com SELECT
    if (!upperQuery.startsWith('SELECT')) {
      return false;
    }
    
    // Verificar palavras proibidas
    for (const keyword of forbiddenKeywords) {
      if (upperQuery.includes(keyword)) {
        return false;
      }
    }
    
    // Verificar comentários maliciosos
    if (upperQuery.includes('--') || upperQuery.includes('/*') || upperQuery.includes('*/')) {
      return false;
    }
    
    // Permitir subqueries e UNION ALL, mas bloquear múltiplas declarações só se houver comandos perigosos
    const statements = query.split(';').filter(s => s.trim());
    if (statements.length > 1) {
      // Se houver mais de um statement, só permita se todos forem SELECT
      if (!statements.every(s => s.trim().toUpperCase().startsWith('SELECT'))) {
        return false;
      }
    }
    
    // Limitar tamanho da query
    if (query.length > 5000) {
      return false;
    }
    
    return true;
  }

  /**
   * Obter configuração de drill-down para um gráfico
   * @param {number} clientId - ID do cliente
   * @param {number} chartPosition - Posição do gráfico (1-10)
   * @param {string} groupId - ID do grupo (opcional, para compatibilidade)
   * @returns {Object|null} - Configuração do drill-down ou null se não encontrada
   */
  static async getDrillDownConfig(clientId, chartPosition, groupId = null) {
    try {
      let query = `
        SELECT 
          id,
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
        FROM chart_drilldown_configs 
        WHERE client_id = ? 
          AND chart_position = ? 
          AND is_active = TRUE
      `;
      
      const params = [clientId, chartPosition];
      
      // Se groupId for fornecido, adicionar à query
      if (groupId) {
        query += ` AND group_id = ?`;
        params.push(groupId);
      }
      
      const [rows] = await pool.execute(query, params);

      if (rows.length === 0) {
        return null;
      }

      const config = rows[0];
      
      // Parse JSON fields
      try {
        config.detail_sql_params = JSON.parse(config.detail_sql_params);
        config.detail_grid_columns = JSON.parse(config.detail_grid_columns);
      } catch (parseError) {
        console.error('Erro ao fazer parse dos campos JSON:', parseError);
        return null;
      }

      return config;
    } catch (error) {
      console.error('Erro ao obter configuração de drill-down:', error);
      throw new Error('Erro interno ao obter configuração');
    }
  }

  /**
   * Executar drill-down e retornar dados detalhados
   * @param {number} clientId - ID do cliente
   * @param {number} chartPosition - Posição do gráfico
   * @param {Object} clickedData - Dados do elemento clicado no gráfico
   * @returns {Object} - Dados detalhados formatados
   */
  static async executeDrillDown(clientId, chartPosition, clickedData) {
    try {
      // Obter configuração
      const config = await this.getDrillDownConfig(clientId, chartPosition);
      
      if (!config) {
        throw new Error('Configuração de drill-down não encontrada para este gráfico');
      }

      // Validar query de segurança
      if (!this.isQuerySafe(config.detail_sql_query)) {
        throw new Error('Query de drill-down contém comandos não permitidos');
      }

      // Preparar parâmetros da query
      const queryParams = this.prepareQueryParams(config.detail_sql_params, clickedData, clientId);
      
      // Adicionar LIMIT se não existir
      let finalQuery = config.detail_sql_query;
      if (!finalQuery.toUpperCase().includes('LIMIT')) {
        finalQuery += ` LIMIT ${config.max_results || 1000}`;
      }

      // LOG: SQL final e parâmetros
      console.log('[DRILLDOWN DEBUG] SQL final a executar:', finalQuery);
      console.log('[DRILLDOWN DEBUG] Parâmetros:', queryParams);

      // Detectar se o SQL usa placeholders nomeados (ex: :data)
      const usesNamedPlaceholders = /:[a-zA-Z_][a-zA-Z0-9_]*/.test(finalQuery);
      let execParams = queryParams;
      if (usesNamedPlaceholders && Array.isArray(queryParams)) {
        // Se o mapeamento de parâmetros for array, converter para objeto usando o paramMapping
        execParams = {};
        if (Array.isArray(config.detail_sql_params)) {
          // Se for array, não temos nomes, não é possível mapear
          throw new Error('Configuração de parâmetros do drill-down deve ser um objeto para SQLs com placeholders nomeados.');
        } else {
          // paramMapping é objeto: { data: 'data_criacao', ... }
          Object.keys(config.detail_sql_params).forEach((paramKey, idx) => {
            execParams[paramKey] = queryParams[idx];
          });
        }
      }
      // DEBUG: Montar SQL substituindo os placeholders para visualização
      let debugSql = finalQuery;
      if (usesNamedPlaceholders) {
        debugSql = debugSql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, p1) => {
          const val = execParams[p1];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${val}'`;
        });
      } else if (Array.isArray(execParams) && execParams.length > 0) {
        let i = 0;
        debugSql = debugSql.replace(/\?/g, () => {
          const val = execParams[i++];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${val}'`;
        });
      }
      console.log('[DRILLDOWN DEBUG] SQL para visualização:', debugSql);

      // Executar query com timeout
      const timeoutMs = (config.query_timeout_seconds || 30) * 1000;
      const execOptions = usesNamedPlaceholders ? { sql: finalQuery, namedPlaceholders: true } : finalQuery;
      const [rows] = await Promise.race([
        pool.execute(execOptions, execParams),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
        )
      ]);

      // Formatar dados para o grid
      const formattedData = this.formatDataForGrid(rows, config);

      return {
        success: true,
        data: {
          title: config.detail_grid_title,
          columns: config.detail_grid_columns,
          rows: formattedData.rows,
          totalRows: rows.length,
          modalSize: config.modal_size,
          linkConfig: {
            column: config.detail_link_column,
            template: config.detail_link_template,
            textColumn: config.detail_link_text_column
          }
        }
      };
    } catch (error) {
      console.error('Erro ao executar drill-down:', error);
      
      if (error.message.includes('timeout')) {
        throw new Error('A consulta demorou muito para ser executada. Tente filtrar os dados.');
      }
      
      if (error.message.includes('não permitidos')) {
        throw new Error('Configuração de drill-down inválida');
      }
      
      throw new Error(`Erro ao obter dados detalhados: ${error.message}`);
    }
  }

  /**
   * Preparar parâmetros para a query baseado nos dados clicados
   * @param {Object} paramMapping - Mapeamento de parâmetros
   * @param {Object} clickedData - Dados do elemento clicado
   * @param {number} clientId - ID do cliente
   * @returns {Array} - Array de parâmetros para a query
   */
  static prepareQueryParams(paramMapping, clickedData, clientId) {
    const params = [];
    
    // Sempre adicionar client_id como primeiro parâmetro se mapeado
    if (paramMapping.client_id) {
      params.push(clientId);
    }

    // Adicionar outros parâmetros baseados no mapeamento
    for (const [paramKey, dataKey] of Object.entries(paramMapping)) {
      if (paramKey === 'client_id') {
        continue; // Já adicionado acima
      }

      let value = clickedData[dataKey];
      
      // Conversões especiais baseado no tipo de dado
      if (dataKey.includes('date') || dataKey.includes('data')) {
        // Converter para formato de data MySQL se necessário
        if (value && !value.includes('-')) {
          // Se for timestamp ou formato diferente, converter
          const date = new Date(value);
          value = date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
      }
      
      params.push(value);
    }

    return params;
  }

  /**
   * Formatar dados para exibição no grid
   * @param {Array} rows - Dados brutos do banco
   * @param {Object} config - Configuração do drill-down
   * @returns {Object} - Dados formatados
   */
  static formatDataForGrid(rows, config) {
    const formattedRows = rows.map(row => {
      const formattedRow = { ...row };
      
      // Aplicar formatações baseadas no tipo da coluna
      config.detail_grid_columns.forEach(column => {
        const value = formattedRow[column.field];
        
        if (value !== null && value !== undefined) {
          switch (column.type) {
            case 'currency':
              formattedRow[column.field] = this.formatCurrency(value);
              break;
            case 'date':
              formattedRow[column.field] = this.formatDate(value);
              break;
            case 'datetime':
              formattedRow[column.field] = this.formatDateTime(value);
              break;
            case 'phone':
              formattedRow[column.field] = this.formatPhone(value);
              break;
            case 'email':
              formattedRow[column.field] = value.toLowerCase();
              break;
            case 'badge':
              formattedRow[column.field] = this.formatBadge(value);
              break;
            default:
              // Manter valor original para text, number, etc.
              break;
          }
        }
      });

      // Adicionar link se configurado
      if (config.detail_link_column && config.detail_link_template) {
        const linkValue = formattedRow[config.detail_link_column];
        if (linkValue) {
          formattedRow._link = config.detail_link_template.replace(
            `{${config.detail_link_column}}`, 
            linkValue
          );
          formattedRow._linkText = config.detail_link_text_column 
            ? formattedRow[config.detail_link_text_column] 
            : linkValue;
        }
      }

      return formattedRow;
    });

    return {
      rows: formattedRows
    };
  }

  /**
   * Formatar valor monetário
   */
  static formatCurrency(value) {
    if (isNaN(value)) return value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formatar data
   */
  static formatDate(value) {
    if (!value) return value;
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Formatar data e hora
   */
  static formatDateTime(value) {
    if (!value) return value;
    const date = new Date(value);
    return date.toLocaleString('pt-BR');
  }

  /**
   * Formatar telefone
   */
  static formatPhone(value) {
    if (!value) return value;
    const phone = value.replace(/\D/g, '');
    
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  }

  /**
   * Formatar badge (status, temperatura, etc.)
   */
  static formatBadge(value) {
    if (!value) return value;
    
    // Mapear valores para cores/estilos
    const badgeMap = {
      'ativo': { text: 'Ativo', color: 'green' },
      'inativo': { text: 'Inativo', color: 'gray' },
      'quente': { text: 'Quente', color: 'red' },
      'morno': { text: 'Morno', color: 'yellow' },
      'frio': { text: 'Frio', color: 'blue' },
      'novo': { text: 'Novo', color: 'green' },
      'qualificado': { text: 'Qualificado', color: 'blue' },
      'negociacao': { text: 'Negociação', color: 'yellow' },
      'fechado': { text: 'Fechado', color: 'green' },
      'perdido': { text: 'Perdido', color: 'red' }
    };

    const badge = badgeMap[value.toLowerCase()];
    return badge ? badge : { text: value, color: 'gray' };
  }

  /**
   * Listar todas as configurações de drill-down de um cliente
   * @param {number} clientId - ID do cliente
   * @returns {Array} - Lista de configurações
   */
  static async listDrillDownConfigs(clientId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id,
          chart_position,
          group_id,
          chart_name,
          chart_type,
          chart_title,
          chart_subtitle,
          x_axis_field,
          y_axis_field,
          database_config_id,
          detail_grid_title,
          modal_size,
          max_results,
          is_active,
          created_at,
          updated_at
        FROM chart_drilldown_configs 
        WHERE client_id = ?
        ORDER BY group_id, chart_position
      `, [clientId]);

      return rows;
    } catch (error) {
      console.error('Erro ao listar configurações de drill-down:', error);
      throw new Error('Erro interno ao listar configurações');
    }
  }

  /**
   * Verificar se um gráfico tem drill-down configurado
   * @param {number} clientId - ID do cliente
   * @param {number} chartPosition - Posição do gráfico
   * @param {string} groupId - ID do grupo (opcional)
   * @returns {boolean} - True se tem drill-down configurado
   */
  static async hasDrillDown(clientId, chartPosition, groupId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM chart_drilldown_configs 
        WHERE client_id = ? 
          AND chart_position = ? 
          AND is_active = TRUE
      `;
      
      const params = [clientId, chartPosition];
      
      if (groupId) {
        query += ` AND group_id = ?`;
        params.push(groupId);
      }
      
      const [rows] = await pool.execute(query, params);

      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar drill-down:', error);
      return false;
    }
  }

  /**
   * Criar nova configuração de drill-down
   * @param {number} clientId - ID do cliente
   * @param {Object} configData - Dados da configuração
   * @returns {Object} - Configuração criada
   */
  static async createDrillDownConfig(clientId, configData) {
    try {
      // Validar se já existe configuração para a mesma posição no mesmo grupo
      const existingConfig = await this.getDrillDownConfig(clientId, configData.chart_position, configData.group_id);
      if (existingConfig) {
        throw new Error('Já existe uma configuração de drill-down para esta posição neste grupo');
      }

      // Validar query SQL
      if (!this.isQuerySafe(configData.detail_sql_query)) {
        throw new Error('Query SQL contém comandos não permitidos');
      }

      const [result] = await pool.execute(`
        INSERT INTO chart_drilldown_configs (
          client_id,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId,
        configData.chart_position,
        configData.group_id,
        configData.chart_name,
        configData.chart_type,
        configData.chart_title,
        configData.chart_subtitle,
        configData.x_axis_field,
        configData.y_axis_field,
        configData.database_config_id,
        configData.sql_query,
        configData.detail_sql_query,
        JSON.stringify(configData.detail_sql_params),
        configData.detail_grid_title,
        JSON.stringify(configData.detail_grid_columns),
        configData.detail_link_column,
        configData.detail_link_template,
        configData.detail_link_text_column,
        configData.modal_size,
        configData.max_results,
        configData.query_timeout_seconds,
        configData.is_active
      ]);

      // Retornar configuração criada
      return {
        id: result.insertId,
        ...configData,
        client_id: clientId,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      console.error('Erro ao criar configuração de drill-down:', error);
      throw error;
    }
  }

  /**
   * Atualizar configuração de drill-down existente
   * @param {number} clientId - ID do cliente
   * @param {number} configId - ID da configuração
   * @param {Object} updateData - Dados para atualização
   * @returns {Object|null} - Configuração atualizada ou null se não encontrada
   */
  static async updateDrillDownConfig(clientId, configId, updateData) {
    try {
      // Verificar se a configuração existe e pertence ao cliente
      const [existingRows] = await pool.execute(`
        SELECT id FROM chart_drilldown_configs 
        WHERE id = ? AND client_id = ?
      `, [configId, clientId]);

      if (existingRows.length === 0) {
        throw new Error('Configuração de drill-down não encontrada');
      }

      // Validar se nova posição/grupo não conflita com outra configuração
      if (updateData.chart_position || updateData.group_id) {
        const [conflictRows] = await pool.execute(`
          SELECT id FROM chart_drilldown_configs 
          WHERE client_id = ? 
            AND chart_position = ? 
            AND group_id = ? 
            AND id != ?
        `, [
          clientId,
          updateData.chart_position,
          updateData.group_id,
          configId
        ]);

        if (conflictRows.length > 0) {
          throw new Error('Já existe uma configuração de drill-down para esta posição neste grupo');
        }
      }

      // Validar query SQL se fornecida
      if (updateData.detail_sql_query && !this.isQuerySafe(updateData.detail_sql_query)) {
        throw new Error('Query SQL contém comandos não permitidos');
      }

      // Construir query de atualização dinamicamente
      const updateFields = [];
      const updateValues = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          
          // Serializar campos JSON
          if (key === 'detail_sql_params' || key === 'detail_grid_columns') {
            updateValues.push(JSON.stringify(updateData[key]));
          } else {
            updateValues.push(updateData[key]);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(configId, clientId);

      const [result] = await pool.execute(`
        UPDATE chart_drilldown_configs 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND client_id = ?
      `, updateValues);

      if (result.affectedRows === 0) {
        return null;
      }

      // Retornar configuração atualizada
      const [updatedRows] = await pool.execute(`
        SELECT * FROM chart_drilldown_configs 
        WHERE id = ? AND client_id = ?
      `, [configId, clientId]);

      return updatedRows[0];
    } catch (error) {
      console.error('Erro ao atualizar configuração de drill-down:', error);
      throw error;
    }
  }

  /**
   * Excluir configuração de drill-down
   * @param {number} clientId - ID do cliente
   * @param {number} configId - ID da configuração
   * @returns {boolean} - True se excluído com sucesso
   */
  static async deleteDrillDownConfig(clientId, configId) {
    try {
      const [result] = await pool.execute(`
        DELETE FROM chart_drilldown_configs 
        WHERE id = ? AND client_id = ?
      `, [configId, clientId]);

      if (result.affectedRows === 0) {
        throw new Error('Configuração de drill-down não encontrada');
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir configuração de drill-down:', error);
      throw error;
    }
  }
}

module.exports = DrillDownService;

