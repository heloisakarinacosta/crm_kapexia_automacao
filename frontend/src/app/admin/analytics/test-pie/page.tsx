"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Dados reais do painel 4 (DISTRIBUIÇÃO QUALIFICAÇÃO)
const data = [
  { tipo: 'Frio', percentual: 45.2, total: 226 },
  { tipo: 'Morno', percentual: 32.8, total: 164 },
  { tipo: 'Quente', percentual: 22.0, total: 110 }
];
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];

export default function TestPie() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Teste Gráfico de Pizza (Dados Reais do Painel)</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="percentual"
          nameKey="tipo"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
} 