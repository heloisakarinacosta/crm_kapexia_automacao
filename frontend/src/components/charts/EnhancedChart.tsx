"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDrillDown } from '../../hooks/useDrillDown';
import DrillDownModal from './DrillDownModal';
import { KAPEXIA_COLORS } from '@/constants/colors';

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
  linkConfig?: {
    column: string;
    template: string;
    textColumn: string;
  };
}

interface ChartData {
  [key: string]: unknown;
}

interface EnhancedChartProps {
  // Propriedades básicas do gráfico
  data?: ChartData[]; // Agora opcional - será carregado automaticamente
  chartType: 'bar' | 'line' | 'pie' | 'area';
  chartPosition: number; // Posição do gráfico (1-10)
  groupId?: number; // ID do grupo (para buscar dados específicos do grupo)
  
  // Configurações visuais
  title?: string;
  subtitle?: string;
  dataKey: string;
  xAxisKey?: string;
  colors?: string[];
  height?: number;
  
  // Configurações de drill-down
  enableDrillDown?: boolean;
  autoCheckDrillDown?: boolean;
  isDrillDown?: boolean;
  
  // Configurações específicas por tipo
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  
  // Callbacks opcionais
  onChartClick?: (data: unknown) => void;
  onDrillDownError?: (error: string) => void;
  period?: string; // NOVA PROP
}

