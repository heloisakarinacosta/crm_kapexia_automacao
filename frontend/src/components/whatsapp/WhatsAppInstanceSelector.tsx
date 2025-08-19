"use client";

import React from 'react';

interface WhatsAppInstance {
  id: number;
  name: string;
  instance_key: string;
  provider: string;
  status: 'active' | 'inactive' | 'connecting';
  phone_number?: string;
}

interface WhatsAppInstanceSelectorProps {
  instances: WhatsAppInstance[];
  selectedInstance: WhatsAppInstance | null;
  onInstanceChange: (instance: WhatsAppInstance) => void;
}

const WhatsAppInstanceSelector: React.FC<WhatsAppInstanceSelectorProps> = ({
  instances,
  selectedInstance,
  onInstanceChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      case 'inactive':
        return 'Desconectado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedInstance?.id || ''}
        onChange={(e) => {
          const instance = instances.find(i => i.id === parseInt(e.target.value));
          if (instance) {
            onInstanceChange(instance);
          }
        }}
        className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        <option value="">Selecione uma instância</option>
        {instances.map((instance) => (
          <option key={instance.id} value={instance.id}>
            {instance.name} ({instance.provider})
          </option>
        ))}
      </select>
      
      {selectedInstance && (
        <div className="mt-2 flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInstance.status)}`}
          >
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 fill-current" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            {getStatusText(selectedInstance.status)}
          </span>
          
          {selectedInstance.phone_number && (
            <span className="text-sm text-gray-500">
              {selectedInstance.phone_number}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppInstanceSelector;

