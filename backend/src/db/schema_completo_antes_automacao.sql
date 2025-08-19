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

-- Copiando estrutura para tabela kapexia_crm_db.administrators
DROP TABLE IF EXISTS `administrators`;
CREATE TABLE IF NOT EXISTS `administrators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `client_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `administrators_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.administrators: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `administrators` DISABLE KEYS */;
INSERT IGNORE INTO `administrators` (`id`, `username`, `password_hash`, `email`, `created_at`, `updated_at`, `client_id`) VALUES
	(1, 'admin', '$2b$10$NBUJ2CzII6n0xnMEzYIhQOxOBx9wIJYJiAW56OMHKDoonEzNbH4ve', 'heloisa.karina@kapexia.com.br', '2025-05-29 12:44:27', '2025-06-11 17:20:12', 1);
/*!40000 ALTER TABLE `administrators` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.ai_global_configs
DROP TABLE IF EXISTS `ai_global_configs`;
CREATE TABLE IF NOT EXISTS `ai_global_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_name` varchar(255) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_name` (`config_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.ai_global_configs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `ai_global_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_global_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.card_tags
DROP TABLE IF EXISTS `card_tags`;
CREATE TABLE IF NOT EXISTS `card_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.card_tags: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `card_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `card_tags` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.chart_configs
DROP TABLE IF EXISTS `chart_configs`;
CREATE TABLE IF NOT EXISTS `chart_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `chart_name` varchar(255) DEFAULT NULL,
  `chart_position` int(11) NOT NULL COMMENT 'Posição do gráfico na página (1-10)',
  `chart_type` enum('bar','column','pie','line','donut','stacked_bar') NOT NULL,
  `chart_title` varchar(255) NOT NULL,
  `database_config_id` int(11) DEFAULT NULL,
  `chart_subtitle` varchar(255) DEFAULT NULL,
  `chart_description` text DEFAULT NULL,
  `sql_query` text NOT NULL,
  `x_axis_field` varchar(100) DEFAULT NULL,
  `y_axis_field` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `group_id` int(11) DEFAULT NULL COMMENT 'ID do grupo (NULL = sem grupo)',
  `layout_model` enum('model_10_cards','model_8_cards') DEFAULT 'model_10_cards' COMMENT 'Modelo de layout do grupo',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `fk_chart_configs_group_id` (`group_id`),
  CONSTRAINT `chart_configs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chart_configs_group_id` FOREIGN KEY (`group_id`) REFERENCES `chart_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.chart_configs: ~10 rows (aproximadamente)
/*!40000 ALTER TABLE `chart_configs` DISABLE KEYS */;
INSERT IGNORE INTO `chart_configs` (`id`, `client_id`, `chart_name`, `chart_position`, `chart_type`, `chart_title`, `database_config_id`, `chart_subtitle`, `chart_description`, `sql_query`, `x_axis_field`, `y_axis_field`, `is_active`, `created_at`, `updated_at`, `group_id`, `layout_model`) VALUES
	(1, 1, 'KAPEX QUALIFICAÇÃO', 1, 'bar', 'KAPEX QUALIFICAÇÃO', 1, 'Leads recebidos por dia', 'Leads recebidos por dia no mês atual', 'SELECT \n  dias.dia,\n  COALESCE(leads_por_dia.total_leads, 0) AS total_leads\nFROM\n(\n  SELECT n AS dia FROM (\n    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL\n    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL\n    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL\n    SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL\n    SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL\n    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL\n    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL\n    SELECT 29 UNION ALL SELECT 30 UNION ALL SELECT 31\n  ) AS numbers\n  WHERE n <= DAY(LAST_DAY(CURRENT_DATE))\n) AS dias\nLEFT JOIN\n(\n  SELECT \n    DAY(data_hora) AS dia,\n    COUNT(*) AS total_leads\n  FROM kapexia_whatsapp.leads\n  WHERE YEAR(data_hora) = YEAR(CURRENT_DATE)\n    AND MONTH(data_hora) = MONTH(CURRENT_DATE)\n  GROUP BY DAY(data_hora)\n) AS leads_por_dia ON dias.dia = leads_por_dia.dia\nORDER BY dias.dia;', 'dia', 'total_leads', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:12', 2, 'model_8_cards'),
	(2, 1, 'KAPEX PROSPECÇÃO', 2, 'line', 'KAPEX PROSPECÇÃO', 1, 'Leads prospectados por dia', 'Leads prospectados por dia no mês atual', 'SELECT \r\n  1 AS dia, 23 AS total_prospectados\r\nUNION ALL SELECT 2, 19\r\nUNION ALL SELECT 3, 31\r\nUNION ALL SELECT 4, 27\r\nUNION ALL SELECT 5, 42\r\nUNION ALL SELECT 6, 18\r\nUNION ALL SELECT 7, 15\r\nUNION ALL SELECT 8, 35\r\nUNION ALL SELECT 9, 29\r\nUNION ALL SELECT 10, 38\r\nUNION ALL SELECT 11, 25\r\nUNION ALL SELECT 12, 33\r\nUNION ALL SELECT 13, 22\r\nUNION ALL SELECT 14, 45\r\nUNION ALL SELECT 15, 28\r\nORDER BY dia;', 'dia', 'total_prospectados', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:15', 2, 'model_8_cards'),
	(3, 1, 'KAPEX EXPANSÃO', 3, 'bar', 'KAPEX EXPANSÃO', 1, 'Clientes prospectados por dia', 'Clientes prospectados por dia no mês atual', 'SELECT \r\n  1 AS dia, 8 AS total_clientes\r\nUNION ALL SELECT 2, 5\r\nUNION ALL SELECT 3, 12\r\nUNION ALL SELECT 4, 9\r\nUNION ALL SELECT 5, 15\r\nUNION ALL SELECT 6, 6\r\nUNION ALL SELECT 7, 4\r\nUNION ALL SELECT 8, 11\r\nUNION ALL SELECT 9, 7\r\nUNION ALL SELECT 10, 13\r\nUNION ALL SELECT 11, 8\r\nUNION ALL SELECT 12, 10\r\nUNION ALL SELECT 13, 6\r\nUNION ALL SELECT 14, 16\r\nUNION ALL SELECT 15, 9\r\nORDER BY dia;', 'dia', 'total_clientes', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:17', 2, 'model_8_cards'),
	(4, 1, 'DISTRIBUIÇÃO QUALIFICAÇÃO', 4, 'pie', 'DISTRIBUIÇÃO QUALIFICAÇÃO', 1, 'Percentual de leads', 'Percentual de leads por temperatura', 'SELECT \r\n  \'Frio\' AS tipo, 45.2 AS percentual, 226 AS total\r\nUNION ALL SELECT \'Morno\', 32.8, 164\r\nUNION ALL SELECT \'Quente\', 22.0, 110\r\nORDER BY percentual DESC;', 'tipo', 'percentual', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:19', 2, 'model_8_cards'),
	(5, 1, 'AGENDAMENTOS CLOSERS', 5, 'pie', 'AGENDAMENTOS CLOSERS', 1, 'Status dos agendamentos', 'Status dos agendamentos', 'SELECT \r\n  \'Agendado\' AS status, 68.5 AS percentual, 137 AS total\r\nUNION ALL SELECT \'Realizado\', 24.0, 48\r\nUNION ALL SELECT \'Cancelado\', 7.5, 15\r\nORDER BY percentual DESC;', 'status', 'percentual', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:21', 2, 'model_8_cards'),
	(6, 1, 'CONVERSÃO PRODUTO/SERVIÇO', 6, 'pie', 'CONVERSÃO PRODUTO/SERVIÇO', 1, 'Taxa de conversão geral', 'Taxa de conversão', 'SELECT \r\n  \'Convertidos\' AS status, 18.5 AS percentual, 92 AS total\r\nUNION ALL SELECT \'Em Negociação\', 12.3, 61\r\nUNION ALL SELECT \'Não Convertidos\', 69.2, 347\r\nORDER BY percentual DESC;', 'status', 'percentual', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:23', 2, 'model_8_cards'),
	(7, 1, 'TICKET MÉDIO CLIENTES', 7, 'bar', 'TICKET MÉDIO CLIENTES', 1, 'Ticket médio mensal', 'Ticket médio mensal', 'SELECT \r\n  \'Janeiro\' AS mes, 2850.00 AS ticket_medio, 45600.00 AS total_valor\r\nUNION ALL SELECT \'Fevereiro\', 3120.00, 49920.00\r\nUNION ALL SELECT \'Março\', 2975.00, 47600.00\r\nUNION ALL SELECT \'Abril\', 3340.00, 53440.00\r\nUNION ALL SELECT \'Maio\', 3180.00, 50880.00\r\nUNION ALL SELECT \'Junho\', 3450.00, 55200.00\r\nORDER BY \r\n  CASE mes \r\n    WHEN \'Janeiro\' THEN 1 \r\n    WHEN \'Fevereiro\' THEN 2 \r\n    WHEN \'Março\' THEN 3 \r\n    WHEN \'Abril\' THEN 4 \r\n    WHEN \'Maio\' THEN 5 \r\n    WHEN \'Junho\' THEN 6 \r\n  END;', 'mes', 'ticket_medio', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:24', 2, 'model_8_cards'),
	(8, 1, 'TX GANHO QUALIFICAÇÃO', 8, 'bar', 'TX GANHO QUALIFICAÇÃO', 1, 'Taxa de conversão', 'Taxa de conversão trimestral da qualificação', 'SELECT \n  \'Abril\' AS mes, 156 AS total_leads, 89 AS agendamentos, 57.1 AS taxa_agendamento\nUNION ALL SELECT \'Maio\', 178, 102, 57.3\nUNION ALL SELECT \'Junho\', 164, 98, 59.8\nORDER BY \n  CASE mes \n    WHEN \'Abril\' THEN 1 \n    WHEN \'Maio\' THEN 2 \n    WHEN \'Junho\' THEN 3 \n  END;', 'mes', 'taxa_agendamento', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:26', 2, 'model_8_cards'),
	(9, 1, 'TX GANHO PROSPECÇÃO', 9, 'bar', 'TX GANHO PROSPECÇÃO', 1, 'Taxa de conversão', 'Taxa de conversão trimestral da prospecção', 'SELECT \n  \'Abril\' AS mes, 89 AS total_leads, 34 AS propostas, 38.2 AS taxa_proposta\nUNION ALL SELECT \'Maio\', 102, 41, 40.2\nUNION ALL SELECT \'Junho\', 98, 39, 39.8\nORDER BY \n  CASE mes \n    WHEN \'Abril\' THEN 1 \n    WHEN \'Maio\' THEN 2 \n    WHEN \'Junho\' THEN 3 \n  END;', 'mes', 'taxa_proposta', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:28', 2, 'model_8_cards'),
	(10, 1, 'TICKET MÉDIO TRIMESTRAL', 10, 'bar', 'TICKET MÉDIO TRIMESTRAL', 1, 'Evolução do ticket médio', 'Evolução do ticket médio trimestral', 'SELECT \n  \'Abril\' AS mes, 3340.00 AS ticket_medio, 113560.00 AS total_valor, 34 AS total_vendas\nUNION ALL SELECT \'Maio\', 3180.00, 130380.00, 41\nUNION ALL SELECT \'Junho\', 3450.00, 134550.00, 39\nORDER BY \n  CASE mes \n    WHEN \'Abril\' THEN 1 \n    WHEN \'Maio\' THEN 2 \n    WHEN \'Junho\' THEN 3 \n  END;', 'mes', 'ticket_medio', 1, '2025-06-16 16:05:22', '2025-07-22 12:48:30', 2, 'model_8_cards');
/*!40000 ALTER TABLE `chart_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.chart_drilldown_configs
DROP TABLE IF EXISTS `chart_drilldown_configs`;
CREATE TABLE IF NOT EXISTS `chart_drilldown_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL COMMENT 'CRÍTICO: Isolamento por cliente',
  `group_id` int(11) DEFAULT NULL COMMENT 'ID do grupo de painéis',
  `chart_name` varchar(255) DEFAULT NULL,
  `chart_type` enum('bar','column','pie','line','donut','stacked_bar') DEFAULT NULL,
  `chart_title` varchar(255) DEFAULT NULL,
  `chart_subtitle` varchar(255) DEFAULT NULL,
  `x_axis_field` varchar(100) DEFAULT NULL,
  `y_axis_field` varchar(100) DEFAULT NULL,
  `database_config_id` int(11) DEFAULT NULL,
  `sql_query` text DEFAULT NULL,
  `chart_position` int(11) NOT NULL COMMENT 'Posição do gráfico (1-10) em vez de chart_config_id',
  `detail_sql_query` text NOT NULL COMMENT 'Query SQL para buscar detalhes quando clicar no gráfico',
  `detail_sql_params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Mapeamento dos campos do gráfico para parâmetros da query de detalhes' CHECK (json_valid(`detail_sql_params`)),
  `detail_grid_title` varchar(255) NOT NULL COMMENT 'Título do modal/grid de detalhes',
  `detail_grid_columns` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Configuração das colunas do grid' CHECK (json_valid(`detail_grid_columns`)),
  `detail_link_column` varchar(100) DEFAULT NULL COMMENT 'Nome da coluna que será renderizada como link',
  `detail_link_template` varchar(500) DEFAULT NULL COMMENT 'Template da URL do link (ex: /admin/leads/{lead_id})',
  `detail_link_text_column` varchar(100) DEFAULT NULL COMMENT 'Coluna que será usada como texto do link',
  `is_active` tinyint(1) DEFAULT 1,
  `modal_size` enum('small','medium','large','fullscreen') DEFAULT 'large',
  `max_results` int(11) DEFAULT 1000 COMMENT 'Máximo de resultados para performance',
  `query_timeout_seconds` int(11) DEFAULT 30 COMMENT 'Timeout da query em segundos',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_chart_position` (`client_id`,`chart_position`),
  KEY `idx_client_active` (`client_id`,`is_active`),
  KEY `idx_chart_position` (`chart_position`),
  KEY `fk_chart_drilldown_group_id` (`group_id`),
  CONSTRAINT `chart_drilldown_configs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chart_drilldown_group_id` FOREIGN KEY (`group_id`) REFERENCES `chart_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.chart_drilldown_configs: ~3 rows (aproximadamente)
/*!40000 ALTER TABLE `chart_drilldown_configs` DISABLE KEYS */;
INSERT IGNORE INTO `chart_drilldown_configs` (`id`, `client_id`, `group_id`, `chart_name`, `chart_type`, `chart_title`, `chart_subtitle`, `x_axis_field`, `y_axis_field`, `database_config_id`, `sql_query`, `chart_position`, `detail_sql_query`, `detail_sql_params`, `detail_grid_title`, `detail_grid_columns`, `detail_link_column`, `detail_link_template`, `detail_link_text_column`, `is_active`, `modal_size`, `max_results`, `query_timeout_seconds`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'KAPEX QUALIFICAÇÃO', 'bar', 'KAPEX QUALIFICAÇÃO 2', 'Leads qualificados', 'dia', 'total_leads', NULL, 'SELECT DATE(l.data_hora) AS dia, COUNT(*) AS total_leads\r\nFROM kapexia_whatsapp.leads l\r\nWHERE 1=1\r\n  AND (\r\n    (:period = \'7d\'  AND l.data_hora >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))\r\n    OR (:period = \'30d\' AND l.data_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))\r\n    OR (:period = \'90d\' AND l.data_hora >= DATE_SUB(CURDATE(), INTERVAL 90 DAY))\r\n    OR (:period = \'1y\'  AND l.data_hora >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR))\r\n    OR (:period = \'\' OR :period IS NULL)\r\n  )\r\nGROUP BY dia\r\nORDER BY dia\r\n', 1, 'SELECT * FROM (\n  SELECT 1 AS lead_id, \'João da Silva\' AS nome_lead, \'joao@email.com\' AS email, \'11999999999\' AS telefone, \'Novo\' AS statusLead, \'Indicação\' AS origem, \'2025-07-02 09:15:00\' AS data_criacao\n  UNION ALL\n  SELECT 2, \'Maria Souza\', \'maria@email.com\', \'11988888888\', \'Em Prospecção\', \'Site\', \'2025-07-02 14:30:00\'\n  UNION ALL\n  SELECT 3, \'Carlos Lima\', \'carlos@email.com\', \'11977777777\', \'Qualificado\', \'Evento\', \'2025-07-04 10:00:00\'\n  UNION ALL\n  SELECT 4, \'Ana Paula\', \'ana@email.com\', \'11966666666\', \'Novo\', \'Indicação\', \'2025-07-04 16:45:00\'\n  UNION ALL\n  SELECT 5, \'Pedro Santos\', \'pedro@email.com\', \'11955555555\', \'Em Prospecção\', \'Site\', \'2025-07-05 11:20:00\'\n) AS dados\nWHERE DATE(data_criacao) = DATE(:data)\n', '{"data": "clicked_date"}', 'Leads Recebidos no Dia', '[\r\n        {"field": "lead_id", "title": "ID", "width": 80, "type": "number"}, \r\n        {"field": "nome_lead", "title": "Nome", "width": 200, "type": "text"}, \r\n        {"field": "email", "title": "E-mail", "width": 250, "type": "email"}, \r\n        {"field": "telefone", "title": "Telefone", "width": 150, "type": "phone"}, \r\n        {"field": "statusLead", "title": "Status", "width": 120, "type": "text"}, \r\n        {"field": "origem", "title": "Origem", "width": 120, "type": "text"}, \r\n        {"field": "data_criacao", "title": "Data/Hora", "width": 180, "type": "datetime"}\r\n]', 'lead_id', '/admin/leads/{lead_id}', 'nome_lead', 1, 'large', 500, 30, '2025-07-07 23:14:48', '2025-07-24 14:53:38'),
	(2, 1, 1, 'KAPEX PROSPECÇÃO', 'line', 'KAPEX PROSPECÇÃO 2', 'Leads prospectados', 'dia', 'total_leads', NULL, 'SELECT DATE(l.data_hora) AS dia, COUNT(*) AS total_leads FROM kapexia_whatsapp.leads l GROUP BY dia ORDER BY dia', 2, 'SELECT * FROM (\r\n  SELECT 1 AS lead_id, \'João da Silva\' AS nome_lead, \'joao@email.com\' AS email, \'11999999999\' AS telefone, \'Novo\' AS statusLead, \'Indicação\' AS origem, \'2025-07-02 09:15:00\' AS data_criacao\r\n  UNION ALL\r\n  SELECT 2, \'Maria Souza\', \'maria@email.com\', \'11988888888\', \'Em Prospecção\', \'Site\', \'2025-07-02 14:30:00\'\r\n  UNION ALL\r\n  SELECT 3, \'Carlos Lima\', \'carlos@email.com\', \'11977777777\', \'Qualificado\', \'Evento\', \'2025-07-04 10:00:00\'\r\n  UNION ALL\r\n  SELECT 4, \'Ana Paula\', \'ana@email.com\', \'11966666666\', \'Novo\', \'Indicação\', \'2025-07-04 16:45:00\'\r\n  UNION ALL\r\n  SELECT 5, \'Pedro Santos\', \'pedro@email.com\', \'11955555555\', \'Em Prospecção\', \'Site\', \'2025-07-05 11:20:00\'\r\n) AS dados\r\nWHERE DATE(data_criacao) = DATE(:data)\r\n', '{"data": "clicked_date"}', 'Conversões por Produto', '[\r\n        {"field": "lead_id", "title": "ID", "width": 80, "type": "number"}, \r\n        {"field": "nome_lead", "title": "Nome", "width": 200, "type": "text"}, \r\n        {"field": "email", "title": "E-mail", "width": 250, "type": "email"}, \r\n        {"field": "telefone", "title": "Telefone", "width": 150, "type": "phone"}, \r\n        {"field": "statusLead", "title": "Status", "width": 120, "type": "text"}, \r\n        {"field": "origem", "title": "Origem", "width": 120, "type": "text"}, \r\n        {"field": "data_criacao", "title": "Data/Hora", "width": 180, "type": "datetime"}\r\n]', 'contato_id', '/admin/contacts/{contato_id}', 'nome_contato', 1, 'large', 300, 30, '2025-07-07 23:14:48', '2025-07-24 14:40:53'),
	(3, 1, 1, 'KAPEX EXPANSÃO', 'pie', 'KAPEX EXPANSÃO 2', 'Leads da base', 'dia', 'total_leads', NULL, 'SELECT DATE(l.data_hora) AS dia, COUNT(*) AS total_leads FROM kapexia_whatsapp.leads l GROUP BY dia ORDER BY dia', 3, 'SELECT * FROM (\r\n  SELECT 1 AS lead_id, \'João da Silva\' AS nome_lead, \'joao@email.com\' AS email, \'11999999999\' AS telefone, \'Novo\' AS statusLead, \'Indicação\' AS origem, \'2025-07-02 09:15:00\' AS data_criacao\r\n  UNION ALL\r\n  SELECT 2, \'Maria Souza\', \'maria@email.com\', \'11988888888\', \'Em Prospecção\', \'Site\', \'2025-07-02 14:30:00\'\r\n  UNION ALL\r\n  SELECT 3, \'Carlos Lima\', \'carlos@email.com\', \'11977777777\', \'Qualificado\', \'Evento\', \'2025-07-04 10:00:00\'\r\n  UNION ALL\r\n  SELECT 4, \'Ana Paula\', \'ana@email.com\', \'11966666666\', \'Novo\', \'Indicação\', \'2025-07-04 16:45:00\'\r\n  UNION ALL\r\n  SELECT 5, \'Pedro Santos\', \'pedro@email.com\', \'11955555555\', \'Em Prospecção\', \'Site\', \'2025-07-05 11:20:00\'\r\n) AS dados\r\nWHERE DATE(data_criacao) = DATE(:data)\r\n', '{"data": "clicked_category"}', 'Vendas do Período', '[\r\n        {"field": "lead_id", "title": "ID", "width": 80, "type": "number"}, \r\n        {"field": "nome_lead", "title": "Nome", "width": 200, "type": "text"}, \r\n        {"field": "email", "title": "E-mail", "width": 250, "type": "email"}, \r\n        {"field": "telefone", "title": "Telefone", "width": 150, "type": "phone"}, \r\n        {"field": "statusLead", "title": "Status", "width": 120, "type": "text"}, \r\n        {"field": "origem", "title": "Origem", "width": 120, "type": "text"}, \r\n        {"field": "data_criacao", "title": "Data/Hora", "width": 180, "type": "datetime"}\r\n]', 'venda_id', '/admin/vendas/{venda_id}', 'cliente_nome', 1, 'large', 200, 30, '2025-07-07 23:14:48', '2025-07-24 14:41:02');
/*!40000 ALTER TABLE `chart_drilldown_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.chart_groups
DROP TABLE IF EXISTS `chart_groups`;
CREATE TABLE IF NOT EXISTS `chart_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL COMMENT 'ID do cliente proprietário',
  `group_name` varchar(255) NOT NULL COMMENT 'Nome do grupo (ex: Qualificação, Prospecção)',
  `group_description` text DEFAULT NULL COMMENT 'Descrição opcional do grupo',
  `group_order` int(11) NOT NULL DEFAULT 1 COMMENT 'Ordem de exibição (para abas)',
  `group_color` varchar(7) DEFAULT '#10B981' COMMENT 'Cor da aba (hex)',
  `layout_model` enum('model_10_cards','model_8_cards') DEFAULT 'model_10_cards' COMMENT 'Modelo de layout dos painéis',
  `model_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Configurações específicas do modelo' CHECK (json_valid(`model_config`)),
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0 COMMENT 'Se é o grupo padrão do cliente',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_drilldown` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica se o grupo contém charts drill-down (TRUE) ou charts normais (FALSE)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_group_name` (`client_id`,`group_name`),
  UNIQUE KEY `unique_client_group_order` (`client_id`,`group_order`),
  KEY `idx_client_active` (`client_id`,`is_active`),
  KEY `idx_client_order` (`client_id`,`group_order`),
  KEY `idx_layout_model` (`layout_model`),
  CONSTRAINT `chart_groups_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.chart_groups: ~3 rows (aproximadamente)
/*!40000 ALTER TABLE `chart_groups` DISABLE KEYS */;
INSERT IGNORE INTO `chart_groups` (`id`, `client_id`, `group_name`, `group_description`, `group_order`, `group_color`, `layout_model`, `model_config`, `is_active`, `is_default`, `created_at`, `updated_at`, `is_drilldown`) VALUES
	(1, 1, 'Qualificação', 'Grupo padrão migrado automaticamente do sistema anterior', 1, '#10B981', 'model_8_cards', NULL, 1, 0, '2025-07-10 23:26:12', '2025-07-22 13:21:09', 1),
	(2, 1, 'Agentes Geral', 'Painéis Gerais', 3, '#3B82F6', 'model_10_cards', NULL, 1, 1, '2025-07-10 23:26:12', '2025-07-24 15:48:11', 0),
	(3, 1, 'Prospecção', 'Painéis focados em prospecção - Modelo 8 cards', 2, '#3B82F6', 'model_10_cards', NULL, 1, 0, '2025-07-10 23:26:12', '2025-07-24 15:48:00', 0);
/*!40000 ALTER TABLE `chart_groups` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.clients
DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `trading_name` varchar(255) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnpj` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.clients: ~3 rows (aproximadamente)
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT IGNORE INTO `clients` (`id`, `name`, `trading_name`, `cnpj`, `address`, `phone`, `profile`, `created_at`, `updated_at`) VALUES
	(1, 'Kapexia Tecnologia Ltda', 'Kapexia', '59.712.867/0001-12', 'Rua Sinke Ferreira, 1050', '554199051584', 'Tecnologia', '2025-06-11 14:03:20', '2025-06-11 17:09:34'),
	(4, 'Heloísa Ltda', 'Heloísa', '51.450.671/0001-95', 'teste', '41999051584', 'teste', '2025-06-12 17:35:45', '2025-06-12 17:35:45'),
	(5, 'Heloísa de João', 'DeJoão', '16.168.909/0001-93', 'Rua x 1000', '41999003344', '', '2025-06-14 19:56:48', '2025-06-19 15:26:21');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.client_database_configs
DROP TABLE IF EXISTS `client_database_configs`;
CREATE TABLE IF NOT EXISTS `client_database_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int(11) DEFAULT 3306,
  `database_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `use_ssl` tinyint(1) DEFAULT 0,
  `ssl_ca` text DEFAULT NULL,
  `ssl_cert` text DEFAULT NULL,
  `ssl_key` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `use_demo_data` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `client_database_configs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.client_database_configs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `client_database_configs` DISABLE KEYS */;
INSERT IGNORE INTO `client_database_configs` (`id`, `client_id`, `host`, `port`, `database_name`, `username`, `password`, `use_ssl`, `ssl_ca`, `ssl_cert`, `ssl_key`, `is_active`, `use_demo_data`, `created_at`, `updated_at`) VALUES
	(1, 1, '147.93.71.112', 3306, 'kapexia_whatsapp', 'kapexia_crm_user', 'C87635430476@X', 0, '-----BEGIN CERTIFICATE-----\r\nMIIFmzCCA4OgAwIBAgIUZR7eWNzH68vxFmlXDCLqo8HWdq8wDQYJKoZIhvcNAQEL\r\nBQAwXTELMAkGA1UEBhMCQlIxDzANBgNVBAgMBlBhcmFuYTERMA8GA1UEBwwIQ3Vy\r\naXRpYmExEjAQBgNVBAoMCUthcGV4aWFDQTEWMBQGA1UEAwwNS2FwZXhpYVJvb3RD\r\nQTAeFw0yNTA0MTkyMTAxMTlaFw0zNTA0MTcyMTAxMTlaMF0xCzAJBgNVBAYTAkJS\r\nMQ8wDQYDVQQIDAZQYXJhbmExETAPBgNVBAcMCEN1cml0aWJhMRIwEAYDVQQKDAlL\r\nYXBleGlhQ0ExFjAUBgNVBAMMDUthcGV4aWFSb290Q0EwggIiMA0GCSqGSIb3DQEB\r\nAQUAA4ICDwAwggIKAoICAQCzG+2lrtOCqoVaoo9+VqGtYa0JLOgu5y/9VKEyYGic\r\nZf+tueB7SWyEHOn4di0dbXIN1aANG38il4Lqx59FIJnW1frhMxc17tpEDHCLgaIZ\r\n/YiXKN81HZ8umeoh3Nywu4C8xKOS3gTF9e1ZEi5jf9hNvhYXOwfo5LUwBlYIJjUC\r\neMrLhTWNDFwNarM1t25Cd8g6eurxp6CF9TNhv8WYQufhRR4wnAqAoGBE+qBPHI1V\r\nqn7rZXRZrSTjHBm8h3YudhputAVUZuA1A0vcpk9A8w9rgx9MT+9jdgUACKMBZt+O\r\nCrvnR6HIsKa3MHWmTxgg126rWKir5C8AzMLwbN4XQiIuOHAmS9nrhCg7ZU+0P3hU\r\n+Ai8rim+U4uqsjwQM8gPNTSa9PrCVkF3KRZsUIDv12N14KRxgk30/emRxm9+419y\r\nW4QyHa5vEpMLT5IINzS2u7SVHkb5rQtMW+phhuzohjClea6IQSk2ebQFh7pnSjOZ\r\nN/Qo4Hmwtqz8NQYta+ftbgE+qofLEBYOSfMN98/xQlUZuPLuPG1RPujxrmTJxEXt\r\n9CypXw++K2fbcRd7Ocmj/7hM0/Xje1d7GrnrPXub657A5rPHaiP3iIWmtBP4b+fG\r\nEGWIjZNufO0Fm/2ywsIt9eZMi8t9W2Ty6Y1HLKiAlIxTyR9ffLoh4PjZBvQaxWvi\r\nawIDAQABo1MwUTAdBgNVHQ4EFgQUpQc9PdxWdjJ1HKzZzw2KSuQEzt0wHwYDVR0j\r\nBBgwFoAUpQc9PdxWdjJ1HKzZzw2KSuQEzt0wDwYDVR0TAQH/BAUwAwEB/zANBgkq\r\nhkiG9w0BAQsFAAOCAgEAU7yg3TwZU5VaArfib5clAeme33WSNpL0dFdVMXNLPBXO\r\nr+GRd9hS8B/b+PCwgByYf7dda/qvX7XyciAfwpqWvi4f1qHJ7DDdGDiLUN69CDXI\r\nk+pZJILciJiAAkc55VnxrYACME69jlYLu8oFytKsybj9Cwubpu903jRGavbDu8co\r\nOShW2DwYdC0ECYqgp7+rZ+V4Wf9ufQMi7tOF5D7C027uFgQ876w7GZEYpT0o2E62\r\nkEts4FnR8EaxnjJ2opSTLghbyMRqUWm/NU1+37X1WUgOk3mq0lYYsTTepebT6o1q\r\nJeQdAxQ+s686BRdzMjRdsVH04dv4ymTeIHuxuonj/8ndzLBqbo7rij2tvUgHMQxL\r\niDbs5qYIkaltqr0jiyLtKRmAAhwmO4GCD3U5DUZEDQv1qWxUJxxlUMSHE+yGtful\r\nd1b4uuJpLn/U42N1QaaF7fIhKsj+65aByI5DSkgQwRAjvcRjltzjLADtEKhrFWvI\r\nw6yjLuL4p/f9anQaEr21bgJUBbUT9PeA9TB3Xv5x6Uar66rwmq+DFdyQPOAfyklL\r\nYe5UvlcKnaI922eoPcbdikwLEMAtnw26KynWUxGb/0PT43V3wHgoe52iR4PmhzlD\r\nsLRSXEPCe/rGOZVgk14jzO4JB1tpNddb48+WmdtJKoMgWIcqH/uKiTmbyK9YIfk=\r\n-----END CERTIFICATE-----\r\n-----BEGIN CERTIFICATE-----\r\nMIIGMTCCBBmgAwIBAgIUU44oIUyGmNaGJt4R9vo9vm39Z0QwDQYJKoZIhvcNAQEL\r\nBQAwXTELMAkGA1UEBhMCQlIxDzANBgNVBAgMBlBhcmFuYTERMA8GA1UEBwwIQ3Vy\r\naXRpYmExEjAQBgNVBAoMCUthcGV4aWFDQTEWMBQGA1UEAwwNS2FwZXhpYVJvb3RD\r\nQTAeFw0yNTA0MTkyMTAyNDRaFw0zMDA0MTgyMTAyNDRaMGUxCzAJBgNVBAYTAkJS\r\nMQ8wDQYDVQQIDAZQYXJhbmExETAPBgNVBAcMCEN1cml0aWJhMRIwEAYDVQQKDAlL\r\nYXBleGlhQ0ExHjAcBgNVBAMMFUthcGV4aWFJbnRlcm1lZGlhdGVDQTCCAiIwDQYJ\r\nKoZIhvcNAQEBBQADggIPADCCAgoCggIBALptS2vGjitqoJB2+/5HmF9U+W2p+PRG\r\nBmjON2bp2nVVf6srbNZXlRwTAM47O3FBVhTj2L9hfaSa7JSshdPjuDNR8lJpxfw6\r\nr3IvAbwnubkNEqUafZLmuu+3uoWHn2b/Ru0OmUz/0GH938FW2w6MC5smATJGiWVe\r\nD6+Qga/kM3Y4hTfTxbcpFLnOX65frUw1bV9b+mu5UhCkF3pPXvb+ud07IkaVV51N\r\nUxsD+VuxVCI+Hl2Egn7nPiu/mqf6A5jJX2xDSzNQXWnCDw/hqUAdr0hRkCOqxwnh\r\n3SYV3xlCAq4wd31y3gAfXxO7hKGcOHPd/r4SBL8mPdn4KSXtrirEN06m/W+5ECBq\r\nTSKcz+ejqp860Qfu+4IRtK6aZRoWWgjO9xBaitkpqL969kDERzrslSGXZCaQp6su\r\nHckZVISw6UJY/scZm/62fnAu3O/LEMI4x2HjjqeWmq+TxK6opcyOVMB38TBRl4PP\r\ne1OO2ryFsqApyChfxD9UarvDgVtIupUtSNnHrdEVD6vUuNCkSmZW4+DKJW1ur0ZJ\r\nuwWUW1sCJSxJIBMVk8YjCbJ4455jvSo2fYBbWcraAgCBRFWvnGuzYN0bLeJT4/Z5\r\nuPQFMqj8nJ8mbkyOnPcuJrhiw2vyxEDU9Sppmp8itTikkZoS8qsfqVnfgRn/G957\r\ngrVYbrMh3PLTAgMBAAGjgeAwgd0wHQYDVR0OBBYEFERv/UyDNAPHltVXQ98GU6jA\r\nuZLRMIGaBgNVHSMEgZIwgY+AFKUHPT3cVnYydRys2c8NikrkBM7doWGkXzBdMQsw\r\nCQYDVQQGEwJCUjEPMA0GA1UECAwGUGFyYW5hMREwDwYDVQQHDAhDdXJpdGliYTES\r\nMBAGA1UECgwJS2FwZXhpYUNBMRYwFAYDVQQDDA1LYXBleGlhUm9vdENBghRlHt5Y\r\n3Mfry/EWaVcMIuqjwdZ2rzAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIB\r\nhjANBgkqhkiG9w0BAQsFAAOCAgEAaSrfdppaFCLDUXgY9xXoUwnAAkFnecI26Q6Y\r\n45MHGuoFCvQNYfNFcv7yHUe+HXgcdWXLQsWpTE76RFoS62fkAhitZ4Bqdj5/9I1d\r\npQ8+mCrjAqkRiOO/YR2/2BbiAxV0l32tNM32yj1infCMGasswZynoArDUXmuG9IZ\r\nUCtOImecLdKY5BL7h2I1jlKhUuttwVZi/MZZT9KzBVtWnF3aMhakGRbjwlkALvi3\r\nr3oCGZLKDUmBadTMiCl5ZznsCJYoTRpStWgrupYwT7NeJxV6m/AhGrpRKHRM8DMK\r\nt7zTBm9sYoQa623MIE4mIKVYtP27aMQRSCFS0TklqXDjIC32ZrYs5gItgi3qN5VA\r\n+UOwHelyUNCY3VohHCQSmBrRroX5CFFWFcs9oF6E0Acp1AS+bgT8hpIwNBvkq59p\r\nMHHV8LaYl0/xJY58buGqtQ5lZNI+nHqWH1CHpH50yQcqoCJ6hNEZek2Lxz6WoqOk\r\nWTQa6L2+jCzZusNye9l7YrX+33N9Vzq1FeYIrLNBsjrjVb8tzHE1qY8bGdocqRaK\r\nDnpRFkQH4NyW6sBM9peJvovpplT5CxGdJQNN6noTW9QkBXFYH1e5Y2M6FnThwiTl\r\nlE4y/suVbsxtmUs6/NEIMs5j3LQJKpRDBsIeNz+Zw2OGWdg8e/4FlYJb+H2TFAay\r\nYb6zT3g=\r\n-----END CERTIFICATE-----\r\n', '-----BEGIN CERTIFICATE-----\r\nMIIFczCCA1ugAwIBAgIUZ7MzDGbWtHYolQqJRi+fxT+aSBAwDQYJKoZIhvcNAQEL\r\nBQAwZTELMAkGA1UEBhMCQlIxDzANBgNVBAgMBlBhcmFuYTERMA8GA1UEBwwIQ3Vy\r\naXRpYmExEjAQBgNVBAoMCUthcGV4aWFDQTEeMBwGA1UEAwwVS2FwZXhpYUludGVy\r\nbWVkaWF0ZUNBMB4XDTI1MDQxOTIxMDc1NFoXDTI2MDQxOTIxMDc1NFowWDELMAkG\r\nA1UEBhMCQlIxDzANBgNVBAgMBlBhcmFuYTERMA8GA1UEBwwIQ3VyaXRpYmExEDAO\r\nBgNVBAoMB0thcGV4aWExEzARBgNVBAMMCm44bi1jbGllbnQwggEiMA0GCSqGSIb3\r\nDQEBAQUAA4IBDwAwggEKAoIBAQDD5l5uHKMcFWOdKmEQPzEvIZILy3JW92qB6dY6\r\n1QS5k66wcZrxYrlI3drBCDLSTgxXHWqeBtRf7UFM9EA9HHhzmOwM19nq+1Rg9KAB\r\n0D6v5NfseS/9BVImQ8sAZszJpqJOkDaKqS1z4TZ5Zbt1xkErGh8YZpcaMJcnJSaH\r\nCjj+mlqtnFFER1+fuAbOwOLdhiJaw6hcix2Zc/qw3KKjIUhloIkRYNuGvNf+B4SS\r\nbMKVrzvl1g87TKZuXu6yROwWbnUM5AddkrErlS1eIhfY32E+YpCmXlkJ7taVe4I7\r\nUEuhhiQpiO1RFN99mneOdGTOYPCGCe1ARbFWVX/0QAtd3JyPAgMBAAGjggEmMIIB\r\nIjAJBgNVHRMEAjAAMBEGCWCGSAGG+EIBAQQEAwIHgDAhBglghkgBhvhCAQ0EFBYS\r\nQ2xpZW50IENlcnRpZmljYXRlMB0GA1UdDgQWBBQ6OUPIQZ7blc+VAtx7Aun1nnCQ\r\nFTCBmgYDVR0jBIGSMIGPgBREb/1MgzQDx5bVV0PfBlOowLmS0aFhpF8wXTELMAkG\r\nA1UEBhMCQlIxDzANBgNVBAgMBlBhcmFuYTERMA8GA1UEBwwIQ3VyaXRpYmExEjAQ\r\nBgNVBAoMCUthcGV4aWFDQTEWMBQGA1UEAwwNS2FwZXhpYVJvb3RDQYIUU44oIUyG\r\nmNaGJt4R9vo9vm39Z0QwDgYDVR0PAQH/BAQDAgeAMBMGA1UdJQQMMAoGCCsGAQUF\r\nBwMCMA0GCSqGSIb3DQEBCwUAA4ICAQAWJeNkP8ej1dCHfNQR5RgfDt7R6QRHt6L9\r\nRAmkxCvxDr/N2hyVL9xKSzEglh9sZVXqgpEdzufDJYULEWJE/Rdvy8CiNdTKKc9G\r\nOHGlBrCh/9V0KzusqJmR1cL8tGGFAUrqGEgtzh/2L/mTG/LFZ4gNei+s1PqMdKBa\r\nT3yAI9ZiLkxs3qG9eaLb6HaYFLJhmTryql8eccGeoKSyCQrHhD1rXfVnC1SMa989\r\nK6sHeI9Cf9JovFcUaxAPL0KpcMgXjNBcSDi4T6/Qr0xfh+S/f+NFLTCM3elmJE6E\r\n51dtqiNu/EhClrVKBIYy7oN8ukhxNlv2003Br4V8nhUb9c2085bakttisb8Nyzxx\r\ntSp0OXzBwng6NgZX2ane2maMZNJ/27gwkG3VDmqNqxO1xks/gR9JlHzLlZFrll5h\r\nEb38EiflwRIxHAoQ/18IXRvVrnvX5+46PcMNDiNQf0hZDb0RxlvKuYGMN2hNvBHe\r\ny3oc78BjIjQFG66XGdBuY4SSImzes5GB3hpmrVMfLLTu77TxYKKy0w9XbaV2x5Nd\r\niVYZguuM+Brgh460LdULU7hIrEZbC9TXnGc1ZzKyOZnvYLcg8EzwWHSFbnE88VHp\r\nMOqsuxe4ZoTqtJSZnU79n4tLKfJxM2RUW+lHHkbmUfIWO2OtA0nywvyxZ4erwnIl\r\nuaRvQFxowA==\r\n-----END CERTIFICATE-----\r\n', '-----BEGIN PRIVATE KEY-----\r\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDD5l5uHKMcFWOd\r\nKmEQPzEvIZILy3JW92qB6dY61QS5k66wcZrxYrlI3drBCDLSTgxXHWqeBtRf7UFM\r\n9EA9HHhzmOwM19nq+1Rg9KAB0D6v5NfseS/9BVImQ8sAZszJpqJOkDaKqS1z4TZ5\r\nZbt1xkErGh8YZpcaMJcnJSaHCjj+mlqtnFFER1+fuAbOwOLdhiJaw6hcix2Zc/qw\r\n3KKjIUhloIkRYNuGvNf+B4SSbMKVrzvl1g87TKZuXu6yROwWbnUM5AddkrErlS1e\r\nIhfY32E+YpCmXlkJ7taVe4I7UEuhhiQpiO1RFN99mneOdGTOYPCGCe1ARbFWVX/0\r\nQAtd3JyPAgMBAAECggEAIkvG9W0TCzwdY+sC8ja19CPi7yivfFU1csgO5t7bRGf7\r\n+czxzNe1S3H3tbqrNxFN7MRsIX1dmeut9nx+cJR26/n2PWterdpRU+YPyzF7gAzG\r\n1pIC2j+fua49sHTO3nDLUojB27WxjOt9P3SVhJFwYEzi68EuK/ocxFAnNhYOk1gA\r\njoYqKGzOnSD9IsL94bnTSsq70LfTW4eg2zPyQDjRoXRt0uwLZa/S/PQL7hI26pFM\r\nKHux3gRni0YcEgGoLLHPswYsNgwVh40QZdW8oe/csn2ALzSmEXVySWzJYkii5MKM\r\nBtEAsTTfm9j1K6Ga4h4rPCvbAaBsX4VcHd81EQfYjQKBgQD9Jku+ZDMp6tLlBv5i\r\n/2jXHajN5ZxshQmNYc8dwizBt8z7YFW7oAr7l4V2Ttw7F/iIEkUvt7ES+baa1ndM\r\nqOGs8jFHeN/asp/B61pMlDkmKMzJ5RU1WA/ahMr4BP8IKnlyXcsAPHob0fuA05uT\r\n8bV4M6Gm1aq7aCpKJH4euibVgwKBgQDGGwzzyWY3vQxDBSB5wqeQDu3WANG01Nkt\r\nMr4wUpQ1Dff7tKN/zisrPu+5I9J2XC9IvlbMLP8cF5btbnTwRMZIZHcrqCLu2HyT\r\n2NV2BSvHKgTJihmY1PfKWFrjJbpRJRB+C6p7EjoRJ/GKiR4sXBU7x/UjxA6MqYfv\r\n3levkMH7BQKBgQCNLIIpFzABPFeIKbJL+yu4a23sBRSK4FZHZjhe3B6hmaLSvRKS\r\no9n8HK/tHmVq/x82oxm6VrKFZoUTLG8zbSsNi7M3rI0KJXs6Zcnh0vdb9HzgSsTd\r\nDtMohc27Ku4e27EGuo+u/gsK4LtlSJ0GkFEnS4PmylmAUcLjvh4nfKCTiQKBgQCv\r\nN4u8L9zN3dJzkJxJtWYZH2syxaS1STERLflTqiZVypYUNZAK4WIDLPZAjTN/5kcY\r\nEumYSxAUW7TtKa4aOOoba2iP33WORUHiTn12llpDHKIBU7kSGQNVH9K7Z0okrSCq\r\nK01M7zEWrXqQqnhaidNp/ZCPYr/vn56RBNoPeXxotQKBgBxwgQZSO9T6g3Tq+YtI\r\nVtizaJO+W9e5Dc9onVaJ3To8pN8ICmJPYi3yQ7NF7fUvEhf90UWAKRaUQF0B9Bfe\r\nJMTKTAhwtFYkhuJ+SzVb6OVdx3Li+koXpd0locBTh/JttTXbf2FhNNNU7k7vFpnn\r\njRDlt2RGmOC+lnj4hG1k15gL\r\n-----END PRIVATE KEY-----\r\n', 1, 1, '2025-06-16 18:13:22', '2025-06-16 19:15:13');
/*!40000 ALTER TABLE `client_database_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.contacts
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL CHECK (char_length(trim(`name`)) >= 2),
  `company` varchar(255) DEFAULT NULL CHECK (`company` is null or char_length(trim(`company`)) >= 2),
  `position` varchar(255) DEFAULT NULL COMMENT 'Cargo/Posição na empresa',
  `primary_email` varchar(255) DEFAULT NULL CHECK (`primary_email` is null or `primary_email` regexp '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  `primary_phone` varchar(20) DEFAULT NULL CHECK (`primary_phone` is null or `primary_phone` regexp '^\\+?[1-9]\\d{1,14}$'),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.contacts: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT IGNORE INTO `contacts` (`id`, `client_id`, `name`, `company`, `position`, `primary_email`, `primary_phone`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Karina Costa', 'Kapexia', NULL, 'costa.heloisakarina@gmail.com', '4133221910', '2025-07-25 10:11:51', '2025-07-25 10:11:54');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.contact_addresses
DROP TABLE IF EXISTS `contact_addresses`;
CREATE TABLE IF NOT EXISTS `contact_addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_id` int(11) NOT NULL,
  `address_type` enum('home','work','billing','shipping','other') DEFAULT 'home',
  `street` varchar(255) DEFAULT NULL,
  `number` varchar(20) DEFAULT NULL,
  `complement` varchar(100) DEFAULT NULL,
  `neighborhood` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT 'Brasil',
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contact_primary` (`contact_id`,`is_primary`),
  KEY `idx_address_type` (`address_type`),
  CONSTRAINT `contact_addresses_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.contact_addresses: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `contact_addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_addresses` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.contact_emails
DROP TABLE IF EXISTS `contact_emails`;
CREATE TABLE IF NOT EXISTS `contact_emails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL CHECK (`email` regexp '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
  `email_type` enum('personal','work','other') DEFAULT 'personal',
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_contact_email` (`contact_id`,`email`),
  KEY `idx_contact_primary` (`contact_id`,`is_primary`),
  KEY `idx_email_type` (`email_type`),
  CONSTRAINT `contact_emails_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.contact_emails: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `contact_emails` DISABLE KEYS */;
INSERT IGNORE INTO `contact_emails` (`id`, `contact_id`, `email`, `email_type`, `is_primary`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 'costa.heloisakarina@gmail.com', 'work', 0, 1, NULL, '2025-07-28 19:21:16', '2025-07-28 19:21:16');
/*!40000 ALTER TABLE `contact_emails` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.contact_phones
DROP TABLE IF EXISTS `contact_phones`;
CREATE TABLE IF NOT EXISTS `contact_phones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact_id` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL CHECK (`phone` regexp '^\\+?[1-9]\\d{1,14}$'),
  `phone_type` enum('mobile','home','work','fax','other') DEFAULT 'mobile',
  `country_code` varchar(5) DEFAULT '+55' CHECK (`country_code` regexp '^\\+[1-9]\\d{0,3}$'),
  `is_primary` tinyint(1) DEFAULT 0,
  `is_whatsapp` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_contact_primary` (`contact_id`,`is_primary`),
  KEY `idx_phone_type` (`phone_type`),
  KEY `idx_whatsapp` (`is_whatsapp`),
  CONSTRAINT `contact_phones_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.contact_phones: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `contact_phones` DISABLE KEYS */;
INSERT IGNORE INTO `contact_phones` (`id`, `contact_id`, `phone`, `phone_type`, `country_code`, `is_primary`, `is_whatsapp`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, '4133221414', 'mobile', '+55', 0, 0, 1, NULL, '2025-07-28 19:21:22', '2025-07-28 19:21:22');
/*!40000 ALTER TABLE `contact_phones` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.dashboard_card_configs
DROP TABLE IF EXISTS `dashboard_card_configs`;
CREATE TABLE IF NOT EXISTS `dashboard_card_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `card_position` int(11) NOT NULL COMMENT 'Posição do card (1, 2 ou 3)',
  `card_title` varchar(255) NOT NULL,
  `sql_query` text NOT NULL,
  `icon` varchar(50) DEFAULT '?',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_position` (`client_id`,`card_position`),
  CONSTRAINT `dashboard_card_configs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.dashboard_card_configs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `dashboard_card_configs` DISABLE KEYS */;
INSERT IGNORE INTO `dashboard_card_configs` (`id`, `client_id`, `card_position`, `card_title`, `sql_query`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES
	(3, 1, 1, 'Novos Leads (Semana)', 'SELECT \n  \'Novos Leads (Semana)\' AS titulo,\n  COUNT(DISTINCT CASE WHEN YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1) THEN telefone END) AS valor,\n  ROUND(\n    (COUNT(DISTINCT CASE WHEN YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1) THEN telefone END) * 100.0) / \n    NULLIF(COUNT(DISTINCT CASE WHEN MONTH(data_hora) = MONTH(CURDATE()) AND YEAR(data_hora) = YEAR(CURDATE()) THEN telefone END), 0),\n    2\n  ) AS percentual\nFROM kapexia_whatsapp.contatos;', '📊', 1, '2025-06-21 13:48:10', '2025-06-21 13:48:10');
/*!40000 ALTER TABLE `dashboard_card_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.demo_leads
DROP TABLE IF EXISTS `demo_leads`;
CREATE TABLE IF NOT EXISTS `demo_leads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `lead_name` varchar(255) NOT NULL,
  `lead_email` varchar(255) DEFAULT NULL,
  `lead_phone` varchar(20) DEFAULT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `lead_type` enum('frio','morno','quente') NOT NULL,
  `lead_status` enum('Qualificação','Agendamento','Proposta','Perdido','Fechado') NOT NULL,
  `valor_proposta` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `demo_leads_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.demo_leads: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `demo_leads` DISABLE KEYS */;
/*!40000 ALTER TABLE `demo_leads` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.email_templates
DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `template_name` (`template_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.email_templates: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnels
DROP TABLE IF EXISTS `funnels`;
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
DROP TABLE IF EXISTS `funnel_audit_logs`;
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
DROP TABLE IF EXISTS `funnel_automations`;
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
DROP TABLE IF EXISTS `funnel_automation_logs`;
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
DROP TABLE IF EXISTS `funnel_cards`;
CREATE TABLE IF NOT EXISTS `funnel_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `funnel_id` int(11) NOT NULL,
  `current_stage_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_type` varchar(100) DEFAULT NULL,
  `temperature` enum('frio','morno','quente') DEFAULT 'frio',
  `estimated_value` decimal(15,2) DEFAULT 0.00,
  `probability` decimal(5,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'BRL',
  `expected_close_date` date DEFAULT NULL,
  `actual_close_date` date DEFAULT NULL,
  `status` enum('open','won','lost','paused') DEFAULT 'open',
  `lost_reason` varchar(255) DEFAULT NULL,
  `owner_user_id` int(11) NOT NULL,
  `responsible_user_id` int(11) DEFAULT NULL,
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
  KEY `fk_responsible_user_id` (`responsible_user_id`),
  CONSTRAINT `fk_responsible_user_id` FOREIGN KEY (`responsible_user_id`) REFERENCES `administrators` (`id`),
  CONSTRAINT `funnel_cards_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `funnel_cards_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`),
  CONSTRAINT `funnel_cards_ibfk_3` FOREIGN KEY (`funnel_id`) REFERENCES `funnels` (`id`),
  CONSTRAINT `funnel_cards_ibfk_4` FOREIGN KEY (`current_stage_id`) REFERENCES `funnel_stages` (`id`),
  CONSTRAINT `funnel_cards_ibfk_5` FOREIGN KEY (`owner_user_id`) REFERENCES `administrators` (`id`),
  CONSTRAINT `funnel_cards_ibfk_6` FOREIGN KEY (`created_by_user_id`) REFERENCES `administrators` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_cards: ~1 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_cards` DISABLE KEYS */;
INSERT IGNORE INTO `funnel_cards` (`id`, `client_id`, `contact_id`, `phone`, `email`, `funnel_id`, `current_stage_id`, `title`, `description`, `company_name`, `company_type`, `temperature`, `estimated_value`, `probability`, `currency`, `expected_close_date`, `actual_close_date`, `status`, `lost_reason`, `owner_user_id`, `responsible_user_id`, `created_by_user_id`, `lead_source`, `campaign_id`, `is_active`, `priority`, `created_at`, `updated_at`, `stage_changed_at`) VALUES
	(1, 1, 1, NULL, NULL, 1, 1, 'TESTE KARINA', NULL, NULL, NULL, 'frio', 0.00, 0.00, 'BRL', NULL, NULL, 'open', NULL, 1, NULL, 1, NULL, NULL, 1, 'medium', '2025-07-25 10:12:08', '2025-07-25 10:12:08', '2025-07-25 10:12:08');
/*!40000 ALTER TABLE `funnel_cards` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_comments
DROP TABLE IF EXISTS `funnel_card_comments`;
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
DROP TABLE IF EXISTS `funnel_card_files`;
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
DROP TABLE IF EXISTS `funnel_card_history`;
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

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_items
DROP TABLE IF EXISTS `funnel_card_items`;
CREATE TABLE IF NOT EXISTS `funnel_card_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funnel_card_id` int(11) NOT NULL,
  `product_service_id` int(11) NOT NULL,
  `quantity` decimal(10,3) DEFAULT 1.000,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.funnel_card_items: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `funnel_card_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `funnel_card_items` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.funnel_card_tags
DROP TABLE IF EXISTS `funnel_card_tags`;
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
DROP TABLE IF EXISTS `funnel_permissions`;
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
DROP TABLE IF EXISTS `funnel_stages`;
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
DROP TABLE IF EXISTS `funnel_tags`;
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
DROP TABLE IF EXISTS `funnel_webhooks`;
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

-- Copiando estrutura para tabela kapexia_crm_db.openai_configs
DROP TABLE IF EXISTS `openai_configs`;
CREATE TABLE IF NOT EXISTS `openai_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `assistant_id` varchar(255) DEFAULT NULL COMMENT 'ID do Assistant OpenAI, se NULL usa completion',
  `model` varchar(100) DEFAULT 'gpt-4' COMMENT 'Modelo para completion quando não há assistant',
  `system_prompt` text DEFAULT NULL COMMENT 'Prompt do sistema para completion',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rag_enabled` tinyint(1) DEFAULT 0 COMMENT 'Se RAG está habilitado',
  `embedding_model` varchar(100) DEFAULT 'text-embedding-ada-002' COMMENT 'Modelo de embedding',
  `vector_store_type` varchar(50) DEFAULT 'local' COMMENT 'Tipo de armazenamento de vetores (local, pinecone, etc)',
  `chunk_size` int(11) DEFAULT 1000 COMMENT 'Tamanho dos chunks para embeddings',
  `chunk_overlap` int(11) DEFAULT 200 COMMENT 'Sobreposição entre chunks',
  `max_documents` int(11) DEFAULT 100 COMMENT 'Máximo de documentos para RAG',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_openai` (`client_id`),
  CONSTRAINT `openai_configs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.openai_configs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `openai_configs` DISABLE KEYS */;
INSERT IGNORE INTO `openai_configs` (`id`, `client_id`, `api_key`, `assistant_id`, `model`, `system_prompt`, `is_active`, `created_at`, `updated_at`, `rag_enabled`, `embedding_model`, `vector_store_type`, `chunk_size`, `chunk_overlap`, `max_documents`) VALUES
	(1, 1, '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', 'asst_J7lt9K0Rv6VZtxizUBSEj0Ks', 'gpt-4.1-mini', '', 1, '2025-06-18 20:39:39', '2025-06-22 16:05:45', 0, 'text-embedding-ada-002', 'local', 1000, 200, 100);
/*!40000 ALTER TABLE `openai_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.products_services
DROP TABLE IF EXISTS `products_services`;
CREATE TABLE IF NOT EXISTS `products_services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `type` enum('product','service','subscription','bundle') DEFAULT 'product',
  `category` varchar(100) DEFAULT NULL,
  `base_price` decimal(15,2) DEFAULT 0.00,
  `cost_price` decimal(15,2) DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'BRL',
  `is_active` tinyint(1) DEFAULT 1,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_period` enum('monthly','quarterly','yearly') DEFAULT NULL,
  `track_inventory` tinyint(1) DEFAULT 0,
  `current_stock` int(11) DEFAULT 0,
  `min_stock_alert` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.products_services: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `products_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `products_services` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.rag_documents
DROP TABLE IF EXISTS `rag_documents`;
CREATE TABLE IF NOT EXISTS `rag_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `content_text` longtext DEFAULT NULL COMMENT 'Texto extraído do documento',
  `is_processed` tinyint(1) DEFAULT 0 COMMENT 'Se o documento foi processado para embeddings',
  `upload_date` timestamp NULL DEFAULT current_timestamp(),
  `processed_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_client_processed` (`client_id`,`is_processed`),
  CONSTRAINT `rag_documents_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.rag_documents: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `rag_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `rag_documents` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.rag_embeddings
DROP TABLE IF EXISTS `rag_embeddings`;
CREATE TABLE IF NOT EXISTS `rag_embeddings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `document_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `chunk_text` text NOT NULL,
  `chunk_index` int(11) NOT NULL COMMENT 'Índice do chunk no documento',
  `embedding_vector` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Vetor de embedding (se armazenado localmente)' CHECK (json_valid(`embedding_vector`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Metadados adicionais do chunk' CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_document_chunk` (`document_id`,`chunk_index`),
  KEY `idx_client_embeddings` (`client_id`),
  CONSTRAINT `rag_embeddings_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `rag_documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rag_embeddings_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.rag_embeddings: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `rag_embeddings` DISABLE KEYS */;
/*!40000 ALTER TABLE `rag_embeddings` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.subscription_plans
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `features` text DEFAULT NULL,
  `ai_package_details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.subscription_plans: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.system_integrations
DROP TABLE IF EXISTS `system_integrations`;
CREATE TABLE IF NOT EXISTS `system_integrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `integration_name` varchar(255) NOT NULL,
  `config_details` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `integration_name` (`integration_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.system_integrations: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `system_integrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_integrations` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.tags
DROP TABLE IF EXISTS `tags`;
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#40E0D0',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.tags: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.tasks
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `funnel_card_id` int(11) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `task_type` enum('call','email','meeting','follow_up','demo','proposal','other') DEFAULT 'call',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `due_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `assigned_to_user_id` int(11) NOT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_pattern` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.tasks: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;

-- Copiando estrutura para view kapexia_crm_db.view_chart_configs_with_groups
DROP VIEW IF EXISTS `view_chart_configs_with_groups`;
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `view_chart_configs_with_groups` (
	`chart_id` INT(11) NOT NULL,
	`client_id` INT(11) NOT NULL,
	`client_name` VARCHAR(255) NULL COLLATE 'utf8mb4_unicode_ci',
	`group_id` INT(11) NULL COMMENT 'ID do grupo (NULL = sem grupo)',
	`group_name` VARCHAR(255) NULL COMMENT 'Nome do grupo (ex: Qualificação, Prospecção)' COLLATE 'utf8mb4_unicode_ci',
	`group_order` INT(11) NULL COMMENT 'Ordem de exibição (para abas)',
	`group_color` VARCHAR(7) NULL COMMENT 'Cor da aba (hex)' COLLATE 'utf8mb4_unicode_ci',
	`layout_model` ENUM('model_10_cards','model_8_cards') NULL COMMENT 'Modelo de layout dos painéis' COLLATE 'utf8mb4_unicode_ci',
	`chart_position` INT(11) NOT NULL COMMENT 'Posição do gráfico na página (1-10)',
	`chart_type` ENUM('bar','column','pie','line','donut','stacked_bar') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`chart_title` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`chart_subtitle` VARCHAR(255) NULL COLLATE 'utf8mb4_unicode_ci',
	`chart_description` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`sql_query` TEXT NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`chart_active` TINYINT(1) NULL,
	`group_active` TINYINT(1) NULL,
	`group_default` TINYINT(1) NULL COMMENT 'Se é o grupo padrão do cliente',
	`has_drilldown` INT(1) NOT NULL,
	`drilldown_active` TINYINT(1) NULL,
	`created_at` TIMESTAMP NULL,
	`updated_at` TIMESTAMP NULL
) ENGINE=MyISAM;

-- Copiando estrutura para view kapexia_crm_db.view_chart_groups_summary
DROP VIEW IF EXISTS `view_chart_groups_summary`;
-- Criando tabela temporária para evitar erros de dependência de VIEW
CREATE TABLE `view_chart_groups_summary` (
	`group_id` INT(11) NOT NULL,
	`client_id` INT(11) NOT NULL COMMENT 'ID do cliente proprietário',
	`client_name` VARCHAR(255) NULL COLLATE 'utf8mb4_unicode_ci',
	`group_name` VARCHAR(255) NOT NULL COMMENT 'Nome do grupo (ex: Qualificação, Prospecção)' COLLATE 'utf8mb4_unicode_ci',
	`group_description` TEXT NULL COMMENT 'Descrição opcional do grupo' COLLATE 'utf8mb4_unicode_ci',
	`group_order` INT(11) NOT NULL COMMENT 'Ordem de exibição (para abas)',
	`group_color` VARCHAR(7) NULL COMMENT 'Cor da aba (hex)' COLLATE 'utf8mb4_unicode_ci',
	`layout_model` ENUM('model_10_cards','model_8_cards') NULL COMMENT 'Modelo de layout dos painéis' COLLATE 'utf8mb4_unicode_ci',
	`is_active` TINYINT(1) NULL,
	`is_default` TINYINT(1) NULL COMMENT 'Se é o grupo padrão do cliente',
	`total_charts` BIGINT(21) NOT NULL,
	`active_charts` BIGINT(21) NOT NULL,
	`charts_with_drilldown` BIGINT(21) NOT NULL,
	`created_at` TIMESTAMP NULL,
	`updated_at` TIMESTAMP NULL
) ENGINE=MyISAM;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_chats
DROP TABLE IF EXISTS `whatsapp_chats`;
CREATE TABLE IF NOT EXISTS `whatsapp_chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instance_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL COMMENT 'Referência para contacts se vinculado',
  `assigned_user_id` int(11) DEFAULT NULL COMMENT 'Usuário responsável pelo chat',
  `status` enum('unassigned','assigned','in_progress','resolved','closed') DEFAULT 'unassigned',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `unread_count` int(11) DEFAULT 0,
  `total_messages` int(11) DEFAULT 0,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `last_message_preview` text DEFAULT NULL,
  `last_message_type` enum('text','image','audio','video','document','sticker') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `first_message_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instance_phone` (`instance_id`,`phone_number`),
  KEY `contact_id` (`contact_id`),
  KEY `idx_instance_active` (`instance_id`,`is_active`),
  KEY `idx_client_chats` (`client_id`),
  KEY `idx_assigned_user` (`assigned_user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_unread` (`unread_count`),
  KEY `idx_last_message` (`last_message_at` DESC),
  CONSTRAINT `whatsapp_chats_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `whatsapp_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_chats_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_chats_ibfk_3` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `whatsapp_chats_ibfk_4` FOREIGN KEY (`assigned_user_id`) REFERENCES `administrators` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_chats: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_chats` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_chat_transfers
DROP TABLE IF EXISTS `whatsapp_chat_transfers`;
CREATE TABLE IF NOT EXISTS `whatsapp_chat_transfers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `from_user_id` int(11) DEFAULT NULL COMMENT 'Usuário que transferiu',
  `to_user_id` int(11) NOT NULL COMMENT 'Usuário que recebeu',
  `transferred_by_user_id` int(11) NOT NULL COMMENT 'Quem executou a transferência',
  `transfer_reason` enum('manual','auto_assign','supervisor_assign','user_offline','load_balance') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `transferred_by_user_id` (`transferred_by_user_id`),
  KEY `idx_chat_transfers` (`chat_id`,`created_at` DESC),
  KEY `idx_from_user` (`from_user_id`),
  KEY `idx_to_user` (`to_user_id`),
  KEY `idx_transfer_reason` (`transfer_reason`),
  CONSTRAINT `whatsapp_chat_transfers_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `whatsapp_chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_chat_transfers_ibfk_2` FOREIGN KEY (`from_user_id`) REFERENCES `administrators` (`id`) ON DELETE SET NULL,
  CONSTRAINT `whatsapp_chat_transfers_ibfk_3` FOREIGN KEY (`to_user_id`) REFERENCES `administrators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_chat_transfers_ibfk_4` FOREIGN KEY (`transferred_by_user_id`) REFERENCES `administrators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_chat_transfers: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_chat_transfers` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_chat_transfers` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_http_configs
DROP TABLE IF EXISTS `whatsapp_http_configs`;
CREATE TABLE IF NOT EXISTS `whatsapp_http_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instance_id` int(11) NOT NULL,
  `operation_type` enum('send_message','send_media','get_status','get_qr','connect_instance','disconnect_instance','check_connection') NOT NULL,
  `http_method` enum('GET','POST','PUT','DELETE','PATCH') NOT NULL,
  `endpoint_url` varchar(1000) NOT NULL,
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Headers HTTP customizados' CHECK (json_valid(`headers`)),
  `body_template` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Template do body da requisição' CHECK (json_valid(`body_template`)),
  `response_mapping` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Como mapear a resposta da API' CHECK (json_valid(`response_mapping`)),
  `success_conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Condições para considerar sucesso' CHECK (json_valid(`success_conditions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `timeout_seconds` int(11) DEFAULT 30,
  `retry_attempts` int(11) DEFAULT 3,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instance_operation` (`instance_id`,`operation_type`),
  KEY `idx_instance_operation` (`instance_id`,`operation_type`),
  CONSTRAINT `whatsapp_http_configs_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `whatsapp_instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_http_configs: ~6 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_http_configs` DISABLE KEYS */;
INSERT IGNORE INTO `whatsapp_http_configs` (`id`, `instance_id`, `operation_type`, `http_method`, `endpoint_url`, `headers`, `body_template`, `response_mapping`, `success_conditions`, `is_active`, `timeout_seconds`, `retry_attempts`, `created_at`, `updated_at`) VALUES
	(13, 4, 'get_qr', 'GET', '/whatsapp/qr', '{"Authorization": "Bearer {api_token}", "Content-Type": "application/json"}', NULL, NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20'),
	(14, 4, 'send_message', 'POST', '/whatsapp/message', '{"Authorization": "Bearer {api_token}", "Content-Type": "application/json"}', '{"phone": "{phone_number}", "message": "{message_content}"}', NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20'),
	(15, 4, 'check_connection', 'GET', '/whatsapp/info', '{"Authorization": "Bearer {api_token}", "Content-Type": "application/json"}', NULL, NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20'),
	(16, 5, 'send_message', 'POST', '/instances/{instance_id}/token/{api_token}/send-text', '{"Content-Type": "application/json"}', '{"phone": "{phone_number}", "message": "{message_content}"}', NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20'),
	(17, 5, 'get_qr', 'GET', '/instances/{instance_id}/token/{api_token}/qr-code', '{"Content-Type": "application/json"}', NULL, NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20'),
	(18, 5, 'check_connection', 'GET', '/instances/{instance_id}/token/{api_token}/status', '{"Content-Type": "application/json"}', NULL, NULL, NULL, 1, 30, 3, '2025-07-07 22:40:20', '2025-07-07 22:40:20');
/*!40000 ALTER TABLE `whatsapp_http_configs` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_instances
DROP TABLE IF EXISTS `whatsapp_instances`;
CREATE TABLE IF NOT EXISTS `whatsapp_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `instance_name` varchar(255) NOT NULL,
  `instance_key` varchar(255) NOT NULL COMMENT 'Chave única da instância no provedor',
  `provider` enum('pipego','z-api','custom') NOT NULL DEFAULT 'pipego',
  `provider_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Configurações específicas do provedor' CHECK (json_valid(`provider_config`)),
  `api_base_url` varchar(1000) NOT NULL,
  `api_token` varchar(1000) DEFAULT NULL,
  `status` enum('inactive','qr_pending','connected','disconnected','error') DEFAULT 'inactive',
  `phone_number` varchar(20) DEFAULT NULL COMMENT 'Número conectado',
  `qr_code` text DEFAULT NULL COMMENT 'QR Code para ativação',
  `qr_expires_at` timestamp NULL DEFAULT NULL,
  `webhook_url` varchar(1000) DEFAULT NULL,
  `webhook_token` varchar(255) DEFAULT NULL,
  `webhook_active` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `last_connected_at` timestamp NULL DEFAULT NULL,
  `last_error` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `auth_email` varchar(255) DEFAULT NULL COMMENT 'Email para autenticação (PipeGo)',
  `auth_password` varchar(255) DEFAULT NULL COMMENT 'Password para autenticação (PipeGo)',
  `auth_user` varchar(255) DEFAULT NULL COMMENT 'Usuário para autenticação (outros provedores)',
  `auth_secret` varchar(500) DEFAULT NULL COMMENT 'Chave secreta adicional se necessário',
  `auth_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Configurações específicas de autenticação por provedor' CHECK (json_valid(`auth_config`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_instance_name` (`client_id`,`instance_name`),
  UNIQUE KEY `unique_instance_key` (`instance_key`),
  KEY `idx_client_active` (`client_id`,`is_active`),
  KEY `idx_status` (`status`),
  KEY `idx_provider` (`provider`),
  CONSTRAINT `whatsapp_instances_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_instances: ~2 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_instances` DISABLE KEYS */;
INSERT IGNORE INTO `whatsapp_instances` (`id`, `client_id`, `instance_name`, `instance_key`, `provider`, `provider_config`, `api_base_url`, `api_token`, `status`, `phone_number`, `qr_code`, `qr_expires_at`, `webhook_url`, `webhook_token`, `webhook_active`, `is_active`, `last_connected_at`, `last_error`, `created_at`, `updated_at`, `auth_email`, `auth_password`, `auth_user`, `auth_secret`, `auth_config`) VALUES
	(4, 1, 'PipeGo - Instância Demo', 'pipego_demo_001', 'pipego', '{"provider": "pipego", "api_version": "v1", "features": ["text", "media", "audio", "video"], "auth_method": "email_password"}', 'http://186.227.206.34:5030\n', NULL, 'error', '55419981342423', NULL, NULL, 'https://crm.kapexia.com.br/api/whatsapp/webhook/pipego_demo_001', NULL, 0, 1, NULL, 'Dados inválidos: Usuário ou Cliente não encontrado.', '2025-07-07 22:40:20', '2025-07-08 18:48:47', 'admin@preambulo.com\n', '123', NULL, NULL, '{"auth_endpoint": "/session", "auth_method": "POST", "token_field": "token", "expires_field": "expiresAt"}'),
	(5, 1, 'Z-API - Instância Demo', 'zapi_demo_001', 'z-api', '{"provider": "z-api", "api_version": "v1", "features": ["text", "media", "audio", "video"], "auth_method": "token_direct"}', 'https://api.z-api.io/instances/3E3DAC4372D8D039FE72AE53A3A095E1/token/DA1631484F2D17EFD770017C/send-text', 'DA1631484F2D17EFD770017C', 'error', '55419981342423', NULL, NULL, 'https://crm.kapexia.com.br/api/whatsapp/webhook/zapi_demo_001', NULL, 0, 1, NULL, NULL, '2025-07-07 22:40:20', '2025-07-08 18:49:00', NULL, NULL, NULL, NULL, '{"auth_method": "token_in_url", "instance_id_field": "instance_id", "token_field": "token"}');
/*!40000 ALTER TABLE `whatsapp_instances` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_messages
DROP TABLE IF EXISTS `whatsapp_messages`;
CREATE TABLE IF NOT EXISTS `whatsapp_messages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `message_id` varchar(255) NOT NULL COMMENT 'ID da mensagem no WhatsApp',
  `direction` enum('inbound','outbound') NOT NULL,
  `message_type` enum('text','image','audio','video','document','sticker','location') NOT NULL,
  `content` text DEFAULT NULL COMMENT 'Texto da mensagem',
  `media_url` varchar(500) DEFAULT NULL COMMENT 'URL do arquivo de mídia',
  `media_filename` varchar(255) DEFAULT NULL,
  `media_mimetype` varchar(100) DEFAULT NULL,
  `media_size` int(11) DEFAULT NULL COMMENT 'Tamanho em bytes',
  `sender_phone` varchar(20) DEFAULT NULL COMMENT 'Telefone do remetente (para grupos)',
  `sender_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','sent','delivered','read','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_by_user_id` int(11) DEFAULT NULL COMMENT 'Usuário que enviou (se outbound)',
  `is_read` tinyint(1) DEFAULT 0,
  `read_by_user_id` int(11) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_message_id` (`message_id`),
  KEY `read_by_user_id` (`read_by_user_id`),
  KEY `idx_chat_messages` (`chat_id`,`created_at` DESC),
  KEY `idx_direction` (`direction`),
  KEY `idx_message_type` (`message_type`),
  KEY `idx_status` (`status`),
  KEY `idx_unread` (`is_read`,`created_at`),
  KEY `idx_sent_by_user` (`sent_by_user_id`),
  CONSTRAINT `whatsapp_messages_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `whatsapp_chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_messages_ibfk_2` FOREIGN KEY (`sent_by_user_id`) REFERENCES `administrators` (`id`) ON DELETE SET NULL,
  CONSTRAINT `whatsapp_messages_ibfk_3` FOREIGN KEY (`read_by_user_id`) REFERENCES `administrators` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_messages: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_messages` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_user_instances
DROP TABLE IF EXISTS `whatsapp_user_instances`;
CREATE TABLE IF NOT EXISTS `whatsapp_user_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instance_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Referência para administrators',
  `can_receive_chats` tinyint(1) DEFAULT 1,
  `can_send_messages` tinyint(1) DEFAULT 1,
  `can_transfer_chats` tinyint(1) DEFAULT 1,
  `is_supervisor` tinyint(1) DEFAULT 0,
  `max_concurrent_chats` int(11) DEFAULT 5,
  `auto_assign_new_chats` tinyint(1) DEFAULT 1,
  `is_online` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_activity_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_instance` (`user_id`,`instance_id`),
  KEY `idx_instance_active` (`instance_id`,`is_active`),
  KEY `idx_user_instances` (`user_id`),
  KEY `idx_supervisor` (`is_supervisor`),
  CONSTRAINT `whatsapp_user_instances_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `whatsapp_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_user_instances_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `administrators` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_user_instances: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_user_instances` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_user_instances` ENABLE KEYS */;

-- Copiando estrutura para tabela kapexia_crm_db.whatsapp_webhook_logs
DROP TABLE IF EXISTS `whatsapp_webhook_logs`;
CREATE TABLE IF NOT EXISTS `whatsapp_webhook_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` int(11) NOT NULL,
  `webhook_type` enum('message','status','connection','other') NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`headers`)),
  `processed` tinyint(1) DEFAULT 0,
  `processed_at` timestamp NULL DEFAULT NULL,
  `processing_error` text DEFAULT NULL,
  `created_chat_id` int(11) DEFAULT NULL,
  `created_message_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_chat_id` (`created_chat_id`),
  KEY `created_message_id` (`created_message_id`),
  KEY `idx_instance_webhook` (`instance_id`,`created_at` DESC),
  KEY `idx_processed` (`processed`),
  KEY `idx_webhook_type` (`webhook_type`),
  CONSTRAINT `whatsapp_webhook_logs_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `whatsapp_instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `whatsapp_webhook_logs_ibfk_2` FOREIGN KEY (`created_chat_id`) REFERENCES `whatsapp_chats` (`id`) ON DELETE SET NULL,
  CONSTRAINT `whatsapp_webhook_logs_ibfk_3` FOREIGN KEY (`created_message_id`) REFERENCES `whatsapp_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela kapexia_crm_db.whatsapp_webhook_logs: ~0 rows (aproximadamente)
/*!40000 ALTER TABLE `whatsapp_webhook_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_webhook_logs` ENABLE KEYS */;

-- Copiando estrutura para trigger kapexia_crm_db.ensure_default_group
DROP TRIGGER IF EXISTS `ensure_default_group`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
DELIMITER //
CREATE TRIGGER IF NOT EXISTS ensure_default_group
AFTER UPDATE ON chart_groups
FOR EACH ROW
BEGIN
  
  IF OLD.is_default = TRUE AND NEW.is_default = FALSE THEN
    UPDATE chart_groups 
    SET is_default = TRUE 
    WHERE client_id = NEW.client_id 
      AND is_active = TRUE 
      AND id != NEW.id
    ORDER BY group_order ASC 
    LIMIT 1;
  END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Copiando estrutura para view kapexia_crm_db.view_chart_configs_with_groups
DROP VIEW IF EXISTS `view_chart_configs_with_groups`;
-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `view_chart_configs_with_groups`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_chart_configs_with_groups` AS select `cc`.`id` AS `chart_id`,`cc`.`client_id` AS `client_id`,`c`.`name` AS `client_name`,`cc`.`group_id` AS `group_id`,`cg`.`group_name` AS `group_name`,`cg`.`group_order` AS `group_order`,`cg`.`group_color` AS `group_color`,`cg`.`layout_model` AS `layout_model`,`cc`.`chart_position` AS `chart_position`,`cc`.`chart_type` AS `chart_type`,`cc`.`chart_title` AS `chart_title`,`cc`.`chart_subtitle` AS `chart_subtitle`,`cc`.`chart_description` AS `chart_description`,`cc`.`sql_query` AS `sql_query`,`cc`.`is_active` AS `chart_active`,`cg`.`is_active` AS `group_active`,`cg`.`is_default` AS `group_default`,case when `cdc`.`id` is not null then 1 else 0 end AS `has_drilldown`,`cdc`.`is_active` AS `drilldown_active`,`cc`.`created_at` AS `created_at`,`cc`.`updated_at` AS `updated_at` from (((`chart_configs` `cc` left join `clients` `c` on(`c`.`id` = `cc`.`client_id`)) left join `chart_groups` `cg` on(`cg`.`id` = `cc`.`group_id`)) left join `chart_drilldown_configs` `cdc` on(`cdc`.`client_id` = `cc`.`client_id` and `cdc`.`chart_position` = `cc`.`chart_position`)) order by `cc`.`client_id`,`cg`.`group_order`,`cc`.`chart_position` ;

-- Copiando estrutura para view kapexia_crm_db.view_chart_groups_summary
DROP VIEW IF EXISTS `view_chart_groups_summary`;
-- Removendo tabela temporária e criando a estrutura VIEW final
DROP TABLE IF EXISTS `view_chart_groups_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `view_chart_groups_summary` AS select `cg`.`id` AS `group_id`,`cg`.`client_id` AS `client_id`,`c`.`name` AS `client_name`,`cg`.`group_name` AS `group_name`,`cg`.`group_description` AS `group_description`,`cg`.`group_order` AS `group_order`,`cg`.`group_color` AS `group_color`,`cg`.`layout_model` AS `layout_model`,`cg`.`is_active` AS `is_active`,`cg`.`is_default` AS `is_default`,count(`cc`.`id`) AS `total_charts`,count(case when `cc`.`is_active` = 1 then 1 end) AS `active_charts`,count(case when `cdc`.`id` is not null and `cdc`.`is_active` = 1 then 1 end) AS `charts_with_drilldown`,`cg`.`created_at` AS `created_at`,`cg`.`updated_at` AS `updated_at` from (((`chart_groups` `cg` left join `clients` `c` on(`c`.`id` = `cg`.`client_id`)) left join `chart_configs` `cc` on(`cc`.`group_id` = `cg`.`id`)) left join `chart_drilldown_configs` `cdc` on(`cdc`.`client_id` = `cg`.`client_id` and `cdc`.`chart_position` = `cc`.`chart_position`)) group by `cg`.`id`,`cg`.`client_id`,`c`.`name`,`cg`.`group_name`,`cg`.`group_description`,`cg`.`group_order`,`cg`.`group_color`,`cg`.`layout_model`,`cg`.`is_active`,`cg`.`is_default`,`cg`.`created_at`,`cg`.`updated_at` ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- Alterações Cards
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