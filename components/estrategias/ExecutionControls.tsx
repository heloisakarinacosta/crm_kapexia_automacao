"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, TestTube, Calendar, Zap, ChevronDown } from "lucide-react"

interface ExecutionControlsProps {
  onExecute: (type: "full" | "day" | "node" | "test", target?: string | number) => void
  isExecuting: boolean
}

export function ExecutionControls({ onExecute, isExecuting }: ExecutionControlsProps) {
  const [showOptions, setShowOptions] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Botão principal */}
        <Button onClick={() => onExecute("full")} disabled={isExecuting} className="bg-cyan-600 hover:bg-cyan-700">
          {isExecuting ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Executando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Executar Automação
            </>
          )}
        </Button>

        {/* Menu de opções */}
        <Button variant="outline" size="sm" onClick={() => setShowOptions(!showOptions)} disabled={isExecuting}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Dropdown de opções */}
      {showOptions && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onExecute("test")
                setShowOptions(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <TestTube className="h-4 w-4 text-blue-500" />
              Testar Automação
            </button>
            <button
              onClick={() => {
                onExecute("day", 0)
                setShowOptions(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 text-green-500" />
              Executar Dia Específico
            </button>
            <button
              onClick={() => {
                onExecute("node", "selected")
                setShowOptions(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Zap className="h-4 w-4 text-orange-500" />
              Executar Ação Específica
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
