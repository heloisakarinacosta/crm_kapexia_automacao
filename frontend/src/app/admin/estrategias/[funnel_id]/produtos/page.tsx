"use client";

import { use } from "react";
import React from 'react';

export default function ProdutosPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const { funnel_id } = use(params);
  return (
    <div>
      <h1>Produtos/Serviços do Funil #{funnel_id}</h1>
      <p>Listagem e gestão de produtos/serviços. (Em breve...)</p>
    </div>
  );
} 