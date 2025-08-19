"use client";

import React from 'react';
// import ReactMarkdown from 'react-markdown'; // Não é mais necessário

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (!isUser) {
    // Logar o conteúdo da mensagem do assistant para depuração
    console.log('[DEBUG HTML] Conteúdo da resposta do assistant:', message.content);
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-3/4 rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-white'
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div
            className="markdown"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
