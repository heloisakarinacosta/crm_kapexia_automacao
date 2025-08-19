const { pool } = require('../config/db');

const RAGEmbedding = {
  async create(embeddingData) {
    const query = `
      INSERT INTO rag_embeddings 
      (document_id, client_id, chunk_text, chunk_index, embedding_vector, metadata) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      embeddingData.document_id,
      embeddingData.client_id,
      embeddingData.chunk_text,
      embeddingData.chunk_index,
      JSON.stringify(embeddingData.embedding_vector),
      JSON.stringify(embeddingData.metadata || {})
    ]);
    
    return result.insertId;
  },

  async findByDocumentId(documentId) {
    const query = `
      SELECT * FROM rag_embeddings 
      WHERE document_id = ? 
      ORDER BY chunk_index
    `;
    
    const [rows] = await pool.execute(query, [documentId]);
    return rows.map(row => ({
      ...row,
      embedding_vector: row.embedding_vector ? JSON.parse(row.embedding_vector) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  },

  async findByClientId(clientId) {
    const query = `
      SELECT e.*, d.filename, d.original_name 
      FROM rag_embeddings e
      JOIN rag_documents d ON e.document_id = d.id
      WHERE e.client_id = ? 
      ORDER BY d.upload_date DESC, e.chunk_index
    `;
    
    const [rows] = await pool.execute(query, [clientId]);
    return rows.map(row => ({
      ...row,
      embedding_vector: row.embedding_vector ? JSON.parse(row.embedding_vector) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  },

  async searchSimilar(clientId, queryEmbedding, limit = 5) {
    // Para busca de similaridade, seria necessário implementar
    // cálculo de distância coseno ou usar uma extensão MySQL específica
    // Por enquanto, retorna os chunks mais recentes
    const query = `
      SELECT e.*, d.filename, d.original_name 
      FROM rag_embeddings e
      JOIN rag_documents d ON e.document_id = d.id
      WHERE e.client_id = ? 
      ORDER BY e.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await pool.execute(query, [clientId, limit]);
    return rows.map(row => ({
      ...row,
      embedding_vector: row.embedding_vector ? JSON.parse(row.embedding_vector) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  },

  async deleteByDocumentId(documentId) {
    const query = 'DELETE FROM rag_embeddings WHERE document_id = ?';
    await pool.execute(query, [documentId]);
  },

  async deleteByClientId(clientId) {
    const query = 'DELETE FROM rag_embeddings WHERE client_id = ?';
    await pool.execute(query, [clientId]);
  }
};

module.exports = RAGEmbedding;

