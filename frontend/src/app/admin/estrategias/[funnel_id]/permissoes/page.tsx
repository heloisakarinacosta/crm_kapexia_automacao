'use client';
import React, { useEffect, useState } from 'react';
import { use } from 'react';

interface Permission {
  id: number;
  user_id: number;
  role: string;
  created_at: string;
  updated_at?: string;
}

export default function PermissoesPage({ params }: { params: Promise<{ funnel_id: string }> }) {
  const { funnel_id } = use(params);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar permissões');
        const data = await res.json();
        setPermissions(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [funnel_id]);

  function handleAddPermission(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserId.trim()) return;
    setAdding(true);
    setAddError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: Number(newUserId), role: newRole }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao adicionar permissão');
        setNewUserId('');
        setNewRole('viewer');
        // Recarregar permissões
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar permissões');
        const data = await res.json();
        setPermissions(data.data || []);
      })
      .catch((err) => setAddError(err.message))
      .finally(() => {
        setAdding(false);
        setLoading(false);
      });
  }

  function handleRemovePermission(id: number) {
    if (!window.confirm('Remover permissão?')) return;
    setRemovingId(id);
    setError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao remover permissão');
        // Recarregar permissões
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar permissões');
        const data = await res.json();
        setPermissions(data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setRemovingId(null);
        setLoading(false);
      });
  }

  function handleEditRole(id: number, currentRole: string) {
    setEditingId(id);
    setEditRole(currentRole);
    setEditError(null);
  }

  function handleSaveRole(id: number) {
    setSavingEdit(true);
    setEditError(null);
    const token = 'SEU_TOKEN_JWT_AQUI';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: editRole }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao atualizar papel');
        // Recarregar permissões
        setLoading(true);
        return fetch(`http://localhost:3004/api/funnels/${funnel_id}/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar permissões');
        const data = await res.json();
        setPermissions(data.data || []);
        setEditingId(null);
      })
      .catch((err) => setEditError(err.message))
      .finally(() => {
        setSavingEdit(false);
        setLoading(false);
      });
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Permissões do Funil #{funnel_id}</h1>
      <p>Gestão de permissões dos usuários neste funil.</p>
      <form onSubmit={handleAddPermission} style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          type="number"
          placeholder="ID do usuário"
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          required
          style={{ width: 120, padding: 6 }}
        />
        <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ padding: 6 }}>
          <option value="viewer">Visualizador</option>
          <option value="editor">Editor</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit" disabled={adding} style={{ padding: '6px 16px' }}>
          {adding ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
      {addError && <p style={{ color: 'red' }}>{addError}</p>}
      {loading && <p>Carregando permissões...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && permissions.length === 0 && <p>Nenhuma permissão cadastrada.</p>}
      {!loading && !error && permissions.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 16, width: '100%' }}>
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              <th>ID</th>
              <th>ID Usuário</th>
              <th>Papel</th>
              <th>Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.user_id}</td>
                <td>
                  {editingId === p.id ? (
                    <>
                      <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ padding: 4 }}>
                        <option value="viewer">Visualizador</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button
                        onClick={() => handleSaveRole(p.id)}
                        disabled={savingEdit}
                        style={{ marginLeft: 6, padding: '2px 10px' }}
                      >
                        {savingEdit ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={savingEdit}
                        style={{ marginLeft: 4, padding: '2px 10px' }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {p.role}
                      <button
                        onClick={() => handleEditRole(p.id, p.role)}
                        style={{ marginLeft: 8, padding: '2px 10px' }}
                      >
                        Editar
                      </button>
                    </>
                  )}
                  {editingId === p.id && editError && <div style={{ color: 'red' }}>{editError}</div>}
                </td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleRemovePermission(p.id)}
                    disabled={removingId === p.id}
                    style={{ color: 'red', padding: '2px 10px' }}
                  >
                    {removingId === p.id ? 'Removendo...' : 'Remover'}
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