-- Script SQL para criação das novas tabelas do MVP2 do CRM Kapexia

-- Tabela de clientes
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  trading_name VARCHAR(255),
  cnpj VARCHAR(20) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  profile TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de configurações de base de dados por cliente
CREATE TABLE client_database_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT DEFAULT 3306,
  database_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  use_ssl BOOLEAN DEFAULT FALSE,
  ssl_ca TEXT,
  ssl_cert TEXT,
  ssl_key TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  use_demo_data BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Tabela de configurações de gráficos por cliente
CREATE TABLE chart_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  chart_position INT NOT NULL COMMENT 'Posição do gráfico na página (1-10)',
  chart_type ENUM('bar', 'column', 'pie', 'line', 'donut', 'stacked_bar') NOT NULL,
  chart_title VARCHAR(255) NOT NULL,
  chart_subtitle VARCHAR(255),
  chart_description TEXT,
  sql_query TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Alteração na tabela administrators para associar a clientes
ALTER TABLE administrators
ADD COLUMN client_id INT NULL,
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Tabela para dados de demonstração de leads
CREATE TABLE demo_leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  lead_name VARCHAR(255) NOT NULL,
  lead_email VARCHAR(255),
  lead_phone VARCHAR(20),
  lead_source VARCHAR(100),
  lead_type ENUM('frio', 'morno', 'quente') NOT NULL,
  lead_status ENUM('Qualificação', 'Agendamento', 'Proposta', 'Perdido', 'Fechado') NOT NULL,
  valor_proposta DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
