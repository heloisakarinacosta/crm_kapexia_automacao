"use client";

import { use } from "react";

export default function StagesPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const { funnel_id } = use(params);
  return (
    <div>
      <h1>Estágios do Funil #{funnel_id}</h1>
      <p>Gestão de estágios (criar, editar, reordenar, excluir). (Em breve...)</p>
    </div>
  );
} 