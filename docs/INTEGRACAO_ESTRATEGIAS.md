# Integração da Régua de Estratégias ao CRM Existente

## 1. Estrutura de Arquivos para Integração

### Arquivos Novos (copiar para seu projeto):

\`\`\`
frontend/src/
├── app/
│   └── admin/
│       └── estrategias/
│           └── page.tsx                    # Página principal
├── components/
│   └── estrategias/                        # Todos os componentes
│       ├── NodeSidebar.tsx
│       ├── WorkflowCanvas.tsx
│       ├── TimelineSection.tsx
│       ├── TimelineDayCanvas.tsx
│       ├── NodeComponent.tsx
│       ├── DraggableNode.tsx
│       ├── PropertiesPanel.tsx
│       ├── ExecutionControls.tsx
│       └── ExecutionLogs.tsx
├── constants/
│   └── kapexia-colors.ts                   # Paleta de cores
├── types/
│   └── estrategias.ts                      # Tipos TypeScript
└── components/ui/
    ├── textarea.tsx                        # Componente UI (se não existir)
    └── switch.tsx                          # Componente UI (se não existir)
\`\`\`

### Arquivos para Modificar:

1. **frontend/src/components/layout/Sidebar.tsx**
   - Adicionar item "Estratégias" no menu

2. **frontend/package.json**
   - Adicionar dependências: `react-dnd` e `react-dnd-html5-backend`

3. **backend/src/routes/** (criar novos arquivos)
   - `strategiesRoutes.js`
   - `strategyNodesRoutes.js`
   - `strategyExecutionsRoutes.js`

## 2. Dependências Necessárias

### Frontend:
\`\`\`bash
cd frontend
npm install react-dnd react-dnd-html5-backend
\`\`\`

### Backend:
Nenhuma dependência nova necessária (usa MySQL existente)

## 3. Integração Passo a Passo

### Passo 1: Executar SQL
\`\`\`bash
# No seu banco de dados MySQL
mysql -u seu_usuario -p seu_banco < scripts/estrategias_schema.sql
\`\`\`

### Passo 2: Adicionar ao Menu
Edite `frontend/src/components/layout/Sidebar.tsx`:

\`\`\`tsx
// Adicionar no array de menu items
{
  title: 'Estratégias',
  icon: 'timeline',
  href: '/admin/estrategias',
  description: 'Régua de Estratégias'
}
\`\`\`

### Passo 3: Copiar Arquivos
Copie todos os arquivos do CodeProject para as pastas correspondentes.

### Passo 4: Criar Rotas Backend
\`\`\`javascript
// backend/src/routes/strategiesRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/strategies - Listar estratégias do cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id;
    // Implementar lógica de busca
    res.json({ strategies: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/strategies - Criar nova estratégia
router.post('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const userId = req.user.id;
    // Implementar lógica de criação
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
\`\`\`

### Passo 5: Registrar Rotas
Em `backend/src/app.js`:

\`\`\`javascript
const strategiesRoutes = require('./routes/strategiesRoutes');
app.use('/api/strategies', strategiesRoutes);
\`\`\`

## 4. Configuração de Autenticação

A página já está preparada para usar o sistema de auth existente:

\`\`\`tsx
// Em app/admin/estrategias/page.tsx
// Adicionar verificação de auth se necessário
import { useAuth } from '@/hooks/useAuth'; // se existir

export default function EstrategiasPage() {
  // const { user } = useAuth(); // se necessário
  // const clientId = user?.client_id;
  
  // ... resto do código
}
\`\`\`

## 5. Testando a Integração

### Teste Local:
1. Execute o SQL para criar as tabelas
2. Copie os arquivos para as pastas corretas
3. Instale as dependências: `npm install react-dnd react-dnd-html5-backend`
4. Adicione o item no menu
5. Acesse `/admin/estrategias`

### Verificações:
- [ ] Página carrega sem erros
- [ ] Drag & drop funciona
- [ ] Zoom e pan funcionam (Ctrl + scroll, Ctrl + drag)
- [ ] Nós podem ser adicionados à timeline
- [ ] Propriedades podem ser editadas
- [ ] Execução simula corretamente

## 6. Próximos Passos (Opcional)

1. **Implementar APIs Backend**
   - CRUD de estratégias
   - Execução real de webhooks
   - Logs de execução

2. **Conectar com Banco**
   - Salvar/carregar estratégias
   - Persistir configurações

3. **Integração com N8N/Make**
   - Executar webhooks reais
   - Receber callbacks

4. **Analytics**
   - Dashboard de performance
   - Métricas de conversão

## 7. Estrutura de Dados

### Exemplo de Estratégia Salva:
\`\`\`json
{
  "id": 1,
  "client_id": 1,
  "name": "Prospecção B2B Q1",
  "data_inicial": "2025-01-15",
  "dias_uteis": false,
  "timeline_days": [-5, -3, 0, 2, 7],
  "nodes": [
    {
      "id": "node-1",
      "type": "send-email",
      "day": -5,
      "title": "Email Inicial",
      "position": {"x": 50, "y": 50},
      "config": {
        "subject": "Primeira Abordagem",
        "body": "Olá! Gostaria de apresentar...",
        "webhook": "https://webhook.site/abc123"
      }
    }
  ]
}
\`\`\`

## 8. Troubleshooting

### Erro de Fontes:
- Já corrigido no código (usa fontes do sistema)

### Erro de Dependências:
\`\`\`bash
npm install react-dnd react-dnd-html5-backend @radix-ui/react-switch
\`\`\`

### Erro de Rotas:
- Verificar se o item foi adicionado corretamente no menu
- Verificar se a página está em `app/admin/estrategias/page.tsx`

### Erro de Tipos:
- Verificar se `types/estrategias.ts` foi copiado
- Verificar imports nos componentes
