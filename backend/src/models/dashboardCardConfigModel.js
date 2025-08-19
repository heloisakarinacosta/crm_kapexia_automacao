const { pool } = require('../config/db');

const DashboardCardConfig = {
  async findByClientId(clientId) {
    const [rows] = await pool.execute(
      `SELECT * FROM dashboard_card_configs 
       WHERE client_id = ? AND is_active = true 
       ORDER BY card_position`,
      [clientId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM dashboard_card_configs WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create(configData) {
    const { 
      client_id, 
      card_position,
      card_title, 
      sql_query, 
      icon,
      is_active 
    } = configData;
    
    const processedIcon = icon || '📊';
    const processedIsActive = is_active !== undefined ? is_active : true;
    
    const [result] = await pool.execute(
      `INSERT INTO dashboard_card_configs 
       (client_id, card_position, card_title, sql_query, icon, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [client_id, card_position, card_title, sql_query, processedIcon, processedIsActive]
    );
    
    return { 
      id: result.insertId, 
      client_id,
      card_position,
      card_title,
      sql_query,
      icon: processedIcon,
      is_active: processedIsActive
    };
  },

  async update(id, configData) {
    const { 
      card_position,
      card_title, 
      sql_query, 
      icon,
      is_active 
    } = configData;
    
    await pool.execute(
      `UPDATE dashboard_card_configs SET 
       card_position = ?,
       card_title = ?, 
       sql_query = ?, 
       icon = ?,
       is_active = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [card_position, card_title, sql_query, icon || '📊', is_active !== undefined ? is_active : true, id]
    );
    
    return { id, ...configData };
  },

  async delete(id) {
    await pool.execute(
      "DELETE FROM dashboard_card_configs WHERE id = ?",
      [id]
    );
    return { success: true };
  },

  async executeCardQuery(clientId, cardPosition) {
    try {
      // Buscar a configuração do card
      const [configRows] = await pool.execute(
        'SELECT sql_query FROM dashboard_card_configs WHERE client_id = ? AND card_position = ? AND is_active = true',
        [clientId, cardPosition]
      );

      if (configRows.length === 0) {
        // Retornar dados padrão se não houver configuração
        return this.getDefaultCardData(cardPosition);
      }

      const sqlQuery = configRows[0].sql_query;
      
      // Executar a query
      const [dataRows] = await pool.execute(sqlQuery);
      
      if (dataRows.length > 0) {
        const result = dataRows[0];
        // Mapear campos para padronizar nomes
        return {
          title: result.titulo || result.title,
          value: result.valor || result.value,
          percentual: result.percentual
        };
      } else {
        return this.getDefaultCardData(cardPosition);
      }
    } catch (error) {
      console.error('Erro ao executar query do card:', error);
      return this.getDefaultCardData(cardPosition);
    }
  },

  getDefaultCardData(cardPosition) {
    const defaultData = {
      1: { title: 'Novos Leads (Semana)', value: 42, percentual: '12%' },
      2: { title: 'Agendamentos (Mês)', value: 200, percentual: '5%' },
      3: { title: 'Taxa de Conversão', value: '8.5%', percentual: '2.3%' }
    };
    
    return defaultData[cardPosition] || { title: 'Card ' + cardPosition, value: 0, percentual: '0%' };
  }
};

module.exports = DashboardCardConfig;

