"use client";

import React from 'react';
import Image from 'next/image';

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

interface WhatsAppMessageBubbleProps {
  message: WhatsAppMessage;
}

const WhatsAppMessageBubble: React.FC<WhatsAppMessageBubbleProps> = ({ message }) => {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '🕐';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'text-blue-500';
      case 'delivered':
        return 'text-gray-500';
      case 'sent':
        return 'text-gray-500';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderMediaContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="mb-2">
            <Image
              src={message.media_url || ''}
              alt="Imagem"
              width={384}
              height={256}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(message.media_url, '_blank')}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="mb-2">
            <audio controls className="max-w-xs">
              <source src={message.media_url} type="audio/mpeg" />
              Seu navegador não suporta áudio.
            </audio>
          </div>
        );

      case 'video':
        return (
          <div className="mb-2">
            <video controls className="max-w-xs rounded-lg">
              <source src={message.media_url} type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>
          </div>
        );

      case 'document':
        return (
          <div className="mb-2">
            <a
              href={message.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {message.media_filename || 'Documento'}
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  const isFromContact = message.is_from_contact;

  return (
    <div className={`flex ${isFromContact ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isFromContact
            ? 'bg-white border border-gray-200 text-gray-900'
            : 'bg-blue-600 text-white'
        }`}
      >
        {/* Nome do remetente (apenas para mensagens recebidas) */}
        {isFromContact && message.sender_name && (
          <div className="text-xs text-gray-500 mb-1 font-medium">
            {message.sender_name}
          </div>
        )}

        {/* Conteúdo de mídia */}
        {message.message_type !== 'text' && renderMediaContent()}

        {/* Conteúdo de texto */}
        {message.content && (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}

        {/* Horário e status */}
        <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
          isFromContact ? 'text-gray-500' : 'text-blue-100'
        }`}>
          <span>{formatTime(message.sent_at)}</span>
          {!isFromContact && (
            <span className={getStatusColor(message.status)}>
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessageBubble;

