const db = require('../config/db');

const FunnelModel = {
  async listByClient(client_id) {
    const [rows] = await db.pool.query('SELECT * FROM funnels WHERE client_id = ? AND is_active = TRUE ORDER BY sort_order, name', [client_id]);
    return rows;
  },
  async getById(id, client_id) {
    const [rows] = await db.pool.query('SELECT * FROM funnels WHERE id = ? AND client_id = ?', [id, client_id]);
    return rows[0];
  },
  async create(funnel) {
    const [result] = await db.pool.query('INSERT INTO funnels SET ?', [funnel]);
    return { id: result.insertId, ...funnel };
  },
  async update(id, client_id, data) {
    await db.pool.query('UPDATE funnels SET ? WHERE id = ? AND client_id = ?', [data, id, client_id]);
    return this.getById(id, client_id);
  },
  async delete(id, client_id) {
    await db.pool.query('UPDATE funnels SET is_active = FALSE WHERE id = ? AND client_id = ?', [id, client_id]);
    return true;
  },
  // CRUD de estágios do funil
  async listStagesByFunnel(funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT s.* FROM funnel_stages s
       JOIN funnels f ON s.funnel_id = f.id
       WHERE s.funnel_id = ? AND f.client_id = ? AND s.is_active = TRUE
       ORDER BY s.sort_order, s.name`,
      [funnel_id, client_id]
    );
    return rows;
  },
  async getStageById(id, funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT s.* FROM funnel_stages s
       JOIN funnels f ON s.funnel_id = f.id
       WHERE s.id = ? AND s.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return rows[0];
  },
  async createStage(stage) {
    const [result] = await db.pool.query('INSERT INTO funnel_stages SET ?', [stage]);
    return { id: result.insertId, ...stage };
  },
  async updateStage(id, funnel_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_stages s
       JOIN funnels f ON s.funnel_id = f.id
       SET s.name = ?, s.description = ?, s.color = ?, s.probability = ?, s.sort_order = ?, s.is_active = ?, s.automation_config = ?
       WHERE s.id = ? AND s.funnel_id = ? AND f.client_id = ?`,
      [data.name, data.description, data.color, data.probability, data.sort_order, data.is_active, JSON.stringify(data.automation_config || null), id, funnel_id, client_id]
    );
    return this.getStageById(id, funnel_id, client_id);
  },
  async deleteStage(id, funnel_id, client_id) {
    await db.pool.query(
      `UPDATE funnel_stages s
       JOIN funnels f ON s.funnel_id = f.id
       SET s.is_active = FALSE
       WHERE s.id = ? AND s.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return true;
  },
  // CRUD de cards do funil
  async listCardsByFunnel(funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT c.* FROM funnel_cards c
       JOIN funnels f ON c.funnel_id = f.id
       WHERE c.funnel_id = ? AND f.client_id = ? AND c.is_active = TRUE
       ORDER BY c.status, c.id, c.title`,
      [funnel_id, client_id]
    );
    return rows;
  },
  async getCardById(id, funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT c.* FROM funnel_cards c
       JOIN funnels f ON c.funnel_id = f.id
       WHERE c.id = ? AND c.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return rows[0];
  },
  async createCard(card, contact_phone_id, contact_email_id, contact_address_id) {
    const [result] = await db.pool.query('INSERT INTO funnel_cards SET ?', [card]);
    const cardId = result.insertId;
    await this.addContactReference(cardId, contact_phone_id, contact_email_id, contact_address_id);
    return { id: cardId, ...card };
  },
  async updateCard(id, funnel_id, client_id, data, contact_phone_id, contact_email_id, contact_address_id) {
    console.log('Dados recebidos para atualização do card:', data);
    if (!data.current_stage_id) {
      throw new Error("O campo 'current_stage_id' é obrigatório e não pode ser nulo.");
    }
    if (!data.status || !['open', 'won', 'lost', 'paused'].includes(data.status)) {
      throw new Error("O campo 'status' é obrigatório e deve ser um dos valores: 'open', 'won', 'lost', 'paused'.");
    }
    if (!data.is_active) {
      throw new Error("O campo 'is_active' é obrigatório e não pode ser nulo.");
    }
    if (!data.owner_user_id) {
      throw new Error("O campo 'owner_user_id' é obrigatório e não pode ser nulo.");
    }
    if (!data.responsible_user_id) {
      throw new Error("O campo 'responsible_user_id' é obrigatório e não pode ser nulo.");
    }
    await db.pool.query(
      `UPDATE funnel_cards c
       JOIN funnels f ON c.funnel_id = f.id
       SET c.title = ?, c.description = ?, c.estimated_value = ?, c.status = ?, c.current_stage_id = ?, c.is_active = ?, c.owner_user_id = ?, c.probability = ?, c.responsible_user_id = ?
       WHERE c.id = ? AND c.funnel_id = ? AND f.client_id = ?`,
      [data.title, data.description, data.estimated_value, data.status, data.current_stage_id, data.is_active, data.owner_user_id, data.probability, data.responsible_user_id, id, funnel_id, client_id]
    );
    await this.updateContactReference(id, contact_phone_id, contact_email_id, contact_address_id);
    return this.getCardById(id, funnel_id, client_id);
  },
  async deleteCard(id, funnel_id, client_id) {
    await db.pool.query(
      `UPDATE funnel_cards c
       JOIN funnels f ON c.funnel_id = f.id
       SET c.is_active = FALSE
       WHERE c.id = ? AND c.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return true;
  },
  // CRUD de movimentações dos cards
  async listCardMovementsByCard(card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT m.* FROM funnel_card_movements m
       JOIN funnel_cards c ON m.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE m.card_id = ? AND f.client_id = ?
       ORDER BY m.moved_at DESC, m.id DESC`,
      [card_id, client_id]
    );
    return rows;
  },
  async getCardMovementById(id, card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT m.* FROM funnel_card_movements m
       JOIN funnel_cards c ON m.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE m.id = ? AND m.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return rows[0];
  },
  async createCardMovement(movement) {
    const [result] = await db.pool.query('INSERT INTO funnel_card_movements SET ?', [movement]);
    return { id: result.insertId, ...movement };
  },
  async updateCardMovement(id, card_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_card_movements m
       JOIN funnel_cards c ON m.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       SET m.from_stage_id = ?, m.to_stage_id = ?, m.moved_by_user_id = ?, m.moved_at = ?, m.notes = ?
       WHERE m.id = ? AND m.card_id = ? AND f.client_id = ?`,
      [data.from_stage_id, data.to_stage_id, data.moved_by_user_id, data.moved_at, data.notes, id, card_id, client_id]
    );
    return this.getCardMovementById(id, card_id, client_id);
  },
  async deleteCardMovement(id, card_id, client_id) {
    await db.pool.query(
      `DELETE m FROM funnel_card_movements m
       JOIN funnel_cards c ON m.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE m.id = ? AND m.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return true;
  },
  // CRUD de histórico dos cards
  async listCardHistoryByCard(card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT h.* FROM funnel_card_history h
       JOIN funnel_cards c ON h.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE h.card_id = ? AND f.client_id = ?
       ORDER BY h.created_at DESC, h.id DESC`,
      [card_id, client_id]
    );
    return rows;
  },
  async getCardHistoryById(id, card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT h.* FROM funnel_card_history h
       JOIN funnel_cards c ON h.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE h.id = ? AND h.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return rows[0];
  },
  async createCardHistory(history) {
    const [result] = await db.pool.query('INSERT INTO funnel_card_history SET ?', [history]);
    return { id: result.insertId, ...history };
  },
  async updateCardHistory(id, card_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_card_history h
       JOIN funnel_cards c ON h.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       SET h.event_type = ?, h.description = ?, h.created_by_user_id = ?, h.created_at = ?
       WHERE h.id = ? AND h.card_id = ? AND f.client_id = ?`,
      [data.event_type, data.description, data.created_by_user_id, data.created_at, id, card_id, client_id]
    );
    return this.getCardHistoryById(id, card_id, client_id);
  },
  async deleteCardHistory(id, card_id, client_id) {
    await db.pool.query(
      `DELETE h FROM funnel_card_history h
       JOIN funnel_cards c ON h.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE h.id = ? AND h.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return true;
  },
  // CRUD de tarefas dos cards
  async listCardTasksByCard(card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT t.* FROM funnel_card_tasks t
       JOIN funnel_cards c ON t.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE t.card_id = ? AND f.client_id = ?
       ORDER BY t.due_date ASC, t.id DESC`,
      [card_id, client_id]
    );
    return rows;
  },
  async getCardTaskById(id, card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT t.* FROM funnel_card_tasks t
       JOIN funnel_cards c ON t.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE t.id = ? AND t.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return rows[0];
  },
  async createCardTask(task) {
    const [result] = await db.pool.query('INSERT INTO funnel_card_tasks SET ?', [task]);
    return { id: result.insertId, ...task };
  },
  async updateCardTask(id, card_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_card_tasks t
       JOIN funnel_cards c ON t.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       SET t.title = ?, t.description = ?, t.due_date = ?, t.is_active = ?, t.completed_at = ?
       WHERE t.id = ? AND t.card_id = ? AND f.client_id = ?`,
      [data.title, data.description, data.due_date, data.is_active, data.completed_at, id, card_id, client_id]
    );
    return this.getCardTaskById(id, card_id, client_id);
  },
  async deleteCardTask(id, card_id, client_id) {
    await db.pool.query(
      `DELETE t FROM funnel_card_tasks t
       JOIN funnel_cards c ON t.card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE t.id = ? AND t.card_id = ? AND f.client_id = ?`,
      [id, card_id, client_id]
    );
    return true;
  },
  // CRUD de automações dos funis/cards
  async listAutomationsByFunnel(funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT a.* FROM funnel_automations a
       JOIN funnels f ON a.funnel_id = f.id
       WHERE a.funnel_id = ? AND f.client_id = ?
       ORDER BY a.id DESC`,
      [funnel_id, client_id]
    );
    return rows;
  },
  async getAutomationById(id, funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT a.* FROM funnel_automations a
       JOIN funnels f ON a.funnel_id = f.id
       WHERE a.id = ? AND a.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return rows[0];
  },
  async createAutomation(automation) {
    const [result] = await db.pool.query('INSERT INTO funnel_automations SET ?', [automation]);
    return { id: result.insertId, ...automation };
  },
  async updateAutomation(id, funnel_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_automations a
       JOIN funnels f ON a.funnel_id = f.id
       SET a.name = ?, a.trigger_type = ?, a.trigger_config = ?, a.action_type = ?, a.action_config = ?, a.is_active = ?
       WHERE a.id = ? AND a.funnel_id = ? AND f.client_id = ?`,
      [data.name, data.trigger_type, JSON.stringify(data.trigger_config || null), data.action_type, JSON.stringify(data.action_config || null), data.is_active, id, funnel_id, client_id]
    );
    return this.getAutomationById(id, funnel_id, client_id);
  },
  async deleteAutomation(id, funnel_id, client_id) {
    await db.pool.query(
      `DELETE a FROM funnel_automations a
       JOIN funnels f ON a.funnel_id = f.id
       WHERE a.id = ? AND a.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return true;
  },
  // CRUD de permissões do funil
  async listPermissionsByFunnel(funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT p.* FROM funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.funnel_id = ? AND f.client_id = ?
       ORDER BY p.id DESC`,
      [funnel_id, client_id]
    );
    return rows;
  },
  async getPermissionById(id, funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT p.* FROM funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.id = ? AND p.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return rows[0];
  },
  async createPermission(permission) {
    const [result] = await db.pool.query('INSERT INTO funnel_permissions SET ?', [permission]);
    return { id: result.insertId, ...permission };
  },
  async updatePermission(id, funnel_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       SET p.user_id = ?, p.permission_type = ?, p.is_active = ?
       WHERE p.id = ? AND p.funnel_id = ? AND f.client_id = ?`,
      [data.user_id, data.permission_type, data.is_active, id, funnel_id, client_id]
    );
    return this.getPermissionById(id, funnel_id, client_id);
  },
  async deletePermission(id, funnel_id, client_id) {
    await db.pool.query(
      `DELETE p FROM funnel_permissions p
       JOIN funnels f ON p.funnel_id = f.id
       WHERE p.id = ? AND p.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return true;
  },
  // CRUD de tags do funil
  async listTagsByFunnel(funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT t.* FROM funnel_tags t
       JOIN funnels f ON t.funnel_id = f.id
       WHERE t.funnel_id = ? AND f.client_id = ?
       ORDER BY t.name`,
      [funnel_id, client_id]
    );
    return rows;
  },
  async getTagById(id, funnel_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT t.* FROM funnel_tags t
       JOIN funnels f ON t.funnel_id = f.id
       WHERE t.id = ? AND t.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return rows[0];
  },
  async createTag(tag) {
    const [result] = await db.pool.query('INSERT INTO funnel_tags SET ?', [tag]);
    return { id: result.insertId, ...tag };
  },
  async updateTag(id, funnel_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_tags t
       JOIN funnels f ON t.funnel_id = f.id
       SET t.name = ?, t.color = ?, t.is_active = ?
       WHERE t.id = ? AND t.funnel_id = ? AND f.client_id = ?`,
      [data.name, data.color, data.is_active, id, funnel_id, client_id]
    );
    return this.getTagById(id, funnel_id, client_id);
  },
  async deleteTag(id, funnel_id, client_id) {
    await db.pool.query(
      `UPDATE funnel_tags t
       JOIN funnels f ON t.funnel_id = f.id
       SET t.is_active = FALSE
       WHERE t.id = ? AND t.funnel_id = ? AND f.client_id = ?`,
      [id, funnel_id, client_id]
    );
    return true;
  },
  // CRUD de tags dos cards
  async listTagsByCard(card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT t.* FROM funnel_tags t
       JOIN funnel_card_tags ct ON t.id = ct.tag_id
       JOIN funnel_cards c ON ct.funnel_card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE ct.funnel_card_id = ? AND f.client_id = ?`,
      [card_id, client_id]
    );
    return rows;
  },
  async addTagToCard(card_id, tag_id, client_id) {
    await db.pool.query(
      `INSERT IGNORE INTO funnel_card_tags (funnel_card_id, tag_id) VALUES (?, ?)`,
      [card_id, tag_id]
    );
    return true;
  },
  async removeTagFromCard(card_id, tag_id, client_id) {
    await db.pool.query(
      `DELETE ct FROM funnel_card_tags ct
       JOIN funnel_cards c ON ct.funnel_card_id = c.id
       JOIN funnels f ON c.funnel_id = f.id
       WHERE ct.funnel_card_id = ? AND ct.tag_id = ? AND f.client_id = ?`,
      [card_id, tag_id, client_id]
    );
    return true;
  },
  // CRUD de arquivos dos cards
  async listFilesByCard(card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT f.* FROM funnel_card_files f
       JOIN funnel_cards c ON f.card_id = c.id
       JOIN funnels fu ON c.funnel_id = fu.id
       WHERE f.card_id = ? AND fu.client_id = ?
       ORDER BY f.uploaded_at DESC, f.id DESC`,
      [card_id, client_id]
    );
    return rows;
  },
  async getFileById(id, card_id, client_id) {
    const [rows] = await db.pool.query(
      `SELECT f.* FROM funnel_card_files f
       JOIN funnel_cards c ON f.card_id = c.id
       JOIN funnels fu ON c.funnel_id = fu.id
       WHERE f.id = ? AND f.card_id = ? AND fu.client_id = ?`,
      [id, card_id, client_id]
    );
    return rows[0];
  },
  async createFile(file) {
    const [result] = await db.pool.query('INSERT INTO funnel_card_files SET ?', [file]);
    return { id: result.insertId, ...file };
  },
  async updateFile(id, card_id, client_id, data) {
    await db.pool.query(
      `UPDATE funnel_card_files f
       JOIN funnel_cards c ON f.card_id = c.id
       JOIN funnels fu ON c.funnel_id = fu.id
       SET f.file_name = ?, f.file_url = ?, f.file_type = ?, f.file_size = ?, f.is_active = ?
       WHERE f.id = ? AND f.card_id = ? AND fu.client_id = ?`,
      [data.file_name, data.file_url, data.file_type, data.file_size, data.is_active, id, card_id, client_id]
    );
    return this.getFileById(id, card_id, client_id);
  },
  async deleteFile(id, card_id, client_id) {
    await db.pool.query(
      `DELETE f FROM funnel_card_files f
       JOIN funnel_cards c ON f.card_id = c.id
       JOIN funnels fu ON c.funnel_id = fu.id
       WHERE f.id = ? AND f.card_id = ? AND fu.client_id = ?`,
      [id, card_id, client_id]
    );
    return true;
  },
  async addContactReference(funnel_card_id, contact_phone_id, contact_email_id, contact_address_id) {
    const [result] = await db.pool.query(
      'INSERT INTO contact_references (funnel_card_id, contact_phone_id, contact_email_id, contact_address_id) VALUES (?, ?, ?, ?)',
      [funnel_card_id, contact_phone_id, contact_email_id, contact_address_id]
    );
    return { id: result.insertId, funnel_card_id, contact_phone_id, contact_email_id, contact_address_id };
  },

  async updateContactReference(funnel_card_id, contact_phone_id, contact_email_id, contact_address_id) {
    await db.pool.query(
      'UPDATE contact_references SET contact_phone_id = ?, contact_email_id = ?, contact_address_id = ? WHERE funnel_card_id = ?',
      [contact_phone_id, contact_email_id, contact_address_id, funnel_card_id]
    );
    return this.getContactReferenceByCardId(funnel_card_id);
  },

  async getContactReferenceByCardId(funnel_card_id) {
    const [rows] = await db.pool.query(
      'SELECT * FROM contact_references WHERE funnel_card_id = ?',
      [funnel_card_id]
    );
    return rows[0];
  }
};

module.exports = FunnelModel; 