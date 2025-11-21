import { useState, useRef } from 'react';
import { toast } from 'sonner@2.0.3';

/**
 * Hook para gerenciar debouncing e rate limiting de testes de e-mail
 * Previne spam de requisições e respeita limites do servidor SMTP
 */

export interface DebouncerState {
  isProcessing: boolean;
  cooldownUntil: number;
  requestCount: number;
  lastRequestTime: number;
}

const COOLDOWN_PERIOD = 3000; // 3 segundos entre requisições
const MAX_REQUESTS_PER_MINUTE = 10; // Máximo de 10 requisições por minuto
const RESET_PERIOD = 60000; // 1 minuto

export function useEmailDebouncer() {
  const [state, setState] = useState<DebouncerState>({
    isProcessing: false,
    cooldownUntil: 0,
    requestCount: 0,
    lastRequestTime: 0,
  });

  const requestTimestamps = useRef<number[]>([]);

  /**
   * Verifica se pode executar uma nova requisição
   */
  const canExecute = (): { allowed: boolean; reason?: string } => {
    const now = Date.now();

    // Verificar se está em cooldown
    if (now < state.cooldownUntil) {
      const secondsLeft = Math.ceil((state.cooldownUntil - now) / 1000);
      return {
        allowed: false,
        reason: `Aguarde ${secondsLeft}s antes de tentar novamente`,
      };
    }

    // Limpar timestamps antigos (mais de 1 minuto)
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => now - timestamp < RESET_PERIOD
    );

    // Verificar limite de requisições por minuto
    if (requestTimestamps.current.length >= MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        reason: `Limite de ${MAX_REQUESTS_PER_MINUTE} testes por minuto atingido. Aguarde um momento.`,
      };
    }

    return { allowed: true };
  };

  /**
   * Executa uma função com debounce e rate limiting
   */
  const executeWithDebounce = async <T,>(
    fn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<void> => {
    const check = canExecute();

    if (!check.allowed) {
      toast.warning('⏳ Aguarde um momento', {
        description: check.reason,
        duration: 3000,
      });
      return;
    }

    setState((prev) => ({ ...prev, isProcessing: true }));

    try {
      const now = Date.now();
      requestTimestamps.current.push(now);

      const result = await fn();

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        cooldownUntil: now + COOLDOWN_PERIOD,
        requestCount: prev.requestCount + 1,
        lastRequestTime: now,
      }));

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erro desconhecido');

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        cooldownUntil: Date.now() + COOLDOWN_PERIOD,
      }));

      if (onError) {
        onError(errorObj);
      } else {
        // Fallback: mostrar erro genérico
        console.error('❌ [useEmailDebouncer] Erro:', errorObj);
      }
    }
  };

  /**
   * Reseta o estado do debouncer
   */
  const reset = () => {
    setState({
      isProcessing: false,
      cooldownUntil: 0,
      requestCount: 0,
      lastRequestTime: 0,
    });
    requestTimestamps.current = [];
  };

  return {
    state,
    executeWithDebounce,
    canExecute,
    reset,
  };
}
