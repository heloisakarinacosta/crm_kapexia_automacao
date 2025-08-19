const RAGDocument = require('../models/ragDocumentModel');
const RAGEmbedding = require('../models/ragEmbeddingModel');
const OpenAIConfig = require('../models/openaiConfigModel');
const OpenAIService = require('../services/openaiService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const clientId = req.user.client_id;
    const uploadDir = path.join(__dirname, '../../uploads/rag', clientId.toString());
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use: ' + allowedTypes.join(', ')));
    }
  }
});

const RAGController = {
  // Middleware para upload
  uploadMiddleware: upload.single('document'),

  // Listar documentos RAG do cliente
  async getDocuments(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const documents = await RAGDocument.findByClientId(clientId);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Erro ao listar documentos RAG:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Upload de documento RAG
  async uploadDocument(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
      }

      const documentData = {
        client_id: clientId,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: path.extname(req.file.originalname).toLowerCase()
      };

      const documentId = await RAGDocument.create(documentData);
      
      // Processar documento em background (simplificado)
      setImmediate(() => {
        RAGController.processDocument(documentId);
      });

      res.json({
        success: true,
        message: 'Documento enviado com sucesso. Processamento iniciado.',
        data: { id: documentId, ...documentData }
      });
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Processar documento para embeddings
  async processDocument(documentId) {
    try {
      const document = await RAGDocument.findById(documentId);
      if (!document) return;

      // Extrair texto do arquivo (simplificado - apenas .txt por enquanto)
      let contentText = '';
      
      if (document.file_type === '.txt') {
        contentText = await fs.readFile(document.file_path, 'utf-8');
      } else {
        // Para outros tipos, seria necessário usar bibliotecas específicas
        contentText = 'Conteúdo não processado - tipo de arquivo não suportado ainda';
      }

      // Dividir em chunks
      const chunks = RAGController.splitIntoChunks(contentText, 1000, 200);
      
      // Buscar configuração OpenAI do cliente
      const openaiConfig = await OpenAIConfig.findByClientId(document.client_id);
      
      if (openaiConfig && openaiConfig.rag_enabled) {
        // Gerar embeddings para cada chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          try {
            // Gerar embedding usando OpenAI
            const embedding = await RAGController.generateEmbedding(
              openaiConfig.api_key,
              chunk,
              openaiConfig.embedding_model || 'text-embedding-ada-002'
            );

            await RAGEmbedding.create({
              document_id: documentId,
              client_id: document.client_id,
              chunk_text: chunk,
              chunk_index: i,
              embedding_vector: embedding,
              metadata: {
                document_name: document.original_name,
                chunk_length: chunk.length
              }
            });
          } catch (embeddingError) {
            console.error(`Erro ao gerar embedding para chunk ${i}:`, embeddingError);
          }
        }
      }

      // Marcar documento como processado
      await RAGDocument.updateProcessed(documentId, contentText);
      
      console.log(`Documento ${documentId} processado com sucesso`);
    } catch (error) {
      console.error('Erro ao processar documento:', error);
    }
  },

  // Dividir texto em chunks
  splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      
      if (end === text.length) break;
      start = end - overlap;
    }
    
    return chunks;
  },

  // Gerar embedding usando OpenAI
  async generateEmbedding(apiKey, text, model = 'text-embedding-ada-002') {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey });

      const response = await openai.embeddings.create({
        model: model,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      throw error;
    }
  },

  // Excluir documento RAG
  async deleteDocument(req, res) {
    try {
      const clientId = req.user.client_id;
      const documentId = req.params.id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const document = await RAGDocument.findById(documentId);
      
      if (!document || document.client_id !== clientId) {
        return res.status(404).json({
          success: false,
          message: 'Documento não encontrado'
        });
      }

      // Excluir embeddings associados
      await RAGEmbedding.deleteByDocumentId(documentId);
      
      // Excluir arquivo físico
      try {
        await fs.unlink(document.file_path);
      } catch (fileError) {
        console.error('Erro ao excluir arquivo físico:', fileError);
      }
      
      // Excluir registro do documento
      await RAGDocument.delete(documentId);
      
      res.json({
        success: true,
        message: 'Documento excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = RAGController;

