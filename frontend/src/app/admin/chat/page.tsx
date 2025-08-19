"use client";

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Chat IA</h1>
        <p className="text-gray-400">
          Esta página está em desenvolvimento. Em breve, você terá acesso à interface completa de chat com IA.
        </p>
        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            Funcionalidades previstas:
          </p>
          <ul className="mt-2 list-disc pl-5 text-gray-400">
            <li>Chat com assistente de IA dedicado</li>
            <li>Análise de dados em tempo real</li>
            <li>Respostas a perguntas sobre métricas e KPIs</li>
            <li>Sugestões personalizadas baseadas em dados</li>
            <li>Histórico de conversas</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
