"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'A', value: 30 },
  { name: 'B', value: 70 }
];
const COLORS = ['#FF6384', '#36A2EB'];

export default function TestPie() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Teste Gráfico de Pizza (Recharts)</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
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