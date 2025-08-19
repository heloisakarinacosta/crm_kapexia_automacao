'use client';
import React from 'react';
import Link from 'next/link';
import { use } from 'react';
import CardModalComponent from '../CardModalComponent';

export default function CardPage({ params }: { params: Promise<{ funnel_id: string; card_id: string }> }) {
  const { funnel_id, card_id } = use(params);
  
  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <Link href={`/admin/estrategias/${funnel_id}`} style={{ color: '#007bff', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        ← Voltar para o Funil
      </Link>
      <div style={{ height: 'calc(100vh - 80px)', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardModalComponent funnel_id={funnel_id} card_id={card_id} />
      </div>
    </div>
  );
}