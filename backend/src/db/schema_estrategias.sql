-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           11.4.4-MariaDB-log - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


#### 1.1 Tabela Principal de Contatos

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


#### 1.2 Telefones dos Contatos
DROP TABLE contact_phones;
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


#### 1.3 Emails dos Contatos

DROP TABLE contact_emails;
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


#### 1.4 Endereços dos Contatos

DROP TABLE contact_addresses;
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

-- Copiando estrutura para tabela kapexia_crm_db.funnels
CREATE TABLE IF NOT EXISTS `funnels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `funnel_type` enum('sales','customer_success','support','custom') DEFAULT 'sales',
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(50) DEFAULT '?',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_funnel_name` (`client_id`,`name`),
  CONSTRAINT `funnels_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnels: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnels` DISABLE KEYS */;
INSERT IGNORE INTO `funnels` (`id`, `client_id`, `name`, `description`, `funnel_type`, `is_active`, `is_default`, `sort_order`, `color`, `icon`, `created_at`, `updated_at`) VALUES
	(1, 1, 'HELOISA KARINA COSTA', 'teste', 'sales', 1, 0, 0, '#3B82F6', '?', '2025-07-23 14:29:23', '2025-07-23 14:29:23');
/*!40000 ALTER TABLE `funnels` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_audit_logs
CREATE TABLE IF NOT EXISTS `funnel_audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_id` (`funnel_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `funnel_audit_logs_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_audit_logs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_audit_logs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_automations
CREATE TABLE IF NOT EXISTS `funnel_automations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `trigger_event` varchar(50) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `action_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`action_config`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_id` (`funnel_id`),
  CONSTRAINT `funnel_automations_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_automations: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_automations` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_automations` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_automation_logs
CREATE TABLE IF NOT EXISTS `funnel_automation_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `automation_id` int(11) NOT NULL,
  `funnel_card_id` int(11) DEFAULT NULL,
  `status` enum('success','error','pending') DEFAULT 'pending',
  `log_message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `automation_id` (`automation_id`),
  KEY `funnel_card_id` (`funnel_card_id`),
  CONSTRAINT `funnel_automation_logs_ibfk_1` FOREIGN KEY (`automation_id`) REFERENCES `funnel_automations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_automation_logs_ibfk_2` FOREIGN KEY (`funnel_card_id`) REFERENCES `funnel_cards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_automation_logs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_automation_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_automation_logs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_cards
CREATE TABLE IF NOT EXISTS `funnel_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `funnel_id` int(11) NOT NULL,
  `current_stage_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `estimated_value` decimal(15,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'BRL',
  `expected_close_date` date DEFAULT NULL,
  `actual_close_date` date DEFAULT NULL,
  `status` enum('open','won','lost','paused') DEFAULT 'open',
  `lost_reason` varchar(255) DEFAULT NULL,
  `owner_user_id` int(11) NOT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stage_changed_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `contact_id` (`contact_id`),
  KEY `funnel_id` (`funnel_id`),
  KEY `current_stage_id` (`current_stage_id`),
  KEY `owner_user_id` (`owner_user_id`),
  KEY `created_by_user_id` (`created_by_user_id`),
  CONSTRAINT `funnel_cards_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_cards_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  CONSTRAINT `funnel_cards_ibfk_3` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`),
  CONSTRAINT `funnel_cards_ibfk_4` FOREIGN KEY (`current_stage_id`) REFERENCES `funnel_stages` (`id`),
  CONSTRAINT `funnel_cards_ibfk_5` FOREIGN KEY (`owner_user_id`) REFERENCES `administrators` (`id`),
  CONSTRAINT `funnel_cards_ibfk_6` FOREIGN KEY (`created_by_user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_cards: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_cards` DISABLE KEYS */;
INSERT IGNORE INTO `funnel_cards` (`id`, `client_id`, `contact_id`, `funnel_id`, `current_stage_id`, `title`, `description`, `estimated_value`, `currency`, `expected_close_date`, `actual_close_date`, `status`, `lost_reason`, `owner_user_id`, `created_by_user_id`, `lead_source`, `campaign_id`, `is_active`, `priority`, `created_at`, `updated_at`, `stage_changed_at`) VALUES
	(1, 1, 1, 1, 1, 'TESTE KARINA', NULL, 0.00, 'BRL', NULL, NULL, 'open', NULL, 1, 1, NULL, NULL, 1, 'medium', '2025-07-25 10:12:08', '2025-07-25 10:12:08', '2025-07-25 10:12:08');
