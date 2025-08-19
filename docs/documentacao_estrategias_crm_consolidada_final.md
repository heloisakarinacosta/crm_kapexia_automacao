# Documentação Consolidada: Sistema de Estratégia de Vendas CRM

## 📋 Visão Geral

Este documento consolida a especificação completa do sistema de estratégia de vendas, incorporando todas as correções de segurança, performance e compatibilidade identificadas na revisão crítica. O sistema permite gestão completa de contatos, estratégias configuráveis, oportunidades e tarefas com interface moderna e funcionalidades avançadas.

## 🎯 Fluxo de Trabalho do Sistema

### **A) Configuração de Estratégias (Menu: Configurações)**
1. **Administrador acessa "Configurações" → "Estratégias"**
2. **Cria estratégia "Qualificação"** com estágios: "OPORTUNIDADE, AGENDA, PROPOSTA, FECHAMENTO, DESCARTE"
3. **Cria estratégia "Expansão da Base"** com estágios: "CONTATO, OPORTUNIDADE, PROPOSTA, FECHAMENTO, DESCARTE"
4. **Define cores, probabilidades e automações** para cada estágio

### **B) Cadastro de Contatos (Menu: Contatos)**
1. **Administrador acessa "Contatos" → "Novo Contato"**
2. **Cadastra contato "Karina"** com dados completos (telefones, emails, endereços)
3. **Define responsável, temperatura e origem** do contato

### **C) Gestão de Estratégias (Menu: Estratégia)**
1. **Administrador acessa "Estratégia" → Seleciona estratégia "Qualificação"**
2. **Visualiza board Kanban** com estágios do estratégia
3. **Adiciona "Karina" ao estágio "Oportunidade"** criando um card
4. **Posteriormente, adiciona "Karina" a outro estratégia** se necessário

### **D) Histórico do Contato (Menu: Contatos → Detalhes)**
1. **Administrador acessa "Contatos" → Clica em "Karina"**
2. **Visualiza dados cadastrais completos**
3. **Vê histórico de todos os estratégias** que Karina participou/participa
4. **Acessa timeline completa** de interações e movimentações

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS (CORRIGIDA)

### 1. CONTATOS

#### 1.1 Tabela Principal de Contatos
```sql
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Dados básicos (com validações)
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  company VARCHAR(255) NULL CHECK (company IS NULL OR CHAR_LENGTH(TRIM(company)) >= 2),
  position VARCHAR(255) NULL COMMENT 'Cargo/Posição na empresa',
  
  -- Dados principais (com validações)
  primary_email VARCHAR(255) NULL CHECK (
    primary_email IS NULL OR 
    primary_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
  ),
  primary_phone VARCHAR(20) NULL CHECK (
    primary_phone IS NULL OR 
    primary_phone REGEXP '^\\+?[1-9]\\d{1,14}$'
  ),
  
  -- Classificação
  contact_type ENUM('lead', 'prospect', 'customer', 'partner', 'other') DEFAULT 'lead',
  temperature ENUM('hot', 'warm', 'cold', 'invalid') DEFAULT 'warm',
  lead_source VARCHAR(100) NULL COMMENT 'Origem do lead (site, indicação, etc)',
  
  -- Dados complementares (com validações)
  birth_date DATE NULL CHECK (birth_date IS NULL OR birth_date <= CURDATE()),
  gender ENUM('M', 'F', 'other') NULL,
  notes TEXT NULL,
  
  -- Dados de controle
  owner_user_id INT NOT NULL COMMENT 'Administrador responsável pelo contato',
  created_by_user_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contact_at TIMESTAMP NULL COMMENT 'Último contato realizado',
  
  -- Constraints e índices
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES administrators(id),
  FOREIGN KEY (created_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_owner_user (owner_user_id),
  INDEX idx_temperature (temperature),
  INDEX idx_contact_type (contact_type),
  INDEX idx_last_contact (last_contact_at),
  INDEX idx_contacts_search (client_id, is_active, name, company, primary_email)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  ROW_FORMAT=DYNAMIC
  COMMENT='Tabela principal de contatos do CRM';
```

