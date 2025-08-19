import React from 'react';
import { NodeType } from '@/types/automationTypes';

interface ExecutionControlsProps {
  onExecute: (type: NodeType, target: string) => void;
  isExecuting: boolean;
}

const ExecutionControls: React.FC<ExecutionControlsProps> = ({ onExecute, isExecuting }) => {
  return (
    <div className="execution-controls">
      <h2>Execution Controls</h2>
      {/* Adicione aqui a lógica e o conteúdo dos controles de execução */}
      <button onClick={() => onExecute('email', 'target')} disabled={isExecuting}>
        {isExecuting ? 'Executando...' : 'Executar'}
      </button>
    </div>
  );
};

export default ExecutionControls;

