import React from 'react';
import { TimelineNode } from '@/types/automationTypes';

interface PropertiesPanelProps {
  node: TimelineNode;
  onUpdate: (updates: Partial<TimelineNode>) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdate, onClose }) => {
  return (
    <div className="properties-panel">
      <h2>Properties Panel</h2>
      <p>ID do Nó: {node.id}</p>
      <p>Título: {node.title}</p>
      <button onClick={() => onUpdate({ title: node.title + ' (Atualizado)' })}>Atualizar</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
};

export default PropertiesPanel;

