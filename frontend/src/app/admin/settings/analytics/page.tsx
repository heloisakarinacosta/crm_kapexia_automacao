'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

interface ChartGroup {
  id: number;
  group_name: string;
  group_description: string;
  group_order: number;
  group_color: string;
  layout_model: 'model_10_cards' | 'model_8_cards';
  is_active: boolean;
  is_default: boolean;
  total_charts: number;
  active_charts: number;
  charts_with_drilldown: number;
  created_at: string;
  updated_at: string;
}

interface LayoutModel {
  id: string;
  name: string;
  description: string;
  grid_config: {
    total_positions: number;
    layout: string;
    breakpoints: Record<string, string>;
  };
  preview_image: string;
}

export default function AnalyticsConfigPage() {
  const [groups, setGroups] = useState<ChartGroup[]>([]);
  const [models, setModels] = useState<LayoutModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChartGroup | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    group_name: '',
    group_description: '',
    group_color: '#10B981',
    layout_model: 'model_10_cards' as 'model_10_cards' | 'model_8_cards'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar grupos e modelos em paralelo
      const [groupsResponse, modelsResponse] = await Promise.all([
        fetch('/api/analytics/groups', { headers }),
        fetch('/api/analytics/models', { headers })
      ]);

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.data || []);
      } else {
        throw new Error('Erro ao carregar grupos');
      }

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.data || []);
      } else {
        throw new Error('Erro ao carregar modelos');
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }

    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const handleCreateGroup = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadData();
        setShowCreateModal(false);
        resetForm();
        showMessage('Grupo criado com sucesso!');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Erro ao criar grupo', true);
      }

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      showMessage('Erro ao criar grupo', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup) return;

    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadData();
        setShowEditModal(false);
        setSelectedGroup(null);
        resetForm();
        showMessage('Grupo atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Erro ao atualizar grupo', true);
      }

    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      showMessage('Erro ao atualizar grupo', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateGroup = async () => {
    if (!selectedGroup) return;

    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/groups/${selectedGroup.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadData();
        setShowDuplicateModal(false);
        setSelectedGroup(null);
        resetForm();
        showMessage('Grupo duplicado com sucesso!');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Erro ao duplicar grupo', true);
      }

    } catch (error) {
      console.error('Erro ao duplicar grupo:', error);
      showMessage('Erro ao duplicar grupo', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (group: ChartGroup) => {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${group.group_name}"?\n\nOs painéis serão movidos para o grupo padrão.`)) {
      return;
    }

    try {
      setSaving(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics/groups/${group.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadData();
        showMessage('Grupo excluído com sucesso!');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Erro ao excluir grupo', true);
      }

    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      showMessage('Erro ao excluir grupo', true);
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (group: ChartGroup) => {
    setSelectedGroup(group);
    setFormData({
      group_name: group.group_name,
      group_description: group.group_description || '',
      group_color: group.group_color,
      layout_model: group.layout_model
    });
    setShowEditModal(true);
  };

  const openDuplicateModal = (group: ChartGroup) => {
    setSelectedGroup(group);
    setFormData({
      group_name: `${group.group_name} - Cópia`,
      group_description: `Cópia de ${group.group_name}`,
      group_color: group.group_color,
      layout_model: group.layout_model
    });
    setShowDuplicateModal(true);
  };

  const resetForm = () => {
    setFormData({
      group_name: '',
      group_description: '',
      group_color: '#10B981',
      layout_model: 'model_10_cards'
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDuplicateModal(false);
    setSelectedGroup(null);
    resetForm();
  };

  const getModelInfo = (modelId: string) => {
    return models.find(m => m.id === modelId);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando configurações...</span>
          </div>
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
              <h1 className="text-3xl font-montserrat font-light">CONFIGURAÇÃO DE ANÁLISES</h1>
              <p className="text-gray-600 mt-1">Gerencie grupos de painéis e modelos de layout</p>
            </div>
            
            <button
              onClick={openCreateModal}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Grupo</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Grupos de Painéis</h2>
            <p className="text-sm text-gray-600">Organize seus painéis em grupos com diferentes modelos de layout</p>
          </div>

          <div className="divide-y divide-gray-200">
            {groups.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum grupo encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro grupo de painéis.</p>
              </div>
            ) : (
              groups.map((group) => {
                const modelInfo = getModelInfo(group.layout_model);
                return (
                  <div key={group.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Color indicator */}
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: group.group_color }}
                        ></div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{group.group_name}</h3>
                            {group.is_default && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Padrão
                              </span>
                            )}
                          </div>
                          
                          {group.group_description && (
                            <p className="text-sm text-gray-600 mt-1">{group.group_description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Modelo: {modelInfo?.name || group.layout_model}</span>
                            <span>•</span>
                            <span>{group.active_charts} de {group.total_charts} painéis ativos</span>
                            {group.charts_with_drilldown > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">{group.charts_with_drilldown} com drill-down</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.location.href = '/admin/settings/chart-configs'}
                          disabled={saving}
                          className="text-green-400 hover:text-green-600 disabled:text-gray-300"
                          title="Configurar painéis"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => openEditModal(group)}
                          disabled={saving}
                          className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                          title="Editar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => openDuplicateModal(group)}
                          disabled={saving}
                          className="text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                          title="Duplicar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        {!group.is_default && (
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            disabled={saving}
                            className="text-red-400 hover:text-red-600 disabled:text-gray-300"
                            title="Excluir grupo"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Models Info */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Modelos Disponíveis</h2>
            <p className="text-sm text-gray-600">Escolha o modelo de layout para seus grupos de painéis</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    <div>Posições: {model.grid_config.total_positions}</div>
                    <div>Layout: {model.grid_config.layout}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Grupo</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo</label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Qualificação, Prospecção..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                    <textarea
                      value={formData.group_description}
                      onChange={(e) => setFormData({...formData, group_description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descrição do grupo..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Layout</label>
                    <select
                      value={formData.layout_model}
                      onChange={(e) => setFormData({...formData, layout_model: e.target.value as 'model_10_cards' | 'model_8_cards'})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.grid_config.total_positions} painéis)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor da Aba</label>
                    <input
                      type="color"
                      value={formData.group_color}
                      onChange={(e) => setFormData({...formData, group_color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeModals}
                    disabled={saving}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={saving || !formData.group_name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Criando...' : 'Criar Grupo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedGroup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Grupo</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo</label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.group_description}
                      onChange={(e) => setFormData({...formData, group_description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Layout</label>
                    <select
                      value={formData.layout_model}
                      onChange={(e) => setFormData({...formData, layout_model: e.target.value as 'model_10_cards' | 'model_8_cards'})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.grid_config.total_positions} painéis)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor da Aba</label>
                    <input
                      type="color"
                      value={formData.group_color}
                      onChange={(e) => setFormData({...formData, group_color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeModals}
                    disabled={saving}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditGroup}
                    disabled={saving || !formData.group_name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Modal */}
        {showDuplicateModal && selectedGroup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Duplicar Grupo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Todos os painéis e configurações de drill-down serão copiados para o novo grupo.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Novo Grupo</label>
                    <input
                      type="text"
                      value={formData.group_name}
                      onChange={(e) => setFormData({...formData, group_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.group_description}
                      onChange={(e) => setFormData({...formData, group_description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Layout</label>
                    <select
                      value={formData.layout_model}
                      onChange={(e) => setFormData({...formData, layout_model: e.target.value as 'model_10_cards' | 'model_8_cards'})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.grid_config.total_positions} painéis)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor da Aba</label>
                    <input
                      type="color"
                      value={formData.group_color}
                      onChange={(e) => setFormData({...formData, group_color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeModals}
                    disabled={saving}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDuplicateGroup}
                    disabled={saving || !formData.group_name.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Duplicando...' : 'Duplicar Grupo'}
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

