"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

interface ChartConfig {
  id: number;
  client_id: number;
  chart_name: string;
  chart_position: number;
  chart_type: string;
  database_config_id: number;
  sql_query: string;
  x_axis_field: string;
  y_axis_field: string;
  chart_title: string;
  chart_subtitle?: string;
  chart_description?: string;
  is_active: boolean;
  group_id?: number;
  layout_model: 'model_10_cards' | 'model_8_cards';
  created_at: string;
  updated_at: string;
  group_name?: string;
  has_drilldown?: boolean;
}

interface DatabaseConfig {
  id: number;
  client_id: number;
  config_name: string;
  db_type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  is_active: boolean;
}

interface Client {
  id: number;
  name: string;
}

interface ChartGroup {
  id: number;
  group_name: string;
  layout_model: 'model_10_cards' | 'model_8_cards';
  is_drilldown: boolean;
  total_charts: number;
}

interface DrillDownConfig {
  id: number;
  chart_position: number;
  group_id?: number;
  chart_name?: string;
  chart_type?: string;
  chart_title?: string;
  chart_subtitle?: string;
  x_axis_field?: string;
  y_axis_field?: string;
  database_config_id?: number;
  detail_sql_query: string;
  detail_sql_params: string;
  detail_grid_title: string;
  detail_grid_columns: string;
  detail_link_column?: string;
  detail_link_template?: string;
  detail_link_text_column?: string;
  is_active: boolean;
  modal_size: 'small' | 'medium' | 'large' | 'fullscreen';
  max_results: number;
  query_timeout_seconds: number;
}

