'use client';
import React, { useEffect, useState, useCallback } from 'react';
import MDIIcon from '../../../components/ui/MDIIcon';
import { CRMIcons } from '../../../utils/iconMap';

interface Funnel {
  id: number;
  name: string;
  description?: string;
}

export default function EstrategiasPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  function buildApiUrl(path: string) {
    let base = process.env.NEXT_PUBLIC_API_URL || '';
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (path.startsWith('/')) path = path.slice(1);
    if (base.endsWith('/api') && path.startsWith('api/')) {
      path = path.replace(/^api\//, '');
    }
    return `${base}/${path}`;
  }

  const fetchFunnels = useCallback(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    fetch(buildApiUrl('/api/funnels'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar funis');
        const data = await res.json();
        setFunnels(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCreateFunnel(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    fetch(buildApiUrl('/api/funnels'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao criar funil');
        setForm({ name: '', description: '' });
        setShowForm(false);
        fetchFunnels();
      })
      .catch((err) => setError(err.message))
      .finally(() => setCreating(false));
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#1C1C1C', padding: '32px 40px 0 40px', borderRadius: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#F2F2F2' }}>Estratégias (Funis)</h1>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        {/* Card de criar novo funil */}
        <div
          onClick={() => setShowForm((v) => !v)}
          style={{
            minWidth: 220,
            minHeight: 140,
            background: '#222',
            border: '2px dashed #40E0D0',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            transition: 'border 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLDivElement).style.border = '2px solid #40E0D0';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(64,224,208,0.10)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLDivElement).style.border = '2px dashed #40E0D0';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
          }}
        >
          <MDIIcon path={CRMIcons.add} size={2.2} color="#40E0D0" />
          <span style={{ color: '#40E0D0', fontWeight: 500, marginTop: 8 }}>Criar novo funil</span>
        </div>
        {/* Cards dos funis */}
        {funnels.map((funnel) => (
          <div
            key={funnel.id}
            style={{
              minWidth: 220,
              minHeight: 140,
              background: '#F2F2F2',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: 24,
              position: 'relative',
              cursor: 'pointer',
              border: '2px solid transparent',
              transition: 'border 0.2s',
            }}
            onClick={() => window.location.href = `/admin/estrategias/${funnel.id}`}
            onMouseOver={e => {
              (e.currentTarget as HTMLDivElement).style.border = '2px solid #40E0D0';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLDivElement).style.border = '2px solid transparent';
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              <MDIIcon path={CRMIcons.target} size={2} color="#40E0D0" />
            </div>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#222', marginBottom: 4 }}>{funnel.name}</div>
            <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{funnel.description}</div>
          </div>
        ))}
      </div>
      {/* Formulário de criação de funil */}
      {showForm && (
        <form onSubmit={handleCreateFunnel} style={{ maxWidth: 400, background: '#F2F2F2', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: '#222' }}>Criar novo funil</h2>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#222' }}>Nome:<br />
              <input name="name" value={form.name} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #444948', marginTop: 4, background: '#fff', color: '#222' }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#222' }}>Descrição:<br />
              <textarea name="description" value={form.description} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #444948', marginTop: 4, background: '#fff', color: '#222' }} />
            </label>
          </div>
          <button type="submit" disabled={creating} style={{ padding: '8px 24px', background: '#40E0D0', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 16 }}>
            {creating ? 'Criando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: 16, padding: '8px 24px', background: '#ACBCBA', color: '#222', border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 16 }}>
            Cancelar
          </button>
        </form>
      )}
      {loading && <p style={{ color: '#F2F2F2' }}>Carregando...</p>}
      {error && <p style={{ color: '#D040E0' }}>{error}</p>}
      {!loading && !error && funnels.length === 0 && <p style={{ color: '#F2F2F2' }}>Nenhum funil cadastrado.</p>}
    </div>
  );
} 