const FunnelModel = require('../models/funnelModel');

const listFunnels = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const funnels = await FunnelModel.listByClient(client_id);
    res.json({ success: true, data: funnels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFunnel = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { id } = req.params;
    const funnel = await FunnelModel.getById(id, client_id);
    if (!funnel) return res.status(404).json({ success: false, message: 'Estratégia não encontrada' });
    res.json({ success: true, data: funnel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFunnel = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const funnel = { ...req.body, client_id };
    const created = await FunnelModel.create(funnel);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFunnel = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { id } = req.params;
    const updated = await FunnelModel.update(id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFunnel = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { id } = req.params;
    await FunnelModel.delete(id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de estágios do funil
const listStages = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const stages = await FunnelModel.listStagesByFunnel(funnel_id, client_id);
    res.json({ success: true, data: stages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getStage = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const stage = await FunnelModel.getStageById(id, funnel_id, client_id);
    if (!stage) return res.status(404).json({ success: false, message: 'Estágio não encontrado' });
    res.json({ success: true, data: stage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createStage = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const stage = { ...req.body, funnel_id, is_active: true };
    const created = await FunnelModel.createStage(stage);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateStage = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const updated = await FunnelModel.updateStage(id, funnel_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteStage = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    await FunnelModel.deleteStage(id, funnel_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de cards do funil
const listCards = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const cards = await FunnelModel.listCardsByFunnel(funnel_id, client_id);
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCard = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const card = await FunnelModel.getCardById(id, funnel_id, client_id);
    if (!card) return res.status(404).json({ success: false, message: 'Card não encontrado' });
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createCard = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const card = { ...req.body, funnel_id, is_active: true };
    const created = await FunnelModel.createCard(card);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateCard = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const { status, current_stage_id, title, owner_user_id } = req.body;

    // Verificar se os campos obrigatórios estão presentes
    if (!status || !['open', 'won', 'lost', 'paused'].includes(status)) {
      return res.status(400).json({ success: false, message: "O campo 'status' é obrigatório e deve ser um dos valores: 'open', 'won', 'lost', 'paused'." });
    }
    if (!current_stage_id) {
      return res.status(400).json({ success: false, message: "O campo 'current_stage_id' é obrigatório e não pode ser nulo." });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: "O campo 'title' é obrigatório e não pode ser nulo." });
    }
    if (!owner_user_id) {
      return res.status(400).json({ success: false, message: "O campo 'owner_user_id' é obrigatório e não pode ser nulo." });
    }

    const updated = await FunnelModel.updateCard(id, funnel_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar card:', error, 'Body recebido:', req.body);
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteCard = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    await FunnelModel.deleteCard(id, funnel_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de movimentações dos cards
const listCardMovements = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const movements = await FunnelModel.listCardMovementsByCard(card_id, client_id);
    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCardMovement = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const movement = await FunnelModel.getCardMovementById(id, card_id, client_id);
    if (!movement) return res.status(404).json({ success: false, message: 'Movimentação não encontrada' });
    res.json({ success: true, data: movement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createCardMovement = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const movement = { ...req.body, card_id };
    const created = await FunnelModel.createCardMovement(movement);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateCardMovement = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const updated = await FunnelModel.updateCardMovement(id, card_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteCardMovement = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    await FunnelModel.deleteCardMovement(id, card_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de histórico dos cards
const listCardHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const history = await FunnelModel.listCardHistoryByCard(card_id, client_id);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCardHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const history = await FunnelModel.getCardHistoryById(id, card_id, client_id);
    if (!history) return res.status(404).json({ success: false, message: 'Histórico não encontrado' });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createCardHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const history = { ...req.body, card_id };
    const created = await FunnelModel.createCardHistory(history);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateCardHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const updated = await FunnelModel.updateCardHistory(id, card_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteCardHistory = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    await FunnelModel.deleteCardHistory(id, card_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de tarefas dos cards
const listCardTasks = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const tasks = await FunnelModel.listCardTasksByCard(card_id, client_id);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCardTask = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const task = await FunnelModel.getCardTaskById(id, card_id, client_id);
    if (!task) return res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createCardTask = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const task = { ...req.body, card_id };
    const created = await FunnelModel.createCardTask(task);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateCardTask = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const updated = await FunnelModel.updateCardTask(id, card_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteCardTask = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    await FunnelModel.deleteCardTask(id, card_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de automações dos funis/cards
const listAutomations = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const automations = await FunnelModel.listAutomationsByFunnel(funnel_id, client_id);
    res.json({ success: true, data: automations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAutomation = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const automation = await FunnelModel.getAutomationById(id, funnel_id, client_id);
    if (!automation) return res.status(404).json({ success: false, message: 'Automação não encontrada' });
    res.json({ success: true, data: automation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createAutomation = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const automation = { ...req.body, funnel_id };
    const created = await FunnelModel.createAutomation(automation);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateAutomation = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const updated = await FunnelModel.updateAutomation(id, funnel_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteAutomation = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    await FunnelModel.deleteAutomation(id, funnel_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de permissões do funil
const listPermissions = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const permissions = await FunnelModel.listPermissionsByFunnel(funnel_id, client_id);
    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getPermission = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const permission = await FunnelModel.getPermissionById(id, funnel_id, client_id);
    if (!permission) return res.status(404).json({ success: false, message: 'Permissão não encontrada' });
    res.json({ success: true, data: permission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createPermission = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const permission = { ...req.body, funnel_id };
    const created = await FunnelModel.createPermission(permission);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updatePermission = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const updated = await FunnelModel.updatePermission(id, funnel_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deletePermission = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    await FunnelModel.deletePermission(id, funnel_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de tags do funil
const listTags = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const tags = await FunnelModel.listTagsByFunnel(funnel_id, client_id);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Erro em listTags:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const tag = await FunnelModel.getTagById(id, funnel_id, client_id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag não encontrada' });
    res.json({ success: true, data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id } = req.params;
    const tag = { ...req.body, funnel_id, is_active: true };
    const created = await FunnelModel.createTag(tag);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    const updated = await FunnelModel.updateTag(id, funnel_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { funnel_id, id } = req.params;
    await FunnelModel.deleteTag(id, funnel_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de tags dos cards
const listCardTags = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const tags = await FunnelModel.listTagsByCard(card_id, client_id);
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('Erro em listCardTags:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const addCardTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const { tag_id } = req.body;
    await FunnelModel.addTagToCard(card_id, tag_id, client_id);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const removeCardTag = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, tag_id } = req.params;
    await FunnelModel.removeTagFromCard(card_id, tag_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRUD de arquivos dos cards
const listCardFiles = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const files = await FunnelModel.listFilesByCard(card_id, client_id);
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCardFile = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const file = await FunnelModel.getFileById(id, card_id, client_id);
    if (!file) return res.status(404).json({ success: false, message: 'Arquivo não encontrado' });
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const createCardFile = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id } = req.params;
    const file = { ...req.body, card_id };
    const created = await FunnelModel.createFile(file);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateCardFile = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    const updated = await FunnelModel.updateFile(id, card_id, client_id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteCardFile = async (req, res) => {
  try {
    const client_id = req.user.client_id;
    const { card_id, id } = req.params;
    await FunnelModel.deleteFile(id, card_id, client_id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fallback para itens do card
const listCardItemsFallback = async (req, res) => {
  res.json({ success: true, data: [] });
};
// Fallback para comentários do card
const listCardCommentsFallback = async (req, res) => {
  res.json({ success: true, data: [] });
};
// Fallback para tarefas do card
const listCardTasksFallback = async (req, res) => {
  res.json({ success: true, data: [] });
};
// Fallback para arquivos do card
const listCardFilesFallback = async (req, res) => {
  res.json({ success: true, data: [] });
};
// Fallback para histórico do card
const listCardHistoryFallback = async (req, res) => {
  res.json({ success: true, data: [] });
};

module.exports = {
  listFunnels,
  getFunnel,
  createFunnel,
  updateFunnel,
  deleteFunnel,
  listStages,
  getStage,
  createStage,
  updateStage,
  deleteStage,
  listCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  listCardMovements,
  getCardMovement,
  createCardMovement,
  updateCardMovement,
  deleteCardMovement,
  listCardHistory,
  getCardHistory,
  createCardHistory,
  updateCardHistory,
  deleteCardHistory,
  listCardTasks,
  getCardTask,
  createCardTask,
  updateCardTask,
  deleteCardTask,
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  listCardTags,
  addCardTag,
  removeCardTag,
  listCardFiles,
  getCardFile,
  createCardFile,
  updateCardFile,
  deleteCardFile,
  listCardItemsFallback,
  listCardCommentsFallback,
  listCardTasksFallback,
  listCardFilesFallback,
  listCardHistoryFallback
}; 