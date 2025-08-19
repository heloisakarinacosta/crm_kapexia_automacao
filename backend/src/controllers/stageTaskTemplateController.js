// Controller stub para stage_task_templates

const stageTaskTemplateModel = require('../models/stageTaskTemplateModel');

const stageTaskTemplateController = {
  async createStageTaskTemplate(req, res) {
    try {
      const client_id = req.user.client_id;
      const funnel_id = req.params.funnel_id;
      const stage_id = req.params.stage_id;
      const data = { ...req.body, funnel_id, stage_id };
      const result = await stageTaskTemplateModel.createStageTaskTemplate(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar template de tarefa', error: error.message });
    }
  },

  async getStageTaskTemplatesByStage(req, res) {
    try {
      const client_id = req.user.client_id;
      const stage_id = req.params.stage_id;
      const result = await stageTaskTemplateModel.getStageTaskTemplatesByStage(stage_id, client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar templates de tarefa', error: error.message });
    }
  },

  async getStageTaskTemplateById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { template_id } = req.params;
      const result = await stageTaskTemplateModel.getStageTaskTemplateById(template_id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Template não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar template', error: error.message });
    }
  },

  async updateStageTaskTemplate(req, res) {
    try {
      const client_id = req.user.client_id;
      const { template_id } = req.params;
      const updated = await stageTaskTemplateModel.updateStageTaskTemplate(template_id, req.body, client_id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Template não encontrado ou nada para atualizar' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar template', error: error.message });
    }
  },

  async deleteStageTaskTemplate(req, res) {
    try {
      const client_id = req.user.client_id;
      const { template_id } = req.params;
      const deleted = await stageTaskTemplateModel.deleteStageTaskTemplate(template_id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Template não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar template', error: error.message });
    }
  },
};

module.exports = stageTaskTemplateController; 