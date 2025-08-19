'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import EnhancedChart from '../../../components/charts/EnhancedChart';
import DrillDownModal from '../../../components/charts/DrillDownModal';

interface DrillDownData {
  title: string;
  columns: Array<{
    field: string;
    title: string;
    width: number;
    type: 'text' | 'number' | 'email' | 'phone' | 'badge' | 'currency' | 'date' | 'datetime';
  }>;
  rows: Record<string, unknown>[];
  totalRows: number;
  modalSize: 'small' | 'medium' | 'large' | 'fullscreen';
}

interface ChartGroup {
  id: number;
  group_name: string;
  group_description: string;
  group_order: number;
  group_color: string;
  layout_model: 'model_10_cards' | 'model_8_cards';
  is_default: boolean;
  is_drilldown: boolean;
  total_charts: number;
  active_charts: number;
  charts_with_drilldown: number;
}

interface ChartConfig {
  id: number;
  chart_position: number;
  chart_type: string;
  chart_title: string;
  chart_subtitle: string;
  chart_description: string;
  sql_query: string;
  x_axis_field: string;
  y_axis_field: string;
  is_active: boolean;
  has_drilldown: boolean;
  drilldown_active: boolean;
  group_id: number;
  group_name: string;
  layout_model: string;
  group_color: string;
}

interface GroupData {
  group: ChartGroup;
  charts: ChartConfig[];
}

