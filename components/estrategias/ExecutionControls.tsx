"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Square, Power, PowerOff, BarChart3 } from "lucide-react"

interface ExecutionControlsProps {
  isExecuting: boolean
  isStrategyActive: boolean
  totalEvents: number
  onExecute: () => void
  onStop: () => void
  onToggleActive: () => void
}

export function ExecutionControls({
  isExecuting,
  isStrategyActive,
  totalEvents,
  onExecute,
  onStop,
  onToggleActive,
}: ExecutionControlsProps) {
  return (
    <Card className="m-4 p-4 bg-white border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{totalEvents} ações configuradas</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isStrategyActive ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm text-gray-600">Automação {isStrategyActive ? "Ativa" : "Inativa"}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleActive}
            className={isStrategyActive ? "border-green-500 text-green-600" : ""}
          >
            {isStrategyActive ? <Power className="w-4 h-4 mr-2" /> : <PowerOff className="w-4 h-4 mr-2" />}
            {isStrategyActive ? "Desativar" : "Ativar"}
          </Button>

          {isExecuting ? (
            <Button variant="destructive" size="sm" onClick={onStop} className="bg-red-500 hover:bg-red-600">
              <Square className="w-4 h-4 mr-2" />
              Parar Execução
            </Button>
          ) : (
            <Button
              onClick={onExecute}
              disabled={!isStrategyActive}
              size="sm"
              className="bg-[#40E0D0] hover:bg-[#53B6AC] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Executar Automação
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
