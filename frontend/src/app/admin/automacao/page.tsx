"use client";

import { useState, useCallback, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Save, Settings, Zap } from "lucide-react";
import NodeSidebar from "@/components/automation/NodeSidebar";
import WorkflowCanvas from "@/components/automation/WorkflowCanvas";
import TimelineSection from "@/components/automation/TimelineSection";
import PropertiesPanel from "@/components/automation/PropertiesPanel";
import ExecutionLogs from "@/components/automation/ExecutionLogs";
import ExecutionControls from "@/components/automation/ExecutionControls";
import type { Node, NodeType, TimelineNode, ExecutionLog } from "@/types/automationTypes";

export default function AutomacaoPage() {
  // Estados principais
  const [dataInicial, setDataInicial] = useState("2025-01-15");
  const [diasUteis, setDiasUteis] = useState(false);
  const [timelineDays, setTimelineDays] = useState([-5, -3, 0, 2, 7]);
  const [workflowNodes, setWorkflowNodes] = useState<TimelineNode[]>([]);
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [executionLogs] = useState<ExecutionLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Refs para controle
  const nodeIdCounter = useRef(1);

  // Função para gerar ID único
  const generateNodeId = useCallback(() => {
    return `node-${nodeIdCounter.current++}`;
  }, []);

  // Função para adicionar nó ao workflow
  const addWorkflowNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => { // Alterar 'string' para 'NodeType'
      const newNode: Node = {
        id: generateNodeId(),
        type,
        position,
        day: -999, // Workflow geral
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeIdCounter.current - 1}`,
        config: {},
      };
      setWorkflowNodes((prev) => [...prev, newNode]);
    },
    [generateNodeId],
  );

  // Função para adicionar nó à timeline
  const addTimelineNode = useCallback(
    (type: NodeType, day: number, position: { x: number; y: number }) => { // Alterar 'string' para 'NodeType'
      const newNode: Node = {
        id: generateNodeId(),
        type,
        position,
        day,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeIdCounter.current - 1}`,
        config: {},
      };
      setTimelineNodes((prev) => [...prev, newNode]);
    },
    [generateNodeId],
  );

  // Função para atualizar nó
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<TimelineNode>) => {
      const updateNodes = (nodes: TimelineNode[]) => nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node));

      setWorkflowNodes((prev) => updateNodes(prev));
      setTimelineNodes((prev) => updateNodes(prev));

      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedNode],
  );

  // Função para remover nó
  const removeNode = useCallback(
    (nodeId: string) => {
      setWorkflowNodes((prev) => prev.filter((node) => node.id !== nodeId));
      setTimelineNodes((prev) => prev.filter((node) => node.id !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [selectedNode],
  );

  // Função para salvar automação
  const handleSave = useCallback(() => {
    const automacaoData = {
      dataInicial,
      diasUteis,
      timelineDays,
      workflowNodes,
      timelineNodes,
    };
    console.log("Salvando automação:", automacaoData);
    // Aqui você integraria com sua API
  }, [dataInicial, diasUteis, timelineDays, workflowNodes, timelineNodes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Zap className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Automação - Régua de Contatos</h1>
                <p className="text-sm text-gray-600">Configure sua sequência automatizada de contatos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <ExecutionControls
                onExecute={(type, target) => {
                  console.log("Executando:", type, target);
                  setIsExecuting(true);
                  // Simular execução
                  setTimeout(() => setIsExecuting(false), 3000);
                }}
                isExecuting={isExecuting}
              />
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar de Nós */}
          <NodeSidebar />

          {/* Área Principal */}
          <div className="flex-1 flex flex-col">
            {/* Configurações Gerais */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="data-inicial">Data Inicial:</Label>
                  <Input
                    id="data-inicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="dias-uteis" checked={diasUteis} onCheckedChange={setDiasUteis} />
                  <Label htmlFor="dias-uteis">Apenas dias úteis</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <Label>Timeline:</Label>
                  <Input
                    value={timelineDays.join(", ")}
                    onChange={(e) => {
                      const days = e.target.value
                        .split(",")
                        .map((d) => Number.parseInt(d.trim()))
                        .filter((d) => !isNaN(d));
                      setTimelineDays(days);
                    }}
                    placeholder="Ex: -5, -3, 0, 2, 7"
                    className="w-48"
                  />
                </div>
              </div>
            </div>

            {/* Canvas Principal */}
            <div className="flex-1 flex">
              <div className="flex-1 flex flex-col">
                {/* Workflow Geral */}
                <div className="h-1/3 border-b border-gray-200">
                  <div className="h-full bg-gray-50">
                    <div className="p-3 bg-white border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Workflow Geral</h3>
                      <p className="text-sm text-gray-600">Ações que acontecem antes da timeline</p>
                    </div>
                    <WorkflowCanvas
                      nodes={workflowNodes}
                      onAddNode={addWorkflowNode}
                      onSelectNode={setSelectedNode}
                      onUpdateNode={updateNode}
                      onRemoveNode={removeNode}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1">
                  <TimelineSection
                    days={timelineDays}
                    nodes={timelineNodes}
                    dataInicial={dataInicial}
                    diasUteis={diasUteis}
                    onAddNode={addTimelineNode}
                    onSelectNode={setSelectedNode}
                    onUpdateNode={updateNode}
                    onRemoveNode={removeNode}
                  />
                </div>
              </div>

              {/* Painel de Propriedades */}
              {selectedNode && (
                <div className="w-80 border-l border-gray-200 bg-white">
                  <PropertiesPanel
                    node={selectedNode}
                    onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                    onClose={() => setSelectedNode(null)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Logs de Execução */}
          <div className="w-80 border-l border-gray-200 bg-white">
            <ExecutionLogs logs={executionLogs} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
