"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import EnhancedChart from '../../../components/charts/EnhancedChart';

// Dados de exemplo para os gráficos
const leadsData = [
  { name: '01/07', leads: 45, conversoes: 12 },
  { name: '02/07', leads: 52, conversoes: 15 },
  { name: '03/07', leads: 38, conversoes: 8 },
  { name: '04/07', leads: 71, conversoes: 22 },
  { name: '05/07', leads: 63, conversoes: 18 },
  { name: '06/07', leads: 49, conversoes: 14 },
  { name: '07/07', leads: 58, conversoes: 16 }
];

const produtosData = [
  { name: 'Produto A', vendas: 120, valor: 45000 },
  { name: 'Produto B', vendas: 85, valor: 32000 },
  { name: 'Produto C', vendas: 95, valor: 38000 },
  { name: 'Produto D', vendas: 67, valor: 25000 }
];

const vendasData = [
  { name: 'Jan', vendas: 180000, meta: 200000 },
  { name: 'Fev', vendas: 220000, meta: 200000 },
  { name: 'Mar', vendas: 195000, meta: 200000 },
  { name: 'Abr', vendas: 240000, meta: 220000 },
  { name: 'Mai', vendas: 210000, meta: 220000 },
  { name: 'Jun', vendas: 280000, meta: 250000 }
];

const conversaoData = [
  { name: 'Leads', value: 450, color: '#10B981' },
  { name: 'Qualificados', value: 180, color: '#3B82F6' },
  { name: 'Propostas', value: 85, color: '#F59E0B' },
  { name: 'Fechados', value: 32, color: '#EF4444' }
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [drillDownErrors, setDrillDownErrors] = useState<{ [key: number]: string }>({});

  // Verificar status de drill-down para múltiplos gráficos (temporariamente desabilitado)
  // const { drillDownStatus, loading: statusLoading } = useMultipleDrillDown([1, 2, 3, 4]);
  const drillDownStatus: Record<number, boolean> = {};
  const statusLoading = false;

  const handleDrillDownError = (chartPosition: number) => (error: string) => {
    setDrillDownErrors(prev => ({
      ...prev,
      [chartPosition]: error
    }));

    // Limpar erro após 5 segundos
    setTimeout(() => {
      setDrillDownErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[chartPosition];
        return newErrors;
      });
    }, 5000);
  };

  const clearError = (chartPosition: number) => {
    setDrillDownErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[chartPosition];
      return newErrors;
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-montserrat font-light">ANÁLISES</h1>
              <p className="text-gray-600 mt-1">Visualize e analise seus dados de negócio</p>
            </div>
            
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status de Drill-Down */}
        {!statusLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Drill-down ativo:</strong> Clique nos elementos dos gráficos para ver dados detalhados.
                  {Object.keys(drillDownStatus).filter(key => drillDownStatus[parseInt(key)]).length > 0 && (
                    <span className="ml-2">
                      Gráficos com drill-down: {Object.keys(drillDownStatus).filter(key => drillDownStatus[parseInt(key)]).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Leads por Dia */}
          <div className="bg-white p-6 rounded-lg shadow">
            <EnhancedChart
              data={leadsData}
              chartType="bar"
              chartPosition={1}
              title="Leads por Dia"
              dataKey="leads"
              xAxisKey="name"
              colors={['#10B981']}
              height={300}
              enableDrillDown={true}
              showGrid={true}
              showTooltip={true}
              onDrillDownError={handleDrillDownError(1)}
            />
            
            {drillDownErrors[1] && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-700">{drillDownErrors[1]}</p>
                  <button
                    onClick={() => clearError(1)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico 2: Vendas por Produto */}
          <div className="bg-white p-6 rounded-lg shadow">
            <EnhancedChart
              data={produtosData}
              chartType="bar"
              chartPosition={2}
              title="Vendas por Produto"
              dataKey="vendas"
              xAxisKey="name"
              colors={['#3B82F6']}
              height={300}
              enableDrillDown={true}
              showGrid={true}
              showTooltip={true}
              onDrillDownError={handleDrillDownError(2)}
            />
            
            {drillDownErrors[2] && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-700">{drillDownErrors[2]}</p>
                  <button
                    onClick={() => clearError(2)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico 3: Vendas Mensais */}
          <div className="bg-white p-6 rounded-lg shadow">
            <EnhancedChart
              data={vendasData}
              chartType="line"
              chartPosition={3}
              title="Vendas Mensais"
              dataKey="vendas"
              xAxisKey="name"
              colors={['#F59E0B']}
              height={300}
              enableDrillDown={true}
              showGrid={true}
              showTooltip={true}
              onDrillDownError={handleDrillDownError(3)}
            />
            
            {drillDownErrors[3] && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-700">{drillDownErrors[3]}</p>
                  <button
                    onClick={() => clearError(3)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gráfico 4: Funil de Conversão */}
          <div className="bg-white p-6 rounded-lg shadow">
            <EnhancedChart
              data={conversaoData}
              chartType="pie"
              chartPosition={4}
              title="Funil de Conversão"
              dataKey="value"
              xAxisKey="name"
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
              height={300}
              enableDrillDown={true}
              showLegend={true}
              showTooltip={true}
              onDrillDownError={handleDrillDownError(4)}
            />
            
            {drillDownErrors[4] && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-700">{drillDownErrors[4]}</p>
                  <button
                    onClick={() => clearError(4)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Leads</p>
                <p className="text-2xl font-semibold text-gray-900">376</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Conversões</p>
                <p className="text-2xl font-semibold text-gray-900">105</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Receita</p>
                <p className="text-2xl font-semibold text-gray-900">R$ 1.2M</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                <p className="text-2xl font-semibold text-gray-900">27.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

