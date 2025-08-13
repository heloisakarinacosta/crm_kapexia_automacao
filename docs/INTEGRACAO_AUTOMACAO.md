# 🤖 Integração do Sistema de Automação no CRM

## 📋 Resumo
Este guia explica como integrar o sistema de **Automação - Régua de Contatos** ao seu CRM existente.

## 🗄️ Schema do Banco de Dados

### Tabelas Criadas:
- `automations` - Automações principais
- `automation_nodes` - Ações/nós da automação  
- `automation_executions` - Histórico de execuções
- `automation_execution_logs` - Logs detalhados
- `automation_templates` - Templates pré-definidos

### Relacionamentos:
- Todas as tabelas são vinculadas ao `client_id` (multi-tenancy)
- Referências corrigidas para `administrators` em vez de `users`
- Foreign keys com CASCADE para limpeza automática

## 🔧 Integração no CRM

### 1. Estrutura de Arquivos
\`\`\`
seu-crm/
├── app/admin/
│   └── automacao/           # Nova pasta
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   └── estrategias/         # Mantém nome interno
│       └── [todos os componentes]
└── scripts/
    └── automacao_schema.sql # Execute no MySQL
\`\`\`

### 2. Menu do CRM
Adicione no seu menu administrativo:
\`\`\`php
[
    'title' => 'Automação',
    'icon' => 'zap',
    'route' => '/admin/automacao',
    'permission' => 'automacao.view'
]
\`\`\`

### 3. APIs Necessárias

#### GET /api/automations
\`\`\`javascript
// Listar automações do cliente
app.get('/api/automations', async (req, res) => {
  const { client_id } = req.user;
  const automations = await db.query(`
    SELECT * FROM automations 
    WHERE client_id = ? AND is_active = 1
    ORDER BY created_at DESC
  `, [client_id]);
  res.json(automations);
});
\`\`\`

#### POST /api/automations
\`\`\`javascript
// Criar nova automação
app.post('/api/automations', async (req, res) => {
  const { client_id, administrator_id } = req.user;
  const { name, description, data_inicial, dias_uteis, timeline_days, nodes } = req.body;
  
  // Inserir automação
  const automation = await db.query(`
    INSERT INTO automations (client_id, administrator_id, name, description, data_inicial, dias_uteis, timeline_days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [client_id, administrator_id, name, description, data_inicial, dias_uteis, JSON.stringify(timeline_days)]);
  
  // Inserir nós
  for (const node of nodes) {
    await db.query(`
      INSERT INTO automation_nodes (automation_id, client_id, node_id, type, title, day, position_x, position_y, config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [automation.insertId, client_id, node.id, node.type, node.title, node.day, node.position.x, node.position.y, JSON.stringify(node.config)]);
  }
  
  res.json({ success: true, id: automation.insertId });
});
\`\`\`

#### POST /api/automations/:id/execute
\`\`\`javascript
// Executar automação
app.post('/api/automations/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { client_id, administrator_id } = req.user;
  const { execution_type, target_day, target_node_id } = req.body;
  
  // Criar execução
  const execution = await db.query(`
    INSERT INTO automation_executions (automation_id, client_id, administrator_id, execution_type, target_day, target_node_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, client_id, administrator_id, execution_type, target_day, target_node_id]);
  
  // Processar nós (implementar lógica de execução)
  await processAutomationExecution(execution.insertId);
  
  res.json({ success: true, execution_id: execution.insertId });
});
\`\`\`

## 🔄 Fluxo de Execução

### 1. Workflow Geral (day = -999)
- Importação de dados
- Preparação de variáveis
- Consultas ao banco

### 2. Timeline (days específicos)
- Envio de emails/WhatsApp
- Criação de tarefas
- Webhooks externos
- Condições e delays

### 3. Logs e Monitoramento
- Cada ação gera log em `automation_execution_logs`
- Status: pending → running → success/error
- Webhook responses são armazenadas

## 🎯 Próximos Passos

1. **Execute o SQL**: `automacao_schema.sql`
2. **Copie os arquivos**: Para sua estrutura do CRM
3. **Implemente as APIs**: Seguindo os exemplos acima
4. **Configure o menu**: Adicione "Automação" 
5. **Teste a integração**: Crie uma automação simples

## 📞 Suporte
- Interface funcional e testada no v0
- Schema otimizado para multi-tenancy
- Pronto para produção com webhooks reais

**A automação está pronta para ser integrada ao seu CRM!** 🚀
