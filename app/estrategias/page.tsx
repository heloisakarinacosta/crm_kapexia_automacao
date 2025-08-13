"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Calendar, Settings, Plus, Minus, Power, PowerOff } from "lucide-react"

// Importar componentes das estratégias
import { NodeSidebar } from "@/components/estrategias/NodeSidebar"
import { WorkflowCanvas } from "@/components/estrategias/WorkflowCanvas"
import { TimelineSection } from "@/components/estrategias/TimelineSection"
import { PropertiesPanel } from "@/components/estrategias/PropertiesPanel"
import { ExecutionLogs } from "@/components/estrategias/ExecutionLogs"
import { ExecutionControls } from "@/components/estrategias/ExecutionControls"
import type { NodeType, TimelineNode, ExecutionLog } from "@/types/estrategias"

// Exemplo pré-configurado
const exemploConfigurado = {
  dataInicial: "2025-07-26",
  diasUteis: false,
  timelineDays: [-5, -3, 0, 1, 7],
  workflowNodes: [
    {
      id: "workflow-1",
      type: "data-import" as NodeType,
      position: { x: 100, y: 100 },
      day: -999, // Workflow geral
      title: "Importar Leads",
      config: {
        webhook: "https://webhook.site/import-leads",
      },
    },
  ],
  timelineNodes: [
    {
      id: "node-1",
      type: "send-email" as NodeType,
      position: { x: 50, y: 50 },
      day: -5,
      title: "Email Inicial",
      config: {
        subject: "Primeira Abordagem",
        body: "Olá! Gostaria de apresentar nossa solução...",
      },
    },
    {
      id: "node-2",
      type: "send-whatsapp" as NodeType,
      position: { x: 50, y: 50 },
      day: -3,
      title: "WhatsApp Follow-up",
      config: {
        message: "Oi! Vi que enviamos um email. Conseguiu dar uma olhada?",
      },
    },
    {
      id: "node-3",
      type: "send-email" as NodeType,
      position: { x: 50, y: 50 },
      day: 0,
      title: "Proposta Oficial",
      config: {
        subject: "Proposta Comercial",
        body: "Segue nossa proposta detalhada...",
      },
    },
  ],
}

