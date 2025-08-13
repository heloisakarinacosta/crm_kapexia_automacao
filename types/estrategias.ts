export type NodeType =
  | "data-import"
  | "database-query"
  | "time-trigger"
  | "lead-event"
  | "send-whatsapp"
  | "send-email"
  | "http-request"
  | "create-task"
  | "wait-delay"
  | "condition"
  | "javascript"
  | "set-variable"
  | "transform-data"
  | "filter-records"

export interface TimelineNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  day: number
  title: string
  config: Record<string, any>
}

export interface ExecutionLog {
  id: string
  nodeId: string
  day: number
  timestamp: Date
  status: "success" | "error" | "running" | "pending"
  message: string
  details?: Record<string, any>
}

export interface StrategyConfig {
  id: string
  name: string
  description: string
  dataInicial: string
  diasUteis: boolean
  timelineDays: number[]
  nodes: TimelineNode[]
  createdAt: Date
  updatedAt: Date
}
