"use client"
import { DraggableNode } from "./DraggableNode"
import type { NodeType } from "@/types/estrategias"

const nodeCategories = {
  entrada: {
    title: "Entrada",
    color: "bg-cyan-100 border-cyan-300",
    nodes: [
      { type: "data-import" as NodeType, title: "Importar Dados", icon: "📊" },
      { type: "database-query" as NodeType, title: "Consulta BD", icon: "🗄️" },
      { type: "time-trigger" as NodeType, title: "Gatilho Tempo", icon: "⏰" },
      { type: "lead-event" as NodeType, title: "Evento Lead", icon: "👤" },
    ],
  },
  acoes: {
    title: "Ações",
    color: "bg-teal-100 border-teal-300",
    nodes: [
      { type: "send-whatsapp" as NodeType, title: "Enviar WhatsApp", icon: "💬" },
      { type: "send-email" as NodeType, title: "Enviar E-mail", icon: "📧" },
      { type: "http-request" as NodeType, title: "HTTP Request", icon: "🌐" },
      { type: "create-task" as NodeType, title: "Criar Tarefa", icon: "✅" },
      { type: "wait-delay" as NodeType, title: "Aguardar", icon: "⏳" },
    ],
  },
  logica: {
    title: "Lógica",
    color: "bg-purple-100 border-purple-300",
    nodes: [
      { type: "condition" as NodeType, title: "Condição (IF)", icon: "🔀" },
      { type: "javascript" as NodeType, title: "Código JS", icon: "⚡" },
    ],
  },
  dados: {
    title: "Dados",
    color: "bg-yellow-100 border-yellow-300",
    nodes: [
      { type: "set-variable" as NodeType, title: "Definir Variável", icon: "📝" },
      { type: "transform-data" as NodeType, title: "Transformar Dados", icon: "🔄" },
      { type: "filter-records" as NodeType, title: "Filtrar Registros", icon: "🔍" },
    ],
  },
}

export function NodeSidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Componentes</h2>

      {Object.entries(nodeCategories).map(([key, category]) => (
        <div key={key} className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{category.title}</h3>

          <div className="space-y-2">
            {category.nodes.map((node) => (
              <DraggableNode
                key={node.type}
                type={node.type}
                title={node.title}
                icon={node.icon}
                className={category.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
