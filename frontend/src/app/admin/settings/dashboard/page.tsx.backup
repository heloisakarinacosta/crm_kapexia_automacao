"use client";

import React, { useState, useEffect } from 'react';
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

  const [editingCard, setEditingCard] = useState<DashboardCardConfig | null>(null);
  const [availableAssistants, setAvailableAssistants] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        if (openaiData.data) {
          setOpenaiForm({
            api_key: openaiData.data.api_key || '',
            assistant_id: openaiData.data.assistant_id || '',
            model: openaiData.data.model || 'gpt-4',
            system_prompt: openaiData.data.system_prompt || '',
            rag_enabled: openaiData.data.rag_enabled || false,
            embedding_model: openaiData.data.embedding_model || 'text-embedding-ada-002',
            is_active: openaiData.data.is_active !== false
          });
        }
      }

    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar assistants disponíveis
  const loadAssistants = async () => {
    if (!openaiForm.api_key) {
      setError('Informe a API Key primeiro');
      return;
    }

    try {
      setLoadingAssistants(true);
      const response = await fetch('/api/openai/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: openaiForm.api_key })
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
    if (!openaiForm.api_key) {
      setError('Informe a API Key primeiro');
      return;
    }

    try {
      setLoadingModels(true);
      const response = await fetch('/api/openai/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: openaiForm.api_key })
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

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(openaiForm)
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
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Configuração de Cards
          </button>
          <button
            onClick={() => setActiveTab('openai')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'openai'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Configuração OpenAI
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCard ? 'Editar Card' : 'Novo Card'}
              </h2>
              
              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Posição do Card
                  </label>
                  <select
                    value={cardForm.card_position}
                    onChange={(e) => setCardForm(prev => ({ ...prev, card_position: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setCardForm(prev => ({ ...prev, card_title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Novos Leads (Semana)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ícone
                  </label>
                  <input
                    type="text"
                    value={cardForm.icon}
                    onChange={(e) => setCardForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="📊"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Query SQL
                  </label>
                  <textarea
                    value={cardForm.sql_query}
                    onChange={(e) => setCardForm(prev => ({ ...prev, sql_query: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="SELECT 'Novos Leads' as title, 42 as value, '12%' as percentual"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A query deve retornar: title, value, percentual
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="card_active"
                    checked={cardForm.is_active}
                    onChange={(e) => setCardForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="card_active" className="text-sm text-gray-300">
                    Ativo
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingCard ? 'Atualizar' : 'Criar'}
                  </button>
                  {editingCard && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCard(null);
                        resetCardForm();
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
              
              <div className="space-y-3">
                {cardConfigs.map(card => (
                  <div key={card.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">
                          {card.icon} {card.card_title}
                        </h3>
                        <p className="text-sm text-gray-400">Posição: {card.card_position}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {card.sql_query.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editCard(card)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cardConfigs.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum card configurado
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'openai' && (
          <div className="max-w-2xl">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configuração OpenAI</h2>
              
              <form onSubmit={handleOpenAISubmit} className="space-y-4">
                            <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={openaiForm.api_key}
                        onChange={(e) => setOpenaiForm({...openaiForm, api_key: e.target.value})}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="sk-..."
                        required
                      />
                      <button
                        type="button"
                        onClick={loadAssistants}
                        disabled={!openaiForm.api_key || loadingAssistants}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loadingAssistants ? 'Carregando...' : 'Buscar Assistants'}
                      </button>
                      <button
                        type="button"
                        onClick={loadModels}
                        disabled={!openaiForm.api_key || loadingModels}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loadingModels ? 'Carregando...' : 'Buscar Modelos'}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assistant ID (Opcional)
                    </label>
                    {availableAssistants.length > 0 ? (
                      <select
                        value={openaiForm.assistant_id}
                        onChange={(e) => setOpenaiForm({...openaiForm, assistant_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Selecione um assistant ou deixe vazio para usar completion</option>
                        {availableAssistants.map((assistant) => (
                          <option key={assistant.id} value={assistant.id}>
                            {assistant.name} ({assistant.id})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={openaiForm.assistant_id}
                        onChange={(e) => setOpenaiForm({...openaiForm, assistant_id: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="asst_..."
                      />
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      Se não informado, usará completion com RAG
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modelo
                    </label>
                    {availableModels.length > 0 ? (
                      <select
                        value={openaiForm.model}
                        onChange={(e) => setOpenaiForm({...openaiForm, model: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        {availableModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={openaiForm.model}
                        onChange={(e) => setOpenaiForm({...openaiForm, model: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prompt do Sistema (Para Completion)
                    </label>
                    <textarea
                      value={openaiForm.system_prompt}
                      onChange={(e) => setOpenaiForm({...openaiForm, system_prompt: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
                      placeholder="Você é um assistente especializado em CRM..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={openaiForm.rag_enabled}
                        onChange={(e) => setOpenaiForm({...openaiForm, rag_enabled: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-300">Habilitar RAG/Embeddings</span>
                    </label>
                  </div>

                  {openaiForm.rag_enabled && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Modelo de Embedding
                      </label>
                      <select
                        value={openaiForm.embedding_model}
                        onChange={(e) => setOpenaiForm({...openaiForm, embedding_model: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                        <option value="text-embedding-3-small">text-embedding-3-small</option>
                        <option value="text-embedding-3-large">text-embedding-3-large</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
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
        </div>
      </DashboardLayout>
    );
  }

