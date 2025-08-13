"use client"

import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface TimelineHeaderProps {
  timelineDays: number[]
  setTimelineDays: (days: number[] | ((prev: number[]) => number[])) => void
  dataInicial: string
  diasUteis: boolean
  currentExecutionDay: number | null
  isExecuting: boolean
}

export function TimelineHeader({
  timelineDays,
  setTimelineDays,
  dataInicial,
  diasUteis,
  currentExecutionDay,
  isExecuting,
}: TimelineHeaderProps) {
  const formatDate = (dayOffset: number) => {
    const baseDate = new Date(dataInicial)
    const targetDate = new Date(baseDate)

    if (diasUteis) {
      // Lógica para dias úteis (simplificada)
      let daysToAdd = dayOffset
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
      targetDate.setDate(baseDate.getDate() + dayOffset)
    }

    return targetDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const removeDayFromTimeline = (dayToRemove: number) => {
    setTimelineDays((prev) => prev.filter((day) => day !== dayToRemove))
  }

  const addNewDay = () => {
    const newDay = Math.max(...timelineDays) + 1
    setTimelineDays((prev) => [...prev, newDay].sort((a, b) => a - b))
  }

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border-b-2 border-gray-300 shadow-sm z-10">
      <div className="flex items-center p-4 space-x-4">
        <div className="text-sm font-medium text-gray-600">
          Data Inicial: {new Date(dataInicial).toLocaleDateString("pt-BR")}
        </div>

        <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
          {timelineDays
            .sort((a, b) => a - b)
            .map((day) => (
              <div
                key={day}
                className={`
                relative flex-shrink-0 bg-gray-100 border rounded-lg p-3 min-w-[120px] text-center
                ${
                  currentExecutionDay === day && isExecuting
                    ? "bg-green-200 border-green-400 animate-pulse"
                    : "border-gray-300"
                }
              `}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  onClick={() => removeDayFromTimeline(day)}
                >
                  <X className="w-3 h-3" />
                </Button>

                <div className="text-lg font-medium text-gray-800">
                  D{day > 0 ? "+" : ""}
                  {day}
                </div>
                <div className="text-xs text-gray-600">{formatDate(day)}</div>
              </div>
            ))}

          <Button variant="outline" size="sm" onClick={addNewDay} className="flex-shrink-0 bg-transparent">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Dia
          </Button>
        </div>
      </div>
    </div>
  )
}