#### 1.2 Telefones dos Contatos
```sql
CREATE TABLE contact_phones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  
  phone VARCHAR(20) NOT NULL CHECK (phone REGEXP '^\\+?[1-9]\\d{1,14}$'),
  phone_type ENUM('mobile', 'home', 'work', 'fax', 'other') DEFAULT 'mobile',
  country_code VARCHAR(5) DEFAULT '+55' CHECK (country_code REGEXP '^\\+[1-9]\\d{0,3}$'),
  
  is_primary BOOLEAN DEFAULT FALSE,
  is_whatsapp BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  notes VARCHAR(255) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  
  INDEX idx_contact_primary (contact_id, is_primary),
  INDEX idx_phone_type (phone_type),
  INDEX idx_whatsapp (is_whatsapp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.3 Emails dos Contatos
```sql
CREATE TABLE contact_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  
  email VARCHAR(255) NOT NULL CHECK (
    email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
  ),
  email_type ENUM('personal', 'work', 'other') DEFAULT 'personal',
  
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  notes VARCHAR(255) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  
  INDEX idx_contact_primary (contact_id, is_primary),
  INDEX idx_email_type (email_type),
  UNIQUE KEY unique_contact_email (contact_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.4 Endereços dos Contatos
```sql
CREATE TABLE contact_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  
  address_type ENUM('home', 'work', 'billing', 'shipping', 'other') DEFAULT 'home',
  
  street VARCHAR(255) NULL,
  number VARCHAR(20) NULL,
  complement VARCHAR(100) NULL,
  neighborhood VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(50) NULL,
  postal_code VARCHAR(20) NULL,
  country VARCHAR(50) DEFAULT 'Brasil',
  
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  
  INDEX idx_contact_primary (contact_id, is_primary),
  INDEX idx_address_type (address_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. ESTRATÉGIAS E ESTÁGIOS

#### 2.1 Configuração de Estratégias
```sql
CREATE TABLE funnels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  description TEXT NULL,
  funnel_type ENUM('sales', 'customer_success', 'support', 'custom') DEFAULT 'sales',
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  
  -- Configurações visuais
  color VARCHAR(7) DEFAULT '#3B82F6' CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$'),
  icon VARCHAR(50) DEFAULT '🎯',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_funnel_type (funnel_type),
  UNIQUE KEY unique_client_default (client_id, is_default),
  UNIQUE KEY unique_client_funnel_name (client_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2.2 Estágios dos Estratégias
```sql
CREATE TABLE funnel_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_id INT NOT NULL,
  
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  description TEXT NULL,
  
  -- Configurações do estágio
  sort_order INT NOT NULL CHECK (sort_order > 0),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Configurações de negócio
  probability_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (
    probability_percentage >= 0 AND probability_percentage <= 100
  ),
  is_closed_won BOOLEAN DEFAULT FALSE COMMENT 'Estágio de fechamento ganho',
  is_closed_lost BOOLEAN DEFAULT FALSE COMMENT 'Estágio de fechamento perdido',
  
  -- Configurações visuais
  color VARCHAR(7) DEFAULT '#10B981' CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$'),
  
  -- Automações
  auto_move_after_days INT NULL CHECK (auto_move_after_days IS NULL OR auto_move_after_days > 0),
  next_stage_id INT NULL COMMENT 'Próximo estágio para auto-move',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE,
  FOREIGN KEY (next_stage_id) REFERENCES funnel_stages(id) ON DELETE SET NULL,
  
  INDEX idx_funnel_order (funnel_id, sort_order),
  INDEX idx_funnel_active (funnel_id, is_active),
  UNIQUE KEY unique_funnel_stage_order (funnel_id, sort_order),
  UNIQUE KEY unique_funnel_stage_name (funnel_id, name),
  
  -- Constraint para evitar fechamento duplo
  CONSTRAINT chk_single_close_type CHECK (
    NOT (is_closed_won = TRUE AND is_closed_lost = TRUE)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. CARDS DO ESTRATÉGIA (OPORTUNIDADES)

#### 3.1 Cards Principais
```sql
CREATE TABLE funnel_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  contact_id INT NOT NULL,
  funnel_id INT NOT NULL,
  current_stage_id INT NOT NULL,
  
  -- Dados da oportunidade
  title VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(title)) >= 2),
  description TEXT NULL,
  
  -- Valores
  estimated_value DECIMAL(15,2) DEFAULT 0.00 CHECK (estimated_value >= 0),
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Datas importantes
  expected_close_date DATE NULL CHECK (
    expected_close_date IS NULL OR expected_close_date >= CURDATE()
  ),
  actual_close_date DATE NULL,
  
  -- Status
  status ENUM('open', 'won', 'lost', 'paused') DEFAULT 'open',
  lost_reason VARCHAR(255) NULL,
  
  -- Responsabilidades
  owner_user_id INT NOT NULL COMMENT 'Administrador responsável',
  created_by_user_id INT NOT NULL,
  
  -- Origem
  lead_source VARCHAR(100) NULL,
  campaign_id INT NULL COMMENT 'ID da campanha (se houver)',
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  stage_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (funnel_id) REFERENCES funnels(id),
  FOREIGN KEY (current_stage_id) REFERENCES funnel_stages(id),
  FOREIGN KEY (owner_user_id) REFERENCES administrators(id),
  FOREIGN KEY (created_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_contact_funnel (contact_id, funnel_id),
  INDEX idx_stage_status (current_stage_id, status),
  INDEX idx_owner_user (owner_user_id),
  INDEX idx_expected_close (expected_close_date),
  INDEX idx_priority (priority),
  INDEX idx_funnel_cards_performance (client_id, current_stage_id, status, owner_user_id, expected_close_date),
  
  -- Constraint para datas lógicas
  CONSTRAINT chk_close_dates CHECK (
    actual_close_date IS NULL OR 
    actual_close_date >= DATE(created_at)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3.2 Histórico de Movimentações (com Particionamento)
```sql
CREATE TABLE funnel_card_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  funnel_card_id INT NOT NULL,
  
  -- Movimentação
  from_stage_id INT NULL,
  to_stage_id INT NOT NULL,
  
  -- Dados da movimentação
  moved_by_user_id INT NOT NULL,
  move_reason TEXT NULL,
  
  -- Valores no momento da movimentação
  value_at_time DECIMAL(15,2) NULL,
  probability_at_time DECIMAL(5,2) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (funnel_card_id) REFERENCES funnel_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (from_stage_id) REFERENCES funnel_stages(id),
  FOREIGN KEY (to_stage_id) REFERENCES funnel_stages(id),
  FOREIGN KEY (moved_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_card_timeline (funnel_card_id, created_at DESC),
  INDEX idx_stage_moves (to_stage_id, created_at),
  INDEX idx_funnel_card_history_performance (funnel_card_id, created_at DESC, to_stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
  PARTITION p202501 VALUES LESS THAN (202502),
  PARTITION p202502 VALUES LESS THAN (202503),
  PARTITION p202503 VALUES LESS THAN (202504),
  PARTITION p202504 VALUES LESS THAN (202505),
  PARTITION p202505 VALUES LESS THAN (202506),
  PARTITION p202506 VALUES LESS THAN (202507),
  PARTITION p202507 VALUES LESS THAN (202508),
  PARTITION p202508 VALUES LESS THAN (202509),
  PARTITION p202509 VALUES LESS THAN (202510),
  PARTITION p202510 VALUES LESS THAN (202511),
  PARTITION p202511 VALUES LESS THAN (202512),
  PARTITION p202512 VALUES LESS THAN (202601),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

### 4. PRODUTOS E SERVIÇOS

#### 4.1 Catálogo de Produtos/Serviços
```sql
CREATE TABLE products_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Dados básicos
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  description TEXT NULL,
  sku VARCHAR(100) NULL COMMENT 'Código do produto',
  
  -- Tipo
  type ENUM('product', 'service', 'subscription', 'bundle') DEFAULT 'product',
  category VARCHAR(100) NULL,
  
  -- Preços
  base_price DECIMAL(15,2) DEFAULT 0.00 CHECK (base_price >= 0),
  cost_price DECIMAL(15,2) DEFAULT 0.00 CHECK (cost_price >= 0),
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_period ENUM('monthly', 'quarterly', 'yearly') NULL,
  
  -- Estoque (se aplicável)
  track_inventory BOOLEAN DEFAULT FALSE,
  current_stock INT DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_alert INT DEFAULT 0 CHECK (min_stock_alert >= 0),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_type_category (type, category),
  INDEX idx_sku (sku),
  UNIQUE KEY unique_client_sku (client_id, sku),
  UNIQUE KEY unique_client_product_name (client_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4.2 Itens dos Cards do Estratégia
```sql
CREATE TABLE funnel_card_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_card_id INT NOT NULL,
  product_service_id INT NOT NULL,
  
  -- Quantidade e preços
  quantity DECIMAL(10,3) DEFAULT 1.000 CHECK (quantity > 0),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  discount_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (
    discount_percentage >= 0 AND discount_percentage <= 100
  ),
  discount_amount DECIMAL(15,2) DEFAULT 0.00 CHECK (discount_amount >= 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Observações
  notes TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (funnel_card_id) REFERENCES funnel_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (product_service_id) REFERENCES products_services(id),
  
  INDEX idx_card_items (funnel_card_id),
  INDEX idx_product_usage (product_service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. TAREFAS

#### 5.1 Tarefas Principais
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Relacionamentos
  funnel_card_id INT NULL COMMENT 'Tarefa relacionada a um card do estratégia',
  contact_id INT NULL COMMENT 'Tarefa relacionada a um contato',
  
  -- Dados da tarefa
  title VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(title)) >= 2),
  description TEXT NULL,
  
  -- Tipo e prioridade
  task_type ENUM('call', 'email', 'meeting', 'follow_up', 'demo', 'proposal', 'other') DEFAULT 'call',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  -- Datas
  due_date DATETIME NULL,
  completed_at DATETIME NULL,
  
  -- Status
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  
  -- Responsabilidades
  assigned_to_user_id INT NOT NULL,
  created_by_user_id INT NOT NULL,
  
  -- Configurações
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(100) NULL COMMENT 'Padrão de recorrência (daily, weekly, etc)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (funnel_card_id) REFERENCES funnel_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES administrators(id),
  FOREIGN KEY (created_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_client_status (client_id, status),
  INDEX idx_assigned_user (assigned_to_user_id, status),
  INDEX idx_due_date (due_date),
  INDEX idx_funnel_card (funnel_card_id),
  INDEX idx_contact_tasks (contact_id),
  INDEX idx_tasks_user_date (assigned_to_user_id, status, due_date, client_id),
  
  -- Constraint para datas lógicas
  CONSTRAINT chk_task_dates CHECK (
    completed_at IS NULL OR 
    completed_at >= created_at
  ),
  
  -- Constraint para relacionamentos
  CONSTRAINT chk_task_relations CHECK (
    funnel_card_id IS NOT NULL OR contact_id IS NOT NULL
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5.2 Compartilhamento de Tarefas
```sql
CREATE TABLE task_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  shared_with_user_id INT NOT NULL,
  shared_by_user_id INT NOT NULL,
  
  -- Permissões
  can_edit BOOLEAN DEFAULT FALSE,
  can_complete BOOLEAN DEFAULT FALSE,
  
  -- Observações
  share_message TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES administrators(id),
  FOREIGN KEY (shared_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_shared_user (shared_with_user_id),
  INDEX idx_task_shares (task_id),
  UNIQUE KEY unique_task_user_share (task_id, shared_with_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5.3 Comentários/Mensagens das Tarefas
```sql
CREATE TABLE task_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  
  comment TEXT NOT NULL CHECK (CHAR_LENGTH(TRIM(comment)) >= 1),
  
  -- Anexos
  attachment_path VARCHAR(500) NULL,
  attachment_name VARCHAR(255) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES administrators(id),
  
  INDEX idx_task_timeline (task_id, created_at),
  INDEX idx_user_comments (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. USUÁRIOS E PERMISSÕES (ATUALIZAÇÃO SEGURA)

#### 6.1 Atualização da Tabela de Administradors
```sql
-- Verificar se colunas já existem antes de adicionar
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'user_type') = 0,
              'ALTER TABLE administrators ADD COLUMN user_type ENUM(\'admin\', \'manager\', \'sales\', \'support\', \'viewer\') DEFAULT \'sales\'',
              'SELECT "Column user_type already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'supervisor_user_id') = 0,
              'ALTER TABLE administrators ADD COLUMN supervisor_user_id INT NULL',
              'SELECT "Column supervisor_user_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'can_view_all_contacts') = 0,
              'ALTER TABLE administrators ADD COLUMN can_view_all_contacts BOOLEAN DEFAULT FALSE',
              'SELECT "Column can_view_all_contacts already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'can_edit_all_contacts') = 0,
              'ALTER TABLE administrators ADD COLUMN can_edit_all_contacts BOOLEAN DEFAULT FALSE',
              'SELECT "Column can_edit_all_contacts already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'can_view_all_funnels') = 0,
              'ALTER TABLE administrators ADD COLUMN can_view_all_funnels BOOLEAN DEFAULT FALSE',
              'SELECT "Column can_view_all_funnels already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_name = 'administrators' AND column_name = 'can_edit_all_funnels') = 0,
              'ALTER TABLE administrators ADD COLUMN can_edit_all_funnels BOOLEAN DEFAULT FALSE',
              'SELECT "Column can_edit_all_funnels already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar foreign key e índices se não existirem
SET @sql = IF((SELECT COUNT(*) FROM information_schema.key_column_usage 
               WHERE table_name = 'administrators' AND column_name = 'supervisor_user_id') = 0,
              'ALTER TABLE administrators ADD FOREIGN KEY (supervisor_user_id) REFERENCES administrators(id) ON DELETE SET NULL',
              'SELECT "Foreign key supervisor_user_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_name = 'administrators' AND index_name = 'idx_supervisor') = 0,
              'ALTER TABLE administrators ADD INDEX idx_supervisor (supervisor_user_id)',
              'SELECT "Index idx_supervisor already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_name = 'administrators' AND index_name = 'idx_user_type') = 0,
              'ALTER TABLE administrators ADD INDEX idx_user_type (user_type)',
              'SELECT "Index idx_user_type already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

#### 6.2 Permissões Específicas por Estratégia
```sql
CREATE TABLE user_funnel_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  funnel_id INT NOT NULL,
  
  -- Permissões
  can_view BOOLEAN DEFAULT TRUE,
  can_create_cards BOOLEAN DEFAULT TRUE,
  can_edit_cards BOOLEAN DEFAULT TRUE,
  can_move_cards BOOLEAN DEFAULT TRUE,
  can_delete_cards BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES administrators(id) ON DELETE CASCADE,
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_user_funnel (user_id, funnel_id),
  INDEX idx_user_permissions (user_id),
  INDEX idx_funnel_permissions (funnel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. AUDITORIA E SEGURANÇA

#### 7.1 Log de Auditoria
```sql
CREATE TABLE audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  user_id INT NOT NULL,
  
  -- Dados da operação
  table_name VARCHAR(100) NOT NULL,
  record_id INT NOT NULL,
  operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  
  -- Dados alterados
  old_values JSON NULL,
  new_values JSON NULL,
  changed_fields JSON NULL,
  
  -- Contexto
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  request_id VARCHAR(100) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES administrators(id),
  
  INDEX idx_client_table_record (client_id, table_name, record_id),
  INDEX idx_user_operations (user_id, created_at),
  INDEX idx_operation_time (operation, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (YEAR(created_at) * 100 + QUARTER(created_at)) (
  PARTITION p2025q1 VALUES LESS THAN (202502),
  PARTITION p2025q2 VALUES LESS THAN (202503),
  PARTITION p2025q3 VALUES LESS THAN (202504),
  PARTITION p2025q4 VALUES LESS THAN (202601),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

### 8. CONFIGURAÇÕES E AUTOMAÇÕES

#### 8.1 Configurações do Cliente para Estratégia
```sql
CREATE TABLE client_funnel_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Configurações gerais
  default_funnel_id INT NULL,
  auto_create_tasks BOOLEAN DEFAULT TRUE,
  
  -- Configurações de notificação
  notify_stage_changes BOOLEAN DEFAULT TRUE,
  notify_overdue_tasks BOOLEAN DEFAULT TRUE,
  notify_card_assignments BOOLEAN DEFAULT TRUE,
  
  -- Configurações de automação
  auto_move_inactive_cards BOOLEAN DEFAULT FALSE,
  inactive_days_threshold INT DEFAULT 30 CHECK (inactive_days_threshold > 0),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (default_funnel_id) REFERENCES funnels(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_client_settings (client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 8.2 Templates de Tarefas por Estágio
```sql
CREATE TABLE stage_task_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_stage_id INT NOT NULL,
  
  -- Template da tarefa
  task_title VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(task_title)) >= 2),
  task_description TEXT NULL,
  task_type ENUM('call', 'email', 'meeting', 'follow_up', 'demo', 'proposal', 'other') DEFAULT 'call',
  
  -- Configurações de criação
  auto_create BOOLEAN DEFAULT FALSE,
  days_after_stage_entry INT DEFAULT 0 CHECK (days_after_stage_entry >= 0),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (funnel_stage_id) REFERENCES funnel_stages(id) ON DELETE CASCADE,
  
  INDEX idx_stage_templates (funnel_stage_id, is_active),
  INDEX idx_auto_create (auto_create)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📊 DADOS DE EXEMPLO

### Inserir Estratégias Padrão
```sql
-- Estratégia de Qualificação
INSERT INTO funnels (client_id, name, description, funnel_type, is_default, color, icon) VALUES
(1, 'Qualificação', 'Estratégia principal de qualificação de leads', 'sales', TRUE, '#3B82F6', '🎯'),
(1, 'Expansão da Base', 'Estratégia de expansão e upsell de clientes', 'customer_success', FALSE, '#10B981', '📈');

-- Estágios do Estratégia de Qualificação
INSERT INTO funnel_stages (funnel_id, name, sort_order, probability_percentage, color) VALUES
(1, 'OPORTUNIDADE', 1, 10.00, '#EF4444'),
(1, 'AGENDA', 2, 25.00, '#F59E0B'),
(1, 'PROPOSTA', 3, 50.00, '#3B82F6'),
(1, 'FECHAMENTO', 4, 90.00, '#10B981'),
(1, 'DESCARTE', 5, 0.00, '#6B7280');

-- Marcar estágios de fechamento
UPDATE funnel_stages SET is_closed_won = TRUE WHERE funnel_id = 1 AND name = 'FECHAMENTO';
UPDATE funnel_stages SET is_closed_lost = TRUE WHERE funnel_id = 1 AND name = 'DESCARTE';

-- Estágios do Estratégia de Expansão da Base
INSERT INTO funnel_stages (funnel_id, name, sort_order, probability_percentage, color) VALUES
(2, 'CONTATO', 1, 15.00, '#F59E0B'),
(2, 'OPORTUNIDADE', 2, 35.00, '#3B82F6'),
(2, 'PROPOSTA', 3, 65.00, '#8B5CF6'),
(2, 'FECHAMENTO', 4, 90.00, '#10B981'),
(2, 'DESCARTE', 5, 0.00, '#6B7280');

-- Marcar estágios de fechamento para expansão
UPDATE funnel_stages SET is_closed_won = TRUE WHERE funnel_id = 2 AND name = 'FECHAMENTO';
UPDATE funnel_stages SET is_closed_lost = TRUE WHERE funnel_id = 2 AND name = 'DESCARTE';
```

### Inserir Contato de Exemplo (Karina)
```sql
-- Inserir contato Karina
INSERT INTO contacts (
  client_id, name, company, position, primary_email, primary_phone,
  contact_type, temperature, lead_source, owner_user_id, created_by_user_id
) VALUES (
  1, 'Karina Silva', 'Tech Solutions Ltda', 'Diretora de Vendas',
  'karina@techsolutions.com.br', '+5511987654321',
  'lead', 'warm', 'site', 1, 1
);

-- Inserir telefones adicionais da Karina
INSERT INTO contact_phones (contact_id, phone, phone_type, is_primary, is_whatsapp) VALUES
(1, '+5511987654321', 'mobile', TRUE, TRUE),
(1, '+551133334444', 'work', FALSE, FALSE);

-- Inserir emails adicionais da Karina
INSERT INTO contact_emails (contact_id, email, email_type, is_primary) VALUES
(1, 'karina@techsolutions.com.br', 'work', TRUE),
(1, 'karina.silva@gmail.com', 'personal', FALSE);

-- Inserir endereço da Karina
INSERT INTO contact_addresses (
  contact_id, address_type, street, number, neighborhood, 
  city, state, postal_code, is_primary
) VALUES (
  1, 'work', 'Av. Paulista', '1000', 'Bela Vista',
  'São Paulo', 'SP', '01310-100', TRUE
);
```

### Inserir Card da Karina no Estratégia
```sql
-- Inserir Karina no estratégia de Qualificação, estágio Oportunidade
INSERT INTO funnel_cards (
  client_id, contact_id, funnel_id, current_stage_id,
  title, description, estimated_value, expected_close_date,
  owner_user_id, created_by_user_id, lead_source, priority
) VALUES (
  1, 1, 1, 1,
  'CRM para Tech Solutions', 
  'Implementação de sistema CRM para equipe de vendas de 15 pessoas',
  25000.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY),
  1, 1, 'site', 'high'
);
```

### Inserir Produtos/Serviços de Exemplo
```sql
INSERT INTO products_services (client_id, name, description, type, base_price, category) VALUES
(1, 'CRM Básico', 'Plano básico do CRM com até 5 administradors', 'subscription', 299.00, 'Software'),
(1, 'CRM Profissional', 'Plano profissional com administradors ilimitados', 'subscription', 599.00, 'Software'),
(1, 'Consultoria em Vendas', 'Consultoria especializada em processos de vendas', 'service', 2500.00, 'Consultoria'),
(1, 'Treinamento de Equipe', 'Treinamento para equipe de vendas', 'service', 1500.00, 'Treinamento'),
(1, 'Implementação Personalizada', 'Implementação e customização do sistema', 'service', 5000.00, 'Implementação');
```

---

## 🎨 ESTRUTURA DE MENUS E NAVEGAÇÃO

### **Menu Principal:**
```
📊 Dashboard
👥 Contatos
🎯 Estratégia
📋 Tarefas
📈 Relatórios
⚙️  Configurações
   ├── 🎯 Estratégias
   ├── 📦 Produtos/Serviços
   ├── 👤 Administradors
   ├── 📊 Dashboard
   └── 🔧 Geral
```

### **Fluxo de Navegação:**

#### **1. Configurações → Estratégias**
- Lista de estratégias do cliente
- Botão "Novo Estratégia"
- Para cada estratégia: configurar estágios, cores, probabilidades
- Templates de tarefas por estágio

#### **2. Contatos**
- Lista de todos os contatos
- Filtros: temperatura, tipo, responsável
- Busca por nome, empresa, email
- Botão "Novo Contato"
- Ao clicar em contato: modal com abas
  - **Dados Cadastrais:** informações pessoais, telefones, emails, endereços
  - **Estratégias:** histórico de participação em estratégias
  - **Tarefas:** tarefas relacionadas ao contato
  - **Timeline:** histórico completo de interações

#### **3. Estratégia**
- Seletor de estratégia no topo
- Board Kanban com colunas por estágio
- Métricas em tempo real no header
- Filtros avançados
- Cards arrastáveis entre estágios
- Botão "Adicionar ao Estratégia" em cada coluna

#### **4. Tarefas**
- Lista de tarefas do administrador
- Filtros: status, prioridade, data
- Agrupamento por: hoje, esta semana, atrasadas
- Integração com cards do estratégia

---

## 🚀 APIS NECESSÁRIAS

### **1. Contatos**
```typescript
// Listar contatos
GET /api/contacts?page=1&limit=20&search=karina&temperature=warm

// Criar contato
POST /api/contacts
{
  name: "Karina Silva",
  company: "Tech Solutions",
  primary_email: "karina@techsolutions.com.br",
  phones: [
    { phone: "+5511987654321", type: "mobile", is_primary: true, is_whatsapp: true }
  ],
  emails: [
    { email: "karina@techsolutions.com.br", type: "work", is_primary: true }
  ]
}

// Obter detalhes do contato
GET /api/contacts/1
{
  contact: { ... },
  phones: [ ... ],
  emails: [ ... ],
  addresses: [ ... ],
  funnel_history: [ ... ],
  active_cards: [ ... ]
}
```

### **2. Estratégias**
```typescript
// Listar estratégias do cliente
GET /api/funnels

// Obter estratégia com estágios e cards
GET /api/funnels/1/board
{
  funnel: { ... },
  stages: [
    {
      id: 1,
      name: "OPORTUNIDADE",
      cards: [ ... ],
      metrics: { total_value: 50000, card_count: 5 }
    }
  ]
}

// Mover card entre estágios
PUT /api/funnel-cards/1/move
{
  to_stage_id: 2,
  reason: "Cliente demonstrou interesse"
}
```

### **3. Cards do Estratégia**
```typescript
// Criar card no estratégia
POST /api/funnel-cards
{
  contact_id: 1,
  funnel_id: 1,
  stage_id: 1,
  title: "CRM para Tech Solutions",
  estimated_value: 25000,
  expected_close_date: "2025-02-15"
}

// Adicionar produtos ao card
POST /api/funnel-cards/1/items
{
  product_service_id: 2,
  quantity: 1,
  unit_price: 599.00
}
```

### **4. Métricas em Tempo Real**
```typescript
// WebSocket para métricas do estratégia
WS /ws/funnel-metrics/1
{
  type: "metrics_update",
  data: {
    total_pipeline: 150000,
    conversion_rate: 23.5,
    avg_cycle_days: 45,
    active_opportunities: 12
  }
}
```

---

## 🎨 COMPONENTES DE INTERFACE

### **1. Página de Configuração de Estratégias**
```typescript
// /admin/settings/funnels
const FunnelConfigPage = () => {
  return (
    <div className="funnel-config">
      <PageHeader title="Configuração de Estratégias" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Estratégias */}
        <FunnelList 
          funnels={funnels}
          onSelect={setSelectedFunnel}
          onNew={createNewFunnel}
        />
        
        {/* Configuração do Estratégia */}
        <FunnelEditor 
          funnel={selectedFunnel}
          onSave={saveFunnel}
        />
        
        {/* Estágios do Estratégia */}
        <StageManager 
          stages={selectedFunnel?.stages}
          onStageUpdate={updateStage}
        />
      </div>
    </div>
  );
};
```

### **2. Página de Contatos**
```typescript
// /admin/contacts
const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <PageHeader 
        title="Contatos" 
        action={<NewContactButton />}
      />
      
      <ContactFilters 
        filters={filters}
        onChange={setFilters}
      />
      
      <ContactTable 
        contacts={contacts}
        onContactClick={openContactModal}
      />
      
      <ContactModal 
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};
```

### **3. Página do Estratégia (Kanban)**
```typescript
// /admin/funnel
const FunnelPage = () => {
  return (
    <div className="funnel-page">
      <FunnelHeader 
        funnels={funnels}
        selectedFunnel={selectedFunnel}
        onFunnelChange={setSelectedFunnel}
      />
      
      <FunnelMetrics 
        metrics={metrics}
        realtime={true}
      />
      
      <FunnelFilters 
        filters={filters}
        onChange={setFilters}
      />
      
      <FunnelKanbanBoard 
        funnel={selectedFunnel}
        cards={filteredCards}
        onCardMove={moveCard}
        onCardClick={openCardModal}
      />
    </div>
  );
};
```

### **4. Modal de Detalhes do Contato**
```typescript
const ContactModal = ({ contact, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="contact-modal">
        <ContactHeader contact={contact} />
        
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="funnels">Estratégias</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ContactProfile contact={contact} />
          </TabsContent>
          
          <TabsContent value="funnels">
            <ContactFunnelHistory 
              contactId={contact.id}
              activeCards={contact.active_cards}
              history={contact.funnel_history}
            />
          </TabsContent>
          
          <TabsContent value="tasks">
            <ContactTasks contactId={contact.id} />
          </TabsContent>
          
          <TabsContent value="timeline">
            <ContactTimeline contactId={contact.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
};
```

---

## ✅ PLANO DE IMPLEMENTAÇÃO CONSOLIDADO

### **Fase 1: Fundação (Semana 1-2)**
1. ✅ **Banco de Dados**
   - Criar todas as tabelas com validações
   - Configurar índices otimizados
   - Implementar particionamento
   - Inserir dados de exemplo

2. ✅ **Segurança**
   - Sistema de auditoria
   - Validações rigorosas
   - Constraints de integridade

### **Fase 2: Backend Core (Semana 3-4)**
1. ✅ **APIs de Contatos**
   - CRUD completo com validação
   - Busca avançada
   - Gestão de telefones/emails/endereços

2. ✅ **APIs de Estratégias**
   - Configuração de estratégias e estágios
   - Movimentação de cards
   - Histórico de mudanças

### **Fase 3: Frontend Base (Semana 5-6)**
1. ✅ **Páginas de Configuração**
   - Configuração de estratégias
   - Gestão de estágios
   - Templates de tarefas

2. ✅ **Página de Contatos**
   - Lista com filtros
   - Modal de detalhes
   - Formulário de cadastro

### **Fase 4: Estratégia Kanban (Semana 7-8)**
1. ✅ **Board Kanban**
   - Visualização por estágios
   - Drag & drop
   - Métricas em tempo real

2. ✅ **Cards Interativos**
   - Modal de detalhes
   - Edição inline
   - Gestão de produtos/serviços

### **Fase 5: Funcionalidades Avançadas (Semana 9-10)**
1. ✅ **Sistema de Tarefas**
   - Criação e gestão
   - Compartilhamento
   - Comentários

2. ✅ **Automações**
   - Movimentação automática
   - Criação de tarefas
   - Notificações

### **Fase 6: Produção (Semana 11-12)**
1. ✅ **Testes e Otimização**
   - Testes de carga
   - Otimização de queries
   - Monitoramento

2. ✅ **Deploy e Migração**
   - Migração de dados existentes
   - Deploy gradual
   - Treinamento de administradors

---

## 🎯 CONCLUSÃO

Esta documentação consolidada fornece uma base completa e segura para implementação do sistema de estratégia de vendas, contemplando:

- ✅ **Fluxo de trabalho completo** conforme especificado
- ✅ **Estrutura de banco robusta** com validações e segurança
- ✅ **APIs bem definidas** para todas as funcionalidades
- ✅ **Interface moderna** com componentes reutilizáveis
- ✅ **Plano de implementação** detalhado e realista
- ✅ **Compatibilidade** com sistema existente
- ✅ **Escalabilidade** para crescimento futuro

O sistema permitirá que o cliente configure seus estratégias, cadastre contatos, gerencie oportunidades e acompanhe todo o histórico de forma intuitiva e eficiente.



---

## ANÁLISE DE COMPATIBILIDADE E ADAPTAÇÕES
# Análise de Compatibilidade: Funil de Vendas vs Sistema Atual

## 📊 RESUMO EXECUTIVO

Após análise detalhada do código atual, identifiquei **pontos de compatibilidade** e **áreas que precisam de adaptação** para integrar o sistema de funil de vendas com a versão atual do CRM.

---

## 🔍 ESTRUTURA ATUAL IDENTIFICADA

### **1. Banco de Dados Existente**

#### **Tabelas Principais:**
- ✅ `clients` - Estrutura de clientes já implementada
- ✅ `administrators` - Usuários com `client_id` (compatível)
- ✅ `chart_configs` - Configurações de gráficos por cliente
- ✅ `dashboard_card_configs` - Cards do dashboard
- ✅ `openai_configs` - Configurações de IA por cliente
- ✅ `demo_leads` - Dados de demonstração de leads

#### **Tabelas Externas (WhatsApp):**
- 📊 `kapexia_whatsapp.contatos` - Contatos do WhatsApp
- 📊 `kapexia_whatsapp.leads` - Leads do WhatsApp

### **2. APIs Existentes**

#### **Contatos/Leads (Relatórios):**
```
GET /api/contatos/conversas?period=week|month|range
GET /api/leads/count?period=today|week|month|range  
GET /api/leads/list?period=today|week|month|range
```

#### **Outras APIs Funcionais:**
- ✅ `/api/auth` - Autenticação
- ✅ `/api/users` - Usuários
- ✅ `/api/clients` - Clientes
- ✅ `/api/dashboard` - Dashboard cards
- ✅ `/api/openai` - Chat com IA

---

## ⚠️ PROBLEMAS DE COMPATIBILIDADE IDENTIFICADOS

### **1. CONFLITO DE NOMENCLATURA**

#### **Problema:**
- **Sistema Atual:** Usa `administrators` para usuários
- **Documentação:** Propõe `users` 

#### **Solução:**
```sql
-- Manter tabela administrators existente
-- Adicionar colunas necessárias para funil
ALTER TABLE administrators 
ADD COLUMN user_type ENUM('admin', 'manager', 'sales', 'support', 'viewer') DEFAULT 'sales',
ADD COLUMN supervisor_user_id INT NULL,
ADD COLUMN can_view_all_contacts BOOLEAN DEFAULT FALSE,
ADD COLUMN can_edit_all_contacts BOOLEAN DEFAULT FALSE;
```

### **2. ESTRUTURA DE CONTATOS INCOMPATÍVEL**

#### **Problema:**
- **Sistema Atual:** `kapexia_whatsapp.contatos` (básico, para relatórios)
- **Documentação:** `contacts` (completo, para CRM)

#### **Solução:**
```sql
-- Criar nova tabela contacts para CRM
-- Manter kapexia_whatsapp.contatos para relatórios
-- Criar integração entre as duas quando necessário
```

### **3. LEADS vs CONTATOS**

#### **Problema:**
- **Sistema Atual:** Diferencia `leads` e `contatos`
- **Documentação:** Unifica tudo em `contacts` com `contact_type`

#### **Solução:**
```sql
-- Manter diferenciação atual
-- Criar migração: leads → contacts (type='lead')
-- Criar migração: contatos → contacts (type='customer')
```

---

## ✅ PONTOS DE COMPATIBILIDADE

### **1. ISOLAMENTO POR CLIENTE**
- ✅ **Sistema Atual:** Todas as tabelas têm `client_id`
- ✅ **Documentação:** Também usa `client_id`
- ✅ **Compatibilidade:** 100% compatível

### **2. ESTRUTURA DE USUÁRIOS**
- ✅ **Sistema Atual:** `administrators` com `client_id`
- ✅ **Documentação:** Pode usar `administrators` em vez de `users`
- ✅ **Compatibilidade:** Adaptável com ALTER TABLE

### **3. CONFIGURAÇÕES POR CLIENTE**
- ✅ **Sistema Atual:** Padrão de configurações por cliente
- ✅ **Documentação:** Mesmo padrão
- ✅ **Compatibilidade:** 100% compatível

---

## 🔄 PLANO DE INTEGRAÇÃO ADAPTADO

### **Fase 1: Extensão da Estrutura Atual (Semana 1)**

#### **1.1 Atualizar Tabela de Usuários**
```sql
-- Estender administrators em vez de criar users
ALTER TABLE administrators 
ADD COLUMN user_type ENUM('admin', 'manager', 'sales', 'support', 'viewer') DEFAULT 'sales',
ADD COLUMN supervisor_user_id INT NULL,
ADD COLUMN can_view_all_contacts BOOLEAN DEFAULT FALSE,
ADD COLUMN can_edit_all_contacts BOOLEAN DEFAULT FALSE,
ADD COLUMN can_view_all_funnels BOOLEAN DEFAULT FALSE,
ADD COLUMN can_edit_all_funnels BOOLEAN DEFAULT FALSE;

-- Adicionar foreign key para supervisor
ALTER TABLE administrators 
ADD FOREIGN KEY (supervisor_user_id) REFERENCES administrators(id) ON DELETE SET NULL;
```

#### **1.2 Criar Tabelas de Contatos CRM**
```sql
-- Nova tabela contacts para CRM (separada de kapexia_whatsapp.contatos)
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Dados básicos
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  company VARCHAR(255) NULL,
  position VARCHAR(255) NULL,
  
  -- Dados principais
  primary_email VARCHAR(255) NULL CHECK (
    primary_email IS NULL OR 
    primary_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
  ),
  primary_phone VARCHAR(20) NULL CHECK (
    primary_phone IS NULL OR 
    primary_phone REGEXP '^\\+?[1-9]\\d{1,14}$'
  ),
  
  -- Classificação
  contact_type ENUM('lead', 'prospect', 'customer', 'partner', 'other') DEFAULT 'lead',
  temperature ENUM('hot', 'warm', 'cold', 'invalid') DEFAULT 'warm',
  lead_source VARCHAR(100) NULL,
  
  -- Relacionamento com dados externos
  whatsapp_contact_id INT NULL COMMENT 'Referência para kapexia_whatsapp.contatos',
  demo_lead_id INT NULL COMMENT 'Referência para demo_leads',
  
  -- Controle
  owner_user_id INT NOT NULL COMMENT 'Referência para administrators',
  created_by_user_id INT NOT NULL COMMENT 'Referência para administrators',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contact_at TIMESTAMP NULL,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES administrators(id),
  FOREIGN KEY (created_by_user_id) REFERENCES administrators(id),
  FOREIGN KEY (demo_lead_id) REFERENCES demo_leads(id) ON DELETE SET NULL,
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_owner_user (owner_user_id),
  INDEX idx_contact_type (contact_type),
  INDEX idx_temperature (temperature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **Fase 2: Funis e Estágios (Semana 2)**

#### **2.1 Criar Estrutura de Funis**
```sql
-- Tabela de funis (compatível com documentação)
CREATE TABLE funnels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  description TEXT NULL,
  funnel_type ENUM('sales', 'customer_success', 'support', 'custom') DEFAULT 'sales',
  
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  
  color VARCHAR(7) DEFAULT '#3B82F6' CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$'),
  icon VARCHAR(50) DEFAULT '🎯',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  
  INDEX idx_client_active (client_id, is_active),
  UNIQUE KEY unique_client_default (client_id, is_default),
  UNIQUE KEY unique_client_funnel_name (client_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estágios (compatível com documentação)
CREATE TABLE funnel_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_id INT NOT NULL,
  
  name VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(name)) >= 2),
  description TEXT NULL,
  
  sort_order INT NOT NULL CHECK (sort_order > 0),
  is_active BOOLEAN DEFAULT TRUE,
  
  probability_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (
    probability_percentage >= 0 AND probability_percentage <= 100
  ),
  is_closed_won BOOLEAN DEFAULT FALSE,
  is_closed_lost BOOLEAN DEFAULT FALSE,
  
  color VARCHAR(7) DEFAULT '#10B981' CHECK (color REGEXP '^#[0-9A-Fa-f]{6}$'),
  
  auto_move_after_days INT NULL CHECK (auto_move_after_days IS NULL OR auto_move_after_days > 0),
  next_stage_id INT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (funnel_id) REFERENCES funnels(id) ON DELETE CASCADE,
  FOREIGN KEY (next_stage_id) REFERENCES funnel_stages(id) ON DELETE SET NULL,
  
  INDEX idx_funnel_order (funnel_id, sort_order),
  UNIQUE KEY unique_funnel_stage_order (funnel_id, sort_order),
  UNIQUE KEY unique_funnel_stage_name (funnel_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **Fase 3: Cards do Funil (Semana 3)**

#### **3.1 Criar Cards e Histórico**
```sql
-- Cards do funil (adaptado para usar administrators)
CREATE TABLE funnel_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  contact_id INT NOT NULL,
  funnel_id INT NOT NULL,
  current_stage_id INT NOT NULL,
  
  title VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TRIM(title)) >= 2),
  description TEXT NULL,
  
  estimated_value DECIMAL(15,2) DEFAULT 0.00 CHECK (estimated_value >= 0),
  currency VARCHAR(3) DEFAULT 'BRL',
  
  expected_close_date DATE NULL,
  actual_close_date DATE NULL,
  
  status ENUM('open', 'won', 'lost', 'paused') DEFAULT 'open',
  lost_reason VARCHAR(255) NULL,
  
  owner_user_id INT NOT NULL COMMENT 'Referência para administrators',
  created_by_user_id INT NOT NULL COMMENT 'Referência para administrators',
  
  lead_source VARCHAR(100) NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  stage_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (funnel_id) REFERENCES funnels(id),
  FOREIGN KEY (current_stage_id) REFERENCES funnel_stages(id),
  FOREIGN KEY (owner_user_id) REFERENCES administrators(id),
  FOREIGN KEY (created_by_user_id) REFERENCES administrators(id),
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_contact_funnel (contact_id, funnel_id),
  INDEX idx_stage_status (current_stage_id, status),
  INDEX idx_owner_user (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **Fase 4: APIs Adaptadas (Semana 4)**

#### **4.1 Manter APIs Existentes**
```javascript
// Manter rotas existentes para compatibilidade
app.use('/api/contatos', contatoRoutes); // Relatórios WhatsApp
app.use('/api/leads', leadRoutes);       // Relatórios Leads

// Adicionar novas rotas para CRM
app.use('/api/crm/contacts', crmContactRoutes);   // CRUD contatos CRM
app.use('/api/crm/strategies', strategyRoutes);   // Gestão de estratégias (funis)
app.use('/api/crm/cards', strategyCardRoutes);    // Cards das estratégias
```

#### **4.2 Criar Migração de Dados**
```javascript
// Endpoint para migrar demo_leads para contacts
POST /api/crm/migrate/demo-leads
{
  "client_id": 1,
  "migrate_all": true
}

// Endpoint para importar contatos do WhatsApp
POST /api/crm/migrate/whatsapp-contacts
{
  "client_id": 1,
  "period": "month"
}
```

---

## 🎨 ADAPTAÇÕES DE INTERFACE

### **1. Menu Atualizado**
```
📊 Dashboard
👥 Contatos (CRM)      ← Nova funcionalidade
🎯 Estratégias         ← Nova funcionalidade (funis/campanhas)
📋 Tarefas             ← Nova funcionalidade
📈 Relatórios
   ├── 📞 Conversas    ← Mantém API atual
   ├── 🎯 Leads        ← Mantém API atual
   └── 📊 Gráficos     ← Existente
⚙️  Configurações
   ├── 🎯 Estratégias  ← Nova funcionalidade (config de funis)
   ├── 👤 Usuários     ← Existente (administrators)
   ├── 📊 Dashboard    ← Existente
   └── 🔧 Geral        ← Existente
```

### **2. Compatibilidade de Rotas**
```javascript
// Manter backward compatibility
app.get('/admin/leads', (req, res) => {
  // Redirecionar para nova página de contatos
  res.redirect(301, '/admin/contacts?type=lead');
});

// Nova estrutura
app.get('/admin/contacts', ContactsPage);
app.get('/admin/strategies', StrategiesPage); // Página de estratégias (funis)
```

---

## 🚀 CRONOGRAMA ADAPTADO

### **Semana 1: Extensão da Base**
- ✅ Estender tabela `administrators`
- ✅ Criar tabela `contacts` com referências
- ✅ Criar tabelas auxiliares (phones, emails, addresses)

### **Semana 2: Estratégias (Funis)**
- ✅ Criar tabelas `funnels` e `funnel_stages`
- ✅ Inserir dados de exemplo
- ✅ APIs de configuração de estratégias

### **Semana 3: Cards e Histórico**
- ✅ Criar `funnel_cards` e `funnel_card_history`
- ✅ APIs de gestão de cards
- ✅ Sistema de movimentação

### **Semana 4: Interface**
- ✅ Página de configuração de estratégias
- ✅ Página de contatos CRM
- ✅ Board Kanban das estratégias

### **Semana 5: Integração**
- ✅ Migração de `demo_leads` para `contacts`
- ✅ Integração com dados do WhatsApp
- ✅ Testes e ajustes

---

## ✅ VANTAGENS DA ABORDAGEM ADAPTADA

### **1. Compatibilidade Total**
- ✅ Mantém todas as funcionalidades existentes
- ✅ Não quebra APIs atuais
- ✅ Preserva dados existentes

### **2. Evolução Gradual**
- ✅ Implementação por fases
- ✅ Testes incrementais
- ✅ Rollback seguro se necessário

### **3. Integração Inteligente**
- ✅ Aproveita estrutura existente
- ✅ Conecta dados do WhatsApp com CRM
- ✅ Migração automática de demo_leads

### **4. Flexibilidade Futura**
- ✅ Base sólida para expansões
- ✅ Estrutura escalável
- ✅ Padrões consistentes

---

## 🎯 CONCLUSÃO

A análise mostra que é **totalmente viável** integrar o sistema de funil de vendas com a versão atual, desde que façamos **adaptações inteligentes** que preservem a compatibilidade.

**Principais Adaptações:**
1. **Usar `administrators` em vez de `users`**
2. **Criar `contacts` separado de `kapexia_whatsapp.contatos`**
3. **Manter APIs existentes e adicionar novas**
4. **Implementar migração gradual de dados**

**Resultado:** Sistema de funil robusto e moderno, totalmente integrado com a base existente, sem quebrar funcionalidades atuais.


---

## 🎯 NOMENCLATURA: "ESTRATÉGIAS" vs "FUNIS"

### **Conceito Expandido**

A mudança de "Funil" para "Estratégias" reflete uma visão mais abrangente do sistema:

#### **🎯 Estratégias (Interface do Usuário):**
- **Nome no Menu:** "Estratégias"
- **Conceito:** Campanhas e processos diversos (vendas, marketing, CS, suporte, etc.)
- **Flexibilidade:** Permite criar estratégias para qualquer tipo de campanha
- **Exemplos:**
  - Estratégia de Qualificação de Leads
  - Estratégia de Expansão da Base
  - Estratégia de Retenção de Clientes
  - Estratégia de Onboarding
  - Estratégia de Suporte Técnico

#### **🔧 Funis (Estrutura Técnica):**
- **Nome no Banco:** `funnels`, `funnel_stages`, `funnel_cards`
- **Conceito:** Estrutura técnica que suporta as estratégias
- **Implementação:** Mantém toda a funcionalidade de funil de vendas
- **APIs:** Podem usar tanto `/strategies` quanto `/funnels` internamente

### **Mapeamento Interface ↔ Técnico**

```
INTERFACE (Usuário)          TÉCNICO (Código)
├── Estratégias          →   funnels
├── Estágios             →   funnel_stages  
├── Cards/Oportunidades  →   funnel_cards
├── Contatos             →   contacts
└── Tarefas              →   tasks
```

### **Vantagens da Nomenclatura "Estratégias"**

✅ **Flexibilidade:** Não limita a vendas, permite qualquer tipo de campanha
✅ **Escalabilidade:** Facilita expansão para outros departamentos
✅ **Clareza:** Conceito mais claro para usuários não-técnicos
✅ **Marketing:** Termo mais atrativo e profissional
✅ **Versatilidade:** Permite casos de uso diversos

### **Exemplos de Estratégias Possíveis**

#### **1. Estratégia de Vendas B2B**
- Estágios: Prospecção → Qualificação → Demo → Proposta → Negociação → Fechamento

#### **2. Estratégia de Marketing Digital**
- Estágios: Lead Magnet → Nutrição → Qualificação → Conversão → Upsell

#### **3. Estratégia de Customer Success**
- Estágios: Onboarding → Adoção → Expansão → Renovação → Advocacy

#### **4. Estratégia de Suporte**
- Estágios: Abertura → Triagem → Análise → Resolução → Fechamento

#### **5. Estratégia de Recrutamento**
- Estágios: Candidatura → Triagem → Entrevista → Teste → Contratação

### **Configuração Flexível por Cliente**

Cada cliente pode criar suas próprias estratégias personalizadas:

```sql
-- Exemplo: Cliente de E-commerce
INSERT INTO funnels (client_id, name, funnel_type) VALUES
(1, 'Estratégia de Conversão', 'sales'),
(1, 'Estratégia de Retenção', 'customer_success'),
(1, 'Estratégia de Upsell', 'sales');

-- Exemplo: Cliente de Consultoria
INSERT INTO funnels (client_id, name, funnel_type) VALUES
(2, 'Estratégia de Captação', 'sales'),
(2, 'Estratégia de Entrega', 'custom'),
(2, 'Estratégia de Renovação', 'customer_success');
```

---

## 📱 INTERFACE ATUALIZADA: PÁGINA DE ESTRATÉGIAS

### **Estrutura da Página `/admin/strategies`**

```typescript
const StrategiesPage: React.FC = () => {
  return (
    <div className="strategies-page">
      {/* Header */}
      <PageHeader 
        title="Estratégias" 
        subtitle="Gerencie suas campanhas e processos"
      />
      
      {/* Seletor de Estratégia */}
      <StrategySelector 
        strategies={strategies}
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
      />
      
      {/* Métricas da Estratégia */}
      <StrategyMetrics 
        strategy={selectedStrategy}
        realtime={true}
      />
      
      {/* Board Kanban */}
      <StrategyKanbanBoard 
        strategy={selectedStrategy}
        cards={cards}
        onCardMove={moveCard}
        onCardClick={openCardModal}
      />
    </div>
  );
};
```

### **Componente Seletor de Estratégia**

```typescript
const StrategySelector: React.FC = ({ strategies, selectedStrategy, onStrategyChange }) => {
  return (
    <div className="strategy-selector bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Estratégia Ativa:</h2>
          
          <Select
            value={selectedStrategy?.id}
            onValueChange={(id) => onStrategyChange(strategies.find(s => s.id === parseInt(id)))}
            className="min-w-64"
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Selecione uma estratégia" />
            </SelectTrigger>
            <SelectContent>
              {strategies.map(strategy => (
                <SelectItem key={strategy.id} value={strategy.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{strategy.icon}</span>
                    <span>{strategy.name}</span>
                    <span className="text-gray-400 text-sm">({strategy.funnel_type})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={openStrategyConfig}>
            ⚙️ Configurar
          </Button>
          <Button onClick={createNewStrategy}>
            ➕ Nova Estratégia
          </Button>
        </div>
      </div>
      
      {selectedStrategy && (
        <div className="mt-3 text-gray-300 text-sm">
          {selectedStrategy.description}
        </div>
      )}
    </div>
  );
};
```

---

## ✅ RESULTADO FINAL

Com a nomenclatura "Estratégias", o sistema se torna:

🎯 **Mais Flexível:** Suporta qualquer tipo de campanha ou processo
📈 **Mais Escalável:** Facilita expansão para outros departamentos  
👥 **Mais Intuitivo:** Conceito claro para usuários não-técnicos
🚀 **Mais Vendável:** Termo mais atrativo e profissional
🔧 **Tecnicamente Sólido:** Mantém toda a robustez técnica dos funis por trás

**A mudança é puramente de interface/UX, mantendo toda a estrutura técnica robusta do sistema de funis por trás.**

