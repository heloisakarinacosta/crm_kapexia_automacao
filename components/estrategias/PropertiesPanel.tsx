"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TimelineNode } from "@/types/estrategias"
import { X } from "lucide-react"

interface PropertiesPanelProps {
  selectedNode: TimelineNode | null
  setSelectedNode: (node: TimelineNode | null) => void
  nodes: TimelineNode[]
  setNodes: (nodes: TimelineNode[] | ((prev: TimelineNode[]) => TimelineNode[])) => void
}

export function PropertiesPanel({ selectedNode, setSelectedNode, nodes, setNodes }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="text-sm">Selecione um nó para editar suas propriedades</p>
        </div>
      </div>
    )
  }

  const updateNodeConfig = (key: string, value: any) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === selectedNode.id ? { ...node, config: { ...node.config, [key]: value } } : node)),
    )

    setSelectedNode({
      ...selectedNode,
      config: { ...selectedNode.config, [key]: value },
    })
  }

  const updateNodeTitle = (title: string) => {
    setNodes((prev) => prev.map((node) => (node.id === selectedNode.id ? { ...node, title } : node)))
    setSelectedNode({ ...selectedNode, title })
  }

  const updateNodeDay = (day: number) => {
    setNodes((prev) => prev.map((node) => (node.id === selectedNode.id ? { ...node, day } : node)))
    setSelectedNode({ ...selectedNode, day })
  }

  const renderConfigFields = () => {
    switch (selectedNode.type) {
      case "send-email":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={selectedNode.config.subject || ""}
                onChange={(e) => updateNodeConfig("subject", e.target.value)}
                placeholder="Assunto do e-mail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Corpo do E-mail</Label>
              <Textarea
                id="body"
                value={selectedNode.config.body || ""}
                onChange={(e) => updateNodeConfig("body", e.target.value)}
                placeholder="Conteúdo do e-mail"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL</Label>
              <Input
                id="webhook"
                value={selectedNode.config.webhook || ""}
                onChange={(e) => updateNodeConfig("webhook", e.target.value)}
                placeholder="https://webhook.site/..."
              />
            </div>
          </>
        )

      case "send-whatsapp":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={selectedNode.config.message || ""}
                onChange={(e) => updateNodeConfig("message", e.target.value)}
                placeholder="Mensagem do WhatsApp"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL</Label>
              <Input
                id="webhook"
                value={selectedNode.config.webhook || ""}
                onChange={(e) => updateNodeConfig("webhook", e.target.value)}
                placeholder="https://webhook.site/..."
              />
            </div>
          </>
        )

      case "wait-delay":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                type="number"
                value={selectedNode.config.duration || ""}
                onChange={(e) => updateNodeConfig("duration", Number.parseInt(e.target.value))}
                placeholder="Tempo de espera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select
                value={selectedNode.config.unit || "minutes"}
                onValueChange={(value) => updateNodeConfig("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "javascript":
        return (
          <div className="space-y-2">
            <Label htmlFor="code">Código JavaScript</Label>
            <Textarea
              id="code"
              value={selectedNode.config.code || ""}
              onChange={(e) => updateNodeConfig("code", e.target.value)}
              placeholder="// Seu código JavaScript aqui"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        )

      case "condition":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition">Condição</Label>
              <Textarea
                id="condition"
                value={selectedNode.config.condition || ""}
                onChange={(e) => updateNodeConfig("condition", e.target.value)}
                placeholder="Condição a ser avaliada"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trueAction">Ação se Verdadeiro</Label>
              <Input
                id="trueAction"
                value={selectedNode.config.trueAction || ""}
                onChange={(e) => updateNodeConfig("trueAction", e.target.value)}
                placeholder="Ação para resultado verdadeiro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="falseAction">Ação se Falso</Label>
              <Input
                id="falseAction"
                value={selectedNode.config.falseAction || ""}
                onChange={(e) => updateNodeConfig("falseAction", e.target.value)}
                placeholder="Ação para resultado falso"
              />
            </div>
          </>
        )

      case "http-request":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="method">Método</Label>
              <Select
                value={selectedNode.config.method || "GET"}
                onValueChange={(value) => updateNodeConfig("method", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={selectedNode.config.url || ""}
                onChange={(e) => updateNodeConfig("url", e.target.value)}
                placeholder="https://api.exemplo.com/endpoint"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={selectedNode.config.headers || ""}
                onChange={(e) => updateNodeConfig("headers", e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                rows={3}
              />
            </div>
          </>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook"
              value={selectedNode.config.webhook || ""}
              onChange={(e) => updateNodeConfig("webhook", e.target.value)}
              placeholder="https://webhook.site/..."
            />
          </div>
        )
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Propriedades</h3>
        <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={selectedNode.title}
            onChange={(e) => updateNodeTitle(e.target.value)}
            placeholder="Nome do nó"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">Dia da Timeline</Label>
          <Input
            id="day"
            type="number"
            value={selectedNode.day}
            onChange={(e) => updateNodeDay(Number.parseInt(e.target.value))}
            placeholder="0"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Configurações</h4>
          {renderConfigFields()}
        </div>
      </Card>
    </div>
  )
}
