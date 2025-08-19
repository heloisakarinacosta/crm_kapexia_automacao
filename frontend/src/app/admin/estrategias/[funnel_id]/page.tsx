'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Modal from '@/components/ui/modal';
import CardModalComponent from './card/CardModalComponent';

interface Stage {
  id: number;
  name: string;
}
interface Card {
  id: number;
  title: string;
  current_stage_id: number;
}
interface Contact { id: number; name: string; }

export default function FunilPage() {
  const params = useParams();
  const funnel_id = params?.funnel_id as string;
  const [stages, setStages] = useState<Stage[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingCardStage, setCreatingCardStage] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [creatingCard, setCreatingCard] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const [openNewContact, setOpenNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [errorContact, setErrorContact] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchContacts();
    // eslint-disable-next-line
  }, [funnel_id]);

  function buildApiUrl(path: string) {
    let base = process.env.NEXT_PUBLIC_API_URL || '';
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (path.startsWith('/')) path = path.slice(1);
    // Evita duplicidade de /api
    if (base.endsWith('/api') && path.startsWith('api/')) {
      path = path.replace(/^api\//, '');
    }
    return `${base}/${path}`;
  }

  function fetchData() {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    Promise.all([
      fetch(buildApiUrl(`/api/funnels/${funnel_id}/stages`), {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
      fetch(buildApiUrl(`/api/funnels/${funnel_id}/cards`), {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(res => res.json()),
    ])
      .then(([stagesRes, cardsRes]) => {
        setStages(stagesRes.data || []);
        setCards(cardsRes.data || []);
      })
      .catch(() => setError('Erro ao buscar dados do funil'))
      .finally(() => setLoading(false));
  }

  function fetchContacts() {
    const token = localStorage.getItem('authToken');
    fetch(buildApiUrl(`/api/contatos?client_id=1`), {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setContacts(data.data || []));
  }

  function handleCreateCard(stageId: number) {
    setCreatingCardStage(stageId);
    setNewCardTitle('');
    setSelectedContactId(null);
  }

  function handleSubmitNewCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newCardTitle.trim() || creatingCardStage == null || !selectedContactId) return;
    setCreatingCard(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    fetch(buildApiUrl(`/api/funnels/${funnel_id}/cards`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newCardTitle,
        current_stage_id: creatingCardStage,
        contact_id: selectedContactId,
        client_id: 1, // mock para teste
        funnel_id: Number(funnel_id),
        owner_user_id: 1, // mock para teste
        created_by_user_id: 1, // mock para teste
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao criar card');
        setCreatingCardStage(null);
        setNewCardTitle('');
        fetchData();
      })
      .catch((err) => setError(err.message))
      .finally(() => setCreatingCard(false));
  }

  function handleSubmitNewContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) return;
    setSavingContact(true);
    setErrorContact(null);
    const token = localStorage.getItem('authToken');
    fetch(buildApiUrl(`/api/contatos`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newContactName, email: newContactEmail, client_id: 1 }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao cadastrar contato');
        const data = await res.json();
        setContacts((prev) => [...prev, data.data]);
        setSelectedContactId(data.data.id);
        setOpenNewContact(false);
        setNewContactName('');
        setNewContactEmail('');
      })
      .catch((err) => setErrorContact(err.message))
      .finally(() => setSavingContact(false));
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: '32px 40px 0 40px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24, color: '#222' }}>Kanban do Funil #{funnel_id}</h1>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && stages.length === 0 && <p>Nenhum estágio cadastrado.</p>}
      {!loading && !error && stages.length > 0 && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 24, overflowX: 'auto', paddingBottom: 32 }}>
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              style={{
                minWidth: 300,
                background: '#f9f9fb',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                border: '1.5px solid #ececec',
                position: 'relative',
                height: '70vh',
                maxHeight: 600,
              }}
            >
              {/* Cabeçalho do estágio */}
              <div style={{
                background: idx % 2 === 0 ? '#e0e7ff' : '#d1fae5',
                color: '#222',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: '16px 20px 12px 20px',
                fontWeight: 600,
                fontSize: 18,
                borderBottom: '1.5px solid #ececec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 56,
              }}>
                <span>{stage.name}</span>
                <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>
                  {cards.filter(card => Number(card.current_stage_id) === Number(stage.id)).length} cards
                </span>
              </div>
              {/* Cards do estágio */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {cards.filter(card => Number(card.current_stage_id) === Number(stage.id)).length === 0 && (
                  <p style={{ color: '#bbb', fontSize: 14, textAlign: 'center', marginTop: 24 }}>Nenhum card</p>
                )}
                {cards.filter(card => Number(card.current_stage_id) === Number(stage.id)).map(card => (
                  <div key={card.id} style={{ textDecoration: 'none' }} onClick={() => setOpenCardId(card.id)}>
                    <div style={{
                      background: '#fff',
                      borderRadius: 10,
                      marginBottom: 14,
                      padding: '14px 12px',
                      boxShadow: '0 1px 4px #0001',
                      cursor: 'pointer',
                      border: '1.5px solid #e5e7eb',
                      transition: 'box-shadow 0.2s, border 0.2s',
                      fontWeight: 500,
                      fontSize: 15,
                      color: '#222',
                    }}>
                      <strong>{card.title}</strong>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>ID: {card.id}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Botão de novo card ou formulário */}
              <div style={{ padding: 16, borderTop: '1.5px solid #ececec', background: '#f9f9fb', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                {creatingCardStage === stage.id ? (
                  <form onSubmit={handleSubmitNewCard} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Título do card"
                      value={newCardTitle}
                      onChange={e => setNewCardTitle(e.target.value)}
                      required
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15, color: '#222' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={selectedContactId || ''}
                        onChange={e => setSelectedContactId(Number(e.target.value))}
                        required
                        style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                      >
                        <option value="" disabled>Selecione um contato</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>{contact.name}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setOpenNewContact(true)} style={{ padding: '8px 12px', borderRadius: 6, background: '#e0e7ff', color: '#2563eb', border: 'none', fontWeight: 600, fontSize: 15 }}>+ Novo contato</button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" disabled={creatingCard} style={{ flex: 1, padding: '8px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15 }}>
                        {creatingCard ? 'Criando...' : 'Salvar'}
                      </button>
                      <button type="button" onClick={() => setCreatingCardStage(null)} style={{ flex: 1, padding: '8px 0', background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontWeight: 500, fontSize: 15 }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => handleCreateCard(stage.id)} style={{ width: '100%', padding: '10px 0', background: '#e0e7ff', color: '#2563eb', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, transition: 'background 0.2s' }}>
                    + Nova Oportunidade
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!openCardId} onClose={() => setOpenCardId(null)} width="90vw" height="90vh">
        {!!openCardId && (
          <CardModalComponent 
            funnel_id={funnel_id}
            card_id={String(openCardId)}
            card={cards.find(c => c.id === openCardId) || null}
            contacts={contacts}
          />
        )}
      </Modal>
      <Modal open={openNewContact} onClose={() => setOpenNewContact(false)} width={400} title="Novo Contato">
        <form onSubmit={handleSubmitNewContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Nome"
            value={newContactName}
            onChange={e => setNewContactName(e.target.value)}
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15, color: '#222', background: '#fff' }}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={newContactEmail}
            onChange={e => setNewContactEmail(e.target.value)}
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15, color: '#222', background: '#fff' }}
          />
          {errorContact && <div style={{ color: 'red', fontSize: 14 }}>{errorContact}</div>}
          <button type="submit" disabled={savingContact} style={{ padding: '10px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16 }}>
            {savingContact ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  );
} 