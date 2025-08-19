export type NodeType = 
  | 'email' 
  | 'sms' 
  | 'whatsapp' 
  | 'webhook' 
  | 'delay' 
  | 'condition'
  | 'tag'
  | 'score';

export interface Node {
  id: string;
  type: NodeType; // ← Deve usar NodeType, não string
  position: { x: number; y: number };
  day: number;
  title: string;
  config: Record<string, unknown>;
}

export interface TimelineNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  day: number;
  title: string;
  config: Record<string, unknown>; // Substituir 'any' por 'unknown'
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  day: number;
  timestamp: Date;
  status: "success" | "error" | "running" | "pending";
  message: string;
  details?: Record<string, unknown>; // Substituir 'any' por 'unknown'
}

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  dataInicial: string;
  diasUteis: boolean;
  timelineDays: number[];
  nodes: TimelineNode[];
  createdAt: Date;
  updatedAt: Date;
}
