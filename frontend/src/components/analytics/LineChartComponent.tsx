'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { LineChartComponentProps } from '@/types/ui';
import { KAPEXIA_COLORS } from '@/constants/colors';

export default function LineChartComponent({ 
  title, 
  subtitle,
  data, 
  loading = false, 
  dataKey = 'valor',
  xAxisKey = 'dia',
  // color removido, usar paleta
  height = 200,
  compact = false
}: LineChartComponentProps & { compact?: boolean }) {
  console.log('🔍 LineChartComponent Debug:', {
    title,
    subtitle,
    dataLength: data?.length || 0,
    dataKey,
    xAxisKey,
    sampleData: data?.slice(0, 2),
    loading,
    dataIsArray: Array.isArray(data),
    dataExists: !!data,
    firstItem: data?.[0]
  });

  const hasValidData = data && Array.isArray(data) && data.length > 0;
  console.log('📊 Validação de dados LineChart:', {
    hasValidData,
    dataType: typeof data,
    dataConstructor: data?.constructor?.name
  });

  // Teste com dados hardcoded para debug
  const testData = [
    { dia: 1, total_prospectados: 45 },
    { dia: 2, total_prospectados: 38 },
    { dia: 3, total_prospectados: 52 },
    { dia: 4, total_prospectados: 41 },
    { dia: 5, total_prospectados: 67 }
  ];
  
  // Remover dados de teste para usar dados reais
  const useTestData = false; // title.includes('PROSPECÇÃO');
  const finalData = useTestData ? testData : data;
  
  if (useTestData) {
    console.log('🧪 Usando dados de teste LineChart para:', title);
  }

  // Log dos dados que serão renderizados no LineChart
  if (hasValidData || useTestData) {
    console.log('📈 Renderizando LineChart com dados:', {
      dataForChart: finalData,
      dataKeys: { xAxisKey, dataKey },
      chartHeight: height,
      firstThreeItems: finalData?.slice(0, 3),
      useTestData
    });
  }

  if (!hasValidData && !useTestData) {
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
            <LineChart data={finalData} width={400} height={250}>
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
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={KAPEXIA_COLORS[0]} 
                strokeWidth={compact ? 2 : 3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
