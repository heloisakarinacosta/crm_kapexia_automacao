# Plano de Implementação do MVP2 - CRM Kapexia (Final)

## Visão Geral

O MVP2 do CRM Kapexia introduzirá uma nova página de "Análises" com gráficos dinâmicos e configuráveis por cliente. Esta funcionalidade permitirá que diferentes clientes visualizem dados específicos dos seus leads através de consultas SQL personalizadas, conectando-se a bases de dados externas ou utilizando dados de demonstração.

## Requisitos Principais

1. **Página de Análises com 10 Blocos de Gráficos:**
   - Layout hierárquico: 3 gráficos principais em destaque (primeira linha mais alta), 4 na segunda linha e 3 na terceira linha
   - Visual moderno com painéis brancos arredondados sobre fundo escuro
   - Tipografia Montserrat light com títulos em maiúsculas
   - Foco em métricas de leads e conversão

2. **Gestão de Clientes:**
   - Cadastro de clientes (apenas para administradores)
   - Associação de utilizadores a clientes
   - Dados do cliente (nome, CNPJ, razão social, endereço, telefone, perfil)

3. **Configuração de Datasets:**
   - Configuração de conexão a bases de dados externas (MySQL/MariaDB)
   - Suporte a conexões seguras com SSL
   - Opção para usar dados de demonstração

4. **Configuração de SQLs por Gráfico:**
   - SQLs personalizados para cada bloco de gráfico
   - Configuração por cliente

5. **Tipos de Gráficos Específicos:**
   - **Primeira linha (principais - mais altos):**
     1. "KAPEX QUALIFICAÇÃO" - Gráfico de colunas (leads recebidos por dia)
     2. "KAPEX PROSPECÇÃO" - Gráfico de linha (leads prospectados por dia)
     3. "KAPEX EXPANSÃO" - Gráfico de colunas (clientes prospectados por dia)
   
   - **Segunda linha:**
     4. "DISTRIBUIÇÃO QUALIFICAÇÃO" - Gráfico de pizza (percentual frio, morno, quente)
     5. "AGENDAMENTOS CLOSERS" - Gráfico de rosca (percentuais sobre total)
     6. "CONVERSÃO PRODUTO/SERVIÇO" - Gráfico de rosca (percentuais de conversão)
     7. "TICKET MÉDIO CLIENTES" - Gráfico de colunas com valores (mensal)
   
   - **Terceira linha:**
     8. "TX GANHO QUALIFICAÇÃO" - Gráfico de barras sobrepostas (trimestral)
     9. "TX GANHO PROSPECÇÃO" - Gráfico de barras sobrepostas (trimestral)
     10. "TICKET MÉDIO TRIMESTRAL" - Gráfico de colunas com valores (trimestral)

## Alterações na Base de Dados

### Novas Tabelas

1. **clients**
```sql
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
```

2. **client_database_configs**
```sql
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
```

3. **chart_configs**
```sql
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
```

4. **Alteração na tabela administrators**
```sql
ALTER TABLE administrators
ADD COLUMN client_id INT NULL,
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
```

## Componente de Gráficos Recomendado

Após análise das opções disponíveis, recomendamos o uso do **Recharts** para implementação dos gráficos no MVP2:

- **Licença:** MIT (open source, sem restrições para uso comercial)
- **Compatibilidade:** Nativo para React/Next.js
- **Vantagens:**
  - Componentes React nativos
  - API declarativa e fácil de usar
  - Suporte a responsividade
  - Personalização avançada
  - Animações fluidas
  - Boa documentação
  - Comunidade ativa

- **Instalação:**
```bash
npm install recharts
```

## Lista de Tarefas

### Backend

1. **Modelação da Base de Dados**
   - Criar script SQL para novas tabelas
   - Implementar modelos para as novas entidades

2. **API para Gestão de Clientes**
   - Endpoints CRUD para clientes
   - Validação de dados (CNPJ, etc.)
   - Controlo de acesso (apenas admin)

3. **API para Configuração de Datasets**
   - Endpoints para gestão de conexões a BD
   - Encriptação de credenciais
   - Teste de conexão

4. **API para Configuração de SQLs**
   - Endpoints para gestão de SQLs por gráfico
   - Validação de SQLs (segurança)
   - Associação a clientes

