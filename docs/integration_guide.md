# Guia de Integração: Frontend e Backend do CRM Kapexia

Este documento descreve os pontos de integração entre o frontend e o backend do CRM Kapexia, bem como os próximos passos para completar a implementação.

## Componentes Implementados

Todos os componentes principais do frontend foram implementados seguindo o design aprovado:

1. **Layout Base (DashboardLayout)**: Estrutura principal com menu lateral e área de conteúdo.
2. **Menu Lateral (Sidebar)**: Menu retrátil com navegação e informações do utilizador.
3. **Cards de Indicadores**: Componentes para exibir métricas e KPIs.
4. **Interface de Chat**: Área central com input, mensagens e sugestões.

## Pontos de Integração com Backend/BD

### 1. Autenticação e Gestão de Utilizadores

- **Componentes Afetados**: `Sidebar.tsx` (informações do utilizador)
- **Dados Necessários**: 
  - Informações do utilizador logado (nome, email, avatar)
  - Permissões de acesso para controle de navegação

### 2. Indicadores e Métricas (Dashboard)

- **Componentes Afetados**: `IndicatorCardsSection.tsx`, `IndicatorCard.tsx`
- **Dados Necessários**:
  - Métricas em tempo real (leads, conversões, receita, etc.)
  - Configurações de quais indicadores exibir (personalização)
  - Histórico para cálculo de tendências

### 3. Interface de Chat

- **Componentes Afetados**: `ChatInterface.tsx`, `ChatMessage.tsx`, `ChatSuggestion.tsx`
- **Dados Necessários**:
  - Histórico de conversas do utilizador
  - Sugestões personalizadas baseadas em dados do utilizador
  - Integração com API de IA para processamento de perguntas
  - Acesso a dados em tempo real para responder consultas

## Estrutura de API Recomendada

Para suportar os componentes implementados, recomendamos a seguinte estrutura de API:

### Endpoints de Autenticação
```
POST /api/auth/login
GET /api/auth/user
POST /api/auth/logout
```

### Endpoints de Dashboard
```
GET /api/dashboard/indicators
POST /api/dashboard/indicators/config (para salvar configurações)
GET /api/dashboard/indicators/available (lista de indicadores disponíveis)
```

### Endpoints de Chat
```
GET /api/chat/history
POST /api/chat/message
GET /api/chat/suggestions
```

## Próximos Passos

1. **Implementação do Backend**:
   - Criar os endpoints da API conforme estrutura recomendada
   - Implementar lógica de autenticação e autorização
   - Desenvolver serviços para cálculo de métricas e indicadores
   - Integrar com serviço de IA para processamento de perguntas no chat

2. **Integração Frontend-Backend**:
   - Criar serviços/hooks React para comunicação com a API
   - Substituir dados estáticos por chamadas à API
   - Implementar gestão de estado (Context API ou Redux)
   - Adicionar tratamento de erros e estados de carregamento

3. **Configuração e Personalização**:
   - Implementar interface para configuração de indicadores
   - Desenvolver sistema de permissões baseado em perfis
   - Criar mecanismos para personalização de sugestões no chat

## Considerações Técnicas

- **Autenticação**: Recomendamos JWT para autenticação stateless
- **Comunicação em Tempo Real**: Considerar WebSockets para atualizações em tempo real
- **Cache**: Implementar estratégias de cache para melhorar performance
- **Testes**: Desenvolver testes unitários e de integração para garantir robustez

## Conclusão

O frontend foi desenvolvido de forma modular e preparado para integração com backend e base de dados. A arquitetura permite desenvolvimento incremental e minimiza retrabalho nas próximas fases.
