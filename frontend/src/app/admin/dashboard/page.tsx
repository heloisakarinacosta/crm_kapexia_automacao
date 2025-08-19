import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import IndicatorCardsSection from '../../../components/dashboard/IndicatorCardsSection';
import ChatInterface from '../../../components/chat/ChatInterface';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Seção de Cards de Indicadores */}
      <IndicatorCardsSection />
      
      {/* Interface de Chat */}
      <div className="h-[calc(100vh-220px)]">
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
}
