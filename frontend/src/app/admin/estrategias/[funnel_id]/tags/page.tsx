'use client';
import React, { useEffect, useState } from 'react';
import { use } from 'react';

interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export default function TagsPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const { funnel_id } = use(params);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/tags`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar tags');
        const data = await res.json();
        setTags(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [funnel_id]);

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setAddError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName, color: newColor }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao adicionar tag');
        setNewName('');
        setNewColor('#2563eb');
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnel_id}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar tags');
        const data = await res.json();
        setTags(data.data || []);
      })
      .catch((err) => setAddError(err.message))
      .finally(() => {
        setAdding(false);
        setLoading(false);
      });
  }

  function handleRemoveTag(id: number) {
    if (!window.confirm('Remover tag?')) return;
    setRemovingId(id);
    setError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/tags/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao remover tag');
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnel_id}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar tags');
        const data = await res.json();
        setTags(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setRemovingId(null);
        setLoading(false);
      });
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Tags do Funil #{funnel_id}</h1>
      <form onSubmit={handleAddTag} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          type="text"
          placeholder="Nome da tag"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
          style={{ flex: 1, padding: 6 }}
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          style={{ width: 40, height: 32, border: 'none', background: 'none' }}
        />
        <button type="submit" disabled={adding} style={{ padding: '6px 16px' }}>
          {adding ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
      {addError && <p style={{ color: 'red' }}>{addError}</p>}
      {loading && <p>Carregando tags...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && tags.length === 0 && <p>Nenhuma tag cadastrada.</p>}
      {!loading && !error && tags.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 16, width: '100%' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cor</th>
              <th>Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{tag.name}</td>
                <td>
                  <span style={{ display: 'inline-block', width: 18, height: 18, background: tag.color, borderRadius: '50%', border: '1px solid #ccc' }} />
                  <span style={{ marginLeft: 8 }}>{tag.color}</span>
                </td>
                <td>{new Date(tag.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    disabled={removingId === tag.id}
                    style={{ color: 'red', padding: '2px 10px' }}
                  >
                    {removingId === tag.id ? 'Removendo...' : 'Remover'}
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