const { pool } = require('../config/db');

const RAGDocument = {
  async create(documentData) {
    const query = `
      INSERT INTO rag_documents 
      (client_id, filename, original_name, file_path, file_size, file_type, content_text) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      documentData.client_id,
      documentData.filename,
      documentData.original_name,
      documentData.file_path,
      documentData.file_size,
      documentData.file_type,
      documentData.content_text || null
    ]);
    
    return result.insertId;
  },

  async findByClientId(clientId) {
    const query = `
      SELECT * FROM rag_documents 
      WHERE client_id = ? 
      ORDER BY upload_date DESC
    `;
    
    const [rows] = await pool.execute(query, [clientId]);
    return rows;
  },

  async findById(id) {
    const query = 'SELECT * FROM rag_documents WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  },

  async updateProcessed(id, contentText = null) {
    const query = `
      UPDATE rag_documents 
      SET is_processed = TRUE, content_text = ?, processed_date = NOW() 
      WHERE id = ?
    `;
    
    await pool.execute(query, [contentText, id]);
  },

  async delete(id) {
    const query = 'DELETE FROM rag_documents WHERE id = ?';
    await pool.execute(query, [id]);
  },

  async deleteByClientId(clientId) {
    const query = 'DELETE FROM rag_documents WHERE client_id = ?';
    await pool.execute(query, [clientId]);
  }
};

module.exports = RAGDocument;

