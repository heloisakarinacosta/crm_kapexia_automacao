const OpenAI = require('openai');

const API_BASE_URL = process.env.API_BASE_URL || 'https://crm.kapexia.com.br';

const OpenAIService = {
  // Listar assistants disponíveis
  async listAssistants(apiKey) {
    try {
      const openai = new OpenAI({
        apiKey: apiKey
      });

      const assistants = await openai.beta.assistants.list({
        order: 'desc',
        limit: 100
      });

      return {
        success: true,
        data: assistants.data.map(assistant => ({
          id: assistant.id,
          name: assistant.name || 'Sem nome',
          description: assistant.description || '',
          model: assistant.model,
          created_at: assistant.created_at
        }))
      };
    } catch (error) {
      console.error('Erro ao listar assistants:', error);
      return {
        success: false,
        message: 'Erro ao conectar com OpenAI: ' + error.message
      };
    }
  },

  // Listar modelos disponíveis
  async listModels(apiKey) {
    try {
      const openai = new OpenAI({
        apiKey: apiKey
      });

      const models = await openai.models.list();
      
      // Filtrar apenas modelos de chat/completion
      const chatModels = models.data
        .filter(model => 
          model.id.includes('gpt') || 
          model.id.includes('text-davinci') ||
          model.id.includes('claude') ||
          model.id.includes('llama')
        )
        .sort((a, b) => a.id.localeCompare(b.id));

      return {
        success: true,
        data: chatModels.map(model => ({
          id: model.id,
          name: model.id,
          owned_by: model.owned_by,
          created: model.created
        }))
      };
    } catch (error) {
      console.error('Erro ao listar modelos:', error);
      return {
        success: false,
        message: 'Erro ao conectar com OpenAI: ' + error.message
      };
    }
  },

  // Enviar mensagem para assistant
  async sendToAssistant(apiKey, assistantId, messages, threadId = null, additionalInstructions = null) {
    try {
      console.log('[DEBUG] sendToAssistant:', { assistantId, message: messages, threadId, threadIdType: typeof threadId, additionalInstructions });
      
      const openai = new OpenAI({
        apiKey: apiKey
      });

      // Criar ou usar thread existente
      let thread;
      if (threadId && typeof threadId === 'string' && threadId !== 'undefined' && threadId.trim() !== '') {
        console.log('[DEBUG] Usando thread existente:', threadId);
        thread = await openai.beta.threads.retrieve(threadId);
      } else {
        console.log('[DEBUG] Criando novo thread');
        thread = await openai.beta.threads.create();
      }

      console.log('[DEBUG] Thread criado/recuperado:', { threadId: thread?.id, hasThread: !!thread });

      if (!thread || !thread.id) {
        throw new Error('Falha ao criar ou recuperar thread');
      }

      // Adicionar todas as mensagens ao thread
      for (const msg of messages) {
        console.log('[DEBUG] Enviando mensagem para o thread:', JSON.stringify(msg, null, 2));
        await openai.beta.threads.messages.create(thread.id, msg);
      }

      // Executar assistant
      let runParams = { assistant_id: assistantId };
      if (additionalInstructions) {
        runParams.additional_instructions = additionalInstructions;
      }
      let run = await openai.beta.threads.runs.create(thread.id, runParams);

      // Aguardar conclusão ou function_call
      let runStatus;
      let attempts = 0;
      const maxAttempts = 60;
      
      do {
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log('[DEBUG] Status do run:', runStatus.status);
        
        if (runStatus.status === 'requires_action' && runStatus.required_action && runStatus.required_action.type === 'submit_tool_outputs') {
          console.log('[DEBUG] Function calling solicitado');
          
          // Function calling solicitado
          const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs = [];
          
          for (const toolCall of toolCalls) {
            console.log('[DEBUG] Processando tool call:', toolCall.function.name);
            
            if (toolCall.function.name === 'getConversasPorPeriodo') {
              // Executar chamada na API interna
              const args = JSON.parse(toolCall.function.arguments);
              const fetch = require('node-fetch');
              let url = `${API_BASE_URL}/api/contatos/conversas?period=${args.period}`;
              if (args.period === 'range' && args.start && args.end) {
                url += `&start=${args.start}&end=${args.end}`;
              }
              const apiRes = await fetch(url);
              const data = await apiRes.json();
              console.log('[DEBUG] Resposta da API getConversasPorPeriodo:', data);
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ ...data.results || data, data_hora_atual: new Date().toISOString() })
              });
            } else if (toolCall.function.name === 'getLeadsCountPorPeriodo') {
              // Executar chamada na API interna de leads
              const args = JSON.parse(toolCall.function.arguments);
              const fetch = require('node-fetch');
              let url = `${API_BASE_URL}/api/leads/count?period=${args.period}`;
              if (args.period === 'range' && args.start && args.end) {
                url += `&start=${args.start}&end=${args.end}`;
              }
              const apiRes = await fetch(url);
              const data = await apiRes.json();
              console.log('[DEBUG] Resposta da API getLeadsCountPorPeriodo:', data);
              let output = (data && data.result && typeof data.result.total === 'number') ? data.result.total : 0;
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ total: output, data_hora_atual: new Date().toISOString() })
              });
            } else if (toolCall.function.name === 'getLeadsPorPeriodo') {
              const args = JSON.parse(toolCall.function.arguments);
              const fetch = require('node-fetch');
              let url = `${API_BASE_URL}/api/leads/list?period=${args.period}`;
              if (args.period === 'range' && args.start && args.end) {
                url += `&start=${args.start}&end=${args.end}`;
              }
              const apiRes = await fetch(url);
              const data = await apiRes.json();
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ leads: data.results || data, data_hora_atual: new Date().toISOString() })
              });
            } else {
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({ error: 'Função não implementada' })
              });
            }
          }
          
          console.log('[DEBUG] Enviando tool_outputs para o Assistant:', JSON.stringify(toolOutputs, null, 2));
          
          // Enviar tool outputs
          run = await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
            tool_outputs: toolOutputs
          });
          
          console.log('[DEBUG] Tool outputs enviados, novo status:', run.status);
          
          // NÃO sair do loop aqui - continuar verificando o status
          
        } else if (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
          console.log('[DEBUG] Aguardando... Status:', runStatus.status);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else if (runStatus.status === 'failed') {
          console.error('[DEBUG] Run falhou:', runStatus.last_error);
          throw new Error(`Run falhou: ${runStatus.last_error?.message || 'Erro desconhecido'}`);
        }
        
      } while (
        (runStatus.status === 'in_progress' || 
        runStatus.status === 'queued' || 
        runStatus.status === 'requires_action') && 
        attempts < maxAttempts
      );

      if (runStatus.status === 'completed') {
        // Obter mensagens do thread
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data[0];
        let responseText = lastMessage.content[0].text.value;
        
        try {
          const jsonResponse = JSON.parse(responseText);
          if (jsonResponse.response) {
            responseText = jsonResponse.response;
          }
        } catch (e) {
          // Se não for JSON, manter o texto original
        }
        
        return {
          success: true,
          data: {
            message: responseText,
            threadId: thread.id
          }
        };
      } else {
        console.error('[DEBUG] Run não completou. Status final:', runStatus.status);
        return {
          success: false,
          message: 'Erro na execução do assistant: ' + runStatus.status
        };
      }
    } catch (error) {
      console.error('Erro ao enviar para assistant:', error);
      return {
        success: false,
        message: 'Erro ao comunicar com assistant: ' + error.message
      };
    }
  },

  // Enviar mensagem para completion
  async sendToCompletion(apiKey, model, message, systemPrompt = null) {
    try {
      const openai = new OpenAI({
        apiKey: apiKey
      });

      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: message
      });

      const completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        success: true,
        data: {
          message: completion.choices[0].message.content
        }
      };
    } catch (error) {
      console.error('Erro ao enviar para completion:', error);
      return {
        success: false,
        message: 'Erro ao comunicar com OpenAI: ' + error.message
      };
    }
  }
};

module.exports = OpenAIService;

