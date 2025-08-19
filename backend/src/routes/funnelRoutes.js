const express = require('express');
const router = express.Router();
const funnelController = require('../controllers/funnelController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas as rotas com autenticação
router.use(authMiddleware);

// Listar estratégias
router.get('/', funnelController.listFunnels);
// Buscar estratégia por id
router.get('/:id', funnelController.getFunnel);
// Criar estratégia
router.post('/', funnelController.createFunnel);
// Atualizar estratégia
router.put('/:id', funnelController.updateFunnel);
// Deletar estratégia (soft delete)
router.delete('/:id', funnelController.deleteFunnel);

// Rotas de estágios do funil
router.get('/:funnel_id/stages', funnelController.listStages);
router.get('/:funnel_id/stages/:id', funnelController.getStage);
router.post('/:funnel_id/stages', funnelController.createStage);
router.put('/:funnel_id/stages/:id', funnelController.updateStage);
router.delete('/:funnel_id/stages/:id', funnelController.deleteStage);

// Rotas de cards do funil
router.get('/:funnel_id/cards', funnelController.listCards);
router.get('/:funnel_id/cards/:id', funnelController.getCard);
router.post('/:funnel_id/cards', funnelController.createCard);
router.put('/:funnel_id/cards/:id', funnelController.updateCard);
router.delete('/:funnel_id/cards/:id', funnelController.deleteCard);

// Rotas de movimentações dos cards
router.get('/:funnel_id/cards/:card_id/movements', funnelController.listCardMovements);
router.get('/:funnel_id/cards/:card_id/movements/:id', funnelController.getCardMovement);
router.post('/:funnel_id/cards/:card_id/movements', funnelController.createCardMovement);
router.put('/:funnel_id/cards/:card_id/movements/:id', funnelController.updateCardMovement);
router.delete('/:funnel_id/cards/:card_id/movements/:id', funnelController.deleteCardMovement);

// Rotas de histórico dos cards
router.get('/:funnel_id/cards/:card_id/history', funnelController.listCardHistory);
router.get('/:funnel_id/cards/:card_id/history/:id', funnelController.getCardHistory);
router.post('/:funnel_id/cards/:card_id/history', funnelController.createCardHistory);
router.put('/:funnel_id/cards/:card_id/history/:id', funnelController.updateCardHistory);
router.delete('/:funnel_id/cards/:card_id/history/:id', funnelController.deleteCardHistory);

// Rotas de tarefas dos cards
router.get('/:funnel_id/cards/:card_id/tasks', funnelController.listCardTasks);
router.get('/:funnel_id/cards/:card_id/tasks/:id', funnelController.getCardTask);
router.post('/:funnel_id/cards/:card_id/tasks', funnelController.createCardTask);
router.put('/:funnel_id/cards/:card_id/tasks/:id', funnelController.updateCardTask);
router.delete('/:funnel_id/cards/:card_id/tasks/:id', funnelController.deleteCardTask);

// Rotas de automações dos funis/cards
router.get('/:funnel_id/automations', funnelController.listAutomations);
router.get('/:funnel_id/automations/:id', funnelController.getAutomation);
router.post('/:funnel_id/automations', funnelController.createAutomation);
router.put('/:funnel_id/automations/:id', funnelController.updateAutomation);
router.delete('/:funnel_id/automations/:id', funnelController.deleteAutomation);

// Rotas de permissões do funil
router.get('/:funnel_id/permissions', funnelController.listPermissions);
router.get('/:funnel_id/permissions/:id', funnelController.getPermission);
router.post('/:funnel_id/permissions', funnelController.createPermission);
router.put('/:funnel_id/permissions/:id', funnelController.updatePermission);
router.delete('/:funnel_id/permissions/:id', funnelController.deletePermission);

// Rotas de tags do funil
router.get('/:funnel_id/tags', funnelController.listTags);
router.get('/:funnel_id/tags/:id', funnelController.getTag);
router.post('/:funnel_id/tags', funnelController.createTag);
router.put('/:funnel_id/tags/:id', funnelController.updateTag);
router.delete('/:funnel_id/tags/:id', funnelController.deleteTag);

// Rotas de tags dos cards
router.get('/:funnel_id/cards/:card_id/tags', funnelController.listCardTags);
router.post('/:funnel_id/cards/:card_id/tags', funnelController.addCardTag);
router.delete('/:funnel_id/cards/:card_id/tags/:tag_id', funnelController.removeCardTag);

// Rotas de arquivos dos cards
router.get('/:funnel_id/cards/:card_id/files', funnelController.listCardFiles);
router.get('/:funnel_id/cards/:card_id/files/:id', funnelController.getCardFile);
router.post('/:funnel_id/cards/:card_id/files', funnelController.createCardFile);
router.put('/:funnel_id/cards/:card_id/files/:id', funnelController.updateCardFile);
router.delete('/:funnel_id/cards/:card_id/files/:id', funnelController.deleteCardFile);

// Rotas de itens dos cards (fallback)
router.get('/:funnel_id/cards/:card_id/items', funnelController.listCardItemsFallback);
// Rotas de comentários dos cards (fallback)
router.get('/:funnel_id/cards/:card_id/comments', funnelController.listCardCommentsFallback);
// Rotas de tarefas dos cards (fallback)
router.get('/:funnel_id/cards/:card_id/tasks', funnelController.listCardTasksFallback);
// Rotas de arquivos dos cards (fallback)
router.get('/:funnel_id/cards/:card_id/files', funnelController.listCardFilesFallback);
// Rotas de histórico dos cards (fallback)
router.get('/:funnel_id/cards/:card_id/history', funnelController.listCardHistoryFallback);

module.exports = router; 