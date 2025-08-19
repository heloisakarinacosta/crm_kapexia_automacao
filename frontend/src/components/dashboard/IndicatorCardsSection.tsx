"use client";

import React, { useState, useEffect, useCallback } from 'react';
import IndicatorCard from './IndicatorCard';

// Interface para os dados dos indicadores
interface IndicatorData {
  id: string;
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
}

const IndicatorCardsSection: React.FC = () => {
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  const getDefaultIndicators = useCallback((): IndicatorData[] => {
    return [1, 2, 3].map(position => getDefaultIndicator(position));
  }, []);

  const loadCardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Usar dados padrão se não houver token
        setIndicators(getDefaultIndicators());
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar dados dos 3 cards
      const cardPromises = [1, 2, 3].map(async (position) => {
        try {
          const response = await fetch(`/api/dashboard/cards/${position}/data`, { headers });
          if (response.ok) {
            const data = await response.json();
            return {
              id: `card-${position}`,
              title: data.data.title,
              value: data.data.value,
              icon: getIconForPosition(position),
              trend: {
                value: data.data.percentual ? `${data.data.percentual}%` : '0%',
                isPositive: data.data.percentual ? parseFloat(data.data.percentual.toString()) >= 0 : true
              }
            };
          } else {
            return getDefaultIndicator(position);
          }
        } catch (error) {
          console.error(`Erro ao carregar card ${position}:`, error);
          return getDefaultIndicator(position);
        }
      });

      const cardData = await Promise.all(cardPromises);
      setIndicators(cardData);
    } catch (error) {
      console.error('Erro ao carregar dados dos cards:', error);
      setIndicators(getDefaultIndicators());
    } finally {
      setLoading(false);
    }
  }, [getDefaultIndicators]);

  useEffect(() => {
    loadCardData();
  }, [loadCardData]);

  const getIconForPosition = (position: number): string => {
    const icons = {
      1: '👥',
      2: '📅', 
      3: '💰'
    };
    return icons[position as keyof typeof icons] || '📊';
  };

  const getDefaultIndicator = (position: number): IndicatorData => {
    const defaults = {
      1: {
        id: 'leads-week',
        title: 'Novos Leads (Semana)',
        value: 42,
        icon: '👥',
        trend: { value: '12%', isPositive: true }
      },
      2: {
        id: 'appointments-month',
        title: 'Agendamentos (Mês)',
        value: 200,
        icon: '📅',
        trend: { value: '5%', isPositive: true }
      },
      3: {
        id: 'conversion-rate',
        title: 'Taxa de Conversão',
        value: '8.5%',
        icon: '💰',
        trend: { value: '2.3%', isPositive: true }
      }
    };
    return defaults[position as keyof typeof defaults];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {indicators.map(indicator => (
        <IndicatorCard
          key={indicator.id}
          title={indicator.title}
          value={indicator.value}
          icon={indicator.icon}
          trend={indicator.trend}
        />
      ))}
    </div>
  );
};

export default IndicatorCardsSection;
