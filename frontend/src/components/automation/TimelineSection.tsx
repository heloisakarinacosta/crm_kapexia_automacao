import React from 'react';
import { TimelineNode, NodeType } from '@/types/automationTypes';

interface TimelineSectionProps {
  days: number[];
  nodes: TimelineNode[];
  dataInicial: string;
  diasUteis: boolean;
  onAddNode: (type: NodeType, day: number, position: { x: number; y: number }) => void;
  onSelectNode: React.Dispatch<React.SetStateAction<TimelineNode | null>>;
  onUpdateNode: (nodeId: string, updates: Partial<TimelineNode>) => void;
  onRemoveNode: (nodeId: string) => void;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  days,
  nodes,
  dataInicial,
  diasUteis,
  onAddNode,
  onSelectNode,
  onUpdateNode,
  onRemoveNode,
}) => {
  // Exemplo de uso significativo de 'dataInicial' e 'diasUteis'
  const formattedDate = new Date(dataInicial).toLocaleDateString();
  const workingDays = diasUteis ? 'Sim' : 'Não';

  return (
    <div className="timeline-section">
      <h2>Timeline Section</h2>
      <p>Data Inicial Formatada: {formattedDate}</p>
      <p>São Dias Úteis: {workingDays}</p>
      {/* Renderizar dias */}
      {days.length > 0 ? (
        days.map((day, index) => (
          <div key={index}>
            <h3>Dia {day}</h3>
            {/* Renderizar nós para cada dia */}
            {nodes.filter(node => node.day === day).map(node => (
              <div key={node.id} style={{ position: 'absolute', left: node.position.x, top: node.position.y }}>
                <h4>{node.title}</h4>
                <button onClick={() => onSelectNode(node)}>Selecionar</button>
                <button onClick={() => onUpdateNode(node.id, { title: node.title + ' (Atualizado)' })}>Atualizar</button>
                <button onClick={() => onRemoveNode(node.id)}>Remover</button>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>Nenhum dia disponível.</p>
      )}
      {/* Botão para adicionar um novo nó */}
      <button onClick={() => onAddNode('email', 0, { x: 100, y: 100 })}>Adicionar Nó</button>
    </div>
  );
};

export default TimelineSection;

