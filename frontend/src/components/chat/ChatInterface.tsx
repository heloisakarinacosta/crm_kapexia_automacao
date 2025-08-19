"use client";

import React, { useState } from 'react';
import ChatSuggestion from './ChatSuggestion';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

// Tipos para as mensagens e sugestões
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface SuggestionItem {
  id: string;
  text: string;
  icon?: string;
}

const ChatInterface: React.FC = () => {
  // Estado para mensagens - futuramente virá do backend/API
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Estado para controlar se é a primeira interação (mostrar boas-vindas e sugestões)
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  
  // Estado para gerenciar o thread ID da conversa
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Sugestões pré-definidas - futuramente virão de configuração/API
  const suggestions: SuggestionItem[] = [
    { id: 'leads-week', text: 'Quantos leads entraram essa semana?', icon: '👥' },
    { id: 'tasks-pending', text: 'Tarefas pendentes para hoje?', icon: '📋' },
    { id: 'revenue-month', text: 'Qual a receita do mês atual?', icon: '💰' },
  ];

  // Função para enviar mensagem (usuário ou sugestão)
  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // Criar nova mensagem do usuário
    const newUserMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, newUserMessage]);
    
    // Simular resposta do assistente (futuramente será integrado com backend)
    setTimeout(async () => {
      try {
        // Chamar API real do OpenAI
        const token = localStorage.getItem('authToken');
        const requestBody: { message: string; threadId?: string } = { message: content };
        if (threadId && threadId !== 'undefined') {
          requestBody.threadId = threadId;
        }
        
        console.log('[DEBUG Frontend] Enviando:', requestBody);
        
        const response = await fetch('/api/openai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        let assistantContent = '';
        if (response.ok) {
          const data = await response.json();
          console.log('[DEBUG Frontend] Resposta recebida:', data);
          
          // Verificar se a resposta tem o formato esperado
          if (data.success && data.data) {
            // Formato padrão do backend
            assistantContent = data.data.message || 'Resposta não disponível';
            
            // Atualizar threadId se retornado
            if (data.data.threadId && !threadId) {
              setThreadId(data.data.threadId);
            }
          } else if (data.response) {
            // Formato JSON direto com campo "response"
            assistantContent = data.response;
          } else {
            // Fallback
            assistantContent = data.message || data.data?.message || 'Resposta não disponível';
          }
        } else {
          const errorData = await response.json();
          assistantContent = errorData.message || `Erro: ${response.status}`;
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          content: assistantContent,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          content: 'Erro ao processar mensagem. Verifique as configurações do OpenAI.',
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    }, 1000);
    
    // Não é mais a primeira interação
    if (isFirstInteraction) {
      setIsFirstInteraction(false);
    }
  };

  // Função para lidar com clique em sugestão
  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    handleSendMessage(suggestion.text);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Área de mensagens ou boas-vindas */}
      <div className="flex-1 overflow-y-auto p-6">
        {isFirstInteraction && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl text-gray-400 mb-8">Bem-vindo ao chat!</h2>
            <p className="text-gray-500 mb-8">
              Faça perguntas sobre seus dados ou selecione uma das sugestões abaixo.
            </p>
            
            {/* Grid de sugestões */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
              {suggestions.map(suggestion => (
                <ChatSuggestion
                  key={suggestion.id}
                  suggestion={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
      
      {/* Input de mensagem */}
      <div className="border-t border-gray-800 p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
