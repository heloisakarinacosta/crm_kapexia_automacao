
'use client';

import React, { useState, useEffect } from 'react';
import BarChartComponent from '@/components/analytics/BarChartComponent';
import LineChartComponent from '@/components/analytics/LineChartComponent';
import PieChartComponent from '@/components/analytics/PieChartComponent';
import DashboardLayout from '../../../components/layout/DashboardLayout';

// Definir interface para os dados do dashboard
interface ChartData {
  chart_id: number;
  position: number;
  title: string;
  subtitle?: string;
  description?: string;
  type: string;
  data: Array<{[key: string]: string | number}>;
  x_axis_field?: string;
  y_axis_field?: string;
  error?: string;
  demo?: boolean;
}

interface DashboardData {
  data: ChartData[];
  client: {
    id: number;
    name: string;
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  // Comentado completamente para evitar erros de sintaxe
  /* 
  const [filters, setFilters] = useState({
    date: new Date(),
    period: 'day'
  });
  */

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('Erro ao carregar dados: Token de acesso requerido');
        return;
      }

      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Dados recebidos com sucesso:', result);
        console.log('📊 Charts encontrados:', result.data?.length || 0);
        
        console.log('🔥🔥🔥 POSITIONS DEBUG 🔥🔥🔥');
        if (result.data && result.data.length > 0) {
          result.data.forEach((chart: ChartData, index: number) => {
            console.log(`📈 Chart ${index + 1}:`, {
              id: chart.chart_id,
              title: chart.title,
              type: chart.type,
              POSITION: chart.position,
              dataLength: chart.data?.length || 0,
              xField: chart.x_axis_field,
              yField: chart.y_axis_field,
              sampleData: chart.data?.slice(0, 2) // primeiros 2 registros
            });
          });
        }
        console.log('🔥🔥🔥 END POSITIONS DEBUG 🔥🔥🔥');
        
        setData(result);
      } else {
        console.error('❌ Erro ao carregar dados:', result.message);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Função para renderizar um gráfico baseado no tipo
  const renderChart = (chartConfig: ChartData, heightClass: string = '56') => {
    // Determinar se é gráfico da segunda linha (posições 4-7) para aplicar estilo compacto
    const isSecondLine = chartConfig.position >= 4 && chartConfig.position <= 7;
    
    console.log('🎨🎨🎨 RENDER CHART DEBUG 🎨🎨🎨');
    console.log('Title:', chartConfig.title);
    console.log('Position:', chartConfig.position);
    console.log('IsSecondLine:', isSecondLine);
    console.log('HeightClass:', heightClass);
    console.log('Type:', chartConfig.type);
    console.log('🎨🎨🎨 END DEBUG 🎨🎨🎨');
    
    const commonProps = {
      title: chartConfig.title,
      subtitle: chartConfig.subtitle || '',
      data: chartConfig.data,
      loading: loading,
      height: parseInt(heightClass),
      xAxisKey: chartConfig.x_axis_field || 'x',
      dataKey: chartConfig.y_axis_field || 'y',
      compact: isSecondLine // Nova propriedade para indicar estilo compacto
    };

    switch (chartConfig.type.toLowerCase()) {
      case 'bar':
      case 'barra':
        return (
          <BarChartComponent
            key={chartConfig.chart_id}
            {...commonProps}
            color="#40E0D0"
          />
        );
      case 'line':
      case 'linha':
        return (
          <LineChartComponent
            key={chartConfig.chart_id}
            {...commonProps}
            color="#53B6AC"
          />
        );
      case 'pie':
      case 'pizza':
        return (
          <PieChartComponent
            key={chartConfig.chart_id}
            title={chartConfig.title}
            data={chartConfig.data}
            loading={loading}
            height={parseInt(heightClass)}
            compact={isSecondLine}
          />
        );
      default:
        return (
          <div key={chartConfig.chart_id} className="bg-white p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-montserrat font-light text-center text-gray-800">
              {chartConfig.title}
            </h3>
            <p className="text-center text-gray-500 mt-4">
              Tipo de gráfico &quot;{chartConfig.type}&quot; não suportado
            </p>
          </div>
        );
    }
  };

  /* Funções comentadas completamente para evitar erros de sintaxe
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Em produção, recarregar dados com os novos filtros
    // loadData(newFilters);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    // Implementação futura: exportar dados para CSV/Excel
    alert('Funcionalidade de exportação será implementada em breve!');
  };
  */

  // Organizar gráficos em grupos baseado na posição
  const organizeChartsByPosition = (charts: ChartData[]) => {
    console.log('📊 Organizando gráficos por posição:', {
      totalCharts: charts.length,
      positions: charts.map(c => ({ position: c.position, title: c.title }))
    });

    // Primeira linha: posições 1-3 (gráficos principais - altura maior)
    const firstLine = charts.filter(chart => chart.position >= 1 && chart.position <= 3);
    // Segunda linha: posições 4-7 (4 gráficos menores)
    const secondLine = charts.filter(chart => chart.position >= 4 && chart.position <= 7);
    // Terceira linha: posições 8-10 (3 gráficos menores)
    const thirdLine = charts.filter(chart => chart.position >= 8 && chart.position <= 10);
    
    console.log('📈 Distribuição por linha:', {
      firstLine: firstLine.length,
      secondLine: secondLine.length,
      thirdLine: thirdLine.length,
      firstLineTitles: firstLine.map(c => `${c.title} (pos: ${c.position})`),
      secondLineTitles: secondLine.map(c => `${c.title} (pos: ${c.position})`),
      thirdLineTitles: thirdLine.map(c => `${c.title} (pos: ${c.position})`)
    });

    // Verificar se há gráficos sobrando (acima da posição 10)
    const remainingCharts = charts.filter(chart => chart.position > 10);
    if (remainingCharts.length > 0) {
      console.log('⚠️ Gráficos com posições > 10:', remainingCharts.map(c => `${c.title} (pos: ${c.position})`));
    }
    
    return { firstLine, secondLine, thirdLine };
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-montserrat font-light mb-6">ANÁLISES</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Nenhuma configuração de gráfico encontrada</p>
          </div>
        ) : (
          <>
            {(() => {
              const { firstLine, secondLine, thirdLine } = organizeChartsByPosition(data.data);
              
              return (
                <>
                  {/* Primeira linha - Gráficos principais (mais altos) */}
                  {firstLine.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {firstLine.map((chartConfig) => renderChart(chartConfig, '72'))}
                    </div>
                  )}

                  {/* Segunda linha - 4 gráficos */}
                  {secondLine.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {secondLine.map((chartConfig) => renderChart(chartConfig, '56'))}
                    </div>
                  )}

                  {/* Terceira linha - 3 gráficos */}
                  {thirdLine.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {thirdLine.map((chartConfig) => renderChart(chartConfig, '56'))}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
        
        {data?.client && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Cliente: {data.client.name}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


