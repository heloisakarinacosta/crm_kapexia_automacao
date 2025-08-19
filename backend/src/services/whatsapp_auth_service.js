/**
 * Serviço de Autenticação para Provedores WhatsApp
 * Suporta diferentes métodos de autenticação por provedor
 */

const axios = require('axios');

class WhatsAppAuthService {
  /**
   * Autenticar com provedor baseado na configuração da instância
   * @param {Object} instance - Dados da instância
   * @returns {Promise<Object>} - Token de autenticação e dados adicionais
   */
  static async authenticate(instance) {
    switch (instance.provider) {
      case 'pipego':
        return await this.authenticatePipeGo(instance);
      case 'z-api':
        return await this.authenticateZAPI(instance);
      case 'custom':
        return await this.authenticateCustom(instance);
      default:
        throw new Error(`Provedor não suportado: ${instance.provider}`);
    }
  }

  /**
   * Autenticação PipeGo (email/password → token)
   */
  static async authenticatePipeGo(instance) {
    try {
      if (!instance.auth_email || !instance.auth_password) {
        throw new Error('Email e senha são obrigatórios para PipeGo');
      }

      const authUrl = `${instance.api_base_url}/session`;
      
      const response = await axios.post(authUrl, {
        email: instance.auth_email,
        password: instance.auth_password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.token) {
        return {
          success: true,
          token: response.data.token,
          expires_at: response.data.expiresAt || null,
          user_info: response.data.user || null,
          provider_data: response.data
        };
      } else {
        throw new Error('Resposta inválida do PipeGo');
      }
    } catch (error) {
      console.error('Erro na autenticação PipeGo:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        if (status === 401) {
          throw new Error('Credenciais inválidas para PipeGo');
        } else if (status === 400) {
          throw new Error(`Dados inválidos: ${message}`);
        } else {
          throw new Error(`Erro do PipeGo (${status}): ${message}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar ao PipeGo');
      } else {
        throw new Error(`Erro de autenticação PipeGo: ${error.message}`);
      }
    }
  }

  /**
   * Autenticação Z-API (token direto)
   */
  static async authenticateZAPI(instance) {
    try {
      if (!instance.api_token) {
        throw new Error('Token é obrigatório para Z-API');
      }

      // Para Z-API, o token é usado diretamente nas URLs
      // Vamos validar fazendo uma requisição de status
      const statusUrl = this.buildZAPIUrl(instance, 'status');
      
      const response = await axios.get(statusUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // Se chegou até aqui, o token é válido
      return {
        success: true,
        token: instance.api_token,
        expires_at: null, // Z-API tokens não expiram automaticamente
        user_info: null,
        provider_data: response.data,
        instance_id: this.extractInstanceIdFromUrl(instance.api_base_url)
      };
    } catch (error) {
      console.error('Erro na autenticação Z-API:', error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        
        if (status === 401 || status === 403) {
          throw new Error('Token inválido para Z-API');
        } else {
          throw new Error(`Erro da Z-API (${status}): ${message}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Não foi possível conectar à Z-API');
      } else {
        throw new Error(`Erro de autenticação Z-API: ${error.message}`);
      }
    }
  }

  /**
   * Autenticação personalizada
   */
  static async authenticateCustom(instance) {
    try {
      const authConfig = instance.auth_config || {};
      
      if (authConfig.auth_method === 'token_direct') {
        // Similar à Z-API
        return {
          success: true,
          token: instance.api_token,
          expires_at: null,
          user_info: null,
          provider_data: null
        };
      } else if (authConfig.auth_method === 'basic_auth') {
        // Autenticação básica
        return {
          success: true,
          token: Buffer.from(`${instance.auth_user}:${instance.auth_secret}`).toString('base64'),
          expires_at: null,
          user_info: null,
          provider_data: null
        };
      } else {
        throw new Error('Método de autenticação personalizado não configurado');
      }
    } catch (error) {
      throw new Error(`Erro de autenticação personalizada: ${error.message}`);
    }
  }

  /**
   * Construir URL para Z-API baseada no padrão
   */
  static buildZAPIUrl(instance, endpoint) {
    const instanceId = this.extractInstanceIdFromUrl(instance.api_base_url);
    const token = instance.api_token;
    
    const baseUrl = instance.api_base_url.split('/instances/')[0];
    
    switch (endpoint) {
      case 'status':
        return `${baseUrl}/instances/${instanceId}/token/${token}/status`;
      case 'qr':
        return `${baseUrl}/instances/${instanceId}/token/${token}/qr-code`;
      case 'send-text':
        return `${baseUrl}/instances/${instanceId}/token/${token}/send-text`;
      case 'send-media':
        return `${baseUrl}/instances/${instanceId}/token/${token}/send-file-base64`;
      default:
        return `${baseUrl}/instances/${instanceId}/token/${token}/${endpoint}`;
    }
  }

  /**
   * Extrair instance ID da URL da Z-API
   */
  static extractInstanceIdFromUrl(url) {
    const match = url.match(/\/instances\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Verificar se o token ainda é válido
   */
  static async validateToken(instance, token) {
    try {
      switch (instance.provider) {
        case 'pipego':
          return await this.validatePipeGoToken(instance, token);
        case 'z-api':
          return await this.validateZAPIToken(instance, token);
        case 'custom':
          return await this.validateCustomToken(instance, token);
        default:
          return false;
      }
    } catch (error) {
      console.error('Erro na validação do token:', error);
      return false;
    }
  }

  /**
   * Validar token PipeGo
   */
  static async validatePipeGoToken(instance, token) {
    try {
      const response = await axios.get(`${instance.api_base_url}/whatsapp/info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validar token Z-API
   */
  static async validateZAPIToken(instance, token) {
    try {
      const statusUrl = this.buildZAPIUrl({ ...instance, api_token: token }, 'status');
      
      const response = await axios.get(statusUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validar token personalizado
   */
  static async validateCustomToken(instance, token) {
    // Implementação básica - pode ser customizada conforme necessário
    return token && token.length > 0;
  }

  /**
   * Obter headers de autenticação para requisições
   */
  static getAuthHeaders(instance, token) {
    switch (instance.provider) {
      case 'pipego':
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      case 'z-api':
        return {
          'Content-Type': 'application/json'
        };
      case 'custom':
        const authConfig = instance.auth_config || {};
        if (authConfig.auth_method === 'basic_auth') {
          return {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          };
        } else {
          return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
        }
      default:
        return {
          'Content-Type': 'application/json'
        };
    }
  }
}

module.exports = WhatsAppAuthService;

