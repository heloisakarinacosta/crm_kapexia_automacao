/**
 * Serviço Frontend para Drill-Down nos Gráficos
 * Gerencia comunicação com APIs de drill-down
 */


export interface DrillDownResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

interface DrillDownConfig {
  id: number;
  chart_position: number;
  detail_grid_title: string;
  modal_size: string;
  max_results: number;
  is_active: boolean;
}

class DrillDownService {
  private static baseUrl = '/api/chart-drilldown';

  /**
   * Obter token de autenticação do localStorage
   */
  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Headers padrão para requisições
   */
  private static getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Executar drill-down em um gráfico
   * @param chartPosition - Posição do gráfico (1-10)
   * @param clickedData - Dados do elemento clicado
   * @returns Promise com dados detalhados
   */
  static async executeDrillDown(
    chartPosition: number, 
    clickedData: unknown
  ): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chartPosition,
          clickedData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao executar drill-down:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          return {
            success: false,
            message: 'Erro de conexão. Verifique sua internet e tente novamente.'
          };
        }
        
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: false,
        message: 'Erro desconhecido ao executar drill-down'
      };
    }
  }

  /**
   * Verificar se um gráfico tem drill-down configurado
   * @param chartPosition - Posição do gráfico (1-10)
   * @returns Promise com status do drill-down
   */
  static async checkDrillDown(chartPosition: number): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/check/${chartPosition}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar drill-down:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Listar todas as configurações de drill-down
   * @returns Promise com lista de configurações
   */
  static async listConfigs(): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/configs`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obter configuração específica de drill-down
   * @param chartPosition - Posição do gráfico (1-10)
   * @returns Promise com configuração específica
   */
  static async getConfig(chartPosition: number): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/config/${chartPosition}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obter estatísticas de uso do drill-down
   * @returns Promise com estatísticas
   */
  static async getStats(): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Testar configuração de drill-down (apenas desenvolvimento)
   * @param chartPosition - Posição do gráfico
   * @param testData - Dados de teste (opcional)
   * @returns Promise com resultado do teste
   */
  static async testConfig(
    chartPosition: number, 
    testData?: unknown
  ): Promise<DrillDownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chartPosition,
          testData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao testar configuração:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar múltiplos gráficos de uma vez
   * @param chartPositions - Array de posições dos gráficos
   * @returns Promise com status de cada gráfico
   */
  static async checkMultipleDrillDowns(
    chartPositions: number[]
  ): Promise<{ [key: number]: boolean }> {
    const results: { [key: number]: boolean } = {};

    try {
      const promises = chartPositions.map(async (position) => {
        const response = await this.checkDrillDown(position);
        return {
          position,
          enabled: response.success && (response.data as { hasDrillDown?: boolean })?.hasDrillDown
        };
      });

      const responses = await Promise.all(promises);
      
      responses.forEach(({ position, enabled }) => {
        results[position] = enabled || false;
      });

      return results;
    } catch (error) {
      console.error('Erro ao verificar múltiplos drill-downs:', error);
      
      // Retornar false para todas as posições em caso de erro
      chartPositions.forEach(position => {
        results[position] = false;
      });

      return results;
    }
  }

  /**
   * Formatar dados clicados do gráfico para envio à API
   * @param rawData - Dados brutos do evento de clique
   * @param chartType - Tipo do gráfico (bar, line, pie, etc.)
   * @returns Dados formatados para a API
   */
  static formatClickedData(rawData: unknown, chartType: string): unknown {
    const formatted: Record<string, unknown> = {};

    // Dados comuns independente do tipo de gráfico
    const data = rawData as { 
      payload?: Record<string, unknown>;
      activeLabel?: string;
      name?: string;
      value?: unknown;
    };
    if (data.payload) {
      Object.keys(data.payload).forEach(key => {
        formatted[key] = data.payload![key];
      });
    }

    // Formatações específicas por tipo de gráfico
    switch (chartType) {
      case 'bar':
      case 'line':
        // Para gráficos de barras e linhas, capturar dados do eixo X e Y
        if (data.activeLabel) {
          formatted.clicked_label = data.activeLabel;
          formatted.clicked_date = data.activeLabel; // Assumindo que label é data
        }
        if (data.value !== undefined) {
          formatted.clicked_value = data.value;
        }
        break;

      case 'pie':
        // Para gráficos de pizza, capturar dados da fatia
        if (data.name) {
          formatted.clicked_category = data.name;
        }
        if (data.value !== undefined) {
          formatted.clicked_value = data.value;
        }
        break;

      case 'area':
        // Para gráficos de área, similar ao line
        if (data.activeLabel) {
          formatted.clicked_label = data.activeLabel;
          formatted.period_start = data.activeLabel;
          formatted.period_end = data.activeLabel;
        }
        break;

      default:
        // Para outros tipos, usar dados genéricos
        break;
    }

    // Adicionar timestamp do clique
    formatted.clicked_at = new Date().toISOString();

    return formatted;
  }

  /**
   * Debounce para evitar múltiplos cliques rápidos
   */
  private static debounceTimers: { [key: string]: NodeJS.Timeout } = {};

  static debouncedExecuteDrillDown(
    chartPosition: number,
    clickedData: unknown,
    delay: number = 300
  ): Promise<DrillDownResponse> {
    const key = `${chartPosition}_${JSON.stringify(clickedData)}`;

    return new Promise((resolve) => {
      // Limpar timer anterior se existir
      if (this.debounceTimers[key]) {
        clearTimeout(this.debounceTimers[key]);
      }

      // Criar novo timer
      this.debounceTimers[key] = setTimeout(async () => {
        try {
          const result = await this.executeDrillDown(chartPosition, clickedData);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        } finally {
          delete this.debounceTimers[key];
        }
      }, delay);
    });
  }
}

export default DrillDownService;
export type { DrillDownConfig };