/*!40000 ALTER TABLE `funnel_cards` ENABLE KEYS */;

-- Adicionar campos extras ao formulário inicial do card
ALTER TABLE funnel_cards
  ADD COLUMN company_name VARCHAR(255) NULL AFTER description,
  ADD COLUMN company_type VARCHAR(100) NULL AFTER company_name,
  ADD COLUMN temperature ENUM('frio', 'morno', 'quente') DEFAULT 'frio' AFTER company_type,
  ADD COLUMN phone VARCHAR(30) NULL AFTER contact_id,
  ADD COLUMN email VARCHAR(255) NULL AFTER phone;

-- Comentários do Card
CREATE TABLE IF NOT EXISTS funnel_card_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_card_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arquivos do Card
CREATE TABLE IF NOT EXISTS funnel_card_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_card_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico do Card
CREATE TABLE IF NOT EXISTS funnel_card_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_card_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_comments
CREATE TABLE IF NOT EXISTS `funnel_card_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_card_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_card_id` (`funnel_card_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `funnel_card_comments_ibfk_1` FOREIGN KEY (`funnel_card_id`) REFERENCES `funnel_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_card_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_card_comments: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_card_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_card_comments` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_files
CREATE TABLE IF NOT EXISTS `funnel_card_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_card_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `uploaded_by_user_id` int(11) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_card_id` (`funnel_card_id`),
  KEY `uploaded_by_user_id` (`uploaded_by_user_id`),
  CONSTRAINT `funnel_card_files_ibfk_1` FOREIGN KEY (`funnel_card_id`) REFERENCES `funnel_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_card_files_ibfk_2` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_card_files: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_card_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_card_files` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_history
CREATE TABLE IF NOT EXISTS `funnel_card_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `funnel_card_id` int(11) NOT NULL,
  `from_stage_id` int(11) DEFAULT NULL,
  `to_stage_id` int(11) NOT NULL,
  `moved_by_user_id` int(11) NOT NULL,
  `move_reason` text DEFAULT NULL,
  `value_at_time` decimal(15,2) DEFAULT NULL,
  `probability_at_time` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_card_id` (`funnel_card_id`),
  KEY `from_stage_id` (`from_stage_id`),
  KEY `to_stage_id` (`to_stage_id`),
  KEY `moved_by_user_id` (`moved_by_user_id`),
  CONSTRAINT `funnel_card_history_ibfk_1` FOREIGN KEY (`funnel_card_id`) REFERENCES `funnel_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_card_history_ibfk_2` FOREIGN KEY (`from_stage_id`) REFERENCES `funnel_stages` (`id`),
  CONSTRAINT `funnel_card_history_ibfk_3` FOREIGN KEY (`to_stage_id`) REFERENCES `funnel_stages` (`id`),
  CONSTRAINT `funnel_card_history_ibfk_4` FOREIGN KEY (`moved_by_user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_card_history: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_card_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_card_history` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_tags
CREATE TABLE IF NOT EXISTS `funnel_card_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_card_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_card_id` (`funnel_card_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `funnel_card_tags_ibfk_1` FOREIGN KEY (`funnel_card_id`) REFERENCES `funnel_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_card_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `funnel_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_card_tags: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_card_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_card_tags` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_permissions
CREATE TABLE IF NOT EXISTS `funnel_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `can_view` tinyint(1) DEFAULT 1,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_manage_stages` tinyint(1) DEFAULT 0,
  `can_manage_cards` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_id` (`funnel_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `funnel_permissions_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_permissions: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_permissions` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_stages
CREATE TABLE IF NOT EXISTS `funnel_stages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `probability_percentage` decimal(5,2) DEFAULT 0.00,
  `is_closed_won` tinyint(1) DEFAULT 0,
  `is_closed_lost` tinyint(1) DEFAULT 0,
  `color` varchar(7) DEFAULT '#10B981',
  `auto_move_after_days` int(11) DEFAULT NULL,
  `next_stage_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_funnel_stage_order` (`funnel_id`,`sort_order`),
  UNIQUE KEY `unique_funnel_stage_name` (`funnel_id`,`name`),
  KEY `next_stage_id` (`next_stage_id`),
  CONSTRAINT `funnel_stages_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_stages_ibfk_2` FOREIGN KEY (`next_stage_id`) REFERENCES `funnel_stages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_stages: ~2 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_stages` DISABLE KEYS */;
INSERT IGNORE INTO `funnel_stages` (`id`, `funnel_id`, `name`, `description`, `sort_order`, `is_active`, `probability_percentage`, `is_closed_won`, `is_closed_lost`, `color`, `auto_move_after_days`, `next_stage_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 'NOVO LEAD', 'NOVO LEAD', 1, 1, 0.00, 0, 0, '#F5DEB3', NULL, NULL, '2025-07-23 14:36:50', '2025-07-23 14:39:06'),
	(2, 1, 'CONTATO', 'CONTATO', 2, 1, 0.00, 0, 0, '#B0E0E6', NULL, NULL, '2025-07-23 14:37:18', '2025-07-23 14:39:17'),
	(3, 1, 'REUNIÃO', 'REUNIÃO AGENDADA', 3, 1, 0.00, 0, 0, '#E6E6FA', NULL, NULL, '2025-07-23 14:37:41', '2025-07-23 14:39:25');
/*!40000 ALTER TABLE `funnel_stages` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_tags
CREATE TABLE IF NOT EXISTS `funnel_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) DEFAULT '#F59E42',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_id` (`funnel_id`),
  CONSTRAINT `funnel_tags_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_tags: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_tags` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_webhooks
CREATE TABLE IF NOT EXISTS `funnel_webhooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_id` int(11) NOT NULL,
  `url` text NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `funnel_id` (`funnel_id`),
  CONSTRAINT `funnel_webhooks_ibfk_1` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_webhooks: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_webhooks` ENABLE KEYS */;

-- Ajuste em tasks (garantir campos)
ALTER TABLE tasks
  ADD COLUMN funnel_card_id INT NULL AFTER client_id,
  ADD COLUMN contact_id INT NULL AFTER funnel_card_id;

-- Ajuste em products_services (garantir campos)
ALTER TABLE products_services
  ADD COLUMN sku VARCHAR(100) NULL AFTER description,
  ADD COLUMN type ENUM('product', 'service', 'subscription', 'bundle') DEFAULT 'product' AFTER sku,
  ADD COLUMN category VARCHAR(100) NULL AFTER type,
  ADD COLUMN base_price DECIMAL(15,2) DEFAULT 0.00 AFTER category,
  ADD COLUMN cost_price DECIMAL(15,2) DEFAULT 0.00 AFTER base_price,
  ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE AFTER is_active,
  ADD COLUMN recurring_period ENUM('monthly', 'quarterly', 'yearly') NULL AFTER is_recurring,
  ADD COLUMN track_inventory BOOLEAN DEFAULT FALSE AFTER recurring_period,
  ADD COLUMN current_stock INT DEFAULT 0 AFTER track_inventory,
  ADD COLUMN min_stock_alert INT DEFAULT 0 AFTER current_stock;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;


-- Alterações
ALTER TABLE funnel_cards
  ADD COLUMN probability DECIMAL(5,2) DEFAULT 0.00 AFTER estimated_value,
  ADD COLUMN responsible_user_id INT NULL AFTER owner_user_id;
ALTER TABLE funnel_cards
  ADD CONSTRAINT fk_responsible_user_id FOREIGN KEY (responsible_user_id) REFERENCES administrators(id);

-- Remover campos desnecessários da tabela funnel_cards
ALTER TABLE funnel_cards
DROP COLUMN phone,
DROP COLUMN email;

-- Garantir que as referências a telefones, e-mails e endereços sejam feitas corretamente
-- Isso pode envolver a criação de novas colunas de referência ou ajustes nas tabelas de contatos
-- Exemplo de como criar uma tabela de referência, se necessário:
 CREATE TABLE contact_references (
   id INT AUTO_INCREMENT PRIMARY KEY,
   funnel_card_id INT,
   contact_phone_id INT,
   contact_email_id INT,
   contact_address_id INT,
   FOREIGN KEY (funnel_card_id) REFERENCES funnel_cards(id),
   FOREIGN KEY (contact_phone_id) REFERENCES contact_phones(id),
   FOREIGN KEY (contact_email_id) REFERENCES contact_emails(id),
   FOREIGN KEY (contact_address_id) REFERENCES contact_addresses(id)
 );  