-- Adicionar configurações de RAG/Embeddings à tabela openai_configs
ALTER TABLE openai_configs 
ADD COLUMN rag_enabled BOOLEAN DEFAULT FALSE COMMENT 'Se RAG está habilitado',
ADD COLUMN embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002' COMMENT 'Modelo de embedding',
ADD COLUMN vector_store_type VARCHAR(50) DEFAULT 'local' COMMENT 'Tipo de armazenamento de vetores (local, pinecone, etc)',
ADD COLUMN chunk_size INT DEFAULT 1000 COMMENT 'Tamanho dos chunks para embeddings',
ADD COLUMN chunk_overlap INT DEFAULT 200 COMMENT 'Sobreposição entre chunks',
ADD COLUMN max_documents INT DEFAULT 100 COMMENT 'Máximo de documentos para RAG';

-- Criar tabela para armazenar documentos RAG
CREATE TABLE rag_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  content_text LONGTEXT NULL COMMENT 'Texto extraído do documento',
  is_processed BOOLEAN DEFAULT FALSE COMMENT 'Se o documento foi processado para embeddings',
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_client_processed (client_id, is_processed)
);

-- Criar tabela para armazenar chunks e embeddings
CREATE TABLE rag_embeddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id INT NOT NULL,
  client_id INT NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INT NOT NULL COMMENT 'Índice do chunk no documento',
  embedding_vector JSON NULL COMMENT 'Vetor de embedding (se armazenado localmente)',
  metadata JSON NULL COMMENT 'Metadados adicionais do chunk',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES rag_documents(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_document_chunk (document_id, chunk_index),
  INDEX idx_client_embeddings (client_id)
);

