"use client"

import { useRef } from "react"
import { useDrop } from "react-dnd"
import type { TimelineNode, NodeType } from "@/types/estrategias"
import { NodeComponent } from "./NodeComponent"

interface WorkflowCanvasProps {
  nodes: TimelineNode[]
  setNodes: (nodes: TimelineNode[] | ((prev: TimelineNode[]) => TimelineNode[])) => void
  selectedNode: TimelineNode | null
  setSelectedNode: (node: TimelineNode | null) => void
  zoom: number
  pan: { x: number; y: number }
  onTestNode: (nodeId: string) => void
}

export function WorkflowCanvas({
  nodes,
  setNodes,
  selectedNode,
  setSelectedNode,
  zoom,
  pan,
  onTestNode,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: (item: { type: NodeType; title: string; icon: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left - pan.x) / zoom
        const y = (offset.y - canvasRect.top - pan.y) / zoom

        const newNode: TimelineNode = {
          id: `workflow-${Date.now()}`,
          type: item.type,
          position: { x, y },
          day: -999, // Workflow geral
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
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle, #e5e7eb 1px, transparent 1px)
        `,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
        className="relative w-full h-full"
      >
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={setSelectedNode}
            onMove={moveNode}
            onDelete={deleteNode}
            onTest={() => onTestNode(node.id)}
            isExecuting={false}
            showTestButton={true}
          />
        ))}

        {isOver && (
          <div className="absolute inset-0 bg-cyan-100 bg-opacity-30 border-2 border-dashed border-cyan-400 pointer-events-none rounded-lg" />
        )}
      </div>
    </div>
  )
}
