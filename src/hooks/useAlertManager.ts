import { useState, useEffect, useCallback, useMemo } from 'react';
import { Criterio, Alerta, User } from '../types';
import { 
  proximoDiaUtil, 
  formatarDataBrasil 
} from '../utils/businessDays';
import { emailService } from '../lib/emailService';
import { SENDER_EMAIL } from '../lib/emailConfig';
import { useEmailStatus } from './useEmailStatusOptimized';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: 'vencimento' | 'vencimento_proximo';
  condition: {
    days?: number;
  };
  priority: 'alta' | 'média' | 'baixa';
  template: string;
  secretarias: string[];
  notifications: {
    dashboard: boolean;
    email: boolean;
    push: boolean;
  };
  businessDaysOnly: boolean;
}

interface AlertManagerConfig {
  enabled: boolean;
  checkInterval: number; // em minutos
  maxAlertsPerDay: number;
  debugMode: boolean;
  businessDaysOnly: boolean;
  emailRequired: boolean;
}

const defaultRules: AlertRule[] = [
  {
    id: 'rule-tarefa-vencida',
    name: 'Tarefas Vencidas',
    enabled: true,
    trigger: 'vencimento',
    condition: { days: 0 },
    priority: 'alta',
    template: 'Tarefa "{descricao}" está vencida desde {dataVencimento}',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: 'rule-tarefa-vencimento-proximo',
    name: 'Vencimento Próximo (7 dias)',
    enabled: true,
    trigger: 'vencimento_proximo',
    condition: { days: 7 },
    priority: 'média',
    template: 'Tarefa "{descricao}" vence em {diasRestantes} dias',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  },
  {
    id: 'rule-tarefa-vencimento-iminente',
    name: 'Vencimento Iminente (3 dias)',
    enabled: true,
    trigger: 'vencimento_proximo',
    condition: { days: 3 },
    priority: 'alta',
    template: 'URGENTE: Tarefa "{descricao}" vence em {diasRestantes} dias',
    secretarias: [],
    notifications: { dashboard: true, email: true, push: false },
    businessDaysOnly: true
  }
];

const defaultConfig: AlertManagerConfig = {
  enabled: true,
  checkInterval: 30,
  maxAlertsPerDay: 50,
  debugMode: false,
  businessDaysOnly: true,
  emailRequired: true
};

