// Controller stub para audit_log

const auditLogModel = require('../models/auditLogModel');

const auditLogController = {
  async createAuditLog(req, res) {
    try {
      const client_id = req.user.client_id;
      const user_id = req.user.id;
      const data = { ...req.body, client_id, user_id };
      const result = await auditLogModel.createAuditLog(data);
      res.status(201).json({ success: true, id: result.id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao criar log de auditoria', error: error.message });
    }
  },

  async getAuditLogsByClient(req, res) {
    try {
      const client_id = req.user.client_id;
      const result = await auditLogModel.getAuditLogsByClient(client_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar logs de auditoria', error: error.message });
    }
  },

  async getAuditLogById(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const result = await auditLogModel.getAuditLogById(id, client_id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Log de auditoria não encontrado' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar log de auditoria', error: error.message });
    }
  },

  async deleteAuditLog(req, res) {
    try {
      const client_id = req.user.client_id;
      const { id } = req.params;
      const deleted = await auditLogModel.deleteAuditLog(id, client_id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Log de auditoria não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao deletar log de auditoria', error: error.message });
    }
  },
};

module.exports = auditLogController; 