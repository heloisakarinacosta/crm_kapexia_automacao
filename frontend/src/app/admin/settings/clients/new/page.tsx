"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';

interface ClientFormData {
  name: string;
  trading_name: string;
  cnpj: string;
  address: string;
  phone: string;
  profile: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    trading_name: '',
    cnpj: '',
    address: '',
    phone: '',
    profile: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/settings/clients');
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao criar cliente');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao criar cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-light">NOVO CLIENTE</h1>
          <p className="text-gray-400 mt-2">Preencha as informações do cliente</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome da empresa"
                />
              </div>

              <div>
                <label htmlFor="trading_name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  id="trading_name"
                  name="trading_name"
                  value={formData.trading_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome fantasia"
                />
              </div>

              <div>
                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-300 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Endereço
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o endereço completo"
              />
            </div>

            <div>
              <label htmlFor="profile" className="block text-sm font-medium text-gray-300 mb-2">
                Perfil da Empresa
              </label>
              <textarea
                id="profile"
                name="profile"
                value={formData.profile}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o perfil e atividades da empresa"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors duration-200"
              >
                {loading ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

