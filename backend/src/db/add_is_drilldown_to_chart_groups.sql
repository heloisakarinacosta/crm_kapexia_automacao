-- Adicionar campo is_drilldown na tabela chart_groups
-- Este campo indica se o grupo contém charts drill-down (TRUE) ou charts normais (FALSE)

ALTER TABLE chart_groups 
ADD COLUMN is_drilldown BOOLEAN DEFAULT FALSE NOT NULL 
COMMENT 'Indica se o grupo contém charts drill-down (TRUE) ou charts normais (FALSE)';

-- Atualizar os grupos existentes baseado na situação atual:
-- Grupo id=1 "Qualificação" -> é drill-down (tem 3 charts na chart_drilldown_configs)
-- Grupo id=2 "Prospecção" -> não é drill-down (tem 10 charts na chart_configs)

UPDATE chart_groups 
SET is_drilldown = TRUE 
WHERE id = 1;

UPDATE chart_groups 
SET is_drilldown = FALSE 
WHERE id = 2;

-- Verificar resultado
SELECT 
    id,
    group_name,
    layout_model,
    is_drilldown,
    CASE 
        WHEN is_drilldown = TRUE THEN 'Charts Drill-Down'
        ELSE 'Charts Normais'
    END as tipo_charts
FROM chart_groups 
WHERE client_id = 1 
ORDER BY group_order;