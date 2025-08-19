'use client';

import React, { useState, useEffect } from 'react';
import BarChartComponent from '@/components/analytics/BarChartComponent';
import LineChartComponent from '@/components/analytics/LineChartComponent';
import PieChartComponent from '@/components/analytics/PieChartComponent';

// Definir interface para os dados do dashboard
interface DashboardData {
  qualificacao: Array<{x: string, y: number}>;
  prospeccao: Array<{x: string, y: number}>;
  expansao: Array<{x: string, y: number}>;
  distribuicao: Array<{name: string, value: number}>;
  agendamentos: Array<{name: string, value: number}>;
  conversao: Array<{name: string, value: number}>;
  ticketMedio: Array<{mes: string, valor: number}>;
  txGanhoQualificacao: Array<{mes: string, total: number, agendados: number}>;
  txGanhoProspeccao: Array<{mes: string, total: number, propostas: number}>;
  ticketTrimestral: Array<{mes: string, valor: number}>;
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
      const response = await fetch('/api/analytics/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Erro ao carregar dados:', result.message);
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-montserrat font-light mb-6">ANÁLISES</h1>
      
      {/* Filtros - comentado para evitar erros */}
      
      {/* Primeira linha - Gráficos principais (mais altos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KAPEX QUALIFICAÇÃO */}
        <BarChartComponent 
          title="KAPEX QUALIFICAÇÃO"
          subtitle="Leads Recebidos"
          data={data?.qualificacao || []}
          loading={loading}
          height={72}
          color="#40E0D0"
        />

        {/* KAPEX PROSPECÇÃO */}
        <LineChartComponent 
          title="KAPEX PROSPECÇÃO"
          subtitle="Leads Prospectados"
          data={data?.prospeccao || []}
          loading={loading}
          height={72}
          color="#53B6AC"
        />

        {/* KAPEX EXPANSÃO */}
        <BarChartComponent 
          title="KAPEX EXPANSÃO"
          subtitle="Clientes Prospectados"
          data={data?.expansao || []}
          loading={loading}
          height={72}
          color="#D040E0"
        />
      </div>

      {/* Segunda linha - 4 gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* DISTRIBUIÇÃO QUALIFICAÇÃO */}
        <PieChartComponent 
          title="DISTRIBUIÇÃO QUALIFICAÇÃO"
          data={data?.distribuicao || []}
          loading={loading}
          height={56}
        />

        {/* AGENDAMENTOS CLOSERS */}
        <PieChartComponent 
          title="AGENDAMENTOS CLOSERS"
          data={data?.agendamentos || []}
          loading={loading}
          donut={true}
          height={56}
        />

        {/* CONVERSÃO PRODUTO/SERVIÇO */}
        <PieChartComponent 
          title="CONVERSÃO PRODUTO/SERVIÇO"
          data={data?.conversao || []}
          loading={loading}
          donut={true}
          height={56}
        />

        {/* TICKET MÉDIO CLIENTES */}
        <BarChartComponent 
          title="TICKET MÉDIO CLIENTES"
          subtitle="Valor Médio Mensal"
          data={data?.ticketMedio || []}
          loading={loading}
          xAxisKey="mes"
          height={56}
          color="#E0D040"
        />
      </div>

      {/* Terceira linha - 3 gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TX GANHO QUALIFICAÇÃO */}
        <BarChartComponent 
          title="TX GANHO QUALIFICAÇÃO"
          subtitle="Conversão de Leads"
          data={data?.txGanhoQualificacao || []}
          loading={loading}
          xAxisKey="mes"
          height={56}
          stacked={true}
          stackedKeys={['total', 'agendados']}
          showLegend={true}
        />

        {/* TX GANHO PROSPECÇÃO */}
        <BarChartComponent 
          title="TX GANHO PROSPECÇÃO"
          subtitle="Propostas vs Total"
          data={data?.txGanhoProspeccao || []}
          loading={loading}
          xAxisKey="mes"
          height={56}
          stacked={true}
          stackedKeys={['total', 'propostas']}
          showLegend={true}
        />

        {/* TICKET MÉDIO TRIMESTRAL */}
        <BarChartComponent 
          title="TICKET MÉDIO TRIMESTRAL"
          subtitle="Valor por Trimestre"
          data={data?.ticketTrimestral || []}
          loading={loading}
          xAxisKey="mes"
          height={56}
          color="#E0D040"
        />
      </div>
    </div>
  );
}
