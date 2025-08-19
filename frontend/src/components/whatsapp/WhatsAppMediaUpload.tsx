"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface WhatsAppMediaUploadProps {
  onClose: () => void;
  onSend: (file: File, caption?: string) => void;
}

const WhatsAppMediaUpload: React.FC<WhatsAppMediaUploadProps> = ({ onClose, onSend }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onSend(selectedFile, caption);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type);
  };

  const isValidFileSize = (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return file.size <= maxSize;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enviar Mídia</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedFile ? (
            /* File selection area */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Clique para selecionar</span> ou arraste um arquivo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Imagens, vídeos, áudios ou documentos até 50MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
              />

              {/* Quick action buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-2xl mb-1">🖼️</span>
                  <span className="text-xs text-gray-600">Imagem</span>
                </button>
                
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'video/*';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-2xl mb-1">🎥</span>
                  <span className="text-xs text-gray-600">Vídeo</span>
                </button>
                
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex flex-col items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-2xl mb-1">📄</span>
                  <span className="text-xs text-gray-600">Documento</span>
                </button>
              </div>
            </div>
          ) : (
            /* File preview and caption */
            <div className="space-y-4">
              {/* File preview */}
              <div className="border border-gray-200 rounded-lg p-4">
                {preview ? (
                  <Image src={preview} alt="Preview" width={384} height={192} className="max-w-full h-48 object-contain mx-auto rounded" />
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getFileIcon(selectedFile.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation messages */}
              {!isValidFileType(selectedFile) && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">
                    Tipo de arquivo não suportado. Selecione uma imagem, vídeo, áudio ou documento.
                  </p>
                </div>
              )}

              {!isValidFileSize(selectedFile) && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">
                    Arquivo muito grande. O tamanho máximo é 50MB.
                  </p>
                </div>
              )}

              {/* Caption input */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
                  Legenda (opcional)
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Adicione uma legenda..."
                  rows={3}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setCaption('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Trocar Arquivo
                </button>
                
                <button
                  onClick={handleSend}
                  disabled={uploading || !isValidFileType(selectedFile) || !isValidFileSize(selectedFile)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    uploading || !isValidFileType(selectedFile) || !isValidFileSize(selectedFile)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMediaUpload;

