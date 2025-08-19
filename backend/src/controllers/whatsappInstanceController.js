const WhatsAppInstanceModel = require('../models/whatsappInstanceModel');
const WhatsAppAuthService = require('../services/whatsapp_auth_service');
const axios = require('axios');

/**
 * Controller para gerenciar instâncias WhatsApp - Versão Atualizada
 * Suporta autenticação flexível por provedor
 */
const WhatsAppInstanceController = {
  /**
   * Listar instâncias do cliente
   */
  async list(req, res) {
    try {
      const { client_id } = req.user;
      
      const instances = await WhatsAppInstanceModel.findByClientId(client_id);
      
      res.json({
        success: true,
        data: instances,
        total: instances.length
      });
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter instância por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;
      
      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Verificar se a instância pertence ao cliente
      if (instance.client_id !== client_id) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      // Obter estatísticas da instância
      const stats = await WhatsAppInstanceModel.getStats(id);
      
      res.json({
        success: true,
        data: {
          ...instance,
          stats
        }
      });
    } catch (error) {
      console.error('Erro ao obter instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Criar nova instância - VERSÃO ATUALIZADA
   */
  async create(req, res) {
    try {
      const { client_id } = req.user;
      const {
        instance_name,
        instance_key,
        provider = 'pipego',
        provider_config,
        api_base_url,
        api_token,
        // Novos campos para autenticação flexível
        auth_email,
        auth_password,
        auth_user,
        auth_secret,
        webhook_url
      } = req.body;

      // Validações básicas
      if (!instance_name || !instance_key || !api_base_url) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: instance_name, instance_key, api_base_url'
        });
      }

      // Validações específicas por provedor
      const validationResult = this.validateProviderFields(provider, {
        auth_email,
        auth_password,
        api_token,
        auth_user,
        auth_secret
      });

      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message
        });
      }

      // Configuração padrão do provedor
      const defaultProviderConfig = this.getDefaultProviderConfig(provider);
      
      const instanceData = {
        client_id,
        instance_name,
        instance_key,
        provider,
        provider_config: provider_config || defaultProviderConfig,
        api_base_url,
        api_token,
        auth_email,
        auth_password,
        auth_user,
        auth_secret,
        webhook_url,
        auth_config: this.getAuthConfig(provider)
      };

      // Tentar autenticar antes de salvar (se possível)
      let authResult = null;
      try {
        authResult = await WhatsAppAuthService.authenticate(instanceData);
        
        if (authResult.success) {
          // Se autenticação foi bem-sucedida, atualizar token se necessário
          if (authResult.token && provider === 'pipego') {
            instanceData.api_token = authResult.token;
          }
        }
      } catch (authError) {
        console.warn('Aviso: Não foi possível autenticar durante a criação:', authError.message);
        // Não bloquear a criação, apenas registrar o aviso
      }

      const instance = await WhatsAppInstanceModel.create(instanceData);

      // Criar configurações HTTP padrão baseadas no provedor
      await this.createDefaultHttpConfigs(instance.id, provider);

      res.status(201).json({
        success: true,
        message: 'Instância criada com sucesso',
        data: {
          ...instance,
          auth_status: authResult ? 'authenticated' : 'pending'
        }
      });
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      
      if (error.message.includes('Duplicate entry')) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma instância com esta chave'
        });
      }

      if (error.message.includes('Data truncated')) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos. Verifique o provedor selecionado.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Validar campos obrigatórios por provedor
   */
  validateProviderFields(provider, fields) {
    switch (provider) {
      case 'pipego':
        if (!fields.auth_email || !fields.auth_password) {
          return {
            valid: false,
            message: 'PipeGo requer email e senha para autenticação'
          };
        }
        break;
      
      case 'z-api':
        if (!fields.api_token) {
          return {
            valid: false,
            message: 'Z-API requer token para autenticação'
          };
        }
        break;
      
      case 'custom':
        // Para custom, aceitar qualquer combinação
        break;
      
      default:
        return {
          valid: false,
          message: `Provedor não suportado: ${provider}`
        };
    }

    return { valid: true };
  },

  /**
   * Obter configuração padrão do provedor
   */
  getDefaultProviderConfig(provider) {
    const configs = {
      pipego: {
        provider: 'pipego',
        api_version: 'v1',
        features: ['text', 'media', 'audio', 'video'],
        auth_method: 'email_password'
      },
      'z-api': {
        provider: 'z-api',
        api_version: 'v1',
        features: ['text', 'media', 'audio', 'video'],
        auth_method: 'token_direct'
      },
      custom: {
        provider: 'custom',
        api_version: 'v1',
        features: ['text'],
        auth_method: 'custom'
      }
    };

    return configs[provider] || configs.custom;
  },

  /**
   * Obter configuração de autenticação por provedor
   */
  getAuthConfig(provider) {
    const configs = {
      pipego: {
        auth_endpoint: '/session',
        auth_method: 'POST',
        token_field: 'token',
        expires_field: 'expiresAt'
      },
      'z-api': {
        auth_method: 'token_in_url',
        instance_id_field: 'instance_id',
        token_field: 'token'
      },
      custom: {
        auth_method: 'custom'
      }
    };

    return configs[provider] || configs.custom;
  },

  /**
   * Obter QR Code - VERSÃO ATUALIZADA
   */
  async getQRCode(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;
      
      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Autenticar primeiro
      let authResult;
      try {
        authResult = await WhatsAppAuthService.authenticate(instance);
      } catch (authError) {
        return res.status(401).json({
          success: false,
          message: `Erro de autenticação: ${authError.message}`
        });
      }

      // Construir URL do QR Code baseada no provedor
      let qrUrl;
      let headers;

      switch (instance.provider) {
        case 'pipego':
          qrUrl = `${instance.api_base_url}/whatsapp/qr`;
          headers = WhatsAppAuthService.getAuthHeaders(instance, authResult.token);
          break;
        
        case 'z-api':
          qrUrl = WhatsAppAuthService.buildZAPIUrl(instance, 'qr');
          headers = WhatsAppAuthService.getAuthHeaders(instance, authResult.token);
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Provedor não suporta QR Code'
          });
      }

      // Fazer requisição para obter QR Code
      const response = await axios.get(qrUrl, {
        headers,
        timeout: 30000
      });

      // Atualizar status da instância
      await WhatsAppInstanceModel.update(id, {
        status: 'qr_pending',
        qr_code: response.data.qr || response.data.qrcode || response.data.base64,
        qr_expires_at: new Date(Date.now() + 60000) // 1 minuto
      });

      res.json({
        success: true,
        data: {
          qr_code: response.data.qr || response.data.qrcode || response.data.base64,
          expires_at: new Date(Date.now() + 60000)
        }
      });
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      
      if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          message: `Erro do provedor: ${error.response.data?.message || error.response.statusText}`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Verificar conexão - VERSÃO ATUALIZADA
   */
  async checkConnection(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;
      
      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Autenticar primeiro
      let authResult;
      try {
        authResult = await WhatsAppAuthService.authenticate(instance);
      } catch (authError) {
        await WhatsAppInstanceModel.update(id, {
          status: 'error',
          last_error: authError.message
        });
        
        return res.status(401).json({
          success: false,
          message: `Erro de autenticação: ${authError.message}`
        });
      }

      // Construir URL de status baseada no provedor
      let statusUrl;
      let headers;

      switch (instance.provider) {
        case 'pipego':
          statusUrl = `${instance.api_base_url}/whatsapp/info`;
          headers = WhatsAppAuthService.getAuthHeaders(instance, authResult.token);
          break;
        
        case 'z-api':
          statusUrl = WhatsAppAuthService.buildZAPIUrl(instance, 'status');
          headers = WhatsAppAuthService.getAuthHeaders(instance, authResult.token);
          break;
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Provedor não suporta verificação de status'
          });
      }

      // Fazer requisição para verificar status
      const response = await axios.get(statusUrl, {
        headers,
        timeout: 30000
      });

      // Determinar status baseado na resposta
      let status = 'inactive';
      let phoneNumber = null;

      if (response.data) {
        // Lógica para determinar status baseada na resposta do provedor
        if (response.data.connected || response.data.status === 'connected') {
          status = 'connected';
          phoneNumber = response.data.phone || response.data.phoneNumber || response.data.number;
        } else if (response.data.status === 'qr_pending' || response.data.qr) {
          status = 'qr_pending';
        }
      }

      // Atualizar status da instância
      await WhatsAppInstanceModel.update(id, {
        status,
        phone_number: phoneNumber,
        last_connected_at: status === 'connected' ? new Date() : instance.last_connected_at,
        last_error: null
      });

      res.json({
        success: true,
        data: {
          status,
          phone_number: phoneNumber,
          provider_data: response.data
        }
      });
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      
      // Atualizar status para erro
      await WhatsAppInstanceModel.update(id, {
        status: 'error',
        last_error: error.message
      });

      if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          message: `Erro do provedor: ${error.response.data?.message || error.response.statusText}`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Criar configurações HTTP padrão
   */
  async createDefaultHttpConfigs(instanceId, provider) {
    // Esta função será implementada baseada no provedor
    // Por enquanto, apenas um placeholder
    console.log(`Criando configurações HTTP para instância ${instanceId}, provedor ${provider}`);
  },

  /**
   * Atualizar instância
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;
      const updateData = req.body;

      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      await WhatsAppInstanceModel.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Instância atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Deletar instância
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;

      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      await WhatsAppInstanceModel.delete(id);
      
      res.json({
        success: true,
        message: 'Instância deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Configurar webhook
   */
  async configureWebhook(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;
      const { webhook_url } = req.body;

      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      await WhatsAppInstanceModel.update(id, { webhook_url });
      
      res.json({
        success: true,
        message: 'Webhook configurado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Obter configurações HTTP
   */
  async getHttpConfigs(req, res) {
    try {
      const { id } = req.params;
      const { client_id } = req.user;

      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          provider_config: instance.provider_config,
          auth_config: instance.auth_config
        }
      });
    } catch (error) {
      console.error('Erro ao obter configurações HTTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  /**
   * Atualizar configuração HTTP específica
   */
  async updateHttpConfig(req, res) {
    try {
      const { id, operation } = req.params;
      const { client_id } = req.user;
      const updateData = req.body;

      const instance = await WhatsAppInstanceModel.findById(id);
      
      if (!instance || instance.client_id !== client_id) {
        return res.status(404).json({
          success: false,
          message: 'Instância não encontrada'
        });
      }

      // Atualizar configuração específica baseada na operação
      let configUpdate = {};
      
      if (operation === 'provider') {
        configUpdate.provider_config = updateData;
      } else if (operation === 'auth') {
        configUpdate.auth_config = updateData;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Operação não suportada'
        });
      }

      await WhatsAppInstanceModel.update(id, configUpdate);
      
      res.json({
        success: true,
        message: 'Configuração HTTP atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração HTTP:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
};

module.exports = WhatsAppInstanceController;

