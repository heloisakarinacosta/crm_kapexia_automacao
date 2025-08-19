'use client';
import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/modal';

interface Card {
  id: number;
  title: string;
  description?: string;
  current_stage_id: number;
  estimated_value?: number;
  status?: string;
  owner_user_id?: number;
  contact_id?: number;
  phone?: string; // Adicionar 'phone' à interface
  email?: string; // Adicionar 'email' à interface
  company_name?: string; // Adicionar 'company_name' à interface
  company_type?: string; // Adicionar 'company_type' à interface
  expected_close_date?: string; // Adicionar 'expected_close_date' à interface
  temperature?: string; // Adicionar 'temperature' à interface
  probability?: number; // Adicionar 'probability' à interface
  responsible_user_id?: number; // Adicionar 'responsible_user_id' à interface
}
interface Item {
  id: number;
  product_service_id: number;
  quantity: number;
  unit_price: number;
  total_amount: number;
  product_service: {
    id: number;
    name: string;
  };
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  assigned_to?: {
    id: number;
    name: string;
  };
}

interface HistoryEntry {
  id: number;
  action: string;
  details: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface CardTag {
  id: number;
  card_id: number;
  tag_id: number;
  tag: Tag;
}

interface CardFile {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploader?: {
    id: number;
    name: string;
  };
}

const tabs = [
  { key: 'geral', label: 'Geral' },
  { key: 'itens', label: 'Itens' },
  { key: 'comentarios', label: 'Comentários' },
  { key: 'tarefas', label: 'Tarefas' },
  { key: 'tags', label: 'Tags' },
  { key: 'arquivos', label: 'Arquivos' },
  { key: 'historico', label: 'Histórico' },
];

interface CardModalProps {
  funnel_id: string;
  card_id: string;
  card?: Card | null;
  contacts?: { id: number; name: string }[];
}

export default function CardModalComponent({ funnel_id, card_id, card: propCard, contacts: propContacts }: CardModalProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [contacts, setContacts] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('geral');
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [cardTags, setCardTags] = useState<CardTag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [errorTags, setErrorTags] = useState<string | null>(null);
  const [addingTagId, setAddingTagId] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [removingTagId, setRemovingTagId] = useState<number | null>(null);
  const [files, setFiles] = useState<CardFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removingFileId, setRemovingFileId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    contact_id: string;
    phone_id?: string;
    phone: string;
    email_id?: string;
    email: string;
    company_name: string;
    company_type: string;
    expected_close_date: string;
    temperature: string;
    probability: string;
    responsible_user_id: string;
    estimated_value: string;
    current_stage_id: string; // Adicionar campo para mostrar o estágio atual e mover para um novo estágio
    status?: string; // Adicionar campo para selecionar o status do card
  }>({
    title: '',
    description: '',
    contact_id: '',
    phone: '',
    email: '',
    company_name: '',
    company_type: '',
    expected_close_date: '',
    temperature: '',
    probability: '',
    responsible_user_id: '',
    estimated_value: '',
    current_stage_id: '', // Adicionar campo para mostrar o estágio atual e mover para um novo estágio
    status: 'open', // Adicionar status ao formulário
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [contactPhones, setContactPhones] = useState<{id: number; phone_number: string}[]>([]);
  const [contactEmails, setContactEmails] = useState<{id: number; email: string}[]>([]);
  const [loadingPhones, setLoadingPhones] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [showNewPhone, setShowNewPhone] = useState(false);
  const [showNewEmail, setShowNewEmail] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [savingNewPhone, setSavingNewPhone] = useState(false);
  const [savingNewEmail, setSavingNewEmail] = useState(false);
  const [errorNewPhone, setErrorNewPhone] = useState<string | null>(null);
  const [errorNewEmail, setErrorNewEmail] = useState<string | null>(null);

  // Adicionar campo para mostrar o estágio atual e mover para um novo estágio
  const [stages, setStages] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (propCard) {
      setCard(propCard);
      setLoading(false);
    } else if (!card) {
      setLoading(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Card não encontrado');
          const data = await res.json();
          setCard(data.data || null);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [funnel_id, card_id, card, propCard]);

  useEffect(() => {
    if (card) {
      setLoading(false);
    }
  }, [card]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    if (tab === 'itens') {
      setLoadingItems(true);
      setErrorItems(null);
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erro ao buscar itens');
          const data = await res.json();
          setItems(data.data || []);
        })
        .catch((err) => setErrorItems(err.message))
        .finally(() => setLoadingItems(false));
    } else if (tab === 'comentarios') {
      setLoadingComments(true);
      setErrorComments(null);
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erro ao buscar comentários');
          const data = await res.json();
          setComments(data.data || []);
        })
        .catch((err) => setErrorComments(err.message))
        .finally(() => setLoadingComments(false));
    } else if (tab === 'tarefas') {
      setLoadingTasks(true);
      setErrorTasks(null);
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erro ao buscar tarefas');
          const data = await res.json();
          setTasks(data.data || []);
        })
        .catch((err) => setErrorTasks(err.message))
        .finally(() => setLoadingTasks(false));
    } else if (tab === 'tags') {
      setLoadingTags(true);
      setErrorTags(null);
      Promise.all([
        fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`http://localhost:3004/api/tags`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ])
        .then(async ([cardTagsRes, allTagsRes]) => {
          const cardTagsData = cardTagsRes.ok ? await cardTagsRes.json() : { data: [] };
          const allTagsData = allTagsRes.ok ? await allTagsRes.json() : { data: [] };
          setCardTags(cardTagsData.data || []);
          setAllTags(allTagsData.data || []);
        })
        .catch((err) => setErrorTags(err.message))
        .finally(() => setLoadingTags(false));
    } else if (tab === 'arquivos') {
      setLoadingFiles(true);
      setErrorFiles(null);
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/files`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erro ao buscar arquivos');
          const data = await res.json();
          setFiles(data.data || []);
        })
        .catch((err) => setErrorFiles(err.message))
        .finally(() => setLoadingFiles(false));
    } else if (tab === 'historico') {
      setLoadingHistory(true);
      setErrorHistory(null);
      fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Erro ao buscar histórico');
          const data = await res.json();
          setHistory(data.data || []);
        })
        .catch((err) => setErrorHistory(err.message))
        .finally(() => setLoadingHistory(false));
    }
  }, [tab, funnel_id, card_id]);

  useEffect(() => {
    if (propContacts) {
      setContacts(propContacts);
    } else if (!contacts || contacts.length === 0) {
      // Buscar contatos se não vieram via prop
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
      fetch(`http://localhost:3004/api/contatos?client_id=1`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setContacts(data.data || []));
    }
  }, [contacts, propContacts]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/stages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStages(data.data || []));
  }, [funnel_id]);

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newComment }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao adicionar comentário');
        const data = await res.json();
        setComments(prev => [...prev, data]);
        setNewComment('');
      })
      .catch(() => {})
      .finally(() => setPostingComment(false));
  }

  function handleAddTag() {
    if (!addingTagId || addingTag) return;

    setAddingTag(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag_id: parseInt(addingTagId) }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao adicionar tag');
        const data = await res.json();
        setCardTags(prev => [...prev, data]);
        setAddingTagId('');
      })
      .catch(() => {})
      .finally(() => setAddingTag(false));
  }

  function handleRemoveTag(tagId: number) {
    setRemovingTagId(tagId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/tags/${tagId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(() => {
        setCardTags(prev => prev.filter(ct => ct.tag_id !== tagId));
      })
      .catch(() => {})
      .finally(() => setRemovingTagId(null));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro no upload');
        const data = await res.json();
        setFiles(prev => [...prev, data]);
        e.target.value = '';
      })
      .catch((err) => setUploadError(err.message))
      .finally(() => setUploading(false));
  }

  function handleRemoveFile(fileId: number) {
    setRemovingFileId(fileId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(() => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      })
      .catch(() => {})
      .finally(() => setRemovingFileId(null));
  }

  function handleEdit() {
    if (!card) return;
    setEditForm({
      title: card.title || '',
      description: card.description || '',
      contact_id: card.contact_id ? String(card.contact_id) : '',
      phone: card.phone || '',
      email: card.email || '',
      company_name: card.company_name || '',
      company_type: card.company_type || '',
      expected_close_date: card.expected_close_date || '',
      temperature: card.temperature || '',
      probability: card.probability ? String(card.probability) : '',
      responsible_user_id: card.responsible_user_id ? String(card.responsible_user_id) : '',
      estimated_value: card.estimated_value ? String(card.estimated_value) : '',
      current_stage_id: card.current_stage_id ? String(card.current_stage_id) : '', // Adicionar campo para mostrar o estágio atual e mover para um novo estágio
      status: card.status || 'open', // Adicionar status ao formulário
    });
    setEditModalOpen(true);
  }

  // Carrega telefones e emails quando o modal abre e há contato selecionado
  useEffect(() => {
    if (editModalOpen && editForm?.contact_id) {
      setLoadingPhones(true);
      setLoadingEmails(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
      fetch(`http://localhost:3004/api/contact_phones?contact_id=${editForm.contact_id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setContactPhones(data.data || []))
        .finally(() => setLoadingPhones(false));

      fetch(`http://localhost:3004/api/contact_emails?contact_id=${editForm.contact_id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setContactEmails(data.data || []))
        .finally(() => setLoadingEmails(false));
    }
  }, [editForm?.contact_id, editModalOpen]);

  // Função para salvar novo telefone
  async function saveNewPhone() {
    if (!newPhoneNumber.trim() || !editForm.contact_id) return;

    setSavingNewPhone(true);
    setErrorNewPhone(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    
    try {
      const res = await fetch('http://localhost:3004/api/contact_phones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: parseInt(editForm.contact_id),
          phone_number: newPhoneNumber,
        }),
      });
      
      if (!res.ok) throw new Error('Erro ao salvar telefone');
      
      const data = await res.json();
      setContactPhones(prev => [...prev, data]);
      setEditForm(prev => ({ ...prev, phone_id: String(data.id), phone: data.phone_number }));
      setNewPhoneNumber('');
      setShowNewPhone(false);
    } catch (err: unknown) {
      setErrorNewPhone(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSavingNewPhone(false);
    }
  }

  // Função para salvar novo email
  async function saveNewEmail() {
    if (!newEmailAddress.trim() || !editForm.contact_id) return;

    setSavingNewEmail(true);
    setErrorNewEmail(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    
    try {
      const res = await fetch('http://localhost:3004/api/contact_emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_id: parseInt(editForm.contact_id),
          email: newEmailAddress,
        }),
      });
      
      if (!res.ok) throw new Error('Erro ao salvar email');
      
      const data = await res.json();
      setContactEmails(prev => [...prev, data]);
      setEditForm(prev => ({ ...prev, email_id: String(data.id), email: data.email }));
      setNewEmailAddress('');
      setShowNewEmail(false);
    } catch (err: unknown) {
      setErrorNewEmail(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSavingNewEmail(false);
    }
  }

  // Adicionar useEffect para ativar showNewPhone/showNewEmail
  useEffect(() => {
    if (editModalOpen && editForm?.phone_id === '__new__' && !showNewPhone) {
      setShowNewPhone(true);
    }
  }, [editForm?.phone_id, editModalOpen, showNewPhone]);
  useEffect(() => {
    if (editModalOpen && editForm?.email_id === '__new__' && !showNewEmail) {
      setShowNewEmail(true);
    }
  }, [editForm?.email_id, editModalOpen, showNewEmail]);

  // MOCK de administradores para o select de responsável
  const admins = [
    { id: 1, name: 'Admin 1' },
    { id: 2, name: 'Admin 2' },
    { id: 3, name: 'Admin 3' },
  ];

  function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    setEditError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
    const payload: Record<string, unknown> = {
      title: editForm.title,
      description: editForm.description || null,
      contact_id: editForm.contact_id ? parseInt(editForm.contact_id) : null,
      company_name: editForm.company_name || null,
      company_type: editForm.company_type || null,
      expected_close_date: editForm.expected_close_date || null,
      temperature: editForm.temperature || null,
      probability: editForm.probability ? parseFloat(editForm.probability) : null,
      responsible_user_id: editForm.responsible_user_id ? parseInt(editForm.responsible_user_id) : null,
      estimated_value: editForm.estimated_value ? parseFloat(editForm.estimated_value) : null,
      current_stage_id: editForm.current_stage_id ? parseInt(editForm.current_stage_id) : null, // Adicionar campo para mostrar o estágio atual e mover para um novo estágio
      status: editForm.status || 'open', // Adicionar status ao payload
    };

    // Se phone_id ou email_id foram selecionados (e não são novos), incluir no payload
    if (editForm.phone_id && editForm.phone_id !== '__new__') {
      payload.phone_id = parseInt(editForm.phone_id);
    }
    if (editForm.email_id && editForm.email_id !== '__new__') {
      payload.email_id = parseInt(editForm.email_id);
    }

    fetch(`http://localhost:3004/api/funnels/${funnel_id}/cards/${card_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao salvar alterações');
        const data = await res.json();
        setCard(data);
        setEditModalOpen(false);
      })
      .catch((err) => setEditError(err.message))
      .finally(() => setSavingEdit(false));
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!card) return <div>Card não encontrado</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{card.title}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>{card.description}</p>
        </div>
        <button
          onClick={handleEdit}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Editar
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: tab === tabItem.key ? '#f8f9fa' : 'transparent',
              borderBottom: tab === tabItem.key ? '2px solid #007bff' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {tab === 'geral' && (
          <div>
            {/* Ajustar estilo da visualização */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '14px', color: '#333' }}>
              <div>
                <strong>Valor Estimado</strong>
                <div>{typeof card.estimated_value === 'number' ? card.estimated_value.toFixed(2) : '0,00'}</div>
              </div>
              <div>
                <strong>Status</strong>
                <div>{card.status || 'N/A'}</div>
              </div>
              <div>
                <strong>Contato</strong>
                <div>{contacts.find(c => c.id === card.contact_id)?.name || 'N/A'}</div>
              </div>
              <div>
                <strong>Telefone</strong>
                <div>{card.phone || 'N/A'}</div>
              </div>
              <div>
                <strong>Email</strong>
                <div>{card.email || 'N/A'}</div>
              </div>
              <div>
                <strong>Empresa</strong>
                <div>{card.company_name || 'N/A'}</div>
              </div>
              <div>
                <strong>Tipo de Empresa</strong>
                <div>{card.company_type || 'N/A'}</div>
              </div>
              <div>
                <strong>Data Prevista</strong>
                <div>{card.expected_close_date || 'N/A'}</div>
              </div>
              <div>
                <strong>Temperatura</strong>
                <div>{card.temperature || 'N/A'}</div>
              </div>
              <div>
                <strong>Probabilidade</strong>
                <div>{card.probability ? `${card.probability}%` : 'N/A'}</div>
              </div>
              <div>
                <strong>Responsável</strong>
                <div>{admins.find(a => a.id === card.responsible_user_id)?.name || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'itens' && (
          <div>
            {loadingItems ? (
              <div>Carregando itens...</div>
            ) : errorItems ? (
              <div>Erro: {errorItems}</div>
            ) : (
              <div>
                <h3>Itens do Card</h3>
                {items.length === 0 ? (
                  <p>Nenhum item encontrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div><strong>{item.product_service.name}</strong></div>
                        <div>Quantidade: {item.quantity}</div>
                        <div>Valor Unitário: R$ {item.unit_price.toFixed(2)}</div>
                        <div>Valor Total: R$ {item.total_amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'comentarios' && (
          <div>
            <h3>Comentários</h3>
            <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                style={{ width: '100%', minHeight: '80px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}
              />
              <button
                type="submit"
                disabled={postingComment}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {postingComment ? 'Adicionando...' : 'Adicionar Comentário'}
              </button>
            </form>
            {loadingComments ? (
              <div>Carregando comentários...</div>
            ) : errorComments ? (
              <div>Erro: {errorComments}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {comments.map((comment) => (
                  <div key={comment.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>{comment.user.name}</strong>
                      <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div>{comment.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'tarefas' && (
          <div>
            {loadingTasks ? (
              <div>Carregando tarefas...</div>
            ) : errorTasks ? (
              <div>Erro: {errorTasks}</div>
            ) : (
              <div>
                <h3>Tarefas</h3>
                {tasks.length === 0 ? (
                  <p>Nenhuma tarefa encontrada.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {tasks.map((task) => (
                      <div key={task.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input type="checkbox" checked={task.completed} readOnly />
                          <strong>{task.title}</strong>
                        </div>
                        {task.description && <div style={{ marginTop: '5px' }}>{task.description}</div>}
                        {task.due_date && (
                          <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                            Vencimento: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.assigned_to && (
                          <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                            Atribuída a: {task.assigned_to.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'tags' && (
          <div>
            {loadingTags ? (
              <div>Carregando tags...</div>
            ) : errorTags ? (
              <div>Erro: {errorTags}</div>
            ) : (
              <div>
                <h3>Tags</h3>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      value={addingTagId}
                      onChange={(e) => setAddingTagId(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Selecione uma tag</option>
                      {allTags
                        .filter(tag => !cardTags.find(ct => ct.tag_id === tag.id))
                        .map(tag => (
                          <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                    <button
                      onClick={handleAddTag}
                      disabled={!addingTagId || addingTag}
                      style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {addingTag ? 'Adicionando...' : 'Adicionar Tag'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {cardTags.map((cardTag) => (
                    <div
                      key={cardTag.id}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: cardTag.tag.color,
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {cardTag.tag.name}
                      <button
                        onClick={() => handleRemoveTag(cardTag.tag_id)}
                        disabled={removingTagId === cardTag.tag_id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '0',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'arquivos' && (
          <div>
            {loadingFiles ? (
              <div>Carregando arquivos...</div>
            ) : errorFiles ? (
              <div>Erro: {errorFiles}</div>
            ) : (
              <div>
                <h3>Arquivos</h3>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ marginBottom: '10px' }}
                  />
                  {uploading && <div>Fazendo upload...</div>}
                  {uploadError && <div style={{ color: 'red' }}>Erro: {uploadError}</div>}
                </div>
                {files.length === 0 ? (
                  <p>Nenhum arquivo encontrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {files.map((file) => (
                      <div key={file.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div><strong>{file.original_filename}</strong></div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {(file.file_size / 1024).toFixed(1)} KB • {file.mime_type}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Enviado em {new Date(file.uploaded_at).toLocaleString()}
                            {file.uploader && ` por ${file.uploader.name}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          disabled={removingFileId === file.id}
                          style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {removingFileId === file.id ? 'Removendo...' : 'Remover'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'historico' && (
          <div>
            {loadingHistory ? (
              <div>Carregando histórico...</div>
            ) : errorHistory ? (
              <div>Erro: {errorHistory}</div>
            ) : (
              <div>
                <h3>Histórico</h3>
                {history.length === 0 ? (
                  <p>Nenhum histórico encontrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {history.map((entry) => (
                      <div key={entry.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <strong>{entry.action}</strong>
                          <span style={{ fontSize: '14px', color: '#666' }}>
                            {new Date(entry.created_at).toLocaleString()} • {entry.user.name}
                          </span>
                        </div>
                        <div>{entry.details}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} width={600} title="Editar Card">
        <form onSubmit={handleSubmitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', color: '#333' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Título:</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descrição:</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contato:</label>
            <select
              value={editForm.contact_id}
              onChange={(e) => {
                setEditForm(prev => ({ ...prev, contact_id: e.target.value }));
                // Reset phone/email when contact changes
                setEditForm(prev => ({ ...prev, phone_id: '', email_id: '', phone: '', email: '' }));
                setContactPhones([]);
                setContactEmails([]);
              }}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Selecione um contato</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>{contact.name}</option>
              ))}
            </select>
          </div>

          {editForm.contact_id && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Telefone:</label>
                <select
                  value={editForm.phone_id || ''}
                  onChange={(e) => {
                    const phoneId = e.target.value;
                    if (phoneId === '__new__') {
                      setEditForm(prev => ({ ...prev, phone_id: phoneId, phone: '' }));
                      setShowNewPhone(true);
                    } else {
                      const phone = contactPhones.find(p => p.id === parseInt(phoneId));
                      setEditForm(prev => ({ ...prev, phone_id: phoneId, phone: phone?.phone_number || '' }));
                      setShowNewPhone(false);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  disabled={loadingPhones}
                >
                  <option value="">Selecione um telefone</option>
                  <option value="__new__">+ Adicionar novo telefone</option>
                  {contactPhones.map(phone => (
                    <option key={phone.id} value={phone.id}>{phone.phone_number}</option>
                  ))}
                </select>
                {showNewPhone && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder="Digite o novo telefone"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={saveNewPhone}
                      disabled={savingNewPhone}
                      style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      {savingNewPhone ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewPhone(false);
                        setNewPhoneNumber('');
                        setEditForm(prev => ({ ...prev, phone_id: '', phone: '' }));
                      }}
                      style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {errorNewPhone && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errorNewPhone}</div>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                <select
                  value={editForm.email_id || ''}
                  onChange={(e) => {
                    const emailId = e.target.value;
                    if (emailId === '__new__') {
                      setEditForm(prev => ({ ...prev, email_id: emailId, email: '' }));
                      setShowNewEmail(true);
                    } else {
                      const email = contactEmails.find(e => e.id === parseInt(emailId));
                      setEditForm(prev => ({ ...prev, email_id: emailId, email: email?.email || '' }));
                      setShowNewEmail(false);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  disabled={loadingEmails}
                >
                  <option value="">Selecione um email</option>
                  <option value="__new__">+ Adicionar novo email</option>
                  {contactEmails.map(email => (
                    <option key={email.id} value={email.id}>{email.email}</option>
                  ))}
                </select>
                {showNewEmail && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="email"
                      value={newEmailAddress}
                      onChange={(e) => setNewEmailAddress(e.target.value)}
                      placeholder="Digite o novo email"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={saveNewEmail}
                      disabled={savingNewEmail}
                      style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      {savingNewEmail ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewEmail(false);
                        setNewEmailAddress('');
                        setEditForm(prev => ({ ...prev, email_id: '', email: '' }));
                      }}
                      style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {errorNewEmail && <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{errorNewEmail}</div>}
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Empresa:</label>
              <input
                type="text"
                value={editForm.company_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo de Empresa:</label>
              <input
                type="text"
                value={editForm.company_type}
                onChange={(e) => setEditForm(prev => ({ ...prev, company_type: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data Prevista de Fechamento:</label>
              <input
                type="date"
                value={editForm.expected_close_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, expected_close_date: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Temperatura:</label>
              <select
                value={editForm.temperature}
                onChange={(e) => setEditForm(prev => ({ ...prev, temperature: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Selecione</option>
                <option value="fria">Fria</option>
                <option value="morna">Morna</option>
                <option value="quente">Quente</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Probabilidade (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editForm.probability}
                onChange={(e) => setEditForm(prev => ({ ...prev, probability: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Responsável:</label>
              <select
                value={editForm.responsible_user_id}
                onChange={(e) => setEditForm(prev => ({ ...prev, responsible_user_id: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Selecione</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Valor Estimado:</label>
            <input
              type="number"
              step="0.01"
              value={editForm.estimated_value}
              onChange={(e) => setEditForm(prev => ({ ...prev, estimated_value: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          {/* Adicionar campo para mostrar o estágio atual e mover para um novo estágio */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estágio Atual:</label>
            <div>{stages.find(stage => stage.id === card?.current_stage_id)?.name || 'N/A'}</div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mover para o Estágio:</label>
            <select
              value={editForm.current_stage_id || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, current_stage_id: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Selecione um estágio</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          {/* Adicionar campo para selecionar o status do card */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status:</label>
            <select
              value={editForm.status || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Selecione um status</option>
              <option value="open">Aberto</option>
              <option value="won">Ganho</option>
              <option value="lost">Perdido</option>
              <option value="paused">Pausado</option>
            </select>
          </div>

          {editError && (
            <div style={{ color: 'red', fontSize: '14px' }}>
              {editError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {savingEdit ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}