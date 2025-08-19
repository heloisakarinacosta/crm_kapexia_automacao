# Projeto: Cards de Indicadores Configuráveis

Esta secção detalha o projeto da área superior do dashboard, que conterá cards de indicadores (KPIs) configuráveis pelo utilizador.

## 1. Objetivo

Apresentar métricas chave de forma rápida e visualmente apelativa no topo do dashboard principal. Permitir que o utilizador personalize quais indicadores são exibidos e a sua ordem.

## 2. Layout e Estilo

*   **Layout:** Uma única linha horizontal (ou um grid que quebra em linhas em ecrãs menores) contendo os cards selecionados.
*   **Estilo do Card:**
    *   Fundo: Cor sólida ligeiramente diferente do fundo principal (ex: cinza um pouco mais claro que o fundo do dashboard).
    *   Bordas: Suavemente arredondadas.
    *   Conteúdo:
        *   **Título:** Nome claro e conciso do indicador (ex: "Novos Leads (Semana)").
        *   **Valor Principal:** O número ou valor da métrica em destaque (fonte maior).
        *   **(Opcional) Comparação/Tendência:** Um valor secundário menor ou ícone indicando mudança (ex: "+5% vs semana ant.", seta para cima/baixo).
        *   **(Opcional) Ícone:** Um ícone representativo da métrica.
    *   **Responsividade:** Os cards devem ajustar o seu tamanho ou o número de cards por linha em diferentes tamanhos de ecrã.

## 3. Conteúdo dos Indicadores (Exemplos)

Uma lista pré-definida de indicadores estará disponível para seleção. Exemplos incluem:

*   Novos Leads (Hoje, Semana, Mês)
*   Leads Convertidos (Semana, Mês)
*   Taxa de Conversão
*   Receita Gerada (Mês, Trimestre)
*   Tarefas Pendentes
*   Emails Enviados
*   Atividades Recentes
*   Utilizadores Ativos

## 4. Mecanismo de Configuração

*   **Acesso:** A configuração será feita numa área dedicada (ex: "Configurações > Dashboard" ou um modo "Editar Dashboard" ativado por um botão).
*   **Interface de Configuração:**
    *   **Lista de Indicadores Disponíveis:** Uma lista ou painel mostrando todos os KPIs que podem ser adicionados ao dashboard.
    *   **Área de Pré-visualização/Seleção:** Uma área mostrando os cards atualmente selecionados.
    *   **Funcionalidades:**
        *   **Adicionar:** Botão ou drag-and-drop para mover um indicador da lista de disponíveis para a área de seleção.
        *   **Remover:** Botão "X" em cada card na área de seleção ou drag-and-drop para a lista de disponíveis/lixo.
        *   **Reordenar:** Drag-and-drop dos cards na área de seleção para alterar a ordem de exibição.
    *   **Salvar:** Botão para aplicar as alterações de configuração.
*   **Persistência:** As preferências de configuração de cada utilizador devem ser guardadas (provavelmente no backend associado ao perfil do utilizador).

## 5. Considerações Técnicas

*   **Frontend:** Componentes React reutilizáveis para os Cards e para a interface de configuração.
*   **Backend:** Necessidade de um endpoint para:
    *   Listar os indicadores disponíveis.
    *   Obter/Salvar a configuração de cards do utilizador.
    *   Fornecer os dados atualizados para cada indicador selecionado.

Este projeto estabelece as bases para a implementação dos cards de indicadores, focando na flexibilidade e personalização pelo utilizador.
