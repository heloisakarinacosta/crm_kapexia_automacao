-- Script para corrigir as posições dos gráficos
-- Atualizar as posições dos gráficos baseado no ID para garantir layout 3-4-3

-- Primeira linha (posições 1-3) - Gráficos principais
UPDATE chart_configs SET chart_position = 1 WHERE id = 1; -- KAPEX QUALIFICAÇÃO
UPDATE chart_configs SET chart_position = 2 WHERE id = 2; -- KAPEX PROSPECÇÃO  
UPDATE chart_configs SET chart_position = 3 WHERE id = 3; -- KAPEX EXPANSÃO

-- Segunda linha (posições 4-7) - 4 gráficos
UPDATE chart_configs SET chart_position = 4 WHERE id = 4; -- DISTRIBUIÇÃO QUALIFICAÇÃO
UPDATE chart_configs SET chart_position = 5 WHERE id = 5; -- AGENDAMENTOS CLOSERS
UPDATE chart_configs SET chart_position = 6 WHERE id = 6; -- CONVERSÃO PRODUTO/SERVIÇO
UPDATE chart_configs SET chart_position = 7 WHERE id = 7; -- TICKET MÉDIO CLIENTES

-- Terceira linha (posições 8-10) - 3 gráficos
UPDATE chart_configs SET chart_position = 8 WHERE id = 8; -- TX GANHO QUALIFICAÇÃO
UPDATE chart_configs SET chart_position = 9 WHERE id = 9; -- TX GANHO PROSPECÇÃO
UPDATE chart_configs SET chart_position = 10 WHERE id = 10; -- TICKET MÉDIO TRIMESTRAL

-- Verificar as posições atualizadas
SELECT id, chart_name, chart_position, chart_type, is_active 
FROM chart_configs 
WHERE client_id = 1 
ORDER BY chart_position;