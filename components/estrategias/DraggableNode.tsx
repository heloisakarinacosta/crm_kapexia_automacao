"use client"

import { useDrag } from "react-dnd"
import { Card } from "@/components/ui/card"
import type { NodeType } from "@/types/estrategias"

interface DraggableNodeProps {
  type: NodeType
  title: string
  icon: string
  className?: string
}

export function DraggableNode({ type, title, icon, className }: DraggableNodeProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node",
    item: { type, title, icon },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <Card
      ref={drag}
      className={`p-3 cursor-move transition-all hover:shadow-md ${className} ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-light text-gray-700">{title}</span>
      </div>
    </Card>
  )
}
