"use client"

import { useRef } from "react"
import { useDrag } from "react-dnd"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { TimelineNode } from "@/types/estrategias"
import { X, TestTube } from "lucide-react"

interface NodeComponentProps {
  node: TimelineNode
  isSelected: boolean
  onSelect: (node: TimelineNode) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onDelete: (id: string) => void
  onTest?: () => void
  isExecuting: boolean
  showTestButton?: boolean
}

const nodeIcons: Record<string, string> = {
  "data-import": "📊",
  "database-query": "🗄️",
  "time-trigger": "⏰",
  "lead-event": "👤",
  "send-whatsapp": "💬",
  "send-email": "📧",
  "http-request": "🌐",
  "create-task": "✅",
  "wait-delay": "⏳",
  condition: "🔀",
  javascript: "⚡",
  "set-variable": "📝",
  "transform-data": "🔄",
  "filter-records": "🔍",
}

const nodeColors: Record<string, string> = {
  "data-import": "bg-cyan-100 border-cyan-300",
  "database-query": "bg-cyan-100 border-cyan-300",
  "time-trigger": "bg-cyan-100 border-cyan-300",
  "lead-event": "bg-cyan-100 border-cyan-300",
  "send-whatsapp": "bg-teal-100 border-teal-300",
  "send-email": "bg-teal-100 border-teal-300",
  "http-request": "bg-teal-100 border-teal-300",
  "create-task": "bg-teal-100 border-teal-300",
  "wait-delay": "bg-teal-100 border-teal-300",
  condition: "bg-purple-100 border-purple-300",
  javascript: "bg-purple-100 border-purple-300",
  "set-variable": "bg-yellow-100 border-yellow-300",
  "transform-data": "bg-yellow-100 border-yellow-300",
  "filter-records": "bg-yellow-100 border-yellow-300",
}

export function NodeComponent({
  node,
  isSelected,
  onSelect,
  onMove,
  onDelete,
  onTest,
  isExecuting,
  showTestButton = false,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "existing-node",
    item: { id: node.id, position: node.position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        const newPosition = {
          x: Math.max(0, node.position.x + delta.x),
          y: Math.max(0, node.position.y + delta.y),
        }
        onMove(node.id, newPosition)
      }
    },
  }))

  drag(nodeRef)

  return (
    <div
      ref={nodeRef}
      className="absolute"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? "rotate(2deg)" : "none",
      }}
    >
      <Card
        className={`
          p-3 cursor-move transition-all min-w-[140px] relative border-2
          ${nodeColors[node.type] || "bg-gray-100 border-gray-300"}
          ${isSelected ? "ring-2 ring-cyan-400" : ""}
          ${isExecuting ? "animate-pulse ring-2 ring-cyan-400" : ""}
          ${isDragging ? "opacity-50 shadow-lg" : ""}
        `}
        onClick={() => onSelect(node)}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(node.id)
          }}
        >
          <X className="w-3 h-3" />
        </Button>

        {showTestButton && onTest && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -left-2 w-6 h-6 p-0 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onTest()
            }}
          >
            <TestTube className="w-3 h-3" />
          </Button>
        )}

        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{nodeIcons[node.type] || "⚙️"}</span>
          <span className="text-sm font-medium text-gray-800">{node.title}</span>
        </div>

        {node.day !== -999 && (
          <div className="text-xs text-gray-600">
            Dia {node.day > 0 ? "+" : ""}
            {node.day}
          </div>
        )}

        {isExecuting && (
          <div className="absolute inset-0 bg-cyan-400 bg-opacity-30 rounded flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Card>
    </div>
  )
}
