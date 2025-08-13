"use client"

import { useRef, useCallback } from "react"
import { useDrop } from "react-dnd"
import type { TimelineNode, NodeType } from "@/types/estrategias"
import { TimelineHeader } from "./TimelineHeader"
import { NodeComponent } from "./NodeComponent"
import { ConnectionLines } from "./ConnectionLines"

interface TimelineCanvasProps {
  nodes: TimelineNode[]
  setNodes: (nodes: TimelineNode[] | ((prev: TimelineNode[]) => TimelineNode[])) => void
  selectedNode: TimelineNode | null
  setSelectedNode: (node: TimelineNode | null) => void
  timelineDays: number[]
  setTimelineDays: (days: number[] | ((prev: number[]) => number[])) => void
  dataInicial: string
  diasUteis: boolean
  isExecuting: boolean
  currentExecutionDay: number | null
  zoom: number
  pan: { x: number; y: number }
}

export function TimelineCanvas({
  nodes,
  setNodes,
  selectedNode,
  setSelectedNode,
  timelineDays,
  setTimelineDays,
  dataInicial,
  diasUteis,
  isExecuting,
  currentExecutionDay,
  zoom,
  pan,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: (item: { type: NodeType; title: string; icon: string }, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left - pan.x) / zoom
        const y = (offset.y - canvasRect.top - pan.y) / zoom

        // Determinar em qual dia da timeline o nó foi solto
        const timelineY = 200 // Posição Y da timeline
        let targetDay = 0

        if (y > timelineY - 50 && y < timelineY + 100) {
          // Calcular qual dia baseado na posição X
          const dayWidth = 150
          const startX = 100
          const dayIndex = Math.floor((x - startX) / dayWidth)
          targetDay = timelineDays[dayIndex] || 0
        }

        const newNode: TimelineNode = {
          id: `node-${Date.now()}`,
          type: item.type,
          position: { x, y },
          day: targetDay,
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

  const moveNode = useCallback(
    (id: string, position: { x: number; y: number }, day?: number) => {
      setNodes((prev) =>
        prev.map((node) => (node.id === id ? { ...node, position, ...(day !== undefined && { day }) } : node)),
      )
    },
    [setNodes],
  )

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id))
      if (selectedNode?.id === id) {
        setSelectedNode(null)
      }
    },
    [setNodes, selectedNode, setSelectedNode],
  )

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        drop(node)
      }}
      className="w-full h-full relative bg-gray-50"
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
        {/* Timeline Header */}
        <TimelineHeader
          timelineDays={timelineDays}
          setTimelineDays={setTimelineDays}
          dataInicial={dataInicial}
          diasUteis={diasUteis}
          currentExecutionDay={currentExecutionDay}
          isExecuting={isExecuting}
        />

        {/* Connection Lines */}
        <ConnectionLines nodes={nodes} />

        {/* Nodes */}
        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={setSelectedNode}
            onMove={moveNode}
            onDelete={deleteNode}
            isExecuting={isExecuting && currentExecutionDay === node.day}
          />
        ))}

        {/* Drop Overlay */}
        {isOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-30 border-2 border-dashed border-blue-400 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