export default function EstrategiasPage() {
  const [dataInicial, setDataInicial] = useState(exemploConfigurado.dataInicial)
  const [diasUteis, setDiasUteis] = useState(exemploConfigurado.diasUteis)
  const [timelineDays, setTimelineDays] = useState(exemploConfigurado.timelineDays)
  const [workflowNodes, setWorkflowNodes] = useState<TimelineNode[]>(exemploConfigurado.workflowNodes)
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>(exemploConfigurado.timelineNodes)
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isStrategyActive, setIsStrategyActive] = useState(true)
  const [currentExecutionDay, setCurrentExecutionDay] = useState<number | null>(null)
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)

  // Calcular datas da timeline
  const calculateTimelineDates = () => {
    const baseDate = new Date(dataInicial)
    return timelineDays.map((day) => {
      const targetDate = new Date(baseDate)

      if (diasUteis) {
        let daysToAdd = day
        while (daysToAdd !== 0) {
          if (daysToAdd > 0) {
            targetDate.setDate(targetDate.getDate() + 1)
            if (targetDate.getDay() !== 0 && targetDate.getDay() !== 6) {
              daysToAdd--
            }
          } else {
            targetDate.setDate(targetDate.getDate() - 1)
            if (targetDate.getDay() !== 0 && targetDate.getDay() !== 6) {
              daysToAdd++
            }
          }
        }
      } else {
        targetDate.setDate(baseDate.getDate() + day)
      }

      return {
        day,
        date: targetDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        nodeCount: timelineNodes.filter((node) => node.day === day).length,
      }
    })
  }

  const timelineDates = calculateTimelineDates()
  const totalEvents = workflowNodes.length + timelineNodes.length

  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const addTimelineDay = () => {
    const newDay = Math.max(...timelineDays) + 1
    setTimelineDays((prev) => [...prev, newDay].sort((a, b) => a - b))
  }

  const removeTimelineDay = () => {
    if (timelineDays.length > 1) {
      const maxDay = Math.max(...timelineDays)
      setTimelineDays((prev) => prev.filter((day) => day !== maxDay))
      // Remove nós do dia removido
      setTimelineNodes((prev) => prev.filter((node) => node.day !== maxDay))
    }
  }

  const executeStrategy = async () => {
    if (!isStrategyActive) return

    setIsExecuting(true)
    setExecutionLogs([])

    // Executar workflow geral primeiro
    for (const node of workflowNodes) {
      const log: ExecutionLog = {
        id: `log-${Date.now()}-${Math.random()}`,
        nodeId: node.id,
        day: -999,
        timestamp: new Date(),
        status: "success",
        message: `Executando ${node.title} (Workflow Geral)`,
        details: node.config,
      }
      setExecutionLogs((prev) => [...prev, log])
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Executar timeline
    const sortedDays = [...timelineDays].sort((a, b) => a - b)

    for (const day of sortedDays) {
      setCurrentExecutionDay(day)
      const dayNodes = timelineNodes.filter((node) => node.day === day)

      for (const node of dayNodes) {
        const log: ExecutionLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          nodeId: node.id,
          day: day,
          timestamp: new Date(),
          status: "success",
          message: `Executando ${node.title}`,
          details: node.config,
        }
        setExecutionLogs((prev) => [...prev, log])
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentExecutionDay(null)
    setIsExecuting(false)
  }

  const stopExecution = () => {
    setIsExecuting(false)
    setCurrentExecutionDay(null)
  }

  const testNode = async (nodeId: string) => {
    const node = [...workflowNodes, ...timelineNodes].find((n) => n.id === nodeId)
    if (!node) return

    const log: ExecutionLog = {
      id: `test-${Date.now()}`,
      nodeId: node.id,
      day: node.day,
      timestamp: new Date(),
      status: "success",
      message: `Teste: ${node.title}`,
      details: { ...node.config, test: true },
    }
    setExecutionLogs((prev) => [...prev, log])
  }

  const testDay = async (day: number) => {
    const dayNodes = timelineNodes.filter((node) => node.day === day)
    for (const node of dayNodes) {
      await testNode(node.id)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-light text-gray-800">Régua de Estratégias</h1>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Label htmlFor="data-inicial" className="text-sm font-medium">
                Data Inicial:
              </Label>
              <Input
                id="data-inicial"
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-40"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="dias-uteis" className="text-sm font-medium">
                Dias Úteis:
              </Label>
              <Switch id="dias-uteis" checked={diasUteis} onCheckedChange={setDiasUteis} />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={removeTimelineDay}>
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">{timelineDays.length} dias</span>
              <Button variant="outline" size="sm" onClick={addTimelineDay}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={isStrategyActive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsStrategyActive(!isStrategyActive)}
              className={isStrategyActive ? "bg-[#40E0D0] hover:bg-[#53B6AC]" : ""}
            >
              {isStrategyActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              {isStrategyActive ? "Ativa" : "Inativa"}
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Propriedades
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          {timelineDates.map((item) => (
            <Card
              key={item.day}
              className={`p-3 min-w-[120px] text-center border-2 ${
                currentExecutionDay === item.day && isExecuting
                  ? "border-[#40E0D0] bg-gradient-to-br from-[#40E0D0] to-[#53B6AC] text-white"
                  : "border-gray-300 bg-gray-800 text-white"
              }`}
            >
              <div className="text-lg font-bold">
                D{item.day > 0 ? "+" : ""}
                {item.day}
              </div>
              <div className="text-xs opacity-80">{item.date}</div>
              <div className="text-xs mt-1 opacity-60">{item.nodeCount} nós</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <NodeSidebar />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Workflow Geral */}
          <div className="h-1/3 border-b border-gray-300">
            <div className="h-full bg-white">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-700">Workflow Geral</h3>
                <p className="text-sm text-gray-500">Arraste nós aqui para criar o fluxo principal</p>
              </div>
              <WorkflowCanvas
                nodes={workflowNodes}
                setNodes={setWorkflowNodes}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                zoom={zoom}
                pan={pan}
                onTestNode={testNode}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 bg-gray-100">
            <TimelineSection
              timelineDays={timelineDays}
              timelineDates={timelineDates}
              nodes={timelineNodes}
              setNodes={setTimelineNodes}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              currentExecutionDay={currentExecutionDay}
              isExecuting={isExecuting}
              zoom={zoom}
              pan={pan}
              onTestNode={testNode}
              onTestDay={testDay}
            />
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          nodes={[...workflowNodes, ...timelineNodes]}
          setNodes={(updater) => {
            if (typeof updater === "function") {
              const allNodes = [...workflowNodes, ...timelineNodes]
              const updatedNodes = updater(allNodes)
              setWorkflowNodes(updatedNodes.filter((n) => n.day === -999))
              setTimelineNodes(updatedNodes.filter((n) => n.day !== -999))
            }
          }}
        />
      </div>

      {/* Execution Controls */}
      <ExecutionControls
        isExecuting={isExecuting}
        isStrategyActive={isStrategyActive}
        totalEvents={totalEvents}
        onExecute={executeStrategy}
        onStop={stopExecution}
        onToggleActive={() => setIsStrategyActive(!isStrategyActive)}
      />

      {/* Execution Logs */}
      {executionLogs.length > 0 && <ExecutionLogs logs={executionLogs} />}
    </div>
  )
}