export default function ChartConfigsPage() {
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfig[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chartGroups, setChartGroups] = useState<ChartGroup[]>([]);
  const [drillDownConfigs, setDrillDownConfigs] = useState<DrillDownConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDrillDownForm, setShowDrillDownForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ChartConfig | null>(null);
  const [editingDrillDown, setEditingDrillDown] = useState<DrillDownConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    chart_name: '',
    chart_position: 1,
    chart_type: 'bar',
    database_config_id: '',
    sql_query: '',
    x_axis_field: '',
    y_axis_field: '',
    chart_title: '',
    chart_subtitle: '',
    chart_description: '',
    group_id: '',
    layout_model: 'model_10_cards' as 'model_10_cards' | 'model_8_cards',
    is_active: true
  });

  const [drillDownFormData, setDrillDownFormData] = useState({
    chart_position: 1,
    group_id: '',
    chart_name: '',
    chart_type: 'bar',
    chart_title: '',
    chart_subtitle: '',
    x_axis_field: '',
    y_axis_field: '',
    database_config_id: '',
    detail_sql_query: '',
    detail_sql_params: '',
    detail_grid_title: '',
    detail_grid_columns: '',
    detail_link_column: '',
    detail_link_template: '',
    detail_link_text_column: '',
    modal_size: 'large' as 'small' | 'medium' | 'large' | 'fullscreen',
    max_results: 1000,
    query_timeout_seconds: 30,
    is_active: true
  });

  const chartTypes = [
    { value: 'bar', label: 'Gráfico de Barras' },
    { value: 'column', label: 'Gráfico de Colunas' },
    { value: 'line', label: 'Gráfico de Linhas' },
    { value: 'pie', label: 'Gráfico de Pizza' },
    { value: 'donut', label: 'Gráfico de Rosca' },
    { value: 'stacked_bar', label: 'Gráfico de Barras Empilhadas' }
  ];

  const modalSizes = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
    { value: 'fullscreen', label: 'Tela Cheia' }
  ];

  const layoutModels = [
    { value: 'model_10_cards', label: 'Modelo 10 Cards' },
    { value: 'model_8_cards', label: 'Modelo 8 Cards' }
  ];

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

      // Carregar configurações de gráficos
      const chartResponse = await fetch('/api/chart-configs', { headers });
      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        setChartConfigs(chartData.data || []);
      }

      // Carregar configurações de banco de dados
      const dbResponse = await fetch('/api/database-configs', { headers });
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDatabaseConfigs(dbData.data || []);
      }

      // Carregar clientes
      const clientResponse = await fetch('/api/clients', { headers });
      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        setClients(clientData.data || []);
      }

      // Carregar grupos
      const groupResponse = await fetch('/api/analytics/groups', { headers });
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        setChartGroups(groupData.data || []);
      }

      // Carregar configurações de drill-down
      const drillDownResponse = await fetch('/api/chart-drilldown', { headers });
      if (drillDownResponse.ok) {
        const drillDownData = await drillDownResponse.json();
        setDrillDownConfigs(drillDownData.data || []);
      }

    } catch (err) {
      setError('Erro ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDrillDownInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setDrillDownFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chart_name.trim() || !formData.sql_query.trim()) {
      setError('Nome do gráfico e consulta SQL são obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const url = editingConfig ? `/api/chart-configs/${editingConfig.id}` : '/api/chart-configs';
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingConfig(null);
        resetForm();
        loadData();
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao salvar configuração');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao salvar:', err);
    }
  };

  const handleEdit = (config: ChartConfig) => {
    setEditingConfig(config);
    setFormData({
      client_id: config.client_id.toString(),
      chart_name: config.chart_name,
      chart_position: config.chart_position,
      chart_type: config.chart_type,
      database_config_id: config.database_config_id.toString(),
      sql_query: config.sql_query,
      x_axis_field: config.x_axis_field,
      y_axis_field: config.y_axis_field,
      chart_title: config.chart_title,
      chart_subtitle: config.chart_subtitle || '',
      chart_description: config.chart_description || '',
      group_id: config.group_id?.toString() || '',
      layout_model: config.layout_model,
      is_active: config.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chart-configs/${id}`, {
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
      setError('Erro de conexão');
      console.error('Erro ao excluir:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      chart_name: '',
      chart_position: 1,
      chart_type: 'bar',
      database_config_id: '',
      sql_query: '',
      x_axis_field: '',
      y_axis_field: '',
      chart_title: '',
      chart_subtitle: '',
      chart_description: '',
      group_id: '',
      layout_model: 'model_10_cards',
      is_active: true
    });
    setError(null);
    setSuccess(null);
  };

  const resetDrillDownForm = () => {
    setDrillDownFormData({
      chart_position: 1,
      group_id: '',
      chart_name: '',
      chart_type: 'bar',
      chart_title: '',
      chart_subtitle: '',
      x_axis_field: '',
      y_axis_field: '',
      database_config_id: '',
      detail_sql_query: '',
      detail_sql_params: '',
      detail_grid_title: '',
      detail_grid_columns: '',
      detail_link_column: '',
      detail_link_template: '',
      detail_link_text_column: '',
      modal_size: 'large',
      max_results: 1000,
      query_timeout_seconds: 30,
      is_active: true
    });
    setError(null);
    setSuccess(null);
  };

  const handleDrillDownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!drillDownFormData.chart_name.trim() || !drillDownFormData.chart_title.trim() || !drillDownFormData.detail_sql_query.trim() || !drillDownFormData.detail_grid_title.trim()) {
      setError('Nome do gráfico, título do gráfico, consulta SQL e título do drill-down são obrigatórios');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const url = editingDrillDown ? `/api/chart-drilldown/${editingDrillDown.id}` : '/api/chart-drilldown';
      const method = editingDrillDown ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(drillDownFormData)
      });

      if (response.ok) {
        setSuccess(editingDrillDown ? 'Drill-down atualizado com sucesso!' : 'Drill-down criado com sucesso!');
        setShowDrillDownForm(false);
        setEditingDrillDown(null);
        resetDrillDownForm();
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao salvar drill-down');
      }
    } catch (err) {
      setError('Erro ao salvar drill-down');
      console.error('Erro ao salvar drill-down:', err);
    }
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    resetForm();
    setShowForm(true);
  };

  const handleNewDrillDown = () => {
    setEditingDrillDown(null);
    resetDrillDownForm();
    setShowDrillDownForm(true);
  };

  const handleEditDrillDown = (drillDown: DrillDownConfig) => {
    setEditingDrillDown(drillDown);
    setDrillDownFormData({
      chart_position: drillDown.chart_position,
      group_id: drillDown.group_id?.toString() || '',
      chart_name: drillDown.chart_name || '',
      chart_type: drillDown.chart_type || 'bar',
      chart_title: drillDown.chart_title || '',
      chart_subtitle: drillDown.chart_subtitle || '',
      x_axis_field: drillDown.x_axis_field || '',
      y_axis_field: drillDown.y_axis_field || '',
      database_config_id: drillDown.database_config_id?.toString() || '',
      detail_sql_query: drillDown.detail_sql_query,
      detail_sql_params: drillDown.detail_sql_params,
      detail_grid_title: drillDown.detail_grid_title,
      detail_grid_columns: drillDown.detail_grid_columns,
      detail_link_column: drillDown.detail_link_column || '',
      detail_link_template: drillDown.detail_link_template || '',
      detail_link_text_column: drillDown.detail_link_text_column || '',
      modal_size: drillDown.modal_size,
      max_results: drillDown.max_results,
      query_timeout_seconds: drillDown.query_timeout_seconds,
      is_active: drillDown.is_active
    });
    setShowDrillDownForm(true);
  };

  const handleDeleteDrillDown = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração de drill-down?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/chart-drilldown/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Drill-down excluído com sucesso!');
        loadData();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao excluir drill-down');
      }
    } catch (err) {
      setError('Erro ao excluir drill-down');
      console.error('Erro ao excluir drill-down:', err);
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-montserrat font-light">CONFIGURAÇÃO DE GRÁFICOS</h1>
            <p className="text-gray-400 mt-2">Gerencie as configurações dos gráficos, grupos e drill-downs</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleNewConfig}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Nova Configuração
            </button>
            <button
              onClick={handleNewDrillDown}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              Novo Drill-Down
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingConfig ? 'Editar Configuração' : 'Nova Configuração'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cliente *
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Gráfico *
                </label>
                <input
                  type="text"
                  name="chart_name"
                  value={formData.chart_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grupo *
                </label>
                <select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um grupo</option>
                  {chartGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.group_name} ({group.layout_model === 'model_10_cards' ? '10 cards' : '8 cards'}) - {group.is_drilldown ? 'Drill-Down' : 'Normal'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Posição no Painel *
                </label>
                <input
                  type="number"
                  name="chart_position"
                  value={formData.chart_position}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Gráfico
                </label>
                <select
                  name="chart_type"
                  value={formData.chart_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {chartTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Configuração de Banco
                </label>
                <select
                  name="database_config_id"
                  value={formData.database_config_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma configuração</option>
                  {databaseConfigs.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.config_name} ({config.db_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campo Eixo X
                </label>
                <input
                  type="text"
                  name="x_axis_field"
                  value={formData.x_axis_field}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campo Eixo Y
                </label>
                <input
                  type="text"
                  name="y_axis_field"
                  value={formData.y_axis_field}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Gráfico
                </label>
                <input
                  type="text"
                  name="chart_title"
                  value={formData.chart_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  name="chart_subtitle"
                  value={formData.chart_subtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo de Layout
                </label>
                <select
                  name="layout_model"
                  value={formData.layout_model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {layoutModels.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  name="chart_description"
                  value={formData.chart_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consulta SQL *
                </label>
                <textarea
                  name="sql_query"
                  value={formData.sql_query}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="SELECT campo_x, campo_y FROM tabela WHERE condicao"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Configuração ativa</span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  {editingConfig ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de Drill-Down */}
        {showDrillDownForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingDrillDown ? 'Editar Drill-Down' : 'Novo Drill-Down'}
            </h2>
            
            <form onSubmit={handleDrillDownSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Grupo *
                </label>
                <select
                  name="group_id"
                  value={drillDownFormData.group_id}
                  onChange={handleDrillDownInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um grupo</option>
                  {chartGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.group_name} ({group.layout_model === 'model_10_cards' ? '10 cards' : '8 cards'}) - {group.is_drilldown ? 'Drill-Down' : 'Normal'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Posição do Painel *
                </label>
                <input
                  type="number"
                  name="chart_position"
                  value={drillDownFormData.chart_position}
                  onChange={handleDrillDownInputChange}
                  min="1"
                  max="10"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Gráfico *
                </label>
                <input
                  type="text"
                  name="chart_name"
                  value={drillDownFormData.chart_name}
                  onChange={handleDrillDownInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Gráfico *
                </label>
                <select
                  name="chart_type"
                  value={drillDownFormData.chart_type}
                  onChange={handleDrillDownInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {chartTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Gráfico *
                </label>
                <input
                  type="text"
                  name="chart_title"
                  value={drillDownFormData.chart_title}
                  onChange={handleDrillDownInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtítulo do Gráfico
                </label>
                <input
                  type="text"
                  name="chart_subtitle"
                  value={drillDownFormData.chart_subtitle}
                  onChange={handleDrillDownInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campo Eixo X
                </label>
                <input
                  type="text"
                  name="x_axis_field"
                  value={drillDownFormData.x_axis_field}
                  onChange={handleDrillDownInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campo Eixo Y
                </label>
                <input
                  type="text"
                  name="y_axis_field"
                  value={drillDownFormData.y_axis_field}
                  onChange={handleDrillDownInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Configuração de Banco
                </label>
                <select
                  name="database_config_id"
                  value={drillDownFormData.database_config_id}
                  onChange={handleDrillDownInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma configuração</option>
                  {databaseConfigs.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.config_name} ({config.db_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título do Drill-Down *
                </label>
                <input
                  type="text"
                  name="detail_grid_title"
                  value={drillDownFormData.detail_grid_title}
                  onChange={handleDrillDownInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tamanho do Modal
                </label>
                <select
                  name="modal_size"
                  value={drillDownFormData.modal_size}
                  onChange={handleDrillDownInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {modalSizes.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Máximo de Resultados
                </label>
                <input
                  type="number"
                  name="max_results"
                  value={drillDownFormData.max_results}
                  onChange={handleDrillDownInputChange}
                  min="1"
                  max="10000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Consulta SQL de Detalhe *
                </label>
                <textarea
                  name="detail_sql_query"
                  value={drillDownFormData.detail_sql_query}
                  onChange={handleDrillDownInputChange}
                  required
                  rows={6}
                  placeholder="SELECT campo1, campo2 FROM tabela WHERE campo = :parametro"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Configuração das Colunas *
                </label>
                <textarea
                  name="detail_grid_columns"
                  value={drillDownFormData.detail_grid_columns}
                  onChange={handleDrillDownInputChange}
                  required
                  rows={4}
                  placeholder='[{"field": "campo1", "title": "Título 1"}, {"field": "campo2", "title": "Título 2"}]'
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parâmetros da Consulta
                </label>
                <textarea
                  name="detail_sql_params"
                  value={drillDownFormData.detail_sql_params}
                  onChange={handleDrillDownInputChange}
                  rows={3}
                  placeholder='{"parametro": "valor"}'
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeout (segundos)
                </label>
                <input
                  type="number"
                  name="query_timeout_seconds"
                  value={drillDownFormData.query_timeout_seconds}
                  onChange={handleDrillDownInputChange}
                  min="5"
                  max="300"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={drillDownFormData.is_active}
                    onChange={handleDrillDownInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Drill-down ativo</span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDrillDownForm(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  {editingDrillDown ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Configurações */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nome do Gráfico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Drill-Down
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {chartConfigs.map((config) => {
                  const chartType = chartTypes.find(t => t.value === config.chart_type);
                  const group = chartGroups.find(g => g.id === config.group_id);
                  const hasDrillDown = drillDownConfigs.some(d => d.chart_position === config.chart_position && d.group_id === config.group_id);
                  
                  return (
                    <tr key={config.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {config.chart_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {config.chart_title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {group?.group_name || 'Sem grupo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {config.chart_position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {chartType?.label || config.chart_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          hasDrillDown 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hasDrillDown ? 'Ativo' : 'Sem drill-down'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {config.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {chartConfigs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma configuração de gráfico encontrada</p>
                <button
                  onClick={handleNewConfig}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Criar primeira configuração
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Drill-Downs */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Configurações de Drill-Down</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Modal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {drillDownConfigs.map((drillDown) => {
                  const group = chartGroups.find(g => g.id === drillDown.group_id);
                  return (
                    <tr key={drillDown.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {group?.group_name || 'Sem grupo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {drillDown.chart_position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {drillDown.detail_grid_title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {modalSizes.find(s => s.value === drillDown.modal_size)?.label || drillDown.modal_size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          drillDown.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {drillDown.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditDrillDown(drillDown)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteDrillDown(drillDown.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {drillDownConfigs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma configuração de drill-down encontrada</p>
                <button
                  onClick={handleNewDrillDown}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Criar primeira configuração de drill-down
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
