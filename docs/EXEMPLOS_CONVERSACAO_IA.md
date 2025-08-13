# Exemplos de Conversação - IA para Estratégias

## Exemplo 1: Criação de Estratégia de Prospecção

### Conversa Completa:

**Usuário:** "Quero criar uma estratégia que irá importar uma planilha, e criar uma estratégia para enviar e-mail no dia 0 a partir da data de hoje, no dia 3 enviar um whatsapp, no dia 5 fazer uma conexão com o linkedin"

**IA:** "Perfeito! Entendi que você quer criar uma estratégia de prospecção com importação de planilha e follow-up multi-canal. Vou fazer algumas perguntas para personalizar melhor:

1. **Sobre a planilha**: Que tipo de dados ela contém? (nome, email, telefone, empresa, cargo, etc.)"

**Usuário:** "Nome, email, telefone, empresa e cargo"

**IA:** "Ótimo! 2. **Sobre o e-mail inicial**: Qual seria o assunto e o tom da mensagem? (formal, casual, promocional, educativo)"

**Usuário:** "Formal, apresentando nossa solução de CRM"

**IA:** "Perfeito! 3. **Sobre o WhatsApp**: Prefere uma mensagem de follow-up ou oferecer algo específico (demo, material, desconto)?"

**Usuário:** "Follow-up perguntando se recebeu o email e se tem interesse em uma demo"

**IA:** "Excelente! 4. **Sobre o LinkedIn**: Quer apenas conectar ou enviar uma mensagem junto com o convite?"

**Usuário:** "Conectar com uma mensagem personalizada"

**IA:** "Perfeito! Criei sua estratégia 'Prospecção B2B Multi-canal'. Vou mostrar como ficou:

**📋 ESTRATÉGIA GERADA:**

**Workflow Geral:**
- 📊 **Importar Planilha** → Webhook configurado para processar dados

**Timeline:**
- **Dia 0** (hoje): 📧 **E-mail Apresentação** 
  - Assunto: "Apresentação - Solução CRM para [EMPRESA]"
  - Corpo: Mensagem formal apresentando benefícios
  
- **Dia 3**: 💬 **WhatsApp Follow-up**
  - "Olá [NOME]! Enviei um e-mail sobre nossa solução CRM. Conseguiu dar uma olhada? Gostaria de agendar uma demo rápida?"
  
- **Dia 5**: 🔗 **Conexão LinkedIn**
  - "Olá [NOME]! Vi que trabalha na [EMPRESA] como [CARGO]. Gostaria de conectar e trocar experiências sobre CRM."

**Configurações:**
- Data inicial: Hoje (26/07/2025)
- Dias corridos (não apenas úteis)
- 3 pontos de contato em 5 dias

Quer que eu **salve** essa estratégia, faça algum **ajuste** ou prefere **cancelar**?"

**Usuário:** "Salvar"

**IA:** "✅ Estratégia 'Prospecção B2B Multi-canal' salva com sucesso! 

Você pode:
- **Executar agora**: Começar a estratégia imediatamente
- **Agendar**: Definir quando iniciar
- **Testar**: Fazer um teste com poucos contatos primeiro
- **Editar**: Fazer ajustes na interface visual

O que prefere fazer?"

## Exemplo 2: Estratégia de Customer Success

**Usuário:** "Preciso de uma automação para cuidar dos clientes que acabaram de assinar"

**IA:** "Ótimo! Vou criar uma estratégia de Customer Success para novos clientes. Algumas perguntas:

1. **Timing**: Quando deve começar? (imediatamente após assinatura, 1 dia depois, etc.)"

**Usuário:** "No mesmo dia da assinatura"

**IA:** "2. **Duração**: Por quantos dias quer acompanhar? (30, 60, 90 dias)"

**Usuário:** "60 dias"

**IA:** "3. **Canais**: Prefere e-mail, WhatsApp ou ambos?"

**Usuário:** "Ambos, mas começar com e-mail"

**IA:** "4. **Objetivos**: Quer focar em onboarding, engajamento, upsell ou retenção?"

**Usuário:** "Onboarding nos primeiros 30 dias, depois engajamento"

**IA:** "Perfeito! Criei sua estratégia 'Customer Success - Novos Clientes':

**📋 ESTRATÉGIA GERADA:**

**Workflow Geral:**
- 🎯 **Identificar Novo Cliente** → Trigger quando status = 'ativo'

**Timeline - Onboarding (0-30 dias):**
- **Dia 0**: 📧 **Boas-vindas** + Guia de primeiros passos
- **Dia 2**: 📧 **Tutorial básico** + Link para vídeos
- **Dia 7**: 💬 **WhatsApp check-in** → "Como está sendo a experiência?"
- **Dia 14**: 📧 **Dicas avançadas** + Agendamento de call
- **Dia 21**: 💬 **WhatsApp suporte** → "Precisa de ajuda?"
- **Dia 30**: 📧 **Feedback** + Pesquisa de satisfação

**Timeline - Engajamento (31-60 dias):**
- **Dia 35**: 📧 **Case de sucesso** + Novas funcionalidades
- **Dia 45**: 💬 **WhatsApp** → Compartilhar resultado/métrica
- **Dia 60**: 📧 **Renovação** + Oferta de upgrade

Salvar essa estratégia?"

## Exemplo 3: Estratégia de Cobrança

**Usuário:** "Quero automatizar a cobrança de clientes em atraso"