5. **API para Dados dos Gráficos**
   - Endpoint para execução segura de SQLs
   - Conexão dinâmica a BDs externas
   - Fallback para dados de demonstração
   - Cache de resultados

6. **Segurança e Permissões**
   - Filtro de acesso por cliente_id
   - Validação de tokens JWT
   - Logs de acesso

### Frontend

1. **Página de Análises**
   - Layout responsivo com 10 blocos (3-4-3)
   - Primeira linha com painéis 40% mais altos
   - Painéis brancos arredondados sobre fundo escuro
   - Tipografia Montserrat light com títulos em maiúsculas
   - Componentes de gráficos Recharts
   - Loading states e error handling
   - Filtros de data (mês/trimestre)

2. **Gestão de Clientes (Admin)**
   - Formulário de cadastro
   - Listagem e edição
   - Associação de utilizadores

3. **Configuração de Datasets**
   - Interface para conexão a BD
   - Teste de conexão
   - Toggle para dados de demo

4. **Configuração de SQLs**
   - Editor de SQL por gráfico
   - Preview de resultados
   - Seleção de tipo de gráfico

5. **Integração com Recharts**
   - Componentes reutilizáveis
   - Adaptadores para diferentes tipos de dados
   - Temas e estilos

6. **UI/UX**
   - Tema escuro com painéis brancos
   - Animações e transições
   - Responsividade
   - Tooltips e ajuda contextual

## Estrutura de Ficheiros

### Backend

```
/backend
  /src
    /models
      clientModel.js
      databaseConfigModel.js
      chartConfigModel.js
    /controllers
      clientController.js
      databaseConfigController.js
      chartConfigController.js
      analyticsController.js
    /routes
      clientRoutes.js
      databaseConfigRoutes.js
      chartConfigRoutes.js
      analyticsRoutes.js
    /services
      databaseConnectionService.js
      sqlExecutionService.js
    /utils
      sqlValidator.js
      encryptionUtil.js
```

### Frontend

```
/frontend
  /src
    /app
      /admin
        /analytics
          page.tsx
          layout.tsx
        /settings
          /clients
            page.tsx
            [id]/page.tsx
          /chart-configs
            page.tsx
    /components
      /analytics
        AnalyticsContainer.tsx
        ChartBlock.tsx
        BarChart.tsx
        LineChart.tsx
        PieChart.tsx
        DonutChart.tsx
        ColumnChart.tsx
        StackedBarChart.tsx
        ChartControls.tsx
      /settings
        ClientForm.tsx
        DatabaseConfigForm.tsx
        SqlConfigForm.tsx
    /hooks
      useChartData.ts
      useDatabaseConnection.ts
    /services
      analyticsService.ts
      clientService.ts
      chartConfigService.ts
```

## Dados de Demonstração

Para clientes que optarem por usar dados de demonstração, serão criadas tabelas com dados fictícios de leads:

```sql
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
```

## SQLs Pré-configurados

Para cada tipo de gráfico, serão criados SQLs padrão que funcionarão com os dados de demonstração:

1. **KAPEX QUALIFICAÇÃO (Leads Recebidos)**
```sql
SELECT 
  DAY(created_at) AS dia,
  COUNT(*) AS total_leads
FROM demo_leads
WHERE 
  client_id = ? AND
  MONTH(created_at) = MONTH(CURRENT_DATE()) AND
  YEAR(created_at) = YEAR(CURRENT_DATE())
GROUP BY dia
ORDER BY dia;
```

2. **KAPEX PROSPECÇÃO (Leads Prospectados)**
```sql
SELECT 
  DAY(created_at) AS dia,
  COUNT(*) AS total_leads
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status IN ('Qualificação', 'Agendamento', 'Proposta') AND
  MONTH(created_at) = MONTH(CURRENT_DATE()) AND
  YEAR(created_at) = YEAR(CURRENT_DATE())
GROUP BY dia
ORDER BY dia;
```

3. **KAPEX EXPANSÃO (Clientes Prospectados)**
```sql
SELECT 
  DAY(created_at) AS dia,
  COUNT(DISTINCT lead_name) AS total_clientes
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status = 'Fechado' AND
  MONTH(created_at) = MONTH(CURRENT_DATE()) AND
  YEAR(created_at) = YEAR(CURRENT_DATE())
GROUP BY dia
ORDER BY dia;
```

