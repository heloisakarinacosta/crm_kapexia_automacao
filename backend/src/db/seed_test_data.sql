-- Script para inserir dados de teste

-- Inserir cliente de teste
INSERT IGNORE INTO clients (id, name, trading_name, cnpj, address, phone, profile) 
VALUES (1, 'Kapexia Teste', 'Kapexia', '12345678901234', 'Rua Teste, 123', '11999999999', 'Cliente de teste');

-- Inserir administrador de teste
INSERT IGNORE INTO administrators (id, username, password_hash, email, client_id) 
VALUES (1, 'admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmCLmPXiXRjXxRl4dKi.', 'admin@kapexia.com.br', 1);

-- Inserir configuração padrão de banco
INSERT IGNORE INTO client_database_configs (
    id, client_id, config_name, db_type, host, port, database_name, 
    username, password, use_ssl, is_active, use_demo_data
) VALUES (
    1, 1, 'Configuração Padrão', 'mysql', '127.0.0.1', 3306, 'kapexia_crm_db',
    'kapexia_crm_user', 'C87635430476@X', FALSE, TRUE, FALSE
);

-- Atualizar chart_configs para usar database_config_id se não estiver definido
UPDATE chart_configs SET database_config_id = 1 WHERE client_id = 1 AND database_config_id IS NULL;

-- Atualizar chart_drilldown_configs para usar database_config_id se não estiver definido
UPDATE chart_drilldown_configs SET database_config_id = 1 WHERE client_id = 1 AND database_config_id IS NULL;