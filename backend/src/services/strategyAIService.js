const OpenAI = require("openai")
const db = require("../config/db")

class AutomationAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Templates de estratégias
    this.templates = {
      prospeccao: {
        name: "Prospecção B2B",
        questions: [
          {
            id: "data_source",
            question: "Qual será a fonte dos seus leads?",
            type: "multiple_choice",
            options: [
              { value: "planilha", label: "Importar de planilha Excel/CSV" },
              { value: "banco", label: "Consultar banco de dados existente" },
              { value: "api", label: "Integração com API externa" },
              { value: "manual", label: "Inserção manual" },
            ],
            required: true,
          },
          {
            id: "first_contact",
            question: "Como prefere fazer o primeiro contato?",
            type: "multiple_choice",
            options: [
              { value: "email", label: "E-mail" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "telefone", label: "Telefone" },
            ],
            required: true,
          },
          {
            id: "timeline_duration",
            question: "Quantos dias de follow-up você quer?",
            type: "number",
            min: 1,
            max: 90,
            default: 15,
            required: true,
          },
          {
            id: "tone",
            question: "Qual o tom da comunicação?",
            type: "multiple_choice",
            options: [
              { value: "formal", label: "Formal e profissional" },
              { value: "casual", label: "Casual e amigável" },
              { value: "consultivo", label: "Consultivo e educativo" },
            ],
            required: true,
          },
        ],
      },
      customer_success: {
        name: "Customer Success",
        questions: [
          {
            id: "trigger",
            question: "Quando deve iniciar o acompanhamento?",
            type: "multiple_choice",
            options: [
              { value: "signup", label: "Imediatamente após cadastro" },
              { value: "first_purchase", label: "Após primeira compra" },
              { value: "onboarding_complete", label: "Após completar onboarding" },
            ],
            required: true,
          },
          {
            id: "duration",
            question: "Por quantos dias acompanhar?",
            type: "number",
            min: 7,
            max: 365,
            default: 60,
            required: true,
          },
          {
            id: "objectives",
            question: "Qual o foco principal?",
            type: "multiple_choice",
            options: [
              { value: "onboarding", label: "Onboarding e primeiros passos" },
              { value: "engagement", label: "Engajamento e uso do produto" },
              { value: "retention", label: "Retenção e renovação" },
              { value: "upsell", label: "Upsell e expansão" },
            ],
            required: true,
          },
        ],
      },
      cobranca: {
        name: "Cobrança Inteligente",
        questions: [
          {
            id: "trigger_days",
            question: "A partir de quantos dias de atraso iniciar?",
            type: "number",
            min: 1,
            max: 30,
            default: 3,
            required: true,
          },
          {
            id: "escalation_levels",
            question: "Quantos níveis de escalação?",
            type: "number",
            min: 2,
            max: 5,
            default: 3,
            required: true,
          },
          {
            id: "value_threshold",
            question: "Valor mínimo para tratamento especial (R$)?",
            type: "number",
            min: 0,
            default: 500,
            required: false,
          },
        ],
      },
    }
  }

  // Analisar intenção do usuário
  async analyzeIntent(message, clientContext) {
    try {
      const prompt = `
        Analise a seguinte mensagem do usuário e determine:
        1. A intenção principal (create_strategy, modify_strategy, analyze_strategy, execute_strategy)
        2. O tipo de estratégia (prospeccao, customer_success, cobranca, reativacao)
        3. Entidades mencionadas (canais, timing, objetivos)
        4. Nível de confiança (0-1)

        Contexto do cliente: ${JSON.stringify(clientContext)}
        Mensagem: "${message}"

        Responda em JSON:
        {
          "intent": "create_strategy",
          "strategy_type": "prospeccao",
          "entities": {
            "channels": ["email", "whatsapp"],
            "timing": "hoje",
            "duration": "15 dias"
          },
          "confidence": 0.95,
          "reasoning": "Usuário quer criar nova estratégia de prospecção"
        }
      `

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      })

      return JSON.parse(response.choices[0].message.content)
    } catch (error) {
      console.error("Erro ao analisar intenção:", error)
      return {
        intent: "unknown",
        strategy_type: null,
        entities: {},
        confidence: 0,
        reasoning: "Erro na análise",
      }
    }
  }

  // Gerar perguntas baseadas na intenção
  async generateQuestions(intent, clientContext) {
    const template = this.templates[intent.strategy_type]
    if (!template) {
      throw new Error(`Template não encontrado para: ${intent.strategy_type}`)
    }

    // Personalizar perguntas baseado no contexto
    const personalizedQuestions = template.questions.map((question) => {
      return {
        ...question,
        question: this.personalizeQuestion(question.question, clientContext),
      }
    })

    return personalizedQuestions
  }

  // Gerar estratégia completa
  async generateStrategy(intent, answers, clientContext) {
    try {
      const strategyType = intent.strategy_type
      const template = this.templates[strategyType]

      // Gerar nome da estratégia
      const strategyName = this.generateStrategyName(strategyType, answers)

      // Calcular timeline days
      const timelineDays = this.calculateTimelineDays(answers, strategyType)

      // Gerar workflow nodes
      const workflowNodes = await this.generateWorkflowNodes(strategyType, answers, clientContext)

      // Gerar timeline nodes
      const timelineNodes = await this.generateTimelineNodes(strategyType, answers, timelineDays)

      return {
        name: strategyName,
        description: this.generateDescription(strategyType, answers),
        dataInicial: new Date().toISOString().split("T")[0],
        diasUteis: answers.business_days || false,
        timelineDays: timelineDays,
        workflowNodes: workflowNodes,
        timelineNodes: timelineNodes,
        isActive: true,
        aiGenerated: true,
        template: strategyType,
        generatedAt: new Date(),
        answers: answers,
      }
    } catch (error) {
      console.error("Erro ao gerar estratégia:", error)
      throw error
    }
  }

  // Gerar nós do workflow
  async generateWorkflowNodes(strategyType, answers, clientContext) {
    const nodes = []

    // Nó de entrada baseado na fonte de dados
    if (answers.data_source) {
      const dataSourceNode = this.createDataSourceNode(answers.data_source)
      if (dataSourceNode) {
        nodes.push(dataSourceNode)
      }
    }

    // Nós específicos por tipo de estratégia
    switch (strategyType) {
      case "prospeccao":
        // Adicionar nó de pesquisa se necessário
        if (answers.first_contact === "linkedin") {
          nodes.push(this.createLinkedInResearchNode())
        }
        break

      case "customer_success":
        // Adicionar nó de identificação de cliente
        nodes.push(this.createCustomerIdentificationNode(answers.trigger))
        break

      case "cobranca":
        // Adicionar nó de identificação de atraso
        nodes.push(this.createOverdueIdentificationNode(answers.trigger_days))
        break
    }

    return nodes
  }

  // Gerar nós da timeline
  async generateTimelineNodes(strategyType, answers, timelineDays) {
    const nodes = []

    switch (strategyType) {
      case "prospeccao":
        nodes.push(...this.generateProspectionNodes(answers, timelineDays))
        break

      case "customer_success":
        nodes.push(...this.generateCustomerSuccessNodes(answers, timelineDays))
        break

      case "cobranca":
        nodes.push(...this.generateCollectionNodes(answers, timelineDays))
        break
    }

    return nodes
  }

  // Gerar nós de prospecção
  generateProspectionNodes(answers, timelineDays) {
    const nodes = []
    const channels = this.getChannelSequence(answers)

    timelineDays.forEach((day, index) => {
      const channel = channels[index % channels.length]
      const nodeId = `timeline-${Date.now()}-${index}`

      switch (channel) {
        case "email":
          nodes.push({
            id: nodeId,
            type: "send-email",
            title: this.getEmailTitle(day, index),
            day: day,
            position: { x: 50, y: 50 + index * 80 },
            config: {
              subject: this.generateEmailSubject(day, index, answers.tone),
              body: this.generateEmailBody(day, index, answers.tone),
              webhook: `https://webhook.site/email-${day}`,
            },
          })
          break

        case "whatsapp":
          nodes.push({
            id: nodeId,
            type: "send-whatsapp",
            title: this.getWhatsAppTitle(day, index),
            day: day,
            position: { x: 50, y: 50 + index * 80 },
            config: {
              message: this.generateWhatsAppMessage(day, index, answers.tone),
              webhook: `https://webhook.site/whatsapp-${day}`,
            },
          })
          break

        case "linkedin":
          nodes.push({
            id: nodeId,
            type: "http-request",
            title: "Conexão LinkedIn",
            day: day,
            position: { x: 50, y: 50 + index * 80 },
            config: {
              method: "POST",
              url: "https://webhook.site/linkedin-connect",
              headers: '{"Content-Type": "application/json"}',
              body: this.generateLinkedInMessage(answers.tone),
            },
          })
          break
      }
    })

    return nodes
  }

  // Utilitários
  generateStrategyName(strategyType, answers) {
    const typeNames = {
      prospeccao: "Prospecção",
      customer_success: "Customer Success",
      cobranca: "Cobrança",
      reativacao: "Reativação",
    }

    const baseName = typeNames[strategyType] || "Estratégia"
    const channel = answers.first_contact || answers.channels?.[0] || ""
    const channelSuffix = channel ? ` - ${channel.charAt(0).toUpperCase() + channel.slice(1)}` : ""

    return `${baseName}${channelSuffix} ${new Date().toLocaleDateString("pt-BR")}`
  }

  calculateTimelineDays(answers, strategyType) {
    const duration = answers.timeline_duration || answers.duration || 15
    const days = []

    switch (strategyType) {
      case "prospeccao":
        // Distribuição típica de prospecção
        days.push(0, 3, 7)
        if (duration > 10) days.push(14)
        if (duration > 20) days.push(21)
        if (duration > 30) days.push(30)
        break

      case "customer_success":
        // Distribuição de customer success
        days.push(0, 1, 7, 14, 30)
        if (duration > 60) days.push(60)
        if (duration > 90) days.push(90)
        break

      case "cobranca":
        // Distribuição de cobrança
        const triggerDays = answers.trigger_days || 3
        days.push(0, 3, 7, 14)
        if (duration > 21) days.push(21)
        break

      default:
        // Distribuição padrão
        for (let i = 0; i < duration; i += Math.ceil(duration / 5)) {
          days.push(i)
        }
    }

    return days.slice(0, 8) // Máximo 8 dias na timeline
  }

  createDataSourceNode(dataSource) {
    const nodeConfigs = {
      planilha: {
        type: "data-import",
        title: "Importar Planilha",
        config: {
          webhook: "https://webhook.site/import-spreadsheet",
          format: "csv",
          mapping: {
            nome: "A",
            email: "B",
            telefone: "C",
            empresa: "D",
          },
        },
      },
      banco: {
        type: "database-query",
        title: "Consultar Banco",
        config: {
          query: 'SELECT nome, email, telefone, empresa FROM leads WHERE status = "ativo"',
          webhook: "https://webhook.site/database-query",
        },
      },
      api: {
        type: "http-request",
        title: "Importar via API",
        config: {
          method: "GET",
          url: "https://api.externa.com/leads",
          headers: '{"Authorization": "Bearer TOKEN"}',
        },
      },
    }

    const config = nodeConfigs[dataSource]
    if (!config) return null

    return {
      id: `workflow-${Date.now()}`,
      type: config.type,
      title: config.title,
      day: -999,
      position: { x: 100, y: 100 },
      config: config.config,
    }
  }

  generateEmailSubject(day, index, tone) {
    const subjects = {
      formal: [
        "Apresentação - Solução CRM para [EMPRESA]",
        "Follow-up - Proposta CRM [EMPRESA]",
        "Última oportunidade - CRM [EMPRESA]",
      ],
      casual: [
        "[NOME], 3 minutos para economizar 5 horas/semana?",
        "Oi [NOME], conseguiu dar uma olhada?",
        "[NOME], última chance de otimizar seu processo",
      ],
      consultivo: [
        "Como [EMPRESA] pode aumentar vendas em 30%",
        "[NOME], análise gratuita do seu processo",
        "Estudo de caso: empresa similar à [EMPRESA]",
      ],
    }

    const toneSubjects = subjects[tone] || subjects.formal
    return toneSubjects[index % toneSubjects.length]
  }

  generateEmailBody(day, index, tone) {
    const bodies = {
      formal: `Prezado(a) [NOME],

Espero que esteja bem. Sou da [SUA_EMPRESA] e gostaria de apresentar nossa solução CRM que pode ajudar a [EMPRESA] a otimizar seus processos de vendas.

Nossos clientes conseguem:
- Aumentar conversão em até 40%
- Reduzir tempo de follow-up em 60%
- Automatizar tarefas repetitivas

Gostaria de agendar 15 minutos para mostrar como isso funcionaria na [EMPRESA]?

Atenciosamente,
[SEU_NOME]`,

      casual: `Oi [NOME]!

Vi que você trabalha na [EMPRESA] e imagino que deve lidar com muito follow-up manual, né?

Criamos uma solução que automatiza isso e nossos clientes estão economizando 5+ horas por semana!

Que tal 15 minutinhos para eu mostrar como funciona?

Abraço,
[SEU_NOME]`,

      consultivo: `Olá [NOME],

Analisando o mercado de [SETOR], percebemos que empresas como a [EMPRESA] enfrentam desafios similares na gestão de leads.

Preparei um material específico sobre como empresas do seu segmento estão:
- Aumentando conversão em 35%
- Reduzindo ciclo de vendas
- Melhorando ROI de marketing

Posso compartilhar esses insights com você?

[SEU_NOME]`,
    }

    return bodies[tone] || bodies.formal
  }

  generateWhatsAppMessage(day, index, tone) {
    const messages = {
      formal: [
        "Olá [NOME]! Enviei um e-mail sobre nossa solução CRM. Conseguiu dar uma olhada? Gostaria de agendar uma demo rápida.",
        "Oi [NOME]! Como está o processo de análise da nossa proposta? Posso esclarecer alguma dúvida?",
        "Olá [NOME]! Esta é minha última tentativa de contato. A oferta especial vence hoje.",
      ],
      casual: [
        "Oi [NOME]! 😊 Viu meu e-mail? Tenho 15 min livres hoje para te mostrar algo legal!",
        "E aí [NOME]! Como tá? Conseguiu pensar na nossa conversa? 🤔",
        "Oi [NOME]! Última chance de pegar aquela condição especial! 🚀",
      ],
      consultivo: [
        "Olá [NOME]! Preparei uma análise específica para [EMPRESA]. Quando podemos conversar?",
        "Oi [NOME]! Tenho alguns insights que podem interessar. 10 minutos hoje?",
        "Olá [NOME]! Fechando minha agenda. Ainda tem interesse na análise gratuita?",
      ],
    }

    const toneMessages = messages[tone] || messages.formal
    return toneMessages[index % toneMessages.length]
  }

  getChannelSequence(answers) {
    const firstContact = answers.first_contact
    const sequences = {
      email: ["email", "whatsapp", "email"],
      whatsapp: ["whatsapp", "email", "whatsapp"],
      linkedin: ["linkedin", "email", "whatsapp"],
      telefone: ["telefone", "email", "whatsapp"],
    }

    return sequences[firstContact] || ["email", "whatsapp", "email"]
  }

  personalizeQuestion(question, clientContext) {
    // Personalizar perguntas baseado no contexto do cliente
    return question
      .replace("[EMPRESA]", clientContext.company_name || "sua empresa")
      .replace("[SETOR]", clientContext.industry || "seu setor")
  }
}

module.exports = new AutomationAIService()
