-- =====================================================
-- ADICIONANDO CAMPO GROUP_ID À TABELA CHART_DRILLDOWN_CONFIGS
-- Data: 2025-07-16
-- =====================================================

-- Verificar se o campo já existe
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Campo group_id já existe'
    ELSE 'Campo group_id não existe - será criado'
  END as field_check
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'chart_drilldown_configs'
  AND COLUMN_NAME = 'group_id';

-- Adicionar campo group_id se não existir
ALTER TABLE chart_drilldown_configs 
ADD COLUMN IF NOT EXISTS group_id VARCHAR(36) NOT NULL DEFAULT '' COMMENT 'ID do grupo de painéis ao qual o drill-down pertence';

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_group_id ON chart_drilldown_configs(group_id);

-- Adicionar constraint foreign key se a tabela chart_groups existir
-- (Isso pode falhar se a tabela não existir, mas não é crítico)
-- ALTER TABLE chart_drilldown_configs 
-- ADD CONSTRAINT fk_drilldown_group_id 
-- FOREIGN KEY (group_id) REFERENCES chart_groups(id) ON DELETE CASCADE;

-- Atualizar a constraint unique para incluir group_id
ALTER TABLE chart_drilldown_configs 
DROP INDEX IF EXISTS unique_client_chart_position;

ALTER TABLE chart_drilldown_configs 
ADD CONSTRAINT unique_client_group_chart_position 
UNIQUE (client_id, group_id, chart_position);

-- Verificar se a alteração foi aplicada
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'Campo group_id adicionado com sucesso'
    ELSE 'ERRO: Campo group_id não foi adicionado'
  END as migration_check
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'chart_drilldown_configs'
  AND COLUMN_NAME = 'group_id';

-- Listar estrutura da tabela atualizada
DESCRIBE chart_drilldown_configs;