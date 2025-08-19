"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import WhatsAppMessageBubble from './WhatsAppMessageBubble';
import WhatsAppMediaUpload from './WhatsAppMediaUpload';

interface WhatsAppMessage {
  id: number;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  media_url?: string;
  media_filename?: string;
  is_from_contact: boolean;
  sent_at: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  sender_name?: string;
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

interface WhatsAppChatInterfaceProps {
  chat: WhatsAppChat;
  instanceId?: number;
  onChatUpdate: (chat: WhatsAppChat) => void;
}

const WhatsAppChatInterface: React.FC<WhatsAppChatInterfaceProps> = ({
  chat,
  onChatUpdate
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/chats/${chat.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [chat.id]);

  const markAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch(`/api/whatsapp/chats/${chat.id}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Atualizar o chat para remover contador de não lidas
      if (chat.unread_count > 0) {
        onChatUpdate({ ...chat, unread_count: 0 });
      }
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  }, [chat, onChatUpdate]);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [chat.id, loadMessages, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendTextMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/chats/${chat.id}/messages/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        
        // Atualizar última mensagem do chat
        onChatUpdate({
          ...chat,
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const sendMediaMessage = async (file: File, caption?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('media', file);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await fetch(`/api/whatsapp/chats/${chat.id}/messages/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        
        // Atualizar última mensagem do chat
        const lastMessage = caption || `📎 ${file.name}`;
        onChatUpdate({
          ...chat,
          last_message: lastMessage,
          last_message_time: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const handleChatAction = async (action: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/whatsapp/chats/${chat.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        onChatUpdate(data.data);
      }
    } catch (error) {
      console.error(`Erro ao ${action} chat:`, error);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  return (
    <div className="h-full flex flex-col">
      {/* Header do chat */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {chat.contact_name ? chat.contact_name.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {chat.contact_name || 'Contato'}
              </h3>
              <p className="text-sm text-gray-500">{chat.contact_phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {chat.status === 'open' && (
              <>
                <button
                  onClick={() => handleChatAction('resolve')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  ✓ Resolver
                </button>
                <button
                  onClick={() => handleChatAction('archive')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  📁 Arquivar
                </button>
              </>
            )}
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando mensagens...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <p className="mt-2">Nenhuma mensagem ainda</p>
            <p className="text-sm">Envie a primeira mensagem para iniciar a conversa</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <WhatsAppMessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end space-x-3">
          {/* Botão de anexo */}
          <button
            onClick={() => setShowMediaUpload(true)}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Campo de texto */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="block w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          {/* Botão de enviar */}
          <button
            onClick={sendTextMessage}
            disabled={!newMessage.trim() || sending}
            className={`flex-shrink-0 p-2 rounded-full ${
              newMessage.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Modal de upload de mídia */}
      {showMediaUpload && (
        <WhatsAppMediaUpload
          onClose={() => setShowMediaUpload(false)}
          onSend={sendMediaMessage}
        />
      )}
    </div>
  );
};

export default WhatsAppChatInterface;

