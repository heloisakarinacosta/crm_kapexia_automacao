const express = require('express');
const router = express.Router({ mergeParams: true });
const stageTaskTemplateController = require('../controllers/stageTaskTemplateController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Rotas aninhadas: /api/funnels/:funnel_id/stages/:stage_id/task-templates
router.post('/', stageTaskTemplateController.createStageTaskTemplate);
router.get('/', stageTaskTemplateController.getStageTaskTemplatesByStage);
router.get('/:template_id', stageTaskTemplateController.getStageTaskTemplateById);
router.put('/:template_id', stageTaskTemplateController.updateStageTaskTemplate);
router.delete('/:template_id', stageTaskTemplateController.deleteStageTaskTemplate);

module.exports = router; 