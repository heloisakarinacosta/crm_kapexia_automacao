import React from 'react';
import { ExecutionLog } from '@/types/automationTypes';

interface ExecutionLogsProps {
  logs: ExecutionLog[];
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs }) => {
  return (
    <div className="execution-logs">
      <h2>Execution Logs</h2>
      {/* Renderizar logs de execução */}
      {logs.map((log, index) => (
        <div key={index}>
          <p>Timestamp: {log.timestamp.toLocaleString()}</p>
          <p>Status: {log.status}</p>
          <p>Mensagem: {log.message}</p>
        </div>
      ))}
    </div>
  );
};

export default ExecutionLogs;

