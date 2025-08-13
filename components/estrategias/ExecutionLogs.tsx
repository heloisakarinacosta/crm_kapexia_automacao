"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ExecutionLog } from "@/types/estrategias"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useState } from "react"

interface ExecutionLogsProps {
  logs: ExecutionLog[]
}

export function ExecutionLogs({ logs }: ExecutionLogsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (logs.length === 0) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "running":
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "running":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-800">Logs de Execução ({logs.length})</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Minimizar" : "Expandir"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-h-60 overflow-y-auto p-3 space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className={`p-3 ${getStatusColor(log.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(log.status)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">
                      Dia {log.day > 0 ? "+" : ""}
                      {log.day}
                    </span>
                    <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString("pt-BR")}</span>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">{log.message}</p>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">Ver detalhes</summary>
                      <pre className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
