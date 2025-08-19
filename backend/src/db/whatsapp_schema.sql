-- Schema SQL para Módulo WhatsApp - CRM Kapexia
-- Versão: 1.0
-- Data: 2025-01-15

-- =====================================================
-- 1. INSTÂNCIAS WHATSAPP
-- =====================================================

-- Tabela principal de instâncias WhatsApp
CREATE TABLE whatsapp_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  
  -- Dados da instância
  instance_name VARCHAR(255) NOT NULL,
  instance_key VARCHAR(255) NOT NULL COMMENT 'Chave única da instância no provedor',
  provider ENUM('pipego', 'zapi', 'custom') NOT NULL DEFAULT 'pipego',
  
  -- Configurações do provedor
  provider_config JSON NOT NULL COMMENT 'Configurações específicas do provedor',
  api_base_url VARCHAR(500) NOT NULL,
  api_token VARCHAR(500) NULL,
  
  -- Status da instância
  status ENUM('inactive', 'qr_pending', 'connected', 'disconnected', 'error') DEFAULT 'inactive',
  phone_number VARCHAR(20) NULL COMMENT 'Número conectado',
  qr_code TEXT NULL COMMENT 'QR Code para ativação',
  qr_expires_at TIMESTAMP NULL,
  
  -- Webhook
  webhook_url VARCHAR(500) NULL,
  webhook_token VARCHAR(255) NULL,
  webhook_active BOOLEAN DEFAULT FALSE,
  
  -- Controle
  is_active BOOLEAN DEFAULT TRUE,
  last_connected_at TIMESTAMP NULL,
  last_error TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_status (status),
  INDEX idx_provider (provider),
  UNIQUE KEY unique_client_instance_name (client_id, instance_name),
  UNIQUE KEY unique_instance_key (instance_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações HTTP por operação
CREATE TABLE whatsapp_http_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instance_id INT NOT NULL,
  
  -- Tipo de operação
  operation_type ENUM(
    'send_message', 'send_media', 'get_status', 'get_qr', 
    'connect_instance', 'disconnect_instance', 'check_connection'
  ) NOT NULL,
  
  -- Configuração HTTP
  http_method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
  endpoint_url VARCHAR(500) NOT NULL,
  headers JSON NULL COMMENT 'Headers HTTP customizados',
  body_template JSON NULL COMMENT 'Template do body da requisição',
  
  -- Mapeamento de resposta
  response_mapping JSON NULL COMMENT 'Como mapear a resposta da API',
  success_conditions JSON NULL COMMENT 'Condições para considerar sucesso',
  
  -- Controle
  is_active BOOLEAN DEFAULT TRUE,
  timeout_seconds INT DEFAULT 30,
  retry_attempts INT DEFAULT 3,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (instance_id) REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  
  INDEX idx_instance_operation (instance_id, operation_type),
  UNIQUE KEY unique_instance_operation (instance_id, operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. USUÁRIOS E PERMISSÕES WHATSAPP
-- =====================================================

-- Usuários vinculados às instâncias
CREATE TABLE whatsapp_user_instances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instance_id INT NOT NULL,
  user_id INT NOT NULL COMMENT 'Referência para administrators',
  
  -- Permissões
  can_receive_chats BOOLEAN DEFAULT TRUE,
  can_send_messages BOOLEAN DEFAULT TRUE,
  can_transfer_chats BOOLEAN DEFAULT TRUE,
  is_supervisor BOOLEAN DEFAULT FALSE,
  
  -- Configurações de atendimento
  max_concurrent_chats INT DEFAULT 5,
  auto_assign_new_chats BOOLEAN DEFAULT TRUE,
  
  -- Status
  is_online BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (instance_id) REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES administrators(id) ON DELETE CASCADE,
  
  INDEX idx_instance_active (instance_id, is_active),
  INDEX idx_user_instances (user_id),
  INDEX idx_supervisor (is_supervisor),
  UNIQUE KEY unique_user_instance (user_id, instance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CHATS E MENSAGENS
-- =====================================================

-- Chats do WhatsApp
CREATE TABLE whatsapp_chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instance_id INT NOT NULL,
  client_id INT NOT NULL,
  
  -- Dados do chat
  phone_number VARCHAR(20) NOT NULL,
  contact_name VARCHAR(255) NULL,
  contact_id INT NULL COMMENT 'Referência para contacts se vinculado',
  
  -- Atendimento
  assigned_user_id INT NULL COMMENT 'Usuário responsável pelo chat',
  status ENUM('unassigned', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'unassigned',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  -- Métricas
  unread_count INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  last_message_at TIMESTAMP NULL,
  last_message_preview TEXT NULL,
  last_message_type ENUM('text', 'image', 'audio', 'video', 'document', 'sticker') NULL,
  
  -- Controle
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  first_message_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  
  FOREIGN KEY (instance_id) REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_user_id) REFERENCES administrators(id) ON DELETE SET NULL,
  
  INDEX idx_instance_active (instance_id, is_active),
  INDEX idx_client_chats (client_id),
  INDEX idx_assigned_user (assigned_user_id),
  INDEX idx_status (status),
  INDEX idx_unread (unread_count),
  INDEX idx_last_message (last_message_at DESC),
  UNIQUE KEY unique_instance_phone (instance_id, phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensagens do WhatsApp
CREATE TABLE whatsapp_messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  
  -- Dados da mensagem
  message_id VARCHAR(255) NOT NULL COMMENT 'ID da mensagem no WhatsApp',
  direction ENUM('inbound', 'outbound') NOT NULL,
  
  -- Conteúdo
  message_type ENUM('text', 'image', 'audio', 'video', 'document', 'sticker', 'location') NOT NULL,
  content TEXT NULL COMMENT 'Texto da mensagem',
  media_url VARCHAR(500) NULL COMMENT 'URL do arquivo de mídia',
  media_filename VARCHAR(255) NULL,
  media_mimetype VARCHAR(100) NULL,
  media_size INT NULL COMMENT 'Tamanho em bytes',
  
  -- Metadados
  sender_phone VARCHAR(20) NULL COMMENT 'Telefone do remetente (para grupos)',
  sender_name VARCHAR(255) NULL,
  
  -- Status (para mensagens enviadas)
  status ENUM('pending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'pending',
  error_message TEXT NULL,
  
  -- Controle
  sent_by_user_id INT NULL COMMENT 'Usuário que enviou (se outbound)',
  is_read BOOLEAN DEFAULT FALSE,
  read_by_user_id INT NULL,
  read_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  
  FOREIGN KEY (chat_id) REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sent_by_user_id) REFERENCES administrators(id) ON DELETE SET NULL,
  FOREIGN KEY (read_by_user_id) REFERENCES administrators(id) ON DELETE SET NULL,
  
  INDEX idx_chat_messages (chat_id, created_at DESC),
  INDEX idx_direction (direction),
  INDEX idx_message_type (message_type),
  INDEX idx_status (status),
  INDEX idx_unread (is_read, created_at),
  INDEX idx_sent_by_user (sent_by_user_id),
  UNIQUE KEY unique_message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TRANSFERÊNCIAS E HISTÓRICO
-- =====================================================

-- Histórico de transferências
CREATE TABLE whatsapp_chat_transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chat_id INT NOT NULL,
  
  -- Transferência
  from_user_id INT NULL COMMENT 'Usuário que transferiu',
  to_user_id INT NOT NULL COMMENT 'Usuário que recebeu',
  transferred_by_user_id INT NOT NULL COMMENT 'Quem executou a transferência',
  
  -- Motivo
  transfer_reason ENUM('manual', 'auto_assign', 'supervisor_assign', 'user_offline', 'load_balance') NOT NULL,
  notes TEXT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (chat_id) REFERENCES whatsapp_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (from_user_id) REFERENCES administrators(id) ON DELETE SET NULL,
  FOREIGN KEY (to_user_id) REFERENCES administrators(id) ON DELETE CASCADE,
  FOREIGN KEY (transferred_by_user_id) REFERENCES administrators(id) ON DELETE CASCADE,
  
  INDEX idx_chat_transfers (chat_id, created_at DESC),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_transfer_reason (transfer_reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. WEBHOOKS E LOGS
-- =====================================================

-- Log de webhooks recebidos
CREATE TABLE whatsapp_webhook_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  instance_id INT NOT NULL,
  
  -- Dados do webhook
  webhook_type ENUM('message', 'status', 'connection', 'other') NOT NULL,
  payload JSON NOT NULL,
  headers JSON NULL,
  
  -- Processamento
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP NULL,
  processing_error TEXT NULL,
  
  -- Resultado
  created_chat_id INT NULL,
  created_message_id BIGINT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (instance_id) REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  FOREIGN KEY (created_chat_id) REFERENCES whatsapp_chats(id) ON DELETE SET NULL,
  FOREIGN KEY (created_message_id) REFERENCES whatsapp_messages(id) ON DELETE SET NULL,
  
  INDEX idx_instance_webhook (instance_id, created_at DESC),
  INDEX idx_processed (processed),
  INDEX idx_webhook_type (webhook_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. DADOS DE EXEMPLO PARA DESENVOLVIMENTO
-- =====================================================

-- Inserir configurações padrão para PipeGo
INSERT INTO whatsapp_instances (
  client_id, instance_name, instance_key, provider, 
  provider_config, api_base_url, status
) VALUES (
  1, 
  'Instância Principal', 
  'instance_demo_001',
  'pipego',
  JSON_OBJECT(
    'provider', 'pipego',
    'api_version', 'v1',
    'features', JSON_ARRAY('text', 'media', 'audio', 'video')
  ),
  'https://api-backend.pipego.me',
  'inactive'
);

-- Configurações HTTP para PipeGo
INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) VALUES
(1, 'get_qr', 'GET', '/instances/{instance_key}/qr', 
 JSON_OBJECT('Authorization', 'Bearer {api_token}'), NULL),

(1, 'send_message', 'POST', '/instances/{instance_key}/messages',
 JSON_OBJECT('Authorization', 'Bearer {api_token}', 'Content-Type', 'application/json'),
 JSON_OBJECT('phone', '{phone_number}', 'message', '{message_content}')),

(1, 'send_media', 'POST', '/instances/{instance_key}/messages',
 JSON_OBJECT('Authorization', 'Bearer {api_token}'),
 JSON_OBJECT('phone', '{phone_number}', 'media', '{media_file}')),

(1, 'check_connection', 'GET', '/instances/{instance_key}/status',
 JSON_OBJECT('Authorization', 'Bearer {api_token}'), NULL);

-- Vincular usuário admin à instância (assumindo que existe um admin com ID 1)
INSERT INTO whatsapp_user_instances (
  instance_id, user_id, can_receive_chats, can_send_messages, 
  can_transfer_chats, is_supervisor, is_online, is_active
) VALUES (
  1, 1, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE
);

