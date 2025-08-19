"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

interface DashboardCardConfig {
  id: number;
  client_id: number;
  card_position: number;
  card_title: string;
  sql_query: string;
  icon: string;
  is_active: boolean;
}

export default function DashboardConfigPage() {
  const [cardConfigs, setCardConfigs] = useState<DashboardCardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'openai'>('cards');
  const [clientInfo, setClientInfo] = useState<{id: number, name: string} | null>(null);

  // Estados para formulários
  const [cardForm, setCardForm] = useState({
    card_position: 1,
    card_title: '',
    sql_query: '',
    icon: '📊',
    is_active: true
  });

  const [openaiForm, setOpenaiForm] = useState({
    api_key: '',
    assistant_id: '',
    model: 'gpt-4',
    system_prompt: '',
    rag_enabled: false,
    embedding_model: 'text-embedding-ada-002',
    is_active: true
  });

  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [originalApiKey, setOriginalApiKey] = useState('');
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

  const [editingCard, setEditingCard] = useState<DashboardCardConfig | null>(null);
  const [availableAssistants, setAvailableAssistants] = useState<Array<{id: string, name?: string}>>([]);
  const [availableModels, setAvailableModels] = useState<Array<{id: string}>>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar informações do usuário para obter dados do cliente
      try {
        const userResponse = await fetch('/api/auth/me', { headers });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user && userData.user.client) {
            setClientInfo({
              id: userData.user.client.id,
              name: userData.user.client.name
            });
          }
        }
      } catch {
        console.log('Informações do cliente não disponíveis');
      }

      // Carregar configurações de cards
      const cardResponse = await fetch('/api/dashboard/cards', { headers });
      if (cardResponse.ok) {
        const cardData = await cardResponse.json();
        setCardConfigs(cardData.data || []);
      }

      // Carregar configuração OpenAI
      const openaiResponse = await fetch('/api/openai', { headers });
      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        console.log('[DEBUG Frontend] Dados OpenAI recebidos:', openaiData);
        
        if (openaiData.success && openaiData.data) {
          console.log('[DEBUG Frontend] Configurando formulário com:', openaiData.data);
          setHasExistingConfig(true);
          setOriginalApiKey(openaiData.data.api_key || '');
          setHasValidApiKey(openaiData.data.has_api_key || false);
          
          setOpenaiForm({
            api_key: openaiData.data.api_key || '',
            assistant_id: openaiData.data.assistant_id || '',
            model: openaiData.data.model || 'gpt-4',
            system_prompt: openaiData.data.system_prompt || '',
            rag_enabled: Boolean(openaiData.data.rag_enabled),
            embedding_model: openaiData.data.embedding_model || 'text-embedding-ada-002',
            is_active: Boolean(openaiData.data.is_active)
          });
        } else {
          console.log('[DEBUG Frontend] Nenhuma configuração OpenAI encontrada');
          setHasExistingConfig(false);
          setOriginalApiKey('');
          setHasValidApiKey(false);
        }
      } else {
        console.log('[DEBUG Frontend] Erro ao carregar configuração OpenAI:', openaiResponse.status);
      }

    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Buscar assistants disponíveis
  const loadAssistants = async () => {
    // Verificar se temos uma API Key válida (nova ou salva no banco)
    const hasNewApiKey = openaiForm.api_key && !openaiForm.api_key.includes('...');
    
    if (!hasNewApiKey && !hasValidApiKey) {
      setError('Informe a API Key completa primeiro ou salve uma nova configuração');
      return;
    }

    try {
      setLoadingAssistants(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/openai/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ api_key: hasNewApiKey ? openaiForm.api_key : null })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableAssistants(data.data || []);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar assistants');
        setAvailableAssistants([]);
      }
    } catch (error) {
      console.error('Erro ao carregar assistants:', error);
      setError('Erro ao carregar assistants');
      setAvailableAssistants([]);
    } finally {
      setLoadingAssistants(false);
    }
  };

  // Buscar modelos disponíveis
  const loadModels = async () => {
    // Verificar se temos uma API Key válida (nova ou salva no banco)
    const hasNewApiKey = openaiForm.api_key && !openaiForm.api_key.includes('...');
    
    if (!hasNewApiKey && !hasValidApiKey) {
      setError('Informe a API Key completa primeiro ou salve uma nova configuração');
      return;
    }

    try {
      setLoadingModels(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/openai/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ api_key: hasNewApiKey ? openaiForm.api_key : null })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.data || []);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar modelos');
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      setError('Erro ao carregar modelos');
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingCard ? `/api/dashboard/cards/${editingCard.id}` : '/api/dashboard/cards';
      const method = editingCard ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cardForm)
      });

      if (response.ok) {
        setEditingCard(null);
        resetCardForm();
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao salvar configuração');
      }
    } catch (err) {
      setError('Erro ao salvar configuração');
      console.error('Erro:', err);
    }
  };

  const handleOpenAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Preparar dados para envio
      const submitData = { ...openaiForm };
      
      // Se existe configuração e a API key não foi alterada (ainda está mascarada), limpar o campo
      if (hasExistingConfig && openaiForm.api_key === originalApiKey && originalApiKey.includes('...')) {
        submitData.api_key = '';
      }

      console.log('[DEBUG Frontend] Enviando dados:', submitData);

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        loadData();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao salvar configuração OpenAI');
      }
    } catch (err) {
      setError('Erro ao salvar configuração OpenAI');
      console.error('Erro:', err);
    }
  };

  const resetCardForm = () => {
    setCardForm({
      card_position: 1,
      card_title: '',
      sql_query: '',
      icon: '📊',
      is_active: true
    });
  };

  const editCard = (card: DashboardCardConfig) => {
    setEditingCard(card);
    setCardForm({
      card_position: card.card_position,
      card_title: card.card_title,
      sql_query: card.sql_query,
      icon: card.icon,
      is_active: card.is_active
    });
  };

  const deleteCard = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/dashboard/cards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadData();
      } else {
        setError('Erro ao excluir configuração');
      }
    } catch (err) {
      setError('Erro ao excluir configuração');
      console.error('Erro:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-light">CONFIGURAÇÕES DO DASHBOARD</h1>
          <p className="text-gray-400 mt-2">Configure os cards e chat do dashboard</p>
          {clientInfo && (
            <div className="mt-4 bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                <span className="font-medium">Cliente:</span> {clientInfo.name}
                <span className="text-blue-400 ml-2">(ID: {clientInfo.id})</span>
              </p>
              <p className="text-blue-400 text-xs mt-1">
                Todas as configurações abaixo são específicas para este cliente
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('cards')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cards'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Configuração de Cards
              </button>
              <button
                onClick={() => setActiveTab('openai')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'openai'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Configuração OpenAI
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            {/* Formulário de Cards */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCard ? 'Editar Card' : 'Novo Card'}
              </h2>
              
              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Posição do Card
                    </label>
                    <select
                      value={cardForm.card_position}
                      onChange={(e) => setCardForm({...cardForm, card_position: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      required
                    >
                      <option value={1}>Card 1</option>
                      <option value={2}>Card 2</option>
                      <option value={3}>Card 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Card
                    </label>
                    <input
                      type="text"
                      value={cardForm.card_title}
                      onChange={(e) => setCardForm({...cardForm, card_title: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Consulta SQL
                  </label>
                  <textarea
                    value={cardForm.sql_query}
                    onChange={(e) => setCardForm({...cardForm, sql_query: e.target.value})}
                    rows={6}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
                    placeholder="SELECT 'Título' as title, 1000 as value, 15.5 as percentage"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A consulta deve retornar: title (título), value (valor), percentage (percentual)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ícone
                    </label>
                    <input
                      type="text"
                      value={cardForm.icon}
                      onChange={(e) => setCardForm({...cardForm, icon: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="📊"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={cardForm.is_active}
                        onChange={(e) => setCardForm({...cardForm, is_active: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-300">Ativo</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    {editingCard ? 'Atualizar' : 'Criar'} Card
                  </button>
                  
                  {editingCard && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCard(null);
                        resetCardForm();
                      }}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de Cards */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Cards Configurados</h2>
              
              {cardConfigs.length === 0 ? (
                <p className="text-gray-400">Nenhum card configurado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {cardConfigs.map((card) => (
                    <div key={card.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {card.icon} Card {card.card_position}: {card.card_title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Status: {card.is_active ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editCard(card)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'openai' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Configuração OpenAI</h2>
            
            <form onSubmit={handleOpenAISubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key OpenAI
                  {hasExistingConfig && originalApiKey.includes('...') && (
                    <span className="ml-2 text-xs text-green-400">(Configuração existente)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={openaiForm.api_key}
                  onChange={(e) => setOpenaiForm({...openaiForm, api_key: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder={hasExistingConfig ? "Deixe em branco para manter a atual" : "sk-..."}
                  required={!hasExistingConfig}
                />
                {hasExistingConfig && originalApiKey.includes('...') && (
                  <p className="text-xs text-gray-400 mt-1">
                    API Key atual: {originalApiKey} - Preencha apenas se quiser alterar
                  </p>
                )}
              </div>

              {/* Assistants */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Assistant ID (opcional)
                  </label>
                  <button
                    type="button"
                    onClick={loadAssistants}
                    disabled={loadingAssistants || !openaiForm.api_key}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingAssistants ? 'Carregando...' : 'Buscar Assistants'}
                  </button>
                </div>
                
                {availableAssistants.length > 0 ? (
                  <select
                    value={openaiForm.assistant_id}
                    onChange={(e) => setOpenaiForm({...openaiForm, assistant_id: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-2"
                  >
                    <option value="">Selecione um assistant</option>
                    {availableAssistants.map((assistant) => (
                      <option key={assistant.id} value={assistant.id}>
                        {assistant.name || assistant.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={openaiForm.assistant_id}
                    onChange={(e) => setOpenaiForm({...openaiForm, assistant_id: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="asst_..."
                  />
                )}
                <p className="text-xs text-gray-400">
                  Se não informado, usará completion com prompt
                </p>
              </div>

              {/* Modelos */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Modelo (para completion)
                  </label>
                  <button
                    type="button"
                    onClick={loadModels}
                    disabled={loadingModels || !openaiForm.api_key}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingModels ? 'Carregando...' : 'Buscar Modelos'}
                  </button>
                </div>
                
                {availableModels.length > 0 ? (
                  <select
                    value={openaiForm.model}
                    onChange={(e) => setOpenaiForm({...openaiForm, model: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={openaiForm.model}
                    onChange={(e) => setOpenaiForm({...openaiForm, model: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  System Prompt (para completion)
                </label>
                <textarea
                  value={openaiForm.system_prompt}
                  onChange={(e) => setOpenaiForm({...openaiForm, system_prompt: e.target.value})}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Você é um assistente especializado em CRM..."
                />
              </div>

              {/* RAG Configuration */}
              <div>
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={openaiForm.rag_enabled}
                    onChange={(e) => setOpenaiForm({...openaiForm, rag_enabled: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Habilitar RAG (Retrieval Augmented Generation)</span>
                </label>

                {openaiForm.rag_enabled && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Modelo de Embedding
                      </label>
                      <select
                        value={openaiForm.embedding_model}
                        onChange={(e) => setOpenaiForm({...openaiForm, embedding_model: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                        <option value="text-embedding-3-small">text-embedding-3-small</option>
                        <option value="text-embedding-3-large">text-embedding-3-large</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={openaiForm.is_active}
                    onChange={(e) => setOpenaiForm({...openaiForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Ativo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
