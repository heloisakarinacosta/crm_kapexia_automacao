"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Configurações do Sistema</h1>
        <p className="text-gray-400">
          Bem-vindo à área de configurações. Selecione uma opção abaixo para gerir diferentes aspetos do sistema.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/settings/clients">
            <div className="p-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200">
              <h2 className="text-xl font-bold mb-2">Gestão de Clientes</h2>
              <p className="text-gray-400">Adicione, edite e visualize informações dos seus clientes.</p>
            </div>
          </Link>
          <Link href="/admin/settings/chart-configs">
            <div className="p-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200">
              <h2 className="text-xl font-bold mb-2">Configuração de Gráficos</h2>
              <p className="text-gray-400">Personalize os gráficos de análise para cada cliente.</p>
            </div>
          </Link>
          <Link href="/admin/settings/dashboard">
            <div className="p-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200">
              <h2 className="text-xl font-bold mb-2">Configurações Dashboard</h2>
              <p className="text-gray-400">Configuração Cards e Openai</p>
            </div>
          </Link>
          {/* Adicionar mais links de configuração aqui conforme necessário */}
        </div>
      </div>
    </DashboardLayout>
  );
}