// Funções utilitárias para formatação de datas
function isDateString(val: unknown) {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);
}
function formatDateShort(dateString: string) {
  if (!isDateString(dateString)) return dateString;
  const d = new Date(dateString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function formatDateFull(dateString: string) {
  if (!isDateString(dateString)) return dateString;
  const d = new Date(dateString);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  data: providedData,
  chartType,
  chartPosition,
  groupId,
  title,
  subtitle,
  dataKey,
  xAxisKey = 'name',
  colors = KAPEXIA_COLORS,
  height = 300,
  enableDrillDown = true,
  autoCheckDrillDown = true,
  isDrillDown = false,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  onChartClick,
  onDrillDownError,
  period
}) => {
  // Estados para carregamento automático de dados
  const [chartData, setChartData] = React.useState<ChartData[]>(providedData || []);
  const [dataLoading, setDataLoading] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);
  const {
    isModalOpen,
    modalData,
    loading,
    error,
    isEnabled,
    executeDrillDown,
    closeModal,
    formatClickedData,
    clearError
  } = useDrillDown({
    chartPosition,
    autoCheck: autoCheckDrillDown && enableDrillDown
  });

  /**
   * Carregar dados do gráfico automaticamente se não fornecidos
   */
  React.useEffect(() => {
    const loadChartData = async () => {
      if (providedData && providedData.length > 0) {
        setChartData(providedData);
        return;
      }

      try {
        setDataLoading(true);
        setDataError(null);

        const token = localStorage.getItem('authToken');
        const timestamp = Date.now();
        let url = groupId 
          ? `/api/analytics/chart/${chartPosition}?groupId=${groupId}&_t=${timestamp}`
          : `/api/analytics/chart/${chartPosition}?_t=${timestamp}`;
        url += `&period=${encodeURIComponent(period || '')}`;
        
        // Force fresh request by creating new AbortController each time
        const controller = new AbortController();
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const data = result.data.data || [];
            setChartData(data);
          } else {
            setDataError(result.message || 'Erro ao carregar dados do gráfico');
          }
        } else {
          setDataError('Erro ao carregar dados do gráfico');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        setDataError('Erro ao conectar com o servidor');
      } finally {
        setDataLoading(false);
      }
    };

    loadChartData();
  }, [chartPosition, groupId, providedData, chartType, dataKey, xAxisKey, title, isDrillDown, period]);

  // Atualizar dados se providedData mudar
  React.useEffect(() => {
    if (providedData) {
      setChartData(providedData);
    }
  }, [providedData]);

  // Notificar erro via callback se fornecido
  React.useEffect(() => {
    if (error && onDrillDownError) {
      onDrillDownError(error);
    }
  }, [error, onDrillDownError]);

  // Fix para o problema do "0" aparecendo nos títulos
  React.useEffect(() => {
    if (title && typeof document !== 'undefined') {
      const titleElement = document.getElementById(`chart-title-${chartPosition}`);
      if (titleElement) {
        // Garantir que o texto do título está limpo
        titleElement.textContent = title;
      }
    }
  }, [title, chartPosition]);

  // Log para depuração dos dados e chaves do gráfico
  React.useEffect(() => {
    if (chartType === 'pie' && chartData.length > 0) {
      console.log('[DEBUG EnhancedChart] Dados para gráfico pie:', chartData);
      console.log('[DEBUG EnhancedChart] dataKey:', dataKey, '| xAxisKey:', xAxisKey);
    }
  }, [chartData, chartType, dataKey, xAxisKey]);

  // Detectar se o campo do eixo X é data
  const isXAxisDate = chartData.some(d => isDateString(d[xAxisKey]));

  // Conversão automática: garantir que o campo dataKey seja sempre número
  const fixedChartData = chartData.map(d => ({
    ...d,
    [dataKey]: d[dataKey] !== undefined && d[dataKey] !== null ? Number(d[dataKey]) : d[dataKey]
  }));

  /**
   * Handler para clique nos elementos do gráfico
   */
  const handleChartClick = async (clickData: unknown, extra?: Record<string, unknown>) => {
    // Executar callback personalizado se fornecido
    if (onChartClick) {
      onChartClick(clickData);
    }

    // Executar drill-down se habilitado e configurado
    if (enableDrillDown && isEnabled) {
      try {
        clearError();
        const formattedDataResult = formatClickedData(clickData, chartType);
        const formattedData: Record<string, unknown> = Array.isArray(formattedDataResult) ? formattedDataResult[0] || {} : formattedDataResult as Record<string, unknown>;
        // Para line/bar: garantir clicked_date
        if ((chartType === 'line' || chartType === 'bar') && (!formattedData['clicked_date'] || formattedData['clicked_date'] === undefined)) {
          // Tentar pegar do extra (ex: payload do ponto)
          if (extra && extra.activeLabel) {
            formattedData['clicked_date'] = extra.activeLabel;
          } else if (extra && extra.payload && typeof extra.payload === 'object' && extra.payload !== null && xAxisKey in extra.payload) {
            formattedData['clicked_date'] = (extra.payload as Record<string, unknown>)[xAxisKey];
          }
        }
        // Para pie: garantir clicked_category
        if (chartType === 'pie' && (!formattedData['clicked_category'] || formattedData['clicked_category'] === undefined)) {
          if (extra && extra.name) {
            formattedData['clicked_category'] = extra.name as string;
          } else if (clickData && typeof clickData === 'object' && clickData !== null && 'name' in clickData) {
            formattedData['clicked_category'] = (clickData as Record<string, unknown>).name as string;
          }
        }
        console.log('[DRILLDOWN DEBUG] Dados enviados para drill-down:', formattedData);
        await executeDrillDown(formattedData);
      } catch (error) {
        console.error('Erro ao executar drill-down:', error);
      }
    }
  };

  /**
   * Configurações comuns para todos os gráficos
   */
  const commonProps = {
    data: chartData,
    width: '100%',
    height,
    onClick: handleChartClick,
    style: { 
      cursor: (enableDrillDown && isEnabled) ? 'pointer' : 'default' 
    }
  };

  /**
   * Renderizar tooltip customizado
   */
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: unknown; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{isXAxisDate ? formatDateFull(String(label || '')) : label}</p>
          {payload.map((entry: { name: string; value: unknown; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
          {enableDrillDown && isEnabled && (
            <p className="text-xs text-blue-600 mt-1">
              Clique para ver detalhes
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  /**
   * Renderizar gráfico baseado no tipo
   */
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={fixedChartData} onClick={handleChartClick}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} tickFormatter={isXAxisDate ? (v => formatDateShort(String(v || ''))) : undefined} />
              <YAxis />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              <Bar 
                dataKey={dataKey} 
                cursor={enableDrillDown && isEnabled ? "pointer" : "default"}
              >
                {fixedChartData.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={fixedChartData}
              onClick={(e) => {
                // e.activeLabel pode ser undefined se clicar fora do ponto
                // e.activePayload[0]?.payload pode ter o ponto mais próximo
                let clickData = e;
                if (!e.activeLabel && e.activePayload && e.activePayload[0]) {
                  clickData = e.activePayload[0];
                }
                handleChartClick(clickData, e as Record<string, unknown>);
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} tickFormatter={isXAxisDate ? formatDateShort : undefined} />
              <YAxis />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={fixedChartData} onClick={handleChartClick}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} tickFormatter={isXAxisDate ? formatDateShort : undefined} />
              <YAxis />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={fixedChartData}
                dataKey={dataKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height / 3, 80)}
                label={({ name, value }: { name?: string; value?: number }) => {
                  const labelValue = isXAxisDate ? formatDateShort(String(name ?? '')) : name;
                  return `${labelValue} (${value})`;
                }}
                onClick={(e: Record<string, unknown>) => {
                  let clickData = e;
                  const eTyped = e as Record<string, unknown> & { payload?: Record<string, unknown> };
                  if (e && (eTyped.data_criacao || eTyped.data || eTyped.payload?.data_criacao || eTyped.payload?.data)) {
                    clickData = {
                      ...e,
                      clicked_date: eTyped.data_criacao || eTyped.data || eTyped.payload?.data_criacao || eTyped.payload?.data
                    };
                  }
                  handleChartClick(clickData, e as Record<string, unknown>);
                }}
              >
                {fixedChartData.map((entry, index) => (
                  <Cell key={`cell-pie-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => value}
                labelFormatter={v => isXAxisDate ? formatDateFull(String(v || '')) : v}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Tipo de gráfico não suportado: {chartType}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Título do gráfico */}
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900" id={`chart-title-${chartPosition}`}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Indicador de erro de dados */}
      {dataError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{dataError}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setDataError(null)}
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

      {/* Indicador de erro de drill-down */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
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
                onClick={clearError}
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

      {/* Container do gráfico */}
      <div className="relative">
        {dataLoading ? (
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Carregando dados do gráfico...</span>
            </div>
          </div>
        ) : dataError ? (
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Erro ao carregar dados</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Nenhum dado disponível</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
        
        {/* Overlay de loading durante drill-down */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Carregando detalhes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de drill-down */}
      <DrillDownModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData as DrillDownData | null}
        loading={loading}
      />
    </div>
  );
};

export default EnhancedChart;

