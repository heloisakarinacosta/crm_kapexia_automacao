"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import WhatsAppInstanceSelector from '../../../components/whatsapp/WhatsAppInstanceSelector';
import WhatsAppChatList from '../../../components/whatsapp/WhatsAppChatList';
import WhatsAppChatInterface from '../../../components/whatsapp/WhatsAppChatInterface';
import WhatsAppStats from '../../../components/whatsapp/WhatsAppStats';

interface WhatsAppInstance {
  id: number;
  name: string;
  instance_key: string;
  provider: string;
  status: 'active' | 'inactive' | 'connecting';
  phone_number?: string;
}

interface WhatsAppChat {
  id: number;
  contact_name: string;
  contact_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'open' | 'resolved' | 'archived';
  assigned_user_id?: number;
  assigned_user_name?: string;
}

export default function WhatsAppPage() {
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar instâncias do usuário
  useEffect(() => {
    loadInstances();
  }, []);

  // Carregar chats quando uma instância é selecionada
  useEffect(() => {
    if (selectedInstance) {
      loadChats(selectedInstance.id);
    }
  }, [selectedInstance]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/whatsapp/instances', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar instâncias');
      }

      const data = await response.json();
      setInstances(data.data || []);
      
      // Selecionar a primeira instância ativa automaticamente
      const activeInstance = data.data?.find((instance: WhatsAppInstance) => instance.status === 'active');
      if (activeInstance) {
        setSelectedInstance(activeInstance);
      }
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
      setError('Erro ao carregar instâncias do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async (instanceId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/instances/${instanceId}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar chats');
      }

      const data = await response.json();
      setChats(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      setError('Erro ao carregar conversas');
    }
  };

  const handleInstanceChange = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setSelectedChat(null); // Limpar chat selecionado ao trocar de instância
  };

  const handleChatSelect = (chat: WhatsAppChat) => {
    setSelectedChat(chat);
  };

  const handleChatUpdate = (updatedChat: WhatsAppChat) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );
    
    if (selectedChat?.id === updatedChat.id) {
      setSelectedChat(updatedChat);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando WhatsApp...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button 
                onClick={loadInstances}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (instances.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma instância WhatsApp</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure uma instância WhatsApp para começar a usar o atendimento.
          </p>
          <div className="mt-6">
            <a
              href="/admin/whatsapp/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Configurar Instância
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout noMargin>
      <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(44, 224, 208, 0.08)', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header com seletor de instância e estatísticas */}
        <div className="bg-white border-b border-gray-200 px-6 py-4" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">WhatsApp</h1>
              <WhatsAppInstanceSelector
                instances={instances}
                selectedInstance={selectedInstance}
                onInstanceChange={handleInstanceChange}
              />
            </div>
            
            {selectedInstance && (
              <WhatsAppStats instanceId={selectedInstance.id} />
            )}
          </div>
        </div>

        {/* Área principal com lista de chats e interface de conversa */}
        <div className="flex-1 flex overflow-hidden" style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
          {/* Lista de chats */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <WhatsAppChatList
              chats={chats}
              selectedChat={selectedChat}
              onChatSelect={handleChatSelect}
              onChatUpdate={handleChatUpdate}
              instanceId={selectedInstance?.id}
            />
          </div>

          {/* Interface de conversa */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <WhatsAppChatInterface
                chat={selectedChat}
                instanceId={selectedInstance?.id}
                onChatUpdate={handleChatUpdate}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Selecione uma conversa</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Escolha uma conversa da lista para começar a atender.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

