"use client"

import type React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export default function AutomacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
}




