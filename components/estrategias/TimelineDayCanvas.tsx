"use client"

import { useRef } from "react"
import { useDrop } from "react-dnd"
import type { TimelineNode, NodeType } from "@/types/estrategias"
import { NodeComponent } from "./NodeComponent"

interface TimelineDayCanvasProps {
  day: number
  nodes: TimelineNode[]
  allNodes: TimelineNode[]
  setNodes: (nodes: TimelineNode[] | ((prev: TimelineNode[]) => TimelineNode[])) => void
  selectedNode: TimelineNode | null
  setSelectedNode: (node: TimelineNode | null) => void
  currentExecutionDay: number | null
  isExecuting: boolean
  zoom: number
  pan: { x: number; y: number }
  onTestNode: (nodeId: string) => void
}

export function TimelineDayCanvas({
  day,
  nodes,
  allNodes,
  setNodes,
  selectedNode,
  setSelectedNode,
  currentExecutionDay,
  isExecuting,
  zoom,
  pan,
  onTestNode,
}: TimelineDayCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: (item: { type: NodeType; title: string; icon: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left) / zoom
        const y = (offset.y - canvasRect.top) / zoom

        const newNode: TimelineNode = {
          id: `node-${day}-${Date.now()}`,
          type: item.type,
          position: { x: Math.max(10, x - 70), y: Math.max(10, y - 20) },
          day: day,
          title: item.title,
          config: {},
        }

        setNodes((prev) => [...prev, newNode])
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const moveNode = (id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, position } : node)))
  }

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    if (selectedNode?.id === id) {
      setSelectedNode(null)
    }
  }

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        drop(node)
      }}
      className="w-full h-full relative bg-white"
      style={{
        backgroundImage: `
          radial-gradient(circle, #f3f4f6 1px, transparent 1px)
        `,
        backgroundSize: `${15 * zoom}px ${15 * zoom}px`,
      }}
    >
      <div className="relative w-full h-full">
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={setSelectedNode}
            onMove={moveNode}
            onDelete={deleteNode}
            onTest={() => onTestNode(node.id)}
            isExecuting={isExecuting && currentExecutionDay === day}
            showTestButton={true}
          />
        ))}

        {isOver && (
          <div className="absolute inset-0 bg-cyan-100 bg-opacity-10 border-2 border-dashed border-cyan-400 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
