"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface Client {
  id: number;
  name: string;
  trading_name?: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  profile?: string;
  created_at: string;
  updated_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      } else {
        setError('Erro ao carregar clientes');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setClients(clients.filter(client => client.id !== id));
      } else {
        alert('Erro ao excluir cliente');
      }
    } catch (err) {
      alert('Erro de conexão');
      console.error('Erro ao excluir cliente:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-montserrat font-light">GESTÃO DE CLIENTES</h1>
          <Link 
            href="/admin/settings/clients/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Adicionar Cliente
          </Link>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-lg mb-4">Nenhum cliente cadastrado</p>
              <Link 
                href="/admin/settings/clients/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-block"
              >
                Cadastrar Primeiro Cliente
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nome Fantasia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {client.trading_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {client.cnpj || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {client.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/settings/clients/${client.id}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

