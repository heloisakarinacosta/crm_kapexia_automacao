"use client"

import { Button } from "@/components/ui/button"
import { Play, Square, Power, PowerOff } from "lucide-react"

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
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onExecute}
            disabled={isExecuting || !isStrategyActive}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Executar Estratégia Completa
          </Button>

          {isExecuting && (
            <Button onClick={onStop} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Parar Execução
            </Button>
          )}

          <Button
            variant={isStrategyActive ? "default" : "outline"}
            onClick={onToggleActive}
            className={isStrategyActive ? "bg-cyan-500 hover:bg-cyan-600" : ""}
          >
            {isStrategyActive ? <Power className="w-4 h-4 mr-2" /> : <PowerOff className="w-4 h-4 mr-2" />}
            {isStrategyActive ? "Estratégia Ativa" : "Estratégia Inativa"}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">{totalEvents} eventos</span> configurados
        </div>
      </div>
    </div>
  )
}