export default function AnalyticsPage() {
  const [groups, setGroups] = useState<ChartGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [groupsData, setGroupsData] = useState<{ [key: number]: GroupData }>({});
  const [loading, setLoading] = useState(true);
  const [loadingGroup, setLoadingGroup] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Drill-down states
  const [showDrillDownModal, setShowDrillDownModal] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);


  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const groupsList = data.data || [];
        setGroups(groupsList);

        // Se há apenas um grupo, carregar automaticamente
        if (groupsList.length === 1) {
          setActiveGroupId(groupsList[0].id);
          await loadGroupData(groupsList[0].id);
        } else if (groupsList.length > 1) {
          // Carregar grupo padrão
          const defaultGroup = groupsList.find((g: ChartGroup) => g.is_default) || groupsList[0];
          setActiveGroupId(defaultGroup.id);
          await loadGroupData(defaultGroup.id);
        } else {
          // Fallback: tentar carregar dashboard original
          await loadLegacyDashboard();
        }

      } else {
        // Fallback: tentar carregar dashboard original
        await loadLegacyDashboard();
      }

    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      // Fallback: tentar carregar dashboard original
      await loadLegacyDashboard();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const loadGroupData = async (groupId: number, period?: string) => {
    try {
      setLoadingGroup(groupId);
      setError(null);

      const token = localStorage.getItem('authToken');
      const url = period ? `/api/analytics/groups/${groupId}/charts?period=${encodeURIComponent(period)}` : `/api/analytics/groups/${groupId}/charts`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroupsData(prev => ({
          ...prev,
          [groupId]: data.data
        }));
      } else {
        throw new Error('Erro ao carregar dados do grupo');
      }

    } catch (error) {
      console.error('Erro ao carregar dados do grupo:', error);
      setError('Erro ao carregar dados do grupo');
    } finally {
      setLoadingGroup(null);
    }
  };

  // Atualizar grupo ao trocar período ou grupo
  useEffect(() => {
    console.log('[DEBUG FRONT] selectedPeriod mudou:', selectedPeriod);
    if (activeGroupId !== null) {
      loadGroupData(activeGroupId, selectedPeriod);
    }
  }, [activeGroupId, selectedPeriod]);

  const loadLegacyDashboard = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Criar grupo virtual para compatibilidade
        const virtualGroup: ChartGroup = {
          id: 0,
          group_name: 'Análises',
          group_description: 'Dashboard principal',
          group_order: 1,
          group_color: '#10B981',
          layout_model: 'model_10_cards',
          is_default: true,
          is_drilldown: false,
          total_charts: data.data?.length || 0,
          active_charts: data.data?.length || 0,
          charts_with_drilldown: 0
        };

        setGroups([virtualGroup]);
        setActiveGroupId(0);
        setGroupsData({
          0: {
            group: virtualGroup,
            charts: data.data || []
          }
        });

      } else {
        throw new Error('Erro ao carregar dashboard');
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard legado:', error);
      setError('Erro ao carregar dados. Verifique sua conexão.');
    }
  };

  const handleTabClick = async (groupId: number) => {
    setActiveGroupId(groupId);
    // Carregamento lazy: só carrega se não estiver em cache
    if (!groupsData[groupId]) {
      await loadGroupData(groupId, selectedPeriod);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDrillDown = async (chartPosition: number, clickedData: Record<string, unknown>) => {
    try {
      setDrillDownLoading(true);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/chart-drilldown/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chart_position: chartPosition,
          clicked_data: clickedData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDrillDownData(data.data);
        setShowDrillDownModal(true);
      } else {
        const errorData = await response.json();
        console.error('Erro no drill-down:', errorData.message);
      }

    } catch (error) {
      console.error('Erro ao executar drill-down:', error);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const renderChartGrid = (charts: ChartConfig[], layoutModel: string) => {
    if (layoutModel === 'model_8_cards') {
      return renderModel8Cards(charts);
    } else {
      return renderModel10Cards(charts);
    }
  };

  const renderModel10Cards = (charts: ChartConfig[]) => {
    // Renderizar apenas os painéis configurados
    if (!charts || charts.length === 0) return null;
    // Separar por linhas conforme layout original
    const firstRow = charts.slice(0, 3);
    const secondRow = charts.slice(3, 6);
    const thirdRow = charts.slice(6, 10);
    return (
      <div className="space-y-6">
        {/* Primeira linha - até 3 gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {firstRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={300}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
        {/* Segunda linha - até 3 gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={250}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
        {/* Terceira linha - até 4 gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {thirdRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={200}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderModel8Cards = (charts: ChartConfig[]) => {
    // Renderizar apenas os painéis configurados
    if (!charts || charts.length === 0) return null;
    const firstRow = charts.slice(0, 2);
    const secondRow = charts.slice(2, 5);
    const thirdRow = charts.slice(5, 8);
    return (
      <div className="space-y-6">
        {/* Primeira linha - até 2 gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {firstRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={350}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
        {/* Segunda linha - até 3 gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={280}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
        {/* Terceira linha - até 3 gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {thirdRow.map((chart) => (
            <div key={chart.id} className="bg-white p-6 rounded-lg shadow">
              <EnhancedChart
                chartType={chart.chart_type as 'bar' | 'line' | 'pie' | 'area'}
                chartPosition={chart.chart_position}
                groupId={chart.group_id}
                title={chart.chart_title}
                subtitle={chart.chart_subtitle}
                dataKey={chart.y_axis_field}
                xAxisKey={chart.x_axis_field}
                height={220}
                enableDrillDown={chart.has_drilldown && chart.drilldown_active}
                showGrid={true}
                showTooltip={true}
                isDrillDown={groups.find(g => g.id === activeGroupId)?.is_drilldown}
                period={selectedPeriod}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando análises...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeGroupData = activeGroupId !== null ? groupsData[activeGroupId] : null;

  return (
    <DashboardLayout>
      <div className="pt-2 px-4"> {/* margem superior reduzida */}
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-end"> {/* Só filtros à direita */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  console.log('[DEBUG FRONT] Filtro selecionado:', e.target.value);
                  setSelectedPeriod(e.target.value);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o período</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Abas dos Grupos (só mostra se há múltiplos grupos) */}
        {groups.length > 1 && (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleTabClick(group.id)}
                    className={`py-2 px-1 font-medium text-sm whitespace-nowrap rounded-t-md transition-colors duration-200 ${
                      activeGroupId === group.id
                        ? 'bg-[#E0D040] text-[#222]'
                        : 'bg-transparent text-white hover:bg-gray-700 hover:text-[#E0D040]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: activeGroupId === group.id ? '#40E0D0' : '#888' }}
                      ></div>
                      <span>{group.group_name}</span>
                      {/* Removido texto Drill-Down/Normal */}
                      {loadingGroup === group.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Error Message */}
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

        {/* Loading do Grupo */}
        {loadingGroup === activeGroupId && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando painéis...</span>
          </div>
        )}

        {/* Conteúdo do Grupo */}
        {!loadingGroup && activeGroupData && (
          renderChartGrid(activeGroupData.charts, activeGroupData.group.layout_model)
        )}

        {/* Fallback se não há dados */}
        {!loadingGroup && !activeGroupData && !error && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum painel configurado</h3>
            <p className="mt-1 text-sm text-gray-500">Configure seus painéis em Configurações → Análises.</p>
          </div>
        )}

        {/* Modal de Drill-Down */}
        {showDrillDownModal && drillDownData && (
          <DrillDownModal
            isOpen={showDrillDownModal}
            onClose={() => setShowDrillDownModal(false)}
            data={drillDownData}
            loading={drillDownLoading}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

