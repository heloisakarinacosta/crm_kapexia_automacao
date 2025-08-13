"use client"

import type { TimelineNode } from "@/types/estrategias"

interface ConnectionLinesProps {
  nodes: TimelineNode[]
}

export function ConnectionLines({ nodes }: ConnectionLinesProps) {
  // Agrupar nós por dia
  const nodesByDay = nodes.reduce(
    (acc, node) => {
      if (!acc[node.day]) acc[node.day] = []
      acc[node.day].push(node)
      return acc
    },
    {} as Record<number, TimelineNode[]>,
  )

  const connections: Array<{ from: TimelineNode; to: TimelineNode }> = []

  // Criar conexões entre dias consecutivos
  const sortedDays = Object.keys(nodesByDay)
    .map(Number)
    .sort((a, b) => a - b)

  for (let i = 0; i < sortedDays.length - 1; i++) {
    const currentDay = sortedDays[i]
    const nextDay = sortedDays[i + 1]

    const currentNodes = nodesByDay[currentDay]
    const nextNodes = nodesByDay[nextDay]

    // Conectar o último nó do dia atual com o primeiro do próximo
    if (currentNodes.length > 0 && nextNodes.length > 0) {
      const lastCurrentNode = currentNodes[currentNodes.length - 1]
      const firstNextNode = nextNodes[0]
      connections.push({ from: lastCurrentNode, to: firstNextNode })
    }
  }

  // Criar conexões dentro do mesmo dia (nós conectados verticalmente)
  Object.values(nodesByDay).forEach((dayNodes) => {
    const sortedNodes = dayNodes.sort((a, b) => a.position.y - b.position.y)
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      connections.push({ from: sortedNodes[i], to: sortedNodes[i + 1] })
    }
  })

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {connections.map((connection, index) => {
        const fromX = connection.from.position.x + 70 // Centro do nó
        const fromY = connection.from.position.y + 40
        const toX = connection.to.position.x + 70
        const toY = connection.to.position.y + 40

        return (
          <g key={index}>
            <line
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />

            {/* Seta */}
            <polygon
              points={`${toX - 8},${toY - 4} ${toX},${toY} ${toX - 8},${toY + 4}`}
              fill="#6b7280"
              opacity="0.6"
            />
          </g>
        )
      })}
    </svg>
  )
}
