# INSTRUÇÕES PARA APLICAR DASHBOARD DINÂMICO

## 1. SQL PARA CRIAR TABELAS

Execute no seu MySQL:

```sql
-- Tabela para configurações de cards do dashboard
CREATE TABLE dashboard_card_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  card_position INT NOT NULL COMMENT 'Posição do card (1, 2 ou 3)',
  card_title VARCHAR(255) NOT NULL,
  sql_query TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '📊',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_client_position (client_id, card_position)
);

-- Tabela para configurações do OpenAI por cliente
CREATE TABLE openai_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  assistant_id VARCHAR(255) NULL COMMENT 'ID do Assistant OpenAI, se NULL usa completion',
  model VARCHAR(100) DEFAULT 'gpt-4' COMMENT 'Modelo para completion quando não há assistant',
  system_prompt TEXT NULL COMMENT 'Prompt do sistema para completion',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_client_openai (client_id)
);
```

## 2. ARQUIVOS PARA COPIAR

### Backend - Modelos

**backend/src/models/dashboardCardConfigModel.js**
**backend/src/models/openaiConfigModel.js**

### Backend - Controladores

**backend/src/controllers/dashboardCardController.js**
**backend/src/controllers/openaiController.js**

### Backend - Rotas

**backend/src/routes/dashboardRoutes.js**
**backend/src/routes/openaiRoutes.js**

### Frontend

**frontend/src/app/admin/settings/dashboard/page.tsx**

## 3. ARQUIVOS PARA MODIFICAR

### backend/src/app.js
Adicionar estas linhas:

```javascript
// Nas importações (linha ~17):
const dashboardRoutes = require('./routes/dashboardRoutes');
const openaiRoutes = require('./routes/openaiRoutes');

// Nas rotas (linha ~58):
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/openai', openaiRoutes);
```

### frontend/src/components/dashboard/IndicatorCardsSection.tsx
Substituir todo o conteúdo pelo novo código que carrega dados dinâmicos.

### frontend/src/components/layout/Sidebar.tsx
Adicionar item de menu:

```javascript
// Na linha ~31, adicionar:
{ id: 'dashboard-config', name: 'Config Dashboard', icon: '🔧', path: '/admin/settings/dashboard' },
```

## 4. COMANDOS PARA EXECUTAR

```bash
# 1. Criar as tabelas SQL acima no MySQL

# 2. Reiniciar backend
pm2 restart crm_kapexia_backend

# 3. Rebuild frontend
cd /home/projetos/crm_kapexia/frontend
npm run build

# 4. Reiniciar frontend
pm2 restart crm_kapexia_frontend
```

## 5. COMO TESTAR

1. Acesse o menu "Config Dashboard"
2. Configure os 3 cards com SQLs personalizados
3. Configure OpenAI para o chat
4. Volte ao Dashboard e veja os cards dinâmicos funcionando

## 6. EXEMPLOS DE SQL PARA CARDS

**Card 1:**
```sql
SELECT 'Novos Leads (Semana)' as title, 42 as value, '12%' as percentual
```

**Card 2:**
```sql
SELECT 'Agendamentos (Mês)' as title, 200 as value, '5%' as percentual
```

**Card 3:**
```sql
SELECT 'Taxa de Conversão' as title, '8.5%' as value, '2.3%' as percentual
```

