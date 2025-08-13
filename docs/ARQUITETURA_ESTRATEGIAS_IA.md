# Arquitetura Completa - Régua de Estratégias com IA

## 1. Visão Geral do Sistema

### Objetivos:
- ✅ **Criação Manual**: Interface visual drag & drop
- 🎯 **Criação por IA**: Conversação natural para gerar estratégias
- 🔄 **Híbrido**: Combinar criação manual com sugestões de IA
- 📊 **Integração**: Usar dados existentes do CRM para personalização

### Fluxo de Criação por IA:
\`\`\`
Usuário: "Quero criar uma estratégia de prospecção B2B"
    ↓
IA: Analisa intenção + contexto do cliente
    ↓
IA: "Entendi! Vou criar uma estratégia de prospecção. Algumas perguntas:
     - Qual a fonte dos leads? (planilha, banco, API)
     - Quantos dias de follow-up você quer?
     - Prefere começar com email ou WhatsApp?"
    ↓
Usuário: Responde perguntas
    ↓
IA: Gera estrutura da estratégia automaticamente
    ↓
Sistema: Salva e permite edição manual se necessário
\`\`\`

## 2. Componentes da Arquitetura

### 2.1 Backend APIs (Existente + Novo)
\`\`\`
/api/strategies/                    # CRUD básico
/api/strategies/ai/                 # Endpoints específicos para IA
├── /analyze-intent                 # Analisar intenção do usuário
├── /generate-strategy              # Gerar estratégia completa
├── /suggest-nodes                  # Sugerir nós baseado no contexto
├── /validate-strategy              # Validar estratégia gerada
└── /complete-missing               # Identificar campos obrigatórios
\`\`\`

### 2.2 IA Strategy Builder (Novo)
\`\`\`
StrategyAI/
├── IntentAnalyzer                  # Analisa o que o usuário quer
├── ContextExtractor                # Extrai contexto do cliente/CRM
├── StrategyGenerator               # Gera estrutura da estratégia
├── NodeSuggester                   # Sugere nós apropriados
├── ConversationManager             # Gerencia diálogo com usuário
└── ValidationEngine                # Valida estratégia gerada
\`\`\`

### 2.3 Integração com Chat Existente
\`\`\`
ChatSystem (Existente)
├── MessageProcessor               # Processa mensagens
├── APIConnector                   # Conecta com APIs de dados
└── StrategyModule (Novo)          # Módulo específico para estratégias
    ├── StrategyIntentDetector     # Detecta quando falar de estratégias
    ├── StrategyConversation       # Gerencia conversa sobre estratégias
    └── StrategyExecutor           # Executa criação da estratégia
\`\`\`

## 3. Estrutura de Dados para IA

### 3.1 Intent Classification
\`\`\`json
{
  "intents": {
    "create_strategy": {
      "keywords": ["estratégia", "régua", "automação", "sequência"],
      "patterns": [
        "quero criar uma estratégia",
        "preciso automatizar",
        "fazer uma régua de",
        "sequência de contatos"
      ]
    },
    "strategy_types": {
      "prospeccao": ["prospecção", "leads", "vendas", "contatos"],
      "customer_success": ["retenção", "clientes", "satisfação"],
      "cobranca": ["cobrança", "pagamento", "inadimplência"]
    }
  }
}
\`\`\`

### 3.2 Strategy Templates por IA
\`\`\`json
{
  "templates": {
    "prospeccao_b2b": {
      "name": "Prospecção B2B",
      "description": "Estratégia padrão para prospecção B2B",
      "questions": [
        {
          "id": "data_source",
          "question": "Qual a fonte dos seus leads?",
          "options": ["planilha", "banco_dados", "api_externa", "manual"],
          "required": true
        },
        {
          "id": "timeline_days",
          "question": "Quantos dias de follow-up você quer?",
          "type": "number",
          "default": 30,
          "required": true
        },
        {
          "id": "first_contact",
          "question": "Como prefere fazer o primeiro contato?",
          "options": ["email", "whatsapp", "linkedin", "telefone"],
          "required": true
        }
      ],
      "node_templates": {
        "workflow": [
          {
            "condition": "data_source == 'planilha'",
            "node": {
              "type": "data-import",
              "title": "Importar Planilha",
              "day": -999,
              "config": {
                "webhook": "{{webhook_import}}"
              }
            }
          }
        ],
        "timeline": [
          {
            "condition": "first_contact == 'email'",
            "node": {
              "type": "send-email",
              "title": "Email Inicial",
              "day": 0,
              "config": {
                "subject": "{{email_subject}}",
                "body": "{{email_body}}"
              }
            }
          }
        ]
      }
    }
  }
}
\`\`\`

### 3.3 Context Data Structure
\`\`\`json
{
  "client_context": {
    "client_id": 1,
    "industry": "tecnologia",
    "company_size": "startup",
    "current_strategies": 3,
    "active_leads": 150,
    "conversion_rate": 0.12,
    "preferred_channels": ["email", "whatsapp"],
    "integrations": ["n8n", "make", "zapier"]
  },
  "user_context": {
    "user_id": 1,
    "role": "vendedor",
    "experience_level": "intermediario",
    "created_strategies": 5,
    "preferred_templates": ["prospeccao", "followup"]
  }
}
\`\`\`

## 4. Fluxos de Conversação

### 4.1 Detecção de Intenção
\`\`\`javascript
// Exemplo de detecção
const message = "Quero criar uma estratégia para prospecção"

const intent = await StrategyAI.analyzeIntent(message, clientContext)
// Resultado:
{
  "intent": "create_strategy",
  "strategy_type": "prospeccao",
  "confidence": 0.95,
  "entities": {
    "action": "criar",
    "type": "estratégia",
    "purpose": "prospecção"
  }
}
\`\`\`

### 4.2 Geração de Perguntas
\`\`\`javascript
const questions = await StrategyAI.generateQuestions(intent, clientContext)
// Resultado:
[
  {
    "id": "data_source",
    "question": "Qual será a fonte dos seus leads para esta estratégia?",
    "type": "multiple_choice",
    "options": [
      { "value": "planilha", "label": "Importar de planilha Excel/CSV" },
      { "value": "banco", "label": "Consultar banco de dados" },
      { "value": "api", "label": "Integração com API externa" }
    ],
    "required": true
  },
  {
    "id": "timeline",
    "question": "Quantos dias de follow-up você gostaria?",
    "type": "number",
    "min": 1,
    "max": 365,
    "default": 30,
    "required": true
  }
]
\`\`\`

### 4.3 Geração da Estratégia
\`\`\`javascript
const answers = {
  "data_source": "planilha",
  "timeline": 15,
  "first_contact": "email",
  "followup_channels": ["whatsapp", "email"]
}

const strategy = await StrategyAI.generateStrategy(intent, answers, clientContext)
// Resultado: estrutura completa da estratégia
\`\`\`

## 5. Implementação Backend

### 5.1 Strategy AI Controller
\`\`\`javascript
class StrategyAIController {
  // Analisar intenção do usuário
  async analyzeIntent(req, res) {
    const { message, context } = req.body
    const intent = await IntentAnalyzer.analyze(message, context)
    res.json({ intent })
  }

  // Gerar perguntas baseadas na intenção
  async generateQuestions(req, res) {
    const { intent, clientContext } = req.body
    const questions = await QuestionGenerator.generate(intent, clientContext)
    res.json({ questions })
  }

  // Gerar estratégia completa
  async generateStrategy(req, res) {
    const { intent, answers, clientContext } = req.body
    const strategy = await StrategyGenerator.generate(intent, answers, clientContext)
    res.json({ strategy })
  }

  // Sugerir melhorias em estratégia existente
  async suggestImprovements(req, res) {
    const { strategyId } = req.params
    const suggestions = await ImprovementSuggester.analyze(strategyId)
    res.json({ suggestions })
  }
}
\`\`\`

### 5.2 Intent Analyzer
\`\`\`javascript
class IntentAnalyzer {
  static async analyze(message, context) {
    // 1. Preprocessar mensagem
    const cleanMessage = this.preprocess(message)
    
    // 2. Detectar intenção principal
    const intent = await this.detectIntent(cleanMessage)
    
    // 3. Extrair entidades
    const entities = await this.extractEntities(cleanMessage)
    
    // 4. Determinar tipo de estratégia
    const strategyType = await this.determineStrategyType(entities, context)
    
    return {
      intent,
      strategyType,
      entities,
      confidence: this.calculateConfidence(intent, entities)
    }
  }

  static detectIntent(message) {
    const intents = {
      'create_strategy': [
        /criar.*estratégia/i,
        /nova.*régua/i,
        /automatizar.*processo/i,
        /sequência.*contatos/i
      ],
      'modify_strategy': [
        /alterar.*estratégia/i,
        /modificar.*régua/i,
        /editar.*automação/i
      ],
      'analyze_strategy': [
        /analisar.*estratégia/i,
        /performance.*régua/i,
        /resultados.*automação/i
      ]
    }

    for (const [intent, patterns] of Object.entries(intents)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return intent
      }
    }

    return 'unknown'
  }
}
\`\`\`

### 5.3 Strategy Generator
\`\`\`javascript
class StrategyGenerator {
  static async generate(intent, answers, clientContext) {
    // 1. Selecionar template base
    const template = await this.selectTemplate(intent.strategyType, clientContext)
    
    // 2. Processar respostas
    const processedAnswers = this.processAnswers(answers, template)
    
    // 3. Gerar workflow nodes
    const workflowNodes = await this.generateWorkflowNodes(template, processedAnswers)
    
    // 4. Gerar timeline nodes
    const timelineNodes = await this.generateTimelineNodes(template, processedAnswers)
    
    // 5. Calcular timeline days
    const timelineDays = this.calculateTimelineDays(processedAnswers)
    
    return {
      name: this.generateStrategyName(intent, processedAnswers),
      description: this.generateDescription(intent, processedAnswers),
      dataInicial: new Date().toISOString().split('T')[0],
      diasUteis: processedAnswers.business_days || false,
      timelineDays,
      workflowNodes,
      timelineNodes,
      isActive: true,
      aiGenerated: true,
      template: template.id
    }
  }

  static generateWorkflowNodes(template, answers) {
    const nodes = []
    
    // Processar cada template de nó
    template.node_templates.workflow.forEach((nodeTemplate, index) => {
      if (this.evaluateCondition(nodeTemplate.condition, answers)) {
        const node = {
          id: `workflow-ai-${Date.now()}-${index}`,
          type: nodeTemplate.node.type,
          title: this.processTemplate(nodeTemplate.node.title, answers),
          day: -999,
          position: { x: 100 + (index * 200), y: 100 },
          config: this.processConfig(nodeTemplate.node.config, answers)
        }
        nodes.push(node)
      }
    })
    
    return nodes
  }

  static generateTimelineNodes(template, answers) {
    const nodes = []
    let dayIndex = 0
    
    template.node_templates.timeline.forEach((nodeTemplate, index) => {
      if (this.evaluateCondition(nodeTemplate.condition, answers)) {
        const node = {
          id: `timeline-ai-${Date.now()}-${index}`,
          type: nodeTemplate.node.type,
          title: this.processTemplate(nodeTemplate.node.title, answers),
          day: nodeTemplate.node.day || dayIndex,
          position: { x: 50, y: 50 + (index * 80) },
          config: this.processConfig(nodeTemplate.node.config, answers)
        }
        nodes.push(node)
        dayIndex += 2 // Espaçar dias
      }
    })
    
    return nodes
  }
}
\`\`\`

## 6. Integração com Chat Existente

### 6.1 Strategy Chat Module
\`\`\`javascript
class StrategyChatModule {
  constructor(chatSystem) {
    this.chatSystem = chatSystem
    this.activeConversations = new Map()
  }

  async processMessage(message, userId, clientId) {
    // 1. Verificar se é sobre estratégias
    if (!this.isStrategyRelated(message)) {
      return null // Deixa outros módulos processarem
    }

    // 2. Obter ou criar conversa ativa
    const conversation = this.getOrCreateConversation(userId)

    // 3. Processar mensagem no contexto da conversa
    const response = await this.processStrategyMessage(message, conversation, clientId)

    // 4. Atualizar estado da conversa
    this.updateConversation(userId, conversation)

    return response
  }

  async processStrategyMessage(message, conversation, clientId) {
    const context = await this.getClientContext(clientId)

    switch (conversation.state) {
      case 'initial':
        return await this.handleInitialMessage(message, conversation, context)
      
      case 'collecting_requirements':
        return await this.handleRequirementCollection(message, conversation, context)
      
      case 'generating_strategy':
        return await this.handleStrategyGeneration(message, conversation, context)
      
      case 'reviewing_strategy':
        return await this.handleStrategyReview(message, conversation, context)
      
      default:
        return this.handleUnknownState(conversation)
    }
  }

  async handleInitialMessage(message, conversation, context) {
    // Analisar intenção
    const intent = await StrategyAI.analyzeIntent(message, context)
    
    if (intent.intent === 'create_strategy') {
      // Gerar perguntas iniciais
      const questions = await StrategyAI.generateQuestions(intent, context)
      
      conversation.state = 'collecting_requirements'
      conversation.intent = intent
      conversation.questions = questions
      conversation.currentQuestionIndex = 0
      
      return {
        message: `Perfeito! Vou te ajudar a criar uma estratégia de ${intent.strategyType}. 
                 ${questions[0].question}`,
        options: questions[0].options || null,
        type: 'question'
      }
    }
    
    return {
      message: "Não entendi sua solicitação sobre estratégias. Pode reformular?",
      type: 'clarification'
    }
  }

  async handleRequirementCollection(message, conversation, context) {
    const currentQuestion = conversation.questions[conversation.currentQuestionIndex]
    
    // Salvar resposta
    conversation.answers = conversation.answers || {}
    conversation.answers[currentQuestion.id] = this.parseAnswer(message, currentQuestion)
    
    // Próxima pergunta ou gerar estratégia
    conversation.currentQuestionIndex++
    
    if (conversation.currentQuestionIndex < conversation.questions.length) {
      const nextQuestion = conversation.questions[conversation.currentQuestionIndex]
      return {
        message: nextQuestion.question,
        options: nextQuestion.options || null,
        type: 'question'
      }
    } else {
      // Todas as perguntas respondidas, gerar estratégia
      conversation.state = 'generating_strategy'
      
      const strategy = await StrategyAI.generateStrategy(
        conversation.intent,
        conversation.answers,
        context
      )
      
      conversation.generatedStrategy = strategy
      conversation.state = 'reviewing_strategy'
      
      return {
        message: `Ótimo! Criei sua estratégia "${strategy.name}". 
                 Ela tem ${strategy.workflowNodes.length} nós no workflow geral e 
                 ${strategy.timelineNodes.length} nós na timeline.
                 
                 Quer que eu salve essa estratégia ou prefere fazer algum ajuste?`,
        strategy: strategy,
        type: 'strategy_preview',
        actions: ['salvar', 'ajustar', 'cancelar']
      }
    }
  }
}
\`\`\`

## 7. Próximos Passos de Implementação

### Fase 1: Backend Básico (1-2 semanas)
- [ ] Implementar CRUD completo das estratégias
- [ ] Criar estrutura de templates
- [ ] Implementar validações básicas

### Fase 2: IA Foundation (2-3 semanas)
- [ ] Intent Analyzer básico
- [ ] Question Generator
- [ ] Strategy Generator simples
- [ ] Integração com chat existente

### Fase 3: IA Avançada (3-4 semanas)
- [ ] Machine Learning para melhor detecção
- [ ] Context-aware suggestions
- [ ] Aprendizado com feedback do usuário
- [ ] Templates dinâmicos

### Fase 4: Execução Real (2-3 semanas)
- [ ] Webhook execution engine
- [ ] Integração com N8N/Make
- [ ] Monitoring e logs avançados
- [ ] Error handling e retry logic

## 8. Considerações Técnicas

### Performance:
- Cache de templates e contexto
- Processamento assíncrono de IA
- Rate limiting para APIs de IA

### Segurança:
- Validação de inputs de IA
- Sanitização de webhooks gerados
- Auditoria de estratégias criadas por IA

### Escalabilidade:
- Microserviços para IA
- Queue system para processamento
- Database sharding por cliente

### Monitoramento:
- Métricas de uso da IA
- Accuracy das sugestões
- Performance dos templates
