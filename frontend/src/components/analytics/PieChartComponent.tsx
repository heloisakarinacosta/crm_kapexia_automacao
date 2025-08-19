'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { PieChartComponentProps } from '@/types/ui';
import { KAPEXIA_COLORS } from '@/constants/colors';

export default function PieChartComponent({ 
  title, 
  subtitle, // <-- Adicionar prop subtitle
  data, 
  loading = false, 
  donut = false,
  showPercentage = true,
  height = 200,
  compact = false
}: PieChartComponentProps & { compact?: boolean, subtitle?: string }) { // <-- Adicionar subtitle ao tipo
  console.log('🔍 PieChartComponent Debug:', {
    title,
    subtitle, // <-- Log para debug
    dataLength: data?.length || 0,
    sampleData: data?.slice(0, 2),
    loading,
    dataIsArray: Array.isArray(data),
    dataExists: !!data,
    firstItem: data?.[0],
    compact,
    height
  });
  
  console.log('🎯 COMPACT STATUS:', title, '| compact =', compact, '| height =', height);

  const hasValidData = data && Array.isArray(data) && data.length > 0;
  console.log('📊 Validação de dados PieChart:', {
    hasValidData,
    dataType: typeof data,
    dataConstructor: data?.constructor?.name
  });

  // Para PieChart, precisamos converter dados para formato {name, value}
  let finalData = data;
  if (hasValidData && data[0] && !data[0].hasOwnProperty('value')) {
    // Se os dados não têm campo 'value', vamos mapear
    const firstItem = data[0];
    const keys = Object.keys(firstItem);
    const nameKey = keys.find(k => typeof firstItem[k] === 'string') || keys[0];
    const valueKey = keys.find(k => typeof firstItem[k] === 'number') || keys[1];
    
    finalData = data.map((item, index) => ({
      name: item[nameKey] || `Item ${index + 1}`,
      value: item[valueKey] || 0
    }));
    
    console.log('🔄 Convertendo dados PieChart:', {
      original: data.slice(0, 2),
      converted: finalData.slice(0, 2),
      nameKey,
      valueKey
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
              <p className={`text-gray-600 ${compact ? "text-xs mt-0" : "text-sm"}`}>{subtitle}</p>
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
            <p className={`text-gray-600 ${compact ? "text-xs mt-0" : "text-sm"}`}>{subtitle}</p>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent style={{height: `${height * (compact ? 3 : 4)}px`, minHeight: `${height * (compact ? 3 : 4)}px`}}>
        {loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={250}>
              <Pie
                data={finalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={donut ? (compact ? 30 : 60) : 0}
				outerRadius={compact ? 50 : 80}
                fill="#8884d8"
                dataKey="value"
                label={showPercentage ? 
                  (props) => {
                    const { name, percent } = props;
                    return (
                      <text 
                        x={props.x} 
                        y={props.y} 
                        fill="black" 
                        fontSize={compact ? '10px' : '12px'}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  } : 
                  (props) => {
                    const { name } = props;
                    return (
                      <text 
                        x={props.x} 
                        y={props.y} 
                        fill="black" 
                        fontSize={compact ? '10px' : '12px'}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {name}
                      </text>
                    );
                  }
                }
              >
                {finalData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={KAPEXIA_COLORS[index % KAPEXIA_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  fontSize: compact ? '10px' : '12px',
                  padding: compact ? '4px 6px' : '8px 10px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: compact ? '10px' : '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
