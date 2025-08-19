"use client";

import React, { useState, useEffect } from 'react';

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

interface WhatsAppChatListProps {
  chats: WhatsAppChat[];
  selectedChat: WhatsAppChat | null;
  onChatSelect: (chat: WhatsAppChat) => void;
  onChatUpdate: (chat: WhatsAppChat) => void;
  instanceId?: number;
}

const WhatsAppChatList: React.FC<WhatsAppChatListProps> = ({
  chats,
  selectedChat,
  onChatSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'archived'>('all');
  const [filteredChats, setFilteredChats] = useState<WhatsAppChat[]>([]);

  useEffect(() => {
    let filtered = chats;

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(chat => chat.status === filterStatus);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(chat =>
        chat.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.contact_phone.includes(searchTerm) ||
        chat.last_message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por última mensagem (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

    setFilteredChats(filtered);
  }, [chats, searchTerm, filterStatus]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'resolved':
        return 'Resolvido';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header com busca e filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          {/* Busca */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Filtros */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Todos', count: chats.length },
              { key: 'open', label: 'Abertos', count: chats.filter(c => c.status === 'open').length },
              { key: 'resolved', label: 'Resolvidos', count: chats.filter(c => c.status === 'resolved').length },
              { key: 'archived', label: 'Arquivados', count: chats.filter(c => c.status === 'archived').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as 'all' | 'open' | 'resolved' | 'archived')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filterStatus === filter.key
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || filterStatus !== 'all' ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Nome e telefone */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.contact_name || chat.contact_phone}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(chat.last_message_time)}
                      </span>
                    </div>

                    {/* Última mensagem */}
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {chat.last_message}
                    </p>

                    {/* Status e informações */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(chat.status)}`}>
                          {getStatusText(chat.status)}
                        </span>
                        
                        {chat.assigned_user_name && (
                          <span className="text-xs text-gray-500">
                            👤 {chat.assigned_user_name}
                          </span>
                        )}
                      </div>

                      {chat.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer com ações rápidas */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{filteredChats.length} conversas</span>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChatList;

