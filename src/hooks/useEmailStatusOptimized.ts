import { useState, useEffect, useCallback, useRef } from 'react';
import { emailService } from '../lib/emailService';

export type EmailStatus = 'unknown' | 'checking' | 'configured' | 'not_configured' | 'invalid';

interface EmailStatusHook {
  status: EmailStatus;
  isConfigured: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  checkStatus: () => Promise<void>;
  error: string | null;
}

// Cache global para evitar múltiplas verificações
let globalEmailStatus: EmailStatus = 'unknown';
let globalLastCheck: Date | null = null;
let globalError: string | null = null;
let isGlobalChecking = false;

export function useEmailStatus(): EmailStatusHook {
  const [status, setStatus] = useState<EmailStatus>(globalEmailStatus);
  const [lastCheck, setLastCheck] = useState<Date | null>(globalLastCheck);
  const [error, setError] = useState<string | null>(globalError);
  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkStatus = useCallback(async () => {
    // Evitar verificações múltiplas
    if (isGlobalChecking || isChecking) {
      console.log('🔍 [useEmailStatus] Verificação já em andamento, pulando...');
      return;
    }

    // Se verificou recentemente (menos de 5 minutos), usar cache
    const now = new Date();
    if (globalLastCheck && (now.getTime() - globalLastCheck.getTime()) < 5 * 60 * 1000) {
      console.log('🔍 [useEmailStatus] Usando status em cache (verificado há menos de 5 min)');
      setStatus(globalEmailStatus);
      setError(globalError);
      setLastCheck(globalLastCheck);
      return;
    }
    
    isGlobalChecking = true;
    setIsChecking(true);
    setError(null);
    
    try {
      console.log('🔍 [useEmailStatus] Verificando configuração de e-mail via emailService...');
      
      // Usar o emailService para verificar status (tenta enviar e-mail de teste)
      const result = await emailService.sendTestEmail('status-check@local.test');

      if (!mountedRef.current) return;

      // Se chegou aqui com sucesso, está configurado
      globalEmailStatus = 'configured';
      setStatus('configured');
      globalError = null;
      setError(null);
      console.log('✅ [useEmailStatus] Sistema de e-mail configurado');
      
      globalLastCheck = new Date();
      setLastCheck(globalLastCheck);
      
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.log('🔍 [useEmailStatus] Erro ao verificar configuração (esperado se Edge Function não existir)');
      
      // Não logar erro se for "Failed to fetch" (Edge Function não existe ainda)
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('conectividade')) {
        globalEmailStatus = 'not_configured';
        setStatus('not_configured');
        globalError = 'Edge Function não configurada';
        setError(globalError);
        console.log('ℹ️ [useEmailStatus] Edge Function não existe ou não está acessível');
      } else {
        globalEmailStatus = 'not_configured';
        setStatus('not_configured');
        globalError = 'Não foi possível verificar a configuração de e-mail';
        setError(globalError);
      }
      
      globalLastCheck = new Date();
      setLastCheck(globalLastCheck);
    } finally {
      isGlobalChecking = false;
      if (mountedRef.current) {
        setIsChecking(false);
      }
    }
  }, [isChecking]);

  // Não fazer verificação automática - apenas quando explicitamente solicitada
  useEffect(() => {
    // Usar status em cache se disponível
    if (globalLastCheck) {
      setStatus(globalEmailStatus);
      setError(globalError);
      setLastCheck(globalLastCheck);
    } else {
      // Status inicial desconhecido, sem verificação automática
      setStatus('unknown');
      setError(null);
      setLastCheck(null);
    }
  }, []); // Remove dependências para evitar loops

  const isConfigured = status === 'configured';

  return {
    status,
    isConfigured,
    isChecking,
    lastCheck,
    checkStatus,
    error
  };
}