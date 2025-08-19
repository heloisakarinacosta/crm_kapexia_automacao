'use client';
import React, { useEffect, useState } from 'react';

interface Automation {
  id: number;
  funnel_id: number;
  trigger: string;
  action: string;
  active: boolean;
  created_at: string;
}

export default function AutomacoesPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    params.then(({ funnel_id }) => {
      setFunnelId(funnel_id);
      const fetchAutomations = async () => {
        setLoading(true);
        setError(null);
        const token = 'SEU_TOKEN_JWT_AQUI';
        try {
          const res = await fetch(`http://localhost:3004/api/funnels/${funnel_id}/automations`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Erro ao buscar automações');
          const data = await res.json();
          setAutomations(data.data || []);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchAutomations();
    }).catch(err => setError(err.message));
  }, [params]);

  function handleAddAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrigger.trim() || !newAction.trim()) return;
    setAdding(true);
    setAddError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnelId}/automations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: newTrigger, action: newAction, active: newActive }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao adicionar automação');
        setNewTrigger('');
        setNewAction('');
        setNewActive(true);
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnelId}/automations`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar automações');
        const data = await res.json();
        setAutomations(data.data || []);
      })
      .catch((err) => setAddError(err.message))
      .finally(() => {
        setAdding(false);
        setLoading(false);
      });
  }

  function handleRemoveAutomation(id: number) {
    if (!window.confirm('Remover automação?')) return;
    setRemovingId(id);
    setError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnelId}/automations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao remover automação');
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnelId}/automations`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar automações');
        const data = await res.json();
        setAutomations(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setRemovingId(null);
        setLoading(false);
      });
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Automações do Funil #{funnelId}</h1>
      <form onSubmit={handleAddAutomation} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Gatilho (ex: card_moved)"
          value={newTrigger}
          onChange={e => setNewTrigger(e.target.value)}
          required
          style={{ flex: 1, padding: 6 }}
        />
        <input
          type="text"
          placeholder="Ação (ex: enviar_email)"
          value={newAction}
          onChange={e => setNewAction(e.target.value)}
          required
          style={{ flex: 1, padding: 6 }}
        />
        <select value={newActive ? '1' : '0'} onChange={e => setNewActive(e.target.value === '1')} style={{ padding: 6 }}>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
        <button type="submit" disabled={adding} style={{ padding: '6px 16px' }}>
          {adding ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
      {addError && <p style={{ color: 'red' }}>{addError}</p>}
      {loading && <p>Carregando automações...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && automations.length === 0 && <p>Nenhuma automação cadastrada.</p>}
      {!loading && !error && automations.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 16, width: '100%' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>ID</th>
              <th>Gatilho</th>
              <th>Ação</th>
              <th>Status</th>
              <th>Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {automations.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.trigger}</td>
                <td>{a.action}</td>
                <td>{a.active ? 'Ativo' : 'Inativo'}</td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleRemoveAutomation(a.id)}
                    disabled={removingId === a.id}
                    style={{ color: 'red', padding: '2px 10px' }}
                  >
                    {removingId === a.id ? 'Removendo...' : 'Remover'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 