"use client";

import { use } from "react";
import React from 'react';

export default function TarefasPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const { funnel_id } = use(params);
  return (
    <div>
      <h1>Tarefas do Funil #{funnel_id}</h1>
      <p>Listagem e gestão de tarefas do funil. (Em breve...)</p>
    </div>
  );
} 