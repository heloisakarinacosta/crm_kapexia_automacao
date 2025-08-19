import React from 'react';
import { TimelineNode, NodeType } from '@/types/automationTypes';

interface WorkflowCanvasProps {
  nodes: TimelineNode[];
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onSelectNode: React.Dispatch<React.SetStateAction<TimelineNode | null>>;
  onUpdateNode: (nodeId: string, updates: Partial<TimelineNode>) => void;
  onRemoveNode: (nodeId: string) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  onAddNode,
  onSelectNode,
  onUpdateNode,
  onRemoveNode,
}) => {
  return (
    <div className="workflow-canvas">
      <h2>Workflow Canvas</h2>
      {/* Renderizar nós */}
      {nodes.map((node) => (
        <div key={node.id} style={{ position: 'absolute', left: node.position.x, top: node.position.y }}>
          <h3>{node.title}</h3>
          <button onClick={() => onSelectNode(node)}>Selecionar</button>
          <button onClick={() => onUpdateNode(node.id, { title: node.title + ' (Atualizado)' })}>Atualizar</button>
          <button onClick={() => onRemoveNode(node.id)}>Remover</button>
        </div>
      ))}
      {/* Botão para adicionar um novo nó */}
      <button onClick={() => onAddNode('email', { x: 100, y: 100 })}>Adicionar Nó</button>
    </div>
  );
};

export default WorkflowCanvas;

