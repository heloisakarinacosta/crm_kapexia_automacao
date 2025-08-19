"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

interface WhatsAppInstance {
  id: number;
  name: string;
  instance_key: string;
  provider: string;
  status: 'active' | 'inactive' | 'connecting' | 'error';
  phone_number?: string;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export default function WhatsAppSettingsPage() {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    instance_key: '',
    provider: 'pipego',
    webhook_url: '',
    api_base_url: '',
    // Campos condicionais por provedor
    api_token: '',        // Z-API, Custom
    auth_email: '',       // PipeGo
    auth_password: '',    // PipeGo
    auth_user: '',        // Custom
    auth_secret: ''       // Custom
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/whatsapp/instances', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInstances(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      setError('Erro ao carregar instâncias');
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Preparar dados baseados no provedor selecionado
      const instanceData = {
        instance_name: formData.name,
        instance_key: formData.instance_key,
        provider: formData.provider,
        webhook_url: formData.webhook_url,
        api_base_url: formData.api_base_url,
        // Campos condicionais
        ...(formData.provider === 'pipego' && {
          auth_email: formData.auth_email,
          auth_password: formData.auth_password
        }),
        ...(formData.provider === 'z-api' && {
          api_token: formData.api_token
        }),
        ...(formData.provider === 'custom' && {
          api_token: formData.api_token,
          auth_user: formData.auth_user,
          auth_secret: formData.auth_secret
        })
      };

      const response = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instanceData)
      });

      if (response.ok) {
        await loadInstances();
        setShowCreateModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      setError('Erro ao criar instância');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      instance_key: '',
      provider: 'pipego',
      webhook_url: '',
      api_base_url: '',
      api_token: '',
      auth_email: '',
      auth_password: '',
      auth_user: '',
      auth_secret: ''
    });
  };

  const getQRCode = async (instance: WhatsAppInstance) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/instances/${instance.id}/qr`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQRCode(data.data.qr_code);
        setSelectedInstance(instance);
        setShowQRModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao obter QR Code');
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      setError('Erro ao obter QR Code');
    }
  };

  const checkConnection = async (instance: WhatsAppInstance) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/instances/${instance.id}/connection`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadInstances(); // Recarregar para atualizar status
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao verificar conexão');
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setError('Erro ao verificar conexão');
    }
  };

  const deleteInstance = async (instance: WhatsAppInstance) => {
    if (!confirm(`Tem certeza que deseja excluir a instância "${instance.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/instances/${instance.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadInstances();
      } else {
        setError('Erro ao excluir instância');
      }
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      setError('Erro ao excluir instância');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
      case 'qr_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      case 'qr_pending':
        return 'Aguardando QR';
      case 'inactive':
        return 'Desconectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'pipego':
        return 'PipeGo';
      case 'z-api':
        return 'Z-API';
      case 'custom':
        return 'Personalizado';
      default:
        return provider;
    }
  };

  const getProviderAuthFields = () => {
    switch (formData.provider) {
      case 'pipego':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                value={formData.auth_email}
                onChange={(e) => setFormData({ ...formData, auth_email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Email da sua conta PipeGo</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha *</label>
              <input
                type="password"
                value={formData.auth_password}
                onChange={(e) => setFormData({ ...formData, auth_password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sua senha"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Senha da sua conta PipeGo</p>
            </div>
          </>
        );
      
      case 'z-api':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Token da API *</label>
            <input
              type="text"
              value={formData.api_token}
              onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Token da Z-API"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Token obtido no painel da Z-API</p>
          </div>
        );
      
      case 'custom':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Token/API Key</label>
              <input
                type="text"
                value={formData.api_token}
                onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Token de acesso"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuário</label>
              <input
                type="text"
                value={formData.auth_user}
                onChange={(e) => setFormData({ ...formData, auth_user: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome de usuário"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Chave Secreta</label>
              <input
                type="password"
                value={formData.auth_secret}
                onChange={(e) => setFormData({ ...formData, auth_secret: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Chave secreta"
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const getProviderDefaultUrl = (provider: string) => {
    switch (provider) {
      case 'pipego':
        return 'https://api-backend.pipego.me';
      case 'z-api':
        return 'https://api.z-api.io';
      default:
        return '';
    }
  };

  // Atualizar URL base quando o provedor mudar
  useEffect(() => {
    const defaultUrl = getProviderDefaultUrl(formData.provider);
    if (defaultUrl && !formData.api_base_url) {
      setFormData(prev => ({ ...prev, api_base_url: defaultUrl }));
    }
  }, [formData.provider, formData.api_base_url]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando configurações...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-montserrat font-light">CONFIGURAÇÕES WHATSAPP</h1>
              <p className="text-gray-600 mt-1">Gerencie suas instâncias WhatsApp</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Instância
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instances List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {instances.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma instância configurada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira instância WhatsApp.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Instância
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {instances.map((instance) => (
                <li key={instance.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">📱</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{instance.name}</p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                              {getStatusText(instance.status)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{getProviderDisplayName(instance.provider)}</span>
                            <span className="mx-2">•</span>
                            <span>{instance.instance_key}</span>
                            {instance.phone_number && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{instance.phone_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(instance.status === 'inactive' || instance.status === 'error') && (
                          <button
                            onClick={() => getQRCode(instance)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            📱 Conectar
                          </button>
                        )}
                        
                        <button
                          onClick={() => checkConnection(instance)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          🔄 Verificar
                        </button>
                        
                        <button
                          onClick={() => deleteInstance(instance)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create Instance Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Instância WhatsApp</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Atendimento Principal"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chave da Instância *</label>
                    <input
                      type="text"
                      value={formData.instance_key}
                      onChange={(e) => setFormData({ ...formData, instance_key: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: instance_001"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Identificador único para esta instância</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provedor *</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pipego">PipeGo</option>
                      <option value="z-api">Z-API</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL Base da API *</label>
                    <input
                      type="url"
                      value={formData.api_base_url}
                      onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://api.exemplo.com"
                      required
                    />
                  </div>
                  
                  {/* Campos condicionais por provedor */}
                  {getProviderAuthFields()}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL do Webhook (opcional)</label>
                    <input
                      type="url"
                      value={formData.webhook_url}
                      onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Será gerado automaticamente se não informado</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createInstance}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Criar Instância
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedInstance && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Conectar {selectedInstance.name}
                </h3>
                
                {qrCode ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Image src={qrCode} alt="QR Code" width={256} height={256} className="w-64 h-64" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Escaneie este QR Code com seu WhatsApp para conectar a instância.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Gerando QR Code...</span>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setQRCode(null);
                      setSelectedInstance(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

