"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface WhatsAppStatsProps {
  instanceId: number;
}

interface Stats {
  total_chats: number;
  open_chats: number;
  unread_messages: number;
  messages_today: number;
  active_users: number;
}

const WhatsAppStats: React.FC<WhatsAppStatsProps> = ({ instanceId }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/instances/${instanceId}/chats/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    loadStats();
    
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [instanceId, loadStats]);

  if (loading) {
    return (
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Conversas Abertas',
      value: stats.open_chats,
      icon: '💬',
      color: 'text-blue-600'
    },
    {
      label: 'Não Lidas',
      value: stats.unread_messages,
      icon: '🔴',
      color: 'text-red-600'
    },
    {
      label: 'Mensagens Hoje',
      value: stats.messages_today,
      icon: '📊',
      color: 'text-green-600'
    },
    {
      label: 'Usuários Ativos',
      value: stats.active_users,
      icon: '👥',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="flex space-x-6">
      {statItems.map((item, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm text-gray-500">{item.label}</span>
          </div>
          <div className={`text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WhatsAppStats;

