"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste - Régua de Estratégias</h1>

      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Componentes UI</h2>
        <Button className="mr-2">Botão Teste</Button>
        <Button variant="outline">Botão Outline</Button>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <p>✅ Componentes UI carregando</p>
        <p>✅ Tailwind funcionando</p>
        <p>✅ Página renderizando</p>
      </Card>
    </div>
  )
}
