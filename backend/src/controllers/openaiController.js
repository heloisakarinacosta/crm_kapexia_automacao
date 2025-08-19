const OpenAIConfig = require('../models/openaiConfigModel');
const OpenAIService = require('../services/openaiService');
const { validationResult } = require('express-validator');

const OpenAIController = {
  // Obter configuração OpenAI por cliente
  async getConfigByClientId(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      const config = await OpenAIConfig.findByClientId(clientId);
      
      console.log('[DEBUG] Config do banco:', config);
      
      // Não retornar a API key completa por segurança, mas manter uma versão mascarada
      let maskedConfig = null;
      if (config) {
        maskedConfig = { ...config };
        if (maskedConfig.api_key) {
          maskedConfig.api_key = maskedConfig.api_key.substring(0, 10) + '...';
        }
        // Converter valores numéricos para boolean
        maskedConfig.rag_enabled = !!maskedConfig.rag_enabled;
        maskedConfig.is_active = !!maskedConfig.is_active;
        
        // Adicionar flag indicando que existe uma API Key válida
        maskedConfig.has_api_key = !!(config.api_key && config.api_key.trim() !== '');
      }
      
      console.log('[DEBUG] Config mascarado:', maskedConfig);
      
      res.json({
        success: true,
        data: maskedConfig
      });
    } catch (error) {
      console.error('Erro ao buscar configuração OpenAI:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Criar ou atualizar configuração OpenAI
  async upsertConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      // Verificar se já existe configuração
      const existingConfig = await OpenAIConfig.findByClientId(clientId);
      
      const configData = {
        assistant_id: req.body.assistant_id,
        model: req.body.model,
        system_prompt: req.body.system_prompt,
        is_active: req.body.is_active
      };

      // Só incluir API key se foi fornecida e não está vazia
      if (req.body.api_key && req.body.api_key.trim() !== '') {
        configData.api_key = req.body.api_key;
      }
      
      let result;
      if (existingConfig) {
        result = await OpenAIConfig.update(clientId, configData);
      } else {
        // Para criar nova configuração, API key é obrigatória
        if (!req.body.api_key) {
          return res.status(400).json({
            success: false,
            message: 'API Key é obrigatória para nova configuração'
          });
        }
        configData.client_id = clientId;
        configData.api_key = req.body.api_key;
        result = await OpenAIConfig.create(configData);
      }
      
      res.json({
        success: true,
        message: 'Configuração OpenAI salva com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao salvar configuração OpenAI:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Excluir configuração OpenAI
  async deleteConfig(req, res) {
    try {
      const clientId = req.user.client_id;
      
      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }
      
      await OpenAIConfig.delete(clientId);
      
      res.json({
        success: true,
        message: 'Configuração OpenAI excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir configuração OpenAI:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Listar assistants disponíveis
  async listAssistants(req, res) {
    try {
      let { api_key } = req.body;
      const clientId = req.user.client_id;

      // Se não foi fornecida API Key, tentar usar a do banco
      if (!api_key && clientId) {
        const config = await OpenAIConfig.findByClientId(clientId);
        if (config && config.api_key) {
          api_key = config.api_key;
        }
      }

      if (!api_key) {
        return res.status(400).json({
          success: false,
          message: 'API Key é obrigatória'
        });
      }

      const result = await OpenAIService.listAssistants(api_key);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Erro ao listar assistants:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Listar modelos disponíveis
  async listModels(req, res) {
    try {
      let { api_key } = req.body;
      const clientId = req.user.client_id;

      // Se não foi fornecida API Key, tentar usar a do banco
      if (!api_key && clientId) {
        const config = await OpenAIConfig.findByClientId(clientId);
        if (config && config.api_key) {
          api_key = config.api_key;
        }
      }

      if (!api_key) {
        return res.status(400).json({
          success: false,
          message: 'API Key é obrigatória'
        });
      }

      const result = await OpenAIService.listModels(api_key);
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Erro ao listar modelos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Enviar mensagem para chat
  async sendMessage(req, res) {
    try {
      const clientId = req.user.client_id;
      const { message, threadId } = req.body;

      console.log('[DEBUG] Chat request:', { clientId, message, threadId, threadIdType: typeof threadId });

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: 'Cliente não associado ao usuário'
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Mensagem é obrigatória'
        });
      }

      // Buscar configuração OpenAI do cliente
      const config = await OpenAIConfig.findByClientId(clientId);
      
      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Configuração OpenAI não encontrada para este cliente'
        });
      }

      if (!config.is_active) {
        return res.status(400).json({
          success: false,
          message: 'Configuração OpenAI está inativa'
        });
      }

      let result;

      // Adicionar contexto de data/hora atual
      const dataHoraAtual = new Date().toISOString();
      // Não criar mensagem system, apenas passar como additional_instructions
      const userMessageObj = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: message
          }
        ]
      };
      const messages = [userMessageObj];
      const additionalInstructions = `A data e hora atual do sistema é: ${dataHoraAtual}. Use esta data como referência para cálculos de períodos relativos.`;

      // Usar assistant se configurado, senão usar completion
      if (config.assistant_id) {
        result = await OpenAIService.sendToAssistant(
          config.api_key,
          config.assistant_id,
          messages, // Apenas a mensagem do usuário
          threadId,
          additionalInstructions // Passa as instruções adicionais
        );
      } else {
        result = await OpenAIService.sendToCompletion(
          config.api_key,
          config.model || 'gpt-4',
          message,
          config.system_prompt
        );
      }

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = OpenAIController;

