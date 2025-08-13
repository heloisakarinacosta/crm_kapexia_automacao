"use client"
import { Button } from "@/components/ui/button"
import { TestTube } from "lucide-react"
import { TimelineDayCanvas } from "./TimelineDayCanvas"

interface TimelineSectionProps {
  timelineDays: number[]
  timelineDates: Array<{ day: number; date: string; nodeCount: number }>
  nodes: any[]
  setNodes: any
  selectedNode: any
  setSelectedNode: any
  currentExecutionDay: number | null
  isExecuting: boolean
  zoom: number
  pan: { x: number; y: number }
  onTestNode: (nodeId: string) => void
  onTestDay: (day: number) => void
}

export function TimelineSection({
  timelineDays,
  timelineDates,
  nodes,
  setNodes,
  selectedNode,
  setSelectedNode,
  currentExecutionDay,
  isExecuting,
  zoom,
  pan,
  onTestNode,
  onTestDay,
}: TimelineSectionProps) {
  return (
    <div className="h-full flex">
      {timelineDates.map((item) => (
        <div key={item.day} className="flex-1 border-r border-gray-300 last:border-r-0">
          <div className="h-full flex flex-col">
            {/* Day Header */}
            <div
              className={`p-3 border-b border-gray-300 ${
                currentExecutionDay === item.day && isExecuting
                  ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">
                    D{item.day > 0 ? "+" : ""}
                    {item.day}
                  </div>
                  <div className="text-xs opacity-75">{item.date}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onTestDay(item.day)} className="p-1 h-6 w-6">
                    <TestTube className="w-3 h-3" />
                  </Button>
                  <span className="text-xs">{item.nodeCount}</span>
                </div>
              </div>
            </div>

            {/* Day Canvas */}
            <div className="flex-1">
              <TimelineDayCanvas
                day={item.day}
                nodes={nodes.filter((node) => node.day === item.day)}
                allNodes={nodes}
                setNodes={setNodes}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                currentExecutionDay={currentExecutionDay}
                isExecuting={isExecuting}
                zoom={zoom}
                pan={pan}
                onTestNode={onTestNode}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
