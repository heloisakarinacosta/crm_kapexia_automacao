"use client";

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Gestão de Leads</h1>
        <p className="text-gray-400">
          Esta página está em desenvolvimento. Em breve, você terá acesso à gestão completa de leads.
        </p>
        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            Funcionalidades previstas:
          </p>
          <ul className="mt-2 list-disc pl-5 text-gray-400">
            <li>Lista de leads com filtros avançados</li>
            <li>Detalhes completos de cada lead</li>
            <li>Histórico de interações</li>
            <li>Ferramentas de qualificação</li>
            <li>Integração com automações</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