**IA:** "Entendi! Vou criar uma estratégia de cobrança inteligente. Preciso saber:

1. **Gatilho**: A partir de quantos dias de atraso deve iniciar? (1, 3, 5 dias)"

**Usuário:** "3 dias"

**IA:** "2. **Escalação**: Quantos níveis de cobrança? (amigável → firme → jurídico)"

**Usuário:** "3 níveis: amigável, firme e jurídico"

**IA:** "3. **Canais**: E-mail, WhatsApp, SMS ou telefone?"

**Usuário:** "E-mail primeiro, depois WhatsApp, por último telefone"

**IA:** "4. **Valores**: Quer tratar diferente por faixa de valor? (ex: acima de R$ 1000)"

**Usuário:** "Sim, acima de R$ 500 mais atenção"

**IA:** "Estratégia 'Cobrança Inteligente' criada:

**Workflow Geral:**
- 🔍 **Identificar Atraso** → Query: faturas vencidas há 3+ dias
- ⚖️ **Classificar Valor** → IF valor > R$ 500 → fluxo premium

**Timeline - Cobrança Padrão:**
- **Dia 0**: 📧 **Lembrete amigável** → "Fatura em atraso"
- **Dia 3**: 💬 **WhatsApp cordial** → "Podemos ajudar?"
- **Dia 7**: 📧 **Cobrança firme** → Consequências do não pagamento
- **Dia 10**: ☎️ **Ligação** → Negociação direta
- **Dia 15**: 📧 **Aviso jurídico** → Últimas providências

**Timeline - Cobrança Premium (>R$ 500):**
- **Dia 0**: 📧 **E-mail personalizado** → Gerente de contas
- **Dia 1**: ☎️ **Ligação imediata** → Atendimento VIP
- **Dia 2**: 💬 **WhatsApp executivo** → Proposta de parcelamento
- **Dia 5**: 📧 **Proposta formal** → Condições especiais
- **Dia 10**: ☎️ **Call executiva** → Última negociação

Implementar essa estratégia?"

## Exemplo 4: Modificação de Estratégia Existente

**Usuário:** "A estratégia de prospecção está com baixa conversão no e-mail"

**IA:** "Vou analisar sua estratégia 'Prospecção B2B Multi-canal' e sugerir melhorias:

📊 **ANÁLISE ATUAL:**
- Taxa de abertura: 23% (média: 25%)
- Taxa de clique: 2.1% (média: 3.5%)
- Conversão: 0.8% (média: 2.2%)

🎯 **SUGESTÕES DE MELHORIA:**

1. **Assunto do E-mail:**
   - Atual: "Apresentação - Solução CRM para [EMPRESA]"
   - Sugestão: "[NOME], 3 minutos para economizar 5 horas/semana?"

2. **Timing:**
   - Atual: Dia 0 → Dia 3 → Dia 5
   - Sugestão: Dia 0 → Dia 2 → Dia 5 → Dia 8 (adicionar 4º toque)

3. **Personalização:**
   - Adicionar pesquisa da empresa no LinkedIn (Dia -1)
   - Mencionar dor específica do setor

4. **A/B Test:**
   - Testar 2 versões de assunto
   - Testar horário de envio (9h vs 14h)

Quer que eu **implemente** essas melhorias, **teste A/B** primeiro ou **analise** mais dados?"

**Usuário:** "Implementar as melhorias e fazer teste A/B do assunto"

**IA:** "✅ Melhorias implementadas! Criei 2 versões:

**Versão A:** "[NOME], 3 minutos para economizar 5 horas/semana?"
**Versão B:** "[EMPRESA] pode estar perdendo R$ 50k/ano. Vou mostrar como evitar"

O teste A/B vai dividir 50/50 por 2 semanas. Depois implemento a versão vencedora.

Estratégia atualizada e ativa! 🚀"

## Padrões de Conversação Identificados

### 1. Detecção de Intenção
\`\`\`javascript
const intentPatterns = {
  create: ["criar", "nova", "fazer", "preciso de"],
  modify: ["alterar", "mudar", "melhorar", "ajustar"],
  analyze: ["analisar", "como está", "performance", "resultados"],
  execute: ["executar", "rodar", "iniciar", "ativar"]
}
\`\`\`

### 2. Tipos de Estratégia
\`\`\`javascript
const strategyTypes = {
  prospeccao: ["prospecção", "leads", "vendas", "contatos"],
  customer_success: ["clientes", "onboarding", "retenção", "satisfação"],
  cobranca: ["cobrança", "atraso", "pagamento", "inadimplência"],
  reativacao: ["reativar", "inativos", "volta", "recuperar"]
}
\`\`\`

### 3. Fluxo de Perguntas
\`\`\`javascript
const questionFlow = {
  data_source: "Qual a fonte dos dados?",
  timing: "Quando deve começar?",
  duration: "Por quantos dias?",
  channels: "Quais canais usar?",
  tone: "Qual tom da comunicação?",
  objectives: "Qual o objetivo principal?"
}
\`\`\`

### 4. Validações Automáticas
\`\`\`javascript
const validations = {
  required_fields: ["data_source", "timing", "channels"],
  business_rules: {
    max_timeline_days: 365,
    min_gap_between_contacts: 1,
    max_nodes_per_day: 5
  },
  integrations: {
    webhook_format: /^https?:\/\/.+/,
    email_template: /\[NOME\]|\[EMPRESA\]/
  }
}
