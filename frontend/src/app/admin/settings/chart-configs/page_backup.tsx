"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

interface ChartConfig {
  id: number;
  client_id: number;
  chart_name: string;
  chart_type: string;
  database_config_id: number;
  sql_query: string;
  x_axis_field: string;
  y_axis_field: string;
  chart_title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export default function ChartConfigsPage() {
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfig[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    chart_name: '',
    chart_type: 'bar',
    database_config_id: '',
    sql_query: '',
    x_axis_field: '',
    y_axis_field: '',
    chart_title: '',
    is_active: true
  });

  const chartTypes = [
    { value: 'bar', label: 'Gráfico de Barras' },
    { value: 'line', label: 'Gráfico de Linhas' },
    { value: 'pie', label: 'Gráfico de Pizza' },
    { value: 'area', label: 'Gráfico de Área' },
    { value: 'scatter', label: 'Gráfico de Dispersão' },
    { value: 'donut', label: 'Gráfico de Rosca' }
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
      chart_type: config.chart_type,
      database_config_id: config.database_config_id.toString(),
      sql_query: config.sql_query,
      x_axis_field: config.x_axis_field,
      y_axis_field: config.y_axis_field,
      chart_title: config.chart_title,
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
      chart_type: 'bar',
      database_config_id: '',
      sql_query: '',
      x_axis_field: '',
      y_axis_field: '',
      chart_title: '',
      is_active: true
    });
    setError(null);
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    resetForm();
    setShowForm(true);
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
            <p className="text-gray-400 mt-2">Gerencie as configurações dos gráficos por cliente</p>
          </div>
          <button
            onClick={handleNewConfig}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Nova Configuração
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
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
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tipo
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
                  const client = clients.find(c => c.id === config.client_id);
                  const chartType = chartTypes.find(t => t.value === config.chart_type);
                  
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
                        {client?.name || 'Cliente não encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {chartType?.label || config.chart_type}
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
      </div>
    </DashboardLayout>
  );
}
