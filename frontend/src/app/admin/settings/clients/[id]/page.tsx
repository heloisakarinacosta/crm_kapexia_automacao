"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter, useParams } from 'next/navigation';

interface ClientFormData {
  name: string;
  trading_name: string;
  cnpj: string;
  address: string;
  phone: string;
  profile: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  client_id?: number;
  client_name?: string;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    trading_name: '',
    cnpj: '',
    address: '',
    phone: '',
    profile: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClient = useCallback(async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.data.name || '',
          trading_name: data.data.trading_name || '',
          cnpj: data.data.cnpj || '',
          address: data.data.address || '',
          phone: data.data.phone || '',
          profile: data.data.profile || ''
        });
      } else {
        setError('Cliente não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar cliente');
      console.error('Erro ao carregar cliente:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      loadClient();
      loadUsers();
    }
  }, [clientId, loadClient, loadUsers]);

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
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
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
        setError(data.message || 'Erro ao atualizar cliente');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro ao atualizar cliente:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssociateUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/client`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ client_id: parseInt(clientId) })
      });

      if (response.ok) {
        loadUsers(); // Recarregar lista de usuários
      } else {
        alert('Erro ao associar usuário');
      }
    } catch (err) {
      alert('Erro de conexão');
      console.error('Erro ao associar usuário:', err);
    }
  };

  const handleDisassociateUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/client`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ client_id: null })
      });

      if (response.ok) {
        loadUsers(); // Recarregar lista de usuários
      } else {
        alert('Erro ao desassociar usuário');
      }
    } catch (err) {
      alert('Erro de conexão');
      console.error('Erro ao desassociar usuário:', err);
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
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-montserrat font-light">EDITAR CLIENTE</h1>
          <p className="text-gray-400 mt-2">Atualize as informações do cliente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário do Cliente */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Cliente</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-600 text-white p-4 rounded-lg">
                  {error}
                </div>
              )}

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
                />
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
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors duration-200"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          {/* Gestão de Usuários */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Usuários Associados</h2>
            
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {user.client_name && (
                      <p className="text-xs text-blue-400">Cliente: {user.client_name}</p>
                    )}
                  </div>
                  <div>
                    {user.client_id === parseInt(clientId) ? (
                      <button
                        onClick={() => handleDisassociateUser(user.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors duration-200"
                      >
                        Desassociar
                      </button>
                    ) : user.client_id ? (
                      <span className="px-3 py-1 bg-gray-600 text-gray-300 text-sm rounded">
                        Outro Cliente
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAssociateUser(user.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors duration-200"
                      >
                        Associar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <p className="text-gray-400 text-center py-4">Nenhum usuário encontrado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

