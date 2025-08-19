-- =====================================================
-- CORREÇÕES PARA MÓDULO WHATSAPP - CRM KAPEXIA
-- Data: 2025-07-07
-- =====================================================

-- PROBLEMA 1: Corrigir ENUM da coluna provider para aceitar 'z-api'
-- Erro: Data truncated for column 'provider' at row 1
ALTER TABLE whatsapp_instances 
MODIFY COLUMN provider ENUM('pipego', 'z-api', 'custom') NOT NULL DEFAULT 'pipego';

-- PROBLEMA 2: Adicionar campos para autenticação flexível por provedor
-- PipeGo usa email/password, Z-API usa token direto
ALTER TABLE whatsapp_instances 
ADD COLUMN auth_email VARCHAR(255) NULL COMMENT 'Email para autenticação (PipeGo)',
ADD COLUMN auth_password VARCHAR(255) NULL COMMENT 'Password para autenticação (PipeGo)',
ADD COLUMN auth_user VARCHAR(255) NULL COMMENT 'Usuário para autenticação (outros provedores)',
ADD COLUMN auth_secret VARCHAR(500) NULL COMMENT 'Chave secreta adicional se necessário';

-- PROBLEMA 3: Aumentar tamanho dos campos de URL e token para suportar URLs longas
-- Z-API tem URLs muito longas como mostrado no exemplo
ALTER TABLE whatsapp_instances 
MODIFY COLUMN api_base_url VARCHAR(1000) NOT NULL,
MODIFY COLUMN api_token VARCHAR(1000) NULL,
MODIFY COLUMN webhook_url VARCHAR(1000) NULL;

-- PROBLEMA 4: Adicionar campo para armazenar configuração de autenticação por provedor
ALTER TABLE whatsapp_instances 
ADD COLUMN auth_config JSON NULL COMMENT 'Configurações específicas de autenticação por provedor';

-- PROBLEMA 5: Atualizar configurações HTTP para suportar diferentes estruturas de URL
-- Z-API tem estrutura diferente: /instances/{instance_id}/token/{token}/send-text
ALTER TABLE whatsapp_http_configs 
MODIFY COLUMN endpoint_url VARCHAR(1000) NOT NULL;

-- =====================================================
-- DADOS DE EXEMPLO ATUALIZADOS
-- =====================================================

-- Limpar dados de exemplo antigos se existirem
DELETE FROM whatsapp_http_configs WHERE instance_id IN (SELECT id FROM whatsapp_instances WHERE instance_key LIKE '%demo%');
DELETE FROM whatsapp_user_instances WHERE instance_id IN (SELECT id FROM whatsapp_instances WHERE instance_key LIKE '%demo%');
DELETE FROM whatsapp_instances WHERE instance_key LIKE '%demo%';

-- Exemplo para PipeGo (autenticação via email/password)
INSERT INTO whatsapp_instances (
  client_id, instance_name, instance_key, provider, 
  provider_config, api_base_url, auth_email, auth_password, status,
  auth_config
) VALUES (
  1, 
  'PipeGo - Instância Demo', 
  'pipego_demo_001',
  'pipego',
  JSON_OBJECT(
    'provider', 'pipego',
    'api_version', 'v1',
    'features', JSON_ARRAY('text', 'media', 'audio', 'video'),
    'auth_method', 'email_password'
  ),
  'https://api-backend.pipego.me',
  'usuario@exemplo.com',
  'senha_exemplo',
  'inactive',
  JSON_OBJECT(
    'auth_endpoint', '/session',
    'auth_method', 'POST',
    'token_field', 'token',
    'expires_field', 'expiresAt'
  )
);

-- Exemplo para Z-API (autenticação via token direto)
INSERT INTO whatsapp_instances (
  client_id, instance_name, instance_key, provider, 
  provider_config, api_base_url, api_token, status,
  auth_config
) VALUES (
  1, 
  'Z-API - Instância Demo', 
  'zapi_demo_001',
  'z-api',
  JSON_OBJECT(
    'provider', 'z-api',
    'api_version', 'v1',
    'features', JSON_ARRAY('text', 'media', 'audio', 'video'),
    'auth_method', 'token_direct'
  ),
  'https://api.z-api.io',
  'TOKEN_EXEMPLO_ZAPI',
  'inactive',
  JSON_OBJECT(
    'auth_method', 'token_in_url',
    'instance_id_field', 'instance_id',
    'token_field', 'token'
  )
);

-- =====================================================
-- CONFIGURAÇÕES HTTP ATUALIZADAS
-- =====================================================

-- Configurações para PipeGo
INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'get_qr', 'GET', '/whatsapp/qr', 
 JSON_OBJECT('Authorization', 'Bearer {api_token}', 'Content-Type', 'application/json'), 
 NULL
FROM whatsapp_instances WHERE provider = 'pipego' AND instance_key = 'pipego_demo_001';

INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'send_message', 'POST', '/whatsapp/message',
 JSON_OBJECT('Authorization', 'Bearer {api_token}', 'Content-Type', 'application/json'),
 JSON_OBJECT('phone', '{phone_number}', 'message', '{message_content}')
FROM whatsapp_instances WHERE provider = 'pipego' AND instance_key = 'pipego_demo_001';

INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'check_connection', 'GET', '/whatsapp/info',
 JSON_OBJECT('Authorization', 'Bearer {api_token}', 'Content-Type', 'application/json'), 
 NULL
FROM whatsapp_instances WHERE provider = 'pipego' AND instance_key = 'pipego_demo_001';

-- Configurações para Z-API
INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'send_message', 'POST', '/instances/{instance_id}/token/{api_token}/send-text',
 JSON_OBJECT('Content-Type', 'application/json'),
 JSON_OBJECT('phone', '{phone_number}', 'message', '{message_content}')
FROM whatsapp_instances WHERE provider = 'z-api' AND instance_key = 'zapi_demo_001';

INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'get_qr', 'GET', '/instances/{instance_id}/token/{api_token}/qr-code',
 JSON_OBJECT('Content-Type', 'application/json'), 
 NULL
FROM whatsapp_instances WHERE provider = 'z-api' AND instance_key = 'zapi_demo_001';

INSERT INTO whatsapp_http_configs (instance_id, operation_type, http_method, endpoint_url, headers, body_template) 
SELECT id, 'check_connection', 'GET', '/instances/{instance_id}/token/{api_token}/status',
 JSON_OBJECT('Content-Type', 'application/json'), 
 NULL
FROM whatsapp_instances WHERE provider = 'z-api' AND instance_key = 'zapi_demo_001';

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se as alterações foram aplicadas corretamente
SELECT 'Verificação da coluna provider' as verificacao, 
       COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'whatsapp_instances' 
  AND COLUMN_NAME = 'provider';

-- Verificar se os novos campos foram adicionados
SELECT 'Verificação dos novos campos' as verificacao,
       COLUMN_NAME, 
       COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'whatsapp_instances' 
  AND COLUMN_NAME IN ('auth_email', 'auth_password', 'auth_user', 'auth_secret', 'auth_config');

-- Verificar instâncias de exemplo
SELECT 'Instâncias de exemplo criadas' as verificacao,
       instance_name, 
       provider, 
       auth_email,
       CASE WHEN api_token IS NOT NULL THEN 'Token configurado' ELSE 'Sem token' END as token_status
FROM whatsapp_instances 
WHERE instance_key IN ('pipego_demo_001', 'zapi_demo_001');