export const useAlertManager = (
  tarefas: Tarefa[], 
  criterios: Criterio[],
  onNewAlert?: (alerta: Alerta) => void,
  usuarios?: User[]
) => {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [config, setConfig] = useState<AlertManagerConfig>(defaultConfig);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [alertHistory, setAlertHistory] = useState<Alerta[]>([]);
  const [alertsToday, setAlertsToday] = useState(0);
  const [loadedFromBackend, setLoadedFromBackend] = useState(false);
  const [processedTaskIds, setProcessedTaskIds] = useState<Set<string>>(new Set());
  
  const { isConfigured: emailConfigured } = useEmailStatus();

  // Carregar alertas do backend
  useEffect(() => {
    const loadAlertsFromBackend = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setAlertHistory(result.data);
            
            const today = new Date().toDateString();
            const todayCount = result.data.filter((alert: Alerta) => 
              new Date(alert.dataEnvio).toDateString() === today
            ).length;
            setAlertsToday(todayCount);
            
            if (config.debugMode) {
              console.log(`[AlertManager] ✅ ${result.data.length} alertas carregados do backend`);
            }
          }
        }
      } catch (error) {
        console.error('[AlertManager] Erro ao carregar alertas do backend:', error);
      } finally {
        setLoadedFromBackend(true);
      }
    };

    // ✅ Carregar imediatamente
    loadAlertsFromBackend();
    
    // ✅ Recarregar a cada 1 minuto para manter UI atualizada (SEM criar novos alertas)
    const reloadInterval = setInterval(() => {
      loadAlertsFromBackend();
    }, 60 * 1000); // 1 minuto

    return () => clearInterval(reloadInterval);
  }, [config.debugMode]);

  // Calcular dias até vencimento
  const calculateDaysUntilDue = (dataVencimento: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dataVencimento);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Gerar ID único para alerta
  const generateAlertId = (): string => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Processar template de mensagem
  const processTemplate = (template: string, tarefa: Tarefa, context: any = {}): string => {
    if (!tarefa) {
      console.error('[AlertManager] Tarefa inválida');
      return template;
    }
    
    let message = template;
    message = message.replace(/{descricao}/g, tarefa.descricao || 'N/A');
    message = message.replace(/{dataVencimento}/g, new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR'));
    message = message.replace(/{secretaria}/g, tarefa.secretaria || 'N/A');
    
    if (context.diasRestantes !== undefined && !isNaN(context.diasRestantes)) {
      message = message.replace(/{diasRestantes}/g, String(Math.abs(context.diasRestantes)));
    }
    
    return message;
  };

  // Verificar se deve enviar alerta (dias úteis)
  const shouldSendAlert = (rule: AlertRule): { send: boolean; scheduledDate?: Date } => {
    const now = new Date();
    
    if (config.businessDaysOnly || rule.businessDaysOnly) {
      if (!isDiaUtil(now)) {
        const nextBusinessDay = proximoDiaUtil(now);
        return {
          send: false,
          scheduledDate: nextBusinessDay
        };
      }
    }
    
    return { send: true };
  };

  // Salvar alerta no backend
  const saveAlertToBackend = async (alerta: Alerta): Promise<boolean> => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(alerta)
      });

      if (!response.ok) {
        console.error('[AlertManager] Erro ao salvar alerta no backend:', await response.text());
        return false;
      }

      if (config.debugMode) {
        console.log('[AlertManager] ✅ Alerta salvo no backend');
      }
      return true;
    } catch (error) {
      console.error('[AlertManager] Erro ao salvar alerta no backend:', error);
      return false;
    }
  };

  // Verificar se deve gerar alerta para uma tarefa
  const checkTarefaAlert = (tarefa: Tarefa, rule: AlertRule): Alerta | null => {
    if (!tarefa.dataVencimento) {
      return null;
    }

    // Ignorar tarefas concluídas
    if (tarefa.status === 'concluida') {
      return null;
    }

    // ✅ VALIDAÇÃO CRÍTICA: Verificar se o critério relacionado existe
    if (tarefa.criterioId) {
      const criterioExiste = criterios.find(c => c.id === tarefa.criterioId);
      if (!criterioExiste) {
        if (config.debugMode) {
          console.warn(`[AlertManager] ⚠️ Ignorando tarefa "${tarefa.descricao}" - Critério ${tarefa.criterioId} não existe mais`);
        }
        return null;
      }
    }
    
    const daysUntilDue = calculateDaysUntilDue(tarefa.dataVencimento);
    const conditionDays = rule.condition.days || 0;
    
    let shouldAlert = false;
    
    if (conditionDays === 0) {
      // Tarefa vencida
      shouldAlert = daysUntilDue <= 0;
    } else {
      // Vencimento próximo (exato)
      shouldAlert = daysUntilDue === conditionDays;
    }
    
    if (!shouldAlert) return null;
    
    // Verificar dias úteis
    const sendCheck = shouldSendAlert(rule);
    if (!sendCheck.send) {
      if (config.debugMode) {
        console.log(`[AlertManager] Alerta "${rule.name}" agendado para ${formatarDataBrasil(sendCheck.scheduledDate!)}`);
      }
      return null;
    }
    
    // ✅ PROTEÇÃO ANTI-DUPLICAÇÃO ROBUSTA
    // Criar uma chave única para esta tarefa + tipo de alerta + dia
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const alertKey = `${tarefa.id}-${rule.id}-${today}`;
    
    // Verificar se já processamos essa combinação tarefa+regra hoje
    if (processedTaskIds.has(alertKey)) {
      if (config.debugMode) {
        console.log(`[AlertManager] ⏭️ Alerta já processado hoje para tarefa "${tarefa.descricao}" (regra: ${rule.name})`);
      }
      return null;
    }
    
    // Verificar se já existe alerta similar recente (últimas 24h)
    const existingAlert = alertHistory.find(alert => 
      alert.tarefaId === tarefa.id &&
      alert.tipo === 'vencimento' &&
      new Date(alert.dataEnvio).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );
    
    if (existingAlert) {
      if (config.debugMode) {
        console.log(`[AlertManager] ⏭️ Alerta existente encontrado para tarefa "${tarefa.descricao}"`);
      }
      return null;
    }
    
    const message = processTemplate(rule.template, tarefa, { diasRestantes: daysUntilDue });
    
    return {
      id: generateAlertId(),
      tarefaId: tarefa.id,
      tipo: 'vencimento',
      mensagem: message,
      prioridade: rule.priority,
      dataEnvio: new Date().toISOString(),
      lido: false
    };
  };

  // Processar alertas
  const processAlerts = useCallback(() => {
    if (!config.enabled) {
      if (config.debugMode) {
        console.log('[AlertManager] Sistema de alertas desabilitado');
      }
      return;
    }

    if (alertsToday >= config.maxAlertsPerDay) {
      if (config.debugMode) {
        console.log('[AlertManager] Limite diário de alertas atingido');
      }
      return;
    }

    const newAlerts: Alerta[] = [];
    const activeRules = rules.filter(rule => rule.enabled);
    
    if (config.debugMode) {
      console.log(`[AlertManager] Processando ${activeRules.length} regras para ${tarefas.length} tarefas`);
    }

    const tarefasValidas = tarefas.filter(t => t && t.id && t.descricao && t.status !== 'concluida');
    
    tarefasValidas.forEach(tarefa => {
      activeRules.forEach(rule => {
        try {
          // Verificar secretaria
          if (rule.secretarias.length > 0 && !rule.secretarias.includes(tarefa.secretaria)) {
            return;
          }

          const alert = checkTarefaAlert(tarefa, rule);

          if (alert) {
            newAlerts.push(alert);
            if (config.debugMode) {
              console.log(`[AlertManager] Novo alerta gerado: ${alert.mensagem}`);
            }

            // Enviar e-mail se habilitado
            if (rule.notifications.email && emailConfigured) {
              const criterio = criterios.find(c => c.id === tarefa.criterioId);
              if (criterio) {
                // 🎯 BUSCAR EMAIL DO RESPONSÁVEL PELA TAREFA
                const responsavel = usuarios?.find(u => u.id === tarefa.responsavel);
                const emailDestino = responsavel?.email || SENDER_EMAIL;
                const nomeResponsavel = responsavel?.name || tarefa.responsavelNome || 'Responsável';
                
                if (config.debugMode) {
                  console.log(`[AlertManager] 📧 Enviando para: ${emailDestino} (${nomeResponsavel})`);
                }
                
                const emailData = {
                  to: emailDestino,
                  subject: emailService.generateEmailSubject(
                    alert.prioridade === 'alta' ? 'urgent' : 'warning',
                    tarefa.descricao
                  ),
                  alertType: alert.prioridade === 'alta' ? 'urgent' as const : 'warning' as const,
                  criterio: {
                    id: criterio.id,
                    nome: criterio.nome,
                    secretaria: criterio.secretaria
                  },
                  usuario: {
                    id: responsavel?.id || 'system',
                    name: nomeResponsavel
                  },
                  dueDate: tarefa.dataVencimento
                };

                emailService.sendAlert(emailData)
                  .then(result => {
                    if (config.debugMode) {
                      console.log(`[AlertManager] ✅ E-mail enviado: ${result.emailId}`);
                    }
                  })
                  .catch(error => {
                    console.error('[AlertManager] ❌ Erro ao enviar e-mail:', error);
                  });
              }
            }
          }
        } catch (error) {
          console.error(`[AlertManager] Erro ao processar alerta para tarefa "${tarefa.descricao}":`, error);
        }
      });
    });

    // Salvar novos alertas
    if (newAlerts.length > 0) {
      newAlerts.forEach(async (alert) => {
        const saved = await saveAlertToBackend(alert);
        
        if (saved) {
          setAlertHistory(prev => [...prev, alert]);
          
          // ✅ Marcar como processado para evitar duplicação
          const today = new Date().toISOString().split('T')[0];
          const alertKey = `${alert.tarefaId}-${rules.find(r => r.priority === alert.prioridade)?.id || 'unknown'}-${today}`;
          setProcessedTaskIds(prev => new Set(prev).add(alertKey));
          
          if (onNewAlert) {
            onNewAlert(alert);
          }
          
          if (alert.prioridade === 'alta') {
            toast.error(alert.mensagem, {
              duration: 10000,
              action: {
                label: 'Ver Detalhes',
                onClick: () => console.log('Navegar para tarefa:', alert.tarefaId)
              }
            });
          }
        }
      });

      setAlertsToday(prev => prev + newAlerts.length);
      
      if (config.debugMode) {
        console.log(`[AlertManager] ${newAlerts.length} novos alertas processados`);
      }
    }

    setLastCheck(new Date());
  }, [tarefas, criterios, rules, config, alertHistory, alertsToday, onNewAlert, emailConfigured]);

  // Verificação periódica
  useEffect(() => {
    // ✅ DESATIVAR COMPLETAMENTE O PROCESSAMENTO NO FRONTEND
    // O frontend agora apenas EXIBE alertas que já foram criados pelo backend
    // Os alertas devem ser processados APENAS pelo backend via cron job ou rota específica
    
    if (config.debugMode) {
      console.log('[AlertManager] ℹ️ Processamento de alertas desativado no frontend');
      console.log('[AlertManager] ℹ️ Alertas são processados apenas pelo backend');
    }
    
    // NÃO EXECUTAR processAlerts() aqui
    return;
  }, [config.debugMode]);

  // Reset contador diário
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setAlertsToday(0);
      setProcessedTaskIds(new Set()); // ✅ Limpar tarefas processadas à meia-noite
      if (config.debugMode) {
        console.log('[AlertManager] Contador diário de alertas e tarefas processadas resetados');
      }
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [config.debugMode]);

  // Função manual para forçar verificação
  const manualCheck = useCallback(() => {
    if (config.debugMode) {
      console.log('[AlertManager] Verificação manual iniciada');
    }
    processAlerts();
  }, [processAlerts, config.debugMode]);

  // Função para testar envio de e-mail
  const testEmailAlert = useCallback(async (testEmail: string) => {
    if (!testEmail || !emailService.isValidEmail(testEmail)) {
      throw new Error('E-mail inválido para teste');
    }

    console.log('[AlertManager] Testando envio de e-mail para:', testEmail);

    const mockEmailData = {
      to: testEmail,
      subject: emailService.generateEmailSubject('warning', 'Teste Manual do Sistema'),
      alertType: 'warning' as const,
      criterio: {
        id: 'test-manual',
        nome: 'Teste Manual - AlertManager',
        secretaria: 'Sistema de Alertas'
      },
      usuario: {
        id: 'alert-manager',
        name: 'AlertManager TranspJardim'
      },
      dueDate: new Date().toISOString()
    };

    try {
      const result = await emailService.sendAlert(mockEmailData);
      console.log('[AlertManager] ✅ Teste de e-mail bem-sucedido:', result);
      return result;
    } catch (error) {
      console.error('[AlertManager] ❌ Teste de e-mail falhou:', error);
      throw error;
    }
  }, []);

  return {
    rules,
    setRules,
    config,
    setConfig,
    lastCheck,
    alertHistory,
    alertsToday,
    manualCheck,
    processAlerts,
    testEmailAlert
  };
};