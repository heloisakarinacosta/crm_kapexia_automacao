-- Adicionar configurações para dashboard cards e OpenAI

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

