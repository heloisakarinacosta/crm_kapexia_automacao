"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentDay, setCurrentDay] = useState<number | null>(null)

  const timelineDays = [-5, -3, 0, 1, 7]

  const executeStrategy = async () => {
    setIsExecuting(true)

    for (const day of timelineDays) {
      setCurrentDay(day)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setCurrentDay(null)
    setIsExecuting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-800 mb-4">Régua de Estratégias</h1>
          <p className="text-gray-600">Sistema de automação de marketing e vendas</p>
        </div>

        {/* Controls */}
        <div className="mb-8">
          <Button
            onClick={executeStrategy}
            disabled={isExecuting}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2"
          >
            {isExecuting ? "Executando..." : "▶️ Executar Estratégia"}
          </Button>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {timelineDays.map((day) => (
            <Card
              key={day}
              className={`p-4 text-center transition-all duration-300 ${
                currentDay === day
                  ? "bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-lg scale-105"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="text-2xl font-bold mb-2">
                D{day > 0 ? "+" : ""}
                {day}
              </div>
              <div className="text-sm opacity-75">
                {day === -5 && "Email Inicial"}
                {day === -3 && "WhatsApp"}
                {day === 0 && "Proposta"}
                {day === 1 && "Follow-up"}
                {day === 7 && "Fechamento"}
              </div>
            </Card>
          ))}
        </div>

        {/* Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">📊 Workflow Geral</h3>
            <div className="space-y-3">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                <div className="font-medium">Importar Leads</div>
                <div className="text-sm text-gray-600">Fonte: Planilha Excel/CSV</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">🎯 Ações da Timeline</h3>
            <div className="space-y-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="font-medium">📧 Email + 💬 WhatsApp + 📋 Proposta</div>
                <div className="text-sm text-gray-600">Sequência de 5 pontos de contato</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Status */}
        {isExecuting && (
          <Card className="mt-6 p-4 bg-cyan-50 border-cyan-200">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-cyan-700">
                Executando dia {currentDay !== null ? `D${currentDay > 0 ? "+" : ""}${currentDay}` : "..."}
              </span>
            </div>
          </Card>
        )}

        {/* Results */}
        {!isExecuting && currentDay === null && (
          <Card className="mt-6 p-4 bg-green-50 border-green-200">
            <div className="text-green-700 font-medium">✅ Estratégia configurada e pronta para execução</div>
          </Card>
        )}
      </div>
    </div>
  )
}
