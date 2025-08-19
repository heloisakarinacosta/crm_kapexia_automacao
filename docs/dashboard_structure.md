# Estrutura de Componentes e Layout - Novo Dashboard CRM

Baseado nos requisitos do usuário e na referência visual (estilo ChatGPT/Kapexia), a estrutura proposta para o novo dashboard interno do CRM é a seguinte:

## 1. Layout Principal

*   **Estrutura:** Layout de duas colunas principais.
    *   Coluna Esquerda: Menu Lateral (Sidebar).
    *   Coluna Direita: Área de Conteúdo Principal.
*   **Tema:** Escuro (Dark Mode), seguindo a paleta e estilo da referência Kapexia.
*   **Tecnologia:** React/Next.js com Tailwind CSS para estilização.

## 2. Menu Lateral (Sidebar - Coluna Esquerda)

*   **Funcionalidade:** Retrátil/Colapsável. Um botão (ícone de hambúrguer ou similar) permitirá expandir/recolher o menu.
*   **Conteúdo:**
    *   Logo Kapexia/CRM no topo.
    *   Lista de links de navegação principais (ex: Dashboard, Leads, Clientes, Configurações, etc. - itens exatos a definir).
    *   Ícones associados a cada item de menu.
    *   Possivelmente informações do utilizador logado e botão de logout na parte inferior.
*   **Estilo:** Fundo escuro, texto claro, ícones estilizados, transição suave ao recolher/expandir.

## 3. Área de Conteúdo Principal (Coluna Direita)

Esta área será dividida verticalmente em duas secções principais:

### 3.1. Secção Superior: Cards de Indicadores

*   **Layout:** Uma linha ou grid contendo múltiplos cards.
*   **Componente Card:**
    *   Título do Indicador (ex: "Novos Leads (Semana)").
    *   Valor do Indicador (ex: "42").
    *   Possivelmente um ícone ou pequeno gráfico de tendência.
    *   Estilo minimalista, fundo ligeiramente diferente do principal.
*   **Configurabilidade:** A definição de quais indicadores mostrar será configurável (próximo passo do projeto).

### 3.2. Secção Central: Interface de Chat

*   **Layout:** Ocupa a maior parte da área de conteúdo.
*   **Componentes:**
    *   **Área de Boas-vindas/Sugestões:** Visível inicialmente ou quando não há chat ativo. Apresenta sugestões de perguntas prontas (ex: "Quantos leads entraram essa semana?"). Clicar numa sugestão inicia a pergunta no chat.
    *   **Input de Chat:** Campo de texto na parte inferior para o utilizador digitar perguntas.
    *   **Área de Exibição de Mensagens:** Onde o histórico da conversa (perguntas do utilizador e respostas da IA) é exibido.
    *   **Mecanismo de Resposta:**
        *   **Proposta:** Quando uma resposta é gerada, a área de chat pode deslizar para a esquerda (ou diminuir de tamanho) e um painel lateral direito desliza para dentro, exibindo a resposta detalhada. Um botão (seta para a esquerda) neste painel permitiria fechá-lo e retornar à visualização principal do chat com as sugestões.
        *   *Alternativa:* A resposta aparece diretamente na área de exibição de mensagens, como um chat tradicional.
*   **Estilo:** Interface limpa, similar ao ChatGPT, com balões de mensagem distintos para utilizador e IA.

## 4. Rodapé (Opcional)

*   Pode conter informações de copyright ou links úteis, similar ao dashboard admin atual.

Este documento servirá como base para a criação do wireframe/mockup na próxima etapa.
