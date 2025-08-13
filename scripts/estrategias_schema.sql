-- Schema para Régua de Estratégias
-- Todas as tabelas estão vinculadas ao client_id para multi-tenancy

-- Tabela principal das estratégias
CREATE TABLE `strategies` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `client_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
  `description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
  `data_inicial` DATE NOT NULL,
  `dias_uteis` TINYINT(1) NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `timeline_days` JSON NOT NULL COMMENT 'Array dos dias da timeline: [-5, -3, 0, 1, 7]',
  `total_events` INT(11) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `client_id` (`client_id`) USING BTREE,
  INDEX `user_id` (`user_id`) USING BTREE,
  INDEX `is_active` (`is_active`) USING BTREE,
  CONSTRAINT `strategies_client_fk` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategies_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;

-- Tabela dos nós/componentes da estratégia
CREATE TABLE `strategy_nodes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `strategy_id` INT(11) NOT NULL,
  `client_id` INT(11) NOT NULL,
  `node_id` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci' COMMENT 'ID único do nó no frontend',
  `type` ENUM(
    'data-import', 'database-query', 'time-trigger', 'lead-event',
    'send-whatsapp', 'send-email', 'http-request', 'create-task', 'wait-delay',
    'condition', 'javascript',
    'set-variable', 'transform-data', 'filter-records'
  ) NOT NULL,
  `title` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
  `day` INT(11) NOT NULL COMMENT '-999 para workflow geral, outros valores para timeline',
  `position_x` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `position_y` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `config` JSON NULL DEFAULT NULL COMMENT 'Configurações específicas do nó',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `strategy_node_unique` (`strategy_id`, `node_id`) USING BTREE,
  INDEX `client_id` (`client_id`) USING BTREE,
  INDEX `strategy_id` (`strategy_id`) USING BTREE,
  INDEX `type` (`type`) USING BTREE,
  INDEX `day` (`day`) USING BTREE,
  CONSTRAINT `strategy_nodes_strategy_fk` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategy_nodes_client_fk` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;

-- Tabela de execuções da estratégia
CREATE TABLE `strategy_executions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `strategy_id` INT(11) NOT NULL,
  `client_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `execution_type` ENUM('full', 'day', 'node', 'test') NOT NULL DEFAULT 'full',
  `target_day` INT(11) NULL DEFAULT NULL COMMENT 'Dia específico se execution_type = day',
  `target_node_id` VARCHAR(100) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci' COMMENT 'Nó específico se execution_type = node',
  `status` ENUM('running', 'completed', 'failed', 'stopped') NOT NULL DEFAULT 'running',
  `started_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `total_nodes` INT(11) NOT NULL DEFAULT '0',
  `executed_nodes` INT(11) NOT NULL DEFAULT '0',
  `failed_nodes` INT(11) NOT NULL DEFAULT '0',
  `execution_data` JSON NULL DEFAULT NULL COMMENT 'Dados da execução (leads processados, etc)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `strategy_id` (`strategy_id`) USING BTREE,
  INDEX `client_id` (`client_id`) USING BTREE,
  INDEX `user_id` (`user_id`) USING BTREE,
  INDEX `status` (`status`) USING BTREE,
  INDEX `started_at` (`started_at`) USING BTREE,
  CONSTRAINT `strategy_executions_strategy_fk` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategy_executions_client_fk` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategy_executions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;

-- Tabela de logs detalhados de execução
CREATE TABLE `strategy_execution_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `execution_id` INT(11) NOT NULL,
  `strategy_id` INT(11) NOT NULL,
  `client_id` INT(11) NOT NULL,
  `node_id` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
  `day` INT(11) NOT NULL,
  `status` ENUM('pending', 'running', 'success', 'error', 'skipped') NOT NULL DEFAULT 'pending',
  `message` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
  `details` JSON NULL DEFAULT NULL COMMENT 'Detalhes da execução, resposta do webhook, etc',
  `execution_time_ms` INT(11) NULL DEFAULT NULL COMMENT 'Tempo de execução em milissegundos',
  `webhook_response` JSON NULL DEFAULT NULL COMMENT 'Resposta do webhook se aplicável',
  `error_message` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `execution_id` (`execution_id`) USING BTREE,
  INDEX `strategy_id` (`strategy_id`) USING BTREE,
  INDEX `client_id` (`client_id`) USING BTREE,
  INDEX `status` (`status`) USING BTREE,
  INDEX `day` (`day`) USING BTREE,
  INDEX `created_at` (`created_at`) USING BTREE,
  CONSTRAINT `strategy_execution_logs_execution_fk` FOREIGN KEY (`execution_id`) REFERENCES `strategy_executions` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategy_execution_logs_strategy_fk` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `strategy_execution_logs_client_fk` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;

-- Tabela de templates de estratégias (opcional)
CREATE TABLE `strategy_templates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
  `description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
  `category` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci' COMMENT 'prospeccao, customer_success, cobranca, etc',
  `template_data` JSON NOT NULL COMMENT 'Estrutura completa da estratégia',
  `is_public` TINYINT(1) NOT NULL DEFAULT '1',
  `created_by` INT(11) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `category` (`category`) USING BTREE,
  INDEX `is_public` (`is_public`) USING BTREE,
  CONSTRAINT `strategy_templates_user_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE RESTRICT ON DELETE SET NULL
) COLLATE='utf8mb4_unicode_ci' ENGINE=InnoDB;

-- Inserir template de exemplo
INSERT INTO `strategy_templates` (`name`, `description`, `category`, `template_data`) VALUES
('Prospecção B2B Básica', 'Template básico para prospecção B2B com email e WhatsApp', 'prospeccao', JSON_OBJECT(
  'dataInicial', '2025-01-01',
  'diasUteis', false,
  'timelineDays', JSON_ARRAY(-5, -3, 0, 2, 7),
  'workflowNodes', JSON_ARRAY(
    JSON_OBJECT(
      'id', 'workflow-1',
      'type', 'data-import',
      'position', JSON_OBJECT('x', 100, 'y', 100),
      'day', -999,
      'title', 'Importar Leads',
      'config', JSON_OBJECT('webhook', 'https://webhook.site/import-leads')
    )
  ),
  'timelineNodes', JSON_ARRAY(
    JSON_OBJECT(
      'id', 'node-1',
      'type', 'send-email',
      'position', JSON_OBJECT('x', 50, 'y', 50),
      'day', -5,
      'title', 'Email Inicial',
      'config', JSON_OBJECT('subject', 'Primeira Abordagem', 'body', 'Olá! Gostaria de apresentar nossa solução...')
    ),
    JSON_OBJECT(
      'id', 'node-2',
      'type', 'send-whatsapp',
      'position', JSON_OBJECT('x', 50, 'y', 50),
      'day', -3,
      'title', 'WhatsApp Follow-up',
      'config', JSON_OBJECT('message', 'Oi! Vi que enviamos um email. Conseguiu dar uma olhada?')
    ),
    JSON_OBJECT(
      'id', 'node-3',
      'type', 'send-email',
      'position', JSON_OBJECT('x', 50, 'y', 50),
      'day', 0,
      'title', 'Proposta Oficial',
      'config', JSON_OBJECT('subject', 'Proposta Comercial', 'body', 'Segue nossa proposta detalhada...')
    )
  )
));
