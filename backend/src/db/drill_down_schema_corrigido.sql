-- =====================================================
-- SCHEMA CORRIGIDO PARA DRILL-DOWN NOS GRÁFICOS
-- Baseado na revisão crítica e problemas identificados
-- Data: 2025-07-07
-- =====================================================

-- CORREÇÃO 1: Usar posição do gráfico em vez de chart_config_id
-- CORREÇÃO 2: Adicionar isolamento por cliente (client_id)
-- CORREÇÃO 3: Melhorar segurança e performance

-- Tabela para configurações de drill-down dos gráficos
CREATE TABLE chart_drilldown_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL COMMENT 'CRÍTICO: Isolamento por cliente',
  chart_position INT NOT NULL COMMENT 'Posição do gráfico (1-10) em vez de chart_config_id',
  
  -- SQL para buscar dados detalhados
  detail_sql_query TEXT NOT NULL COMMENT 'Query SQL para buscar detalhes quando clicar no gráfico',
  
  -- Mapeamento de parâmetros
  detail_sql_params JSON NOT NULL COMMENT 'Mapeamento dos campos do gráfico para parâmetros da query de detalhes',
  
  -- Configurações do grid
  detail_grid_title VARCHAR(255) NOT NULL COMMENT 'Título do modal/grid de detalhes',
  detail_grid_columns JSON NOT NULL COMMENT 'Configuração das colunas do grid',
  
  -- Configurações de links
  detail_link_column VARCHAR(100) NULL COMMENT 'Nome da coluna que será renderizada como link',
  detail_link_template VARCHAR(500) NULL COMMENT 'Template da URL do link (ex: /admin/leads/{lead_id})',
  detail_link_text_column VARCHAR(100) NULL COMMENT 'Coluna que será usada como texto do link',
  
  -- Configurações gerais
  is_active BOOLEAN DEFAULT TRUE,
  modal_size ENUM('small', 'medium', 'large', 'fullscreen') DEFAULT 'large',
  max_results INT DEFAULT 1000 COMMENT 'Máximo de resultados para performance',
  query_timeout_seconds INT DEFAULT 30 COMMENT 'Timeout da query em segundos',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_client_chart_position (client_id, chart_position),
  
  INDEX idx_client_active (client_id, is_active),
  INDEX idx_chart_position (chart_position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DADOS DE EXEMPLO CORRIGIDOS
-- =====================================================

-- Exemplo 1: Drill-down para gráfico de leads por dia (Posição 1)
INSERT INTO chart_drilldown_configs (
  client_id,
  chart_position, 
  detail_sql_query,
  detail_sql_params,
  detail_grid_title,
  detail_grid_columns,
  detail_link_column,
  detail_link_template,
  detail_link_text_column,
  max_results,
  query_timeout_seconds
) VALUES (
  1, -- client_id
  1, -- Posição do gráfico "KAPEX QUALIFICAÇÃO"
  'SELECT 
    l.id as lead_id,
    l.nome as nome_lead,
    l.email,
    l.telefone,
    l.status,
    l.temperatura,
    l.created_at as data_criacao
   FROM leads l 
   WHERE l.client_id = ? 
     AND DATE(l.created_at) = ?
   ORDER BY l.created_at DESC',
  JSON_OBJECT(
    'client_id', 'client_id',
    'data', 'clicked_date'
  ),
  'Leads Recebidos no Dia',
  JSON_ARRAY(
    JSON_OBJECT('field', 'lead_id', 'title', 'ID', 'width', 80, 'type', 'number'),
    JSON_OBJECT('field', 'nome_lead', 'title', 'Nome', 'width', 200, 'type', 'text'),
    JSON_OBJECT('field', 'email', 'title', 'E-mail', 'width', 250, 'type', 'email'),
    JSON_OBJECT('field', 'telefone', 'title', 'Telefone', 'width', 150, 'type', 'phone'),
    JSON_OBJECT('field', 'status', 'title', 'Status', 'width', 120, 'type', 'badge'),
    JSON_OBJECT('field', 'temperatura', 'title', 'Temperatura', 'width', 120, 'type', 'badge'),
    JSON_OBJECT('field', 'data_criacao', 'title', 'Data/Hora', 'width', 180, 'type', 'datetime')
  ),
  'lead_id',
  '/admin/leads/{lead_id}',
  'nome_lead',
  500,
  30
);

-- Exemplo 2: Drill-down para gráfico de conversão por produto (Posição 2)
INSERT INTO chart_drilldown_configs (
  client_id,
  chart_position,
  detail_sql_query,
  detail_sql_params,
  detail_grid_title,
  detail_grid_columns,
  detail_link_column,
  detail_link_template,
  detail_link_text_column,
  max_results,
  query_timeout_seconds
) VALUES (
  1, -- client_id
  2, -- Posição do gráfico de conversão
  'SELECT 
    c.id as contato_id,
    c.nome as nome_contato,
    c.email,
    c.telefone,
    c.produto_interesse,
    c.status_negociacao,
    c.valor_proposta,
    c.data_ultima_interacao
   FROM contacts c 
   WHERE c.client_id = ? 
     AND c.produto_interesse = ?
     AND c.status_negociacao IN ("negociacao", "proposta_enviada", "fechado")
   ORDER BY c.data_ultima_interacao DESC',
  JSON_OBJECT(
    'client_id', 'client_id',
    'produto', 'clicked_product'
  ),
  'Conversões por Produto',
  JSON_ARRAY(
    JSON_OBJECT('field', 'contato_id', 'title', 'ID', 'width', 80, 'type', 'number'),
    JSON_OBJECT('field', 'nome_contato', 'title', 'Nome', 'width', 200, 'type', 'text'),
    JSON_OBJECT('field', 'email', 'title', 'E-mail', 'width', 250, 'type', 'email'),
    JSON_OBJECT('field', 'telefone', 'title', 'Telefone', 'width', 150, 'type', 'phone'),
    JSON_OBJECT('field', 'produto_interesse', 'title', 'Produto', 'width', 150, 'type', 'text'),
    JSON_OBJECT('field', 'status_negociacao', 'title', 'Status', 'width', 120, 'type', 'badge'),
    JSON_OBJECT('field', 'valor_proposta', 'title', 'Valor', 'width', 120, 'type', 'currency'),
    JSON_OBJECT('field', 'data_ultima_interacao', 'title', 'Última Interação', 'width', 180, 'type', 'datetime')
  ),
  'contato_id',
  '/admin/contacts/{contato_id}',
  'nome_contato',
  300,
  30
);

-- Exemplo 3: Drill-down para gráfico de vendas por período (Posição 3)
INSERT INTO chart_drilldown_configs (
  client_id,
  chart_position,
  detail_sql_query,
  detail_sql_params,
  detail_grid_title,
  detail_grid_columns,
  detail_link_column,
  detail_link_template,
  detail_link_text_column,
  max_results,
  query_timeout_seconds
) VALUES (
  1, -- client_id
  3, -- Posição do gráfico de vendas
  'SELECT 
    v.id as venda_id,
    c.nome as cliente_nome,
    v.produto,
    v.valor_total,
    v.data_fechamento,
    v.vendedor,
    v.comissao,
    v.status_pagamento
   FROM vendas v
   JOIN contacts c ON v.contato_id = c.id
   WHERE v.client_id = ? 
     AND DATE(v.data_fechamento) BETWEEN ? AND ?
   ORDER BY v.data_fechamento DESC',
  JSON_OBJECT(
    'client_id', 'client_id',
    'data_inicio', 'period_start',
    'data_fim', 'period_end'
  ),
  'Vendas do Período',
  JSON_ARRAY(
    JSON_OBJECT('field', 'venda_id', 'title', 'ID', 'width', 80, 'type', 'number'),
    JSON_OBJECT('field', 'cliente_nome', 'title', 'Cliente', 'width', 200, 'type', 'text'),
    JSON_OBJECT('field', 'produto', 'title', 'Produto', 'width', 150, 'type', 'text'),
    JSON_OBJECT('field', 'valor_total', 'title', 'Valor', 'width', 120, 'type', 'currency'),
    JSON_OBJECT('field', 'data_fechamento', 'title', 'Data Fechamento', 'width', 150, 'type', 'date'),
    JSON_OBJECT('field', 'vendedor', 'title', 'Vendedor', 'width', 150, 'type', 'text'),
    JSON_OBJECT('field', 'comissao', 'title', 'Comissão', 'width', 100, 'type', 'currency'),
    JSON_OBJECT('field', 'status_pagamento', 'title', 'Pagamento', 'width', 120, 'type', 'badge')
  ),
  'venda_id',
  '/admin/vendas/{venda_id}',
  'cliente_nome',
  200,
  30
);

-- =====================================================
-- VERIFICAÇÕES DE SEGURANÇA E INTEGRIDADE
-- =====================================================

-- Verificar se as tabelas necessárias existem
SELECT 'Verificando dependências...' as status;

SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN 'OK: Todas as tabelas necessárias existem'
    ELSE 'ERRO: Tabelas necessárias não encontradas'
  END as dependency_check
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME IN ('clients', 'chart_configs');

-- Verificar se a tabela foi criada corretamente
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'OK: Tabela chart_drilldown_configs criada com sucesso'
    ELSE 'ERRO: Falha ao criar tabela chart_drilldown_configs'
  END as table_creation_check
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'chart_drilldown_configs';

-- Verificar se os dados de exemplo foram inseridos
SELECT 
  CONCAT('OK: ', COUNT(*), ' configurações de drill-down inseridas') as data_insertion_check
FROM chart_drilldown_configs;

-- Listar configurações criadas
SELECT 
  id,
  client_id,
  chart_position,
  detail_grid_title,
  is_active,
  max_results,
  query_timeout_seconds
FROM chart_drilldown_configs
ORDER BY chart_position;

-- =====================================================
-- SCRIPT DE ROLLBACK (SE NECESSÁRIO)
-- =====================================================

/*
-- Para reverter as alterações, execute:

-- 1. Fazer backup dos dados (se necessário)
CREATE TABLE chart_drilldown_configs_backup AS SELECT * FROM chart_drilldown_configs;

-- 2. Remover a tabela
DROP TABLE IF EXISTS chart_drilldown_configs;

-- 3. Verificar remoção
SELECT 'Tabela removida com sucesso' as rollback_status
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.TABLES 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'chart_drilldown_configs'
);
*/

