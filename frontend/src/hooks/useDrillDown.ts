/**
 * Hook React para Drill-Down nos Gráficos
 * Gerencia estado e lógica do drill-down
 */

import { useState, useEffect, useCallback } from 'react';
import DrillDownService from '../services/drillDownService';

interface UseDrillDownOptions {
  chartPosition: number;
  autoCheck?: boolean; // Verificar automaticamente se tem drill-down
  debounceDelay?: number; // Delay para debounce dos cliques
}

interface DrillDownState {
  // Estado do modal
  isModalOpen: boolean;
  modalData: unknown;
  loading: boolean;
  error: string | null;
  
  // Estado da configuração
  isEnabled: boolean;
  configLoaded: boolean;
  config: unknown;
  
  // Estatísticas
  stats: unknown;
}

interface UseDrillDownReturn extends DrillDownState {
  // Ações
  executeDrillDown: (clickedData: unknown) => Promise<void>;
  closeModal: () => void;
  checkDrillDown: () => Promise<void>;
  loadConfig: () => Promise<void>;
  loadStats: () => Promise<void>;
  testConfig: (testData?: unknown) => Promise<void>;
  
  // Utilitários
  formatClickedData: (rawData: unknown, chartType: string) => unknown;
  clearError: () => void;
}

export const useDrillDown = (options: UseDrillDownOptions): UseDrillDownReturn => {
  const { chartPosition, autoCheck = true, debounceDelay = 300 } = options;

  const [state, setState] = useState<DrillDownState>({
    isModalOpen: false,
    modalData: null,
    loading: false,
    error: null,
    isEnabled: false,
    configLoaded: false,
    config: null,
    stats: null
  });

  /**
   * Atualizar estado de forma segura
   */
  const updateState = useCallback((updates: Partial<DrillDownState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Verificar se o gráfico tem drill-down configurado
   */
  const checkDrillDown = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const response = await DrillDownService.checkDrillDown(chartPosition);
      
      if (response.success) {
        updateState({
          isEnabled: (response.data as { hasDrillDown?: boolean })?.hasDrillDown || false,
          configLoaded: true,
          loading: false
        });
      } else {
        updateState({
          isEnabled: false,
          configLoaded: true,
          loading: false,
          error: response.message || 'Erro ao verificar drill-down'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar drill-down:', error);
      updateState({
        isEnabled: false,
        configLoaded: true,
        loading: false,
        error: 'Erro ao verificar configuração de drill-down'
      });
    }
  }, [chartPosition, updateState]);

  /**
   * Carregar configuração específica do drill-down
   */
  const loadConfig = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const response = await DrillDownService.getConfig(chartPosition);
      
      if (response.success) {
        updateState({
          config: response.data,
          loading: false
        });
      } else {
        updateState({
          config: null,
          loading: false,
          error: response.message || 'Erro ao carregar configuração'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      updateState({
        config: null,
        loading: false,
        error: 'Erro ao carregar configuração de drill-down'
      });
    }
  }, [chartPosition, updateState]);

  /**
   * Carregar estatísticas de uso
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await DrillDownService.getStats();
      
      if (response.success) {
        updateState({ stats: response.data });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [updateState]);

  /**
   * Executar drill-down
   */
  const executeDrillDown = useCallback(async (clickedData: unknown) => {
    if (!state.isEnabled) {
      console.warn('Drill-down não está habilitado para este gráfico');
      return;
    }

    try {
      updateState({ 
        loading: true, 
        error: null,
        isModalOpen: true 
      });

      const response = await DrillDownService.debouncedExecuteDrillDown(
        chartPosition, 
        clickedData, 
        debounceDelay
      );

      if (response.success) {
        updateState({
          modalData: response.data,
          loading: false
        });
      } else {
        updateState({
          loading: false,
          error: response.message || 'Erro ao executar drill-down',
          isModalOpen: false
        });
      }
    } catch (error) {
      console.error('Erro ao executar drill-down:', error);
      updateState({
        loading: false,
        error: 'Erro ao executar drill-down',
        isModalOpen: false
      });
    }
  }, [chartPosition, state.isEnabled, debounceDelay, updateState]);

  /**
   * Fechar modal
   */
  const closeModal = useCallback(() => {
    updateState({
      isModalOpen: false,
      modalData: null,
      loading: false,
      error: null
    });
  }, [updateState]);

  /**
   * Testar configuração (desenvolvimento)
   */
  const testConfig = useCallback(async (testData?: unknown) => {
    try {
      updateState({ loading: true, error: null });
      
      const response = await DrillDownService.testConfig(chartPosition, testData);
      
      if (response.success) {
        updateState({
          modalData: response.data,
          loading: false,
          isModalOpen: true
        });
      } else {
        updateState({
          loading: false,
          error: response.message || 'Erro no teste'
        });
      }
    } catch (error) {
      console.error('Erro ao testar configuração:', error);
      updateState({
        loading: false,
        error: 'Erro ao testar configuração'
      });
    }
  }, [chartPosition, updateState]);

  /**
   * Formatar dados clicados
   */
  const formatClickedData = useCallback((rawData: unknown, chartType: string) => {
    return DrillDownService.formatClickedData(rawData, chartType);
  }, []);

  /**
   * Limpar erro
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Verificar drill-down automaticamente quando o componente monta
   */
  useEffect(() => {
    if (autoCheck && chartPosition && !state.configLoaded) {
      checkDrillDown();
    }
  }, [autoCheck, chartPosition, state.configLoaded, checkDrillDown]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      // Limpar qualquer estado pendente
      updateState({
        isModalOpen: false,
        modalData: null,
        loading: false,
        error: null
      });
    };
  }, [updateState]);

  return {
    // Estado
    ...state,
    
    // Ações
    executeDrillDown,
    closeModal,
    checkDrillDown,
    loadConfig,
    loadStats,
    testConfig,
    
    // Utilitários
    formatClickedData,
    clearError
  };
};

/**
 * Hook para verificar múltiplos gráficos
 */
export const useMultipleDrillDown = (chartPositions: number[]) => {
  const [drillDownStatus, setDrillDownStatus] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const checkMultiple = useCallback(async () => {
    if (chartPositions.length === 0) return;

    try {
      setLoading(true);
      const results = await DrillDownService.checkMultipleDrillDowns(chartPositions);
      setDrillDownStatus(results);
    } catch (error) {
      console.error('Erro ao verificar múltiplos drill-downs:', error);
    } finally {
      setLoading(false);
    }
  }, [chartPositions]);

  useEffect(() => {
    checkMultiple();
  }, [checkMultiple]);

  return {
    drillDownStatus,
    loading,
    refresh: checkMultiple
  };
};

export default useDrillDown;