4. **DISTRIBUIÇÃO QUALIFICAÇÃO**
```sql
SELECT 
  lead_type AS tipo,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM demo_leads WHERE client_id = ?), 1) AS percentual
FROM demo_leads
WHERE client_id = ?
GROUP BY tipo;
```

5. **AGENDAMENTOS CLOSERS**
```sql
SELECT 
  lead_status AS status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM demo_leads WHERE client_id = ? AND lead_status = 'Agendamento'), 1) AS percentual
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status = 'Agendamento'
GROUP BY status;
```

6. **CONVERSÃO PRODUTO/SERVIÇO**
```sql
SELECT 
  'Convertidos' AS status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM demo_leads WHERE client_id = ?), 1) AS percentual
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status = 'Fechado'
UNION
SELECT 
  'Não Convertidos' AS status,
  COUNT(*) AS total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM demo_leads WHERE client_id = ?), 1) AS percentual
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status != 'Fechado';
```

7. **TICKET MÉDIO CLIENTES**
```sql
SELECT 
  MONTH(created_at) AS mes,
  ROUND(AVG(valor_proposta), 2) AS ticket_medio,
  SUM(valor_proposta) AS total_valor
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status = 'Fechado' AND
  MONTH(created_at) = MONTH(CURRENT_DATE()) AND
  YEAR(created_at) = YEAR(CURRENT_DATE())
GROUP BY mes
ORDER BY mes;
```

8. **TX GANHO QUALIFICAÇÃO**
```sql
SELECT 
  MONTH(created_at) AS mes,
  COUNT(*) AS total_leads,
  SUM(CASE WHEN lead_status = 'Agendamento' THEN 1 ELSE 0 END) AS agendamentos,
  ROUND(SUM(CASE WHEN lead_status = 'Agendamento' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS taxa_agendamento
FROM demo_leads
WHERE 
  client_id = ? AND
  created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
GROUP BY mes
ORDER BY mes;
```

9. **TX GANHO PROSPECÇÃO**
```sql
SELECT 
  MONTH(created_at) AS mes,
  COUNT(*) AS total_leads,
  SUM(CASE WHEN lead_status = 'Proposta' THEN 1 ELSE 0 END) AS propostas,
  ROUND(SUM(CASE WHEN lead_status = 'Proposta' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS taxa_proposta
FROM demo_leads
WHERE 
  client_id = ? AND
  created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
GROUP BY mes
ORDER BY mes;
```

10. **TICKET MÉDIO TRIMESTRAL**
```sql
SELECT 
  MONTH(created_at) AS mes,
  ROUND(AVG(valor_proposta), 2) AS ticket_medio,
  SUM(valor_proposta) AS total_valor
FROM demo_leads
WHERE 
  client_id = ? AND
  lead_status = 'Fechado' AND
  created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH)
GROUP BY mes
ORDER BY mes;
```

## Segurança

1. **Credenciais de BD**
   - Encriptação de senhas no banco de dados
   - Uso de variáveis de ambiente para chaves de encriptação

2. **Execução de SQL**
   - Validação de queries para evitar injeção SQL
   - Limitação de tipos de queries (apenas SELECT)
   - Timeout para queries longas
   - Rate limiting por cliente

3. **Conexões Externas**
   - Suporte a SSL para conexões seguras
   - Validação de certificados
   - Timeouts e retry policies

## Plano de Implementação

1. **Fase 1: Backend e Base de Dados**
   - Implementação das novas tabelas
   - Desenvolvimento dos modelos e controladores
   - Criação das APIs para gestão de clientes e configurações
   - Testes unitários e de integração

2. **Fase 2: Frontend - Configurações**
   - Desenvolvimento das interfaces de gestão de clientes
   - Implementação das telas de configuração de datasets e SQLs
   - Testes de usabilidade

3. **Fase 3: Frontend - Página de Análises**
   - Implementação do layout com 10 painéis
   - Integração com Recharts
   - Desenvolvimento dos componentes de gráficos
   - Conexão com as APIs do backend

4. **Fase 4: Testes e Validação**
   - Testes integrados de todo o fluxo
   - Validação de performance
   - Verificação de segurança
   - Testes com dados reais e de demonstração

5. **Fase 5: Deployment**
   - Checkpoint de validação pré-produção
   - Deployment em ambiente de produção
   - Monitorização e ajustes finais
