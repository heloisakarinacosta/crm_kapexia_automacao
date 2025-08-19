'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { BarChartComponentProps } from '@/types/ui';
import { KAPEXIA_COLORS } from '@/constants/colors';

export default function BarChartComponent({ 
  title, 
  subtitle,
  data, 
  loading = false, 
  dataKey = 'valor',
  xAxisKey = 'dia',
  // color removido, usar paleta
  height = 200,
  compact = false
}: BarChartComponentProps & { compact?: boolean }) {
  console.log('🔍 BarChartComponent Debug:', {
    title,
    subtitle,
    dataLength: data?.length || 0,
    dataKey,
    xAxisKey,
    sampleData: data?.slice(0, 2),
    loading,
    dataIsArray: Array.isArray(data),
    dataExists: !!data,
    firstItem: data?.[0],
    compact,
    height
  });

  const hasValidData = data && Array.isArray(data) && data.length > 0;
  console.log('📊 Validação de dados:', {
    hasValidData,
    dataType: typeof data,
    dataConstructor: data?.constructor?.name
  });

  // Teste com dados hardcoded para debug
  const testData = [
    { dia: 1, total_leads: 45 },
    { dia: 2, total_leads: 38 },
    { dia: 3, total_leads: 52 }
  ];
  
  // Remover dados de teste para permitir dados reais
  const useTestData = false; // title.includes('QUALIFICAÇÃO');

  // Converter valores string para número se necessário
  let processedData = data;
  if (hasValidData && data[0] && dataKey) {
    processedData = data.map(item => {
      const newItem = { ...item };
      if (typeof newItem[dataKey] === 'string' && !isNaN(Number(newItem[dataKey]))) {
        newItem[dataKey] = Number(newItem[dataKey]);
      }
      return newItem;
    });
    
    if (JSON.stringify(data) !== JSON.stringify(processedData)) {
      console.log('🔄 Convertendo strings para números:', {
        original: data.slice(0, 2),
        converted: processedData.slice(0, 2),
        field: dataKey
      });
    }
  }

  const finalProcessedData = useTestData ? testData : processedData;

  // Log dos dados que serão renderizados no gráfico
  if (hasValidData) {
    console.log('📈 Renderizando BarChart com dados:', {
      dataForChart: finalProcessedData,
      dataKeys: { xAxisKey, dataKey },
      chartHeight: height,
      firstThreeItems: finalProcessedData?.slice(0, 3),
      allData: JSON.stringify(finalProcessedData?.slice(0, 3), null, 2)
    });
  }

  if (!hasValidData) {
    return (
      <Card className="bg-white dark:bg-white rounded-xl shadow-md">
        <CardHeader className={compact ? "pb-1" : "pb-2"}>
          <CardTitle className={`font-montserrat font-light text-center text-gray-800 ${
            compact ? "text-sm" : "text-lg"
          }`}>
            {title}
            {subtitle && (
              <p className={`text-gray-600 ${compact ? "text-xs mt-0" : "text-sm"}`}>
                {subtitle}
              </p>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent style={{height: `${height * (compact ? 3 : 4)}px`, minHeight: `${height * (compact ? 3 : 4)}px`}}>
          <div className="flex items-center justify-center h-full">
            <p className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>Sem dados disponíveis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-white rounded-xl shadow-md">
      <CardHeader className={compact ? "pb-1" : "pb-2"}>
        <CardTitle className={`font-montserrat font-light text-center text-gray-800 ${
          compact ? "text-sm" : "text-lg"
        }`}>
          {title}
          {subtitle && (
            <p className={`text-gray-600 ${compact ? "text-xs mt-0" : "text-sm"}`}>
              {subtitle}
            </p>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent style={{height: `${height * (compact ? 3 : 4)}px`, minHeight: `${height * (compact ? 3 : 4)}px`}}>
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalProcessedData} width={400} height={250}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fontSize: compact ? 10 : 12 }}
                />
                <YAxis 
                  tick={{ fontSize: compact ? 10 : 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: compact ? '11px' : '13px',
                    padding: compact ? '4px 6px' : '8px 10px'
                  }}
                />
                <Bar dataKey={dataKey}>
                  {finalProcessedData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={KAPEXIA_COLORS[index % KAPEXIA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
