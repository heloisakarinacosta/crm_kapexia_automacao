# Integração da Automação (Régua de Contatos) ao CRM Existente

## 1. Estrutura de Arquivos para Integração

### Arquivos Novos (copiar para seu projeto):

\`\`\`
frontend/src/
├── app/
│   └── admin/
│       └── automacao/                      # ⚠️ MUDANÇA: era "estrategias"
│           ├── layout.tsx
│           └── page.tsx                    # Página principal
├── components/
│   └── estrategias/                        # Mantém nome interno
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
│   └── estrategias.ts                      # Mantém nome interno
└── components/ui/
    ├── textarea.tsx                        # Componente UI (se não existir)
    └── switch.tsx                          # Componente UI (se não existir)
\`\`\`

### Arquivos para Modificar:

1. **frontend/src/components/layout/Sidebar.tsx**
   - Adicionar item "Automação" no menu (não "Estratégias")

2. **frontend/package.json**
   - Adicionar dependências: `react-dnd` e `react-dnd-html5-backend`

3. **backend/src/routes/** (criar novos arquivos)
   - `automationRoutes.js` (ou manter `strategiesRoutes.js`)
   - `automationNodesRoutes.js`
   - `automationExecutionsRoutes.js`

## 2. Mudanças Específicas para "Automação"

### ✅ **O que MUDA:**
- **Título da página**: "Automação - Régua de Contatos"
- **Item do menu**: "Automação" (não "Estratégias")
- **Rota**: `/admin/automacao` (não `/admin/estrategias`)
- **Textos da interface**: "ações" em vez de "nós", "Executar Automação", etc.

### ✅ **O que NÃO MUDA:**
- **Nomes dos arquivos internos**: mantém `estrategias/` para organização
- **Nomes das tabelas**: mantém `strategies`, `strategy_nodes`, etc.
- **APIs**: pode manter `/api/strategies` ou criar `/api/automation`
- **Tipos TypeScript**: mantém `estrategias.ts`

## 3. Integração Passo a Passo

### Passo 1: Executar SQL (sem mudanças)
\`\`\`bash
# No seu banco de dados MySQL
mysql -u seu_usuario -p seu_banco < scripts/estrategias_schema.sql
\`\`\`

### Passo 2: Adicionar ao Menu
Edite `frontend/src/components/layout/Sidebar.tsx`:

\`\`\`tsx
// Adicionar no array de menu items
{
  title: 'Automação',                    // ⚠️ MUDANÇA: era "Estratégias"
  icon: 'zap',                          // ⚠️ MUDANÇA: ícone de automação
  href: '/admin/automacao',             // ⚠️ MUDANÇA: era "/admin/estrategias"
  description: 'Régua de Contatos'     // ⚠️ MUDANÇA: descrição mais clara
}
\`\`\`

### Passo 3: Criar Pasta Correta
\`\`\`bash
# Criar a pasta com o nome correto
mkdir -p app/admin/automacao
# Copiar arquivos para a pasta correta
\`\`\`

### Passo 4: APIs (Opcional - pode manter as existentes)
\`\`\`javascript
// Opção 1: Manter rotas existentes
app.use('/api/strategies', strategiesRoutes);

// Opção 2: Criar novas rotas (alias)
app.use('/api/automation', strategiesRoutes);
\`\`\`

## 4. Verificação de Conflitos

### ✅ **Checklist de Integração:**
- [ ] Não há conflito com menu "Estratégias" existente
- [ ] Rota `/admin/automacao` está livre
- [ ] Título "Automação" não confunde usuários
- [ ] Ícone diferente do "Estratégias" existente

## 5. Sugestões de Nomenclatura

### **No Menu do CRM:**
- **Estratégias** → Planejamento estratégico, metas, campanhas
- **Automação** → Régua de contatos, workflows, sequências

### **Diferenciação Clara:**
- **Estratégias**: Visão macro, planejamento, campanhas
- **Automação**: Execução, workflows, sequências de contato

## 6. Testando a Integração

### Teste Local:
1. Execute o SQL para criar as tabelas
2. Copie os arquivos para `app/admin/automacao/`
3. Instale as dependências: `npm install react-dnd react-dnd-html5-backend`
4. Adicione "Automação" no menu (não "Estratégias")
5. Acesse `/admin/automacao`

### Verificações:
- [ ] Página carrega sem erros
- [ ] Não há conflito com "Estratégias" existente
- [ ] Título mostra "Automação - Régua de Contatos"
- [ ] Funcionalidades funcionam normalmente

## 7. Resumo das Mudanças

| Item | Antes | Depois |
|------|-------|--------|
| **Título** | "Régua de Estratégias" | "Automação - Régua de Contatos" |
| **Menu** | "Estratégias" | "Automação" |
| **Rota** | `/admin/estrategias` | `/admin/automacao` |
| **Pasta** | `app/estrategias/` | `app/automacao/` |
| **Ícone** | `timeline` | `zap` ou `workflow` |

**✅ Resultado:** Sem conflitos, nomenclatura clara, funcionalidade mantida!
