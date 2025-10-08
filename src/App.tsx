import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginForm } from './components/LoginForm';
import { JardimHeader } from './components/JardimHeader';
import { JardimFooter } from './components/JardimFooter';
import { JardimBreadcrumb } from './components/JardimBreadcrumb';
import { Dashboard } from './components/Dashboard';
import { CriteriosList } from './components/CriteriosList';
import { AdvancedAlertsPanel } from './components/AdvancedAlertsPanel';
import { AdminPanel } from './components/AdminPanel';
import { AdvancedMetrics } from './components/AdvancedMetrics';
import { Toaster } from './components/ui/sonner';
import { JardimLogo } from './components/JardimLogo';
import { RecoveryNotification } from './components/RecoveryNotification';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';
import { useAuth } from './hooks/useAuth';
import { mockCriterios, mockAlertas, mockMetricas, mockUsers } from './lib/mockData';
import { Alerta, Criterio, Metricas } from './types';
import { isDevelopment } from './utils/environment';
import { optimizeMemoryUsage, cleanupComponentMemory } from './utils/memoryOptimizer';

function AppContent() {
  // Remover monitoring excessivo para reduzir uso de memória
  
  const { isAuthenticated, loading, user } = useAuth();
  
  // Estado inicial com fallbacks seguros
  const [currentView, setCurrentView] = useState('dashboard');
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas || []);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [metricas, setMetricas] = useState<Metricas>(mockMetricas || {
    totalCriterios: 0,
    ativas: 0,
    pendentes: 0,
    vencidas: 0,
    percentualCumprimento: 0,
    alertasAtivos: 0,
    criteriosConcluidos: 0,
    percentualConclusao: 0
  });
  const [initialized, setInitialized] = useState(false);
  const [initTimeout, setInitTimeout] = useState(false);
  const [forceInitialized, setForceInitialized] = useState(false);

  // Inicialização ultra-rápida e segura
  useEffect(() => {
    if (!initialized) {
      // Inicialização síncrona e imediata para evitar timeouts
      try {
        // Dados mock básicos
        setAlertas(mockAlertas || []);
        setCriterios((mockCriterios || []).map(criterio => ({ ...criterio, meta: 100 })));
        
        // View salva (síncrono)
        try {
          const savedView = localStorage.getItem('transpjardim-current-view');
          if (['dashboard', 'criterios', 'alertas', 'admin', 'relatorios'].includes(savedView || '')) {
            setCurrentView(savedView || 'dashboard');
          }
        } catch {
          // Ignorar erros silenciosamente
        }
        
        setInitialized(true);
        console.log('✅ TranspJardim inicializado (modo rápido)');
      } catch (error) {
        console.warn('Erro na inicialização, usando fallback:', error);
        setInitialized(true);
      }
      
      // Timeout de segurança para forçar inicialização
      const emergencyTimeout = setTimeout(() => {
        if (!initialized) {
          console.warn('⚠️ Forçando inicialização por timeout de segurança');
          setForceInitialized(true);
          setInitialized(true);
          setLoading(false);
        }
      }, 3000); // 3 segundos máximo
      
      return () => clearTimeout(emergencyTimeout);
    }
  }, []); // Dependência vazia para rodar apenas uma vez

  // Monitoramento de memória desabilitado por segurança (pode causar timeouts)
  useEffect(() => {
    // Timer de limpeza leve apenas se necessário
    const lightCleanup = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.gc) {
          window.gc();
        }
      } catch {
        // Ignorar se gc não estiver disponível
      }
    }, 30000);
    
    return () => {
      clearTimeout(lightCleanup);
    };
  }, []);

  // Carregar completions do usuário de forma assíncrona para evitar bloqueios
  useEffect(() => {
    if (user?.id && initialized) {
      // Usar setTimeout para não bloquear a thread principal
      const loadCompletions = setTimeout(() => {
        try {
          const storageKey = `transpjardim-user-completions-${user.id}`;
          const savedCompletions = localStorage.getItem(storageKey);
          
          if (savedCompletions) {
            const completions = JSON.parse(savedCompletions);
            
            // Usar requestIdleCallback se disponível para melhor performance
            const updateCriterios = () => {
              setCriterios(prev => 
                prev.map(criterio => {
                  const completion = completions[criterio.id];
                  return completion ? {
                    ...criterio,
                    conclusoesPorUsuario: {
                      ...criterio.conclusoesPorUsuario,
                      [user.id]: completion
                    }
                  } : criterio;
                })
              );
            };
            
            if (typeof window !== 'undefined' && window.requestIdleCallback) {
              window.requestIdleCallback(updateCriterios);
            } else {
              setTimeout(updateCriterios, 0);
            }
          }
        } catch (error) {
          // Ignorar erros silenciosamente
        }
      }, 100);
      
      return () => clearTimeout(loadCompletions);
    }
  }, [user?.id, initialized]);

  // Navegação otimizada
  const handleViewChange = useCallback((newView: string) => {
    const validViews = ['dashboard', 'criterios', 'alertas', 'admin', 'relatorios'];
    if (!validViews.includes(newView)) return;
    
    if ((newView === 'admin' || newView === 'relatorios') && user?.role !== 'admin') return;
    
    setCurrentView(newView);
    
    // Salvar no localStorage de forma síncrona para melhor performance
    try {
      localStorage.setItem('transpjardim-current-view', newView);
    } catch {
      // Ignorar erros
    }
  }, [user?.role]);

  // Handlers
  const handleNewAlert = useCallback((novoAlerta: Alerta) => {
    setAlertas(prev => [novoAlerta, ...prev]);
  }, []);

  const handleMarkAlertAsRead = useCallback((alertaId: string) => {
    setAlertas(prev => 
      prev.map(alerta => 
        alerta.id === alertaId 
          ? { ...alerta, lido: !alerta.lido }
          : alerta
      )
    );
  }, []);

  const handleMarkAllAlertsAsRead = useCallback(() => {
    setAlertas(prev => prev.map(alerta => ({ ...alerta, lido: true })));
  }, []);

  const handleDeleteAlert = useCallback((alertaId: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId));
  }, []);

  const handleArchiveAlert = useCallback((alertaId: string) => {
    handleMarkAlertAsRead(alertaId);
  }, [handleMarkAlertAsRead]);

  const handleSendEmailAlert = useCallback(async (alertaId: string) => {
    try {
      // Mostrar toast de início do processo
      const { toast } = await import('sonner@2.0.3');
      toast.loading('📤 Enviando alerta por email...', { id: `email-${alertaId}` });

      // Buscar o alerta específico
      const alerta = alertas.find(a => a.id === alertaId);
      if (!alerta) {
        throw new Error('Alerta não encontrado');
      }

      // Buscar o critério relacionado
      const criterio = criterios.find(c => c.id === alerta.criterioId);
      if (!criterio) {
        throw new Error('Critério relacionado não encontrado');
      }

      // Buscar o usuário responsável pela secretaria do critério
      const responsavel = mockUsers.find(u => u.secretaria === criterio.secretaria);
      if (!responsavel) {
        throw new Error(`Responsável pela ${criterio.secretaria} não encontrado`);
      }

      // Chamar a API para enviar o email
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/send-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          to: responsavel.email,
          subject: `Alerta TranspJardim: ${alerta.mensagem}`,
          alertType: alerta.prioridade === 'alta' ? 'urgent' : 'normal',
          criterio: {
            id: criterio.id,
            nome: criterio.nome,
            secretaria: criterio.secretaria
          },
          usuario: {
            id: responsavel.id,
            name: responsavel.name
          },
          dueDate: criterio.dataVencimento
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar email');
      }

      if (result.success) {
        const { toast } = await import('sonner@2.0.3');
        toast.success(
          `✉️ Email enviado com sucesso!`,
          {
            id: `email-${alertaId}`,
            description: result.testMode 
              ? `📧 Enviado para ${responsavel.name} (${result.authorizedEmail} - modo teste)`
              : `📧 Enviado para ${responsavel.name} (${responsavel.email})`,
            duration: 5000
          }
        );
      } else {
        throw new Error(result.error || 'Falha no envio do email');
      }

    } catch (error) {
      console.error('Erro ao enviar email do alerta:', error);
      const { toast } = await import('sonner@2.0.3');
      toast.error(
        '❌ Erro ao enviar email',
        {
          id: `email-${alertaId}`,
          description: error instanceof Error ? error.message : 'Erro desconhecido ao enviar alerta por email',
          duration: 7000
        }
      );
    }
  }, [alertas, criterios]);

  const handleAddCriterio = useCallback((criterioData: Omit<Criterio, 'id'>) => {
    const newCriterio: Criterio = {
      ...criterioData,
      meta: 100,
      id: Date.now().toString()
    };
    setCriterios(prev => [...prev, newCriterio]);
  }, []);

  const handleEditCriterio = useCallback((id: string, criterioData: Omit<Criterio, 'id'>) => {
    setCriterios(prev => 
      prev.map(criterio => 
        criterio.id === id 
          ? { ...criterioData, meta: 100, id }
          : criterio
      )
    );
  }, []);

  const handleDeleteCriterio = useCallback((id: string) => {
    setCriterios(prev => prev.filter(criterio => criterio.id !== id));
    
    // Limpar completion de forma otimizada
    if (user?.id) {
      try {
        const storageKey = `transpjardim-user-completions-${user.id}`;
        const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
        delete existingCompletions[id];
        localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
      } catch {
        // Ignorar erros
      }
    }
  }, [user?.id]);

  const handleToggleCriterioCompletion = useCallback((criterioId: string, completed: boolean) => {
    if (!user?.id) return;
    
    setCriterios(prev => 
      prev.map(criterio => {
        if (criterio.id === criterioId) {
          const updatedConclusoes = { ...criterio.conclusoesPorUsuario };
          
          updatedConclusoes[user.id] = {
            concluido: completed,
            dataConclusao: completed ? new Date().toISOString() : undefined
          };
          
          return {
            ...criterio,
            conclusoesPorUsuario: updatedConclusoes
          };
        }
        return criterio;
      })
    );
    
    // Persistir no localStorage de forma otimizada
    try {
      const storageKey = `transpjardim-user-completions-${user.id}`;
      const existingCompletions = JSON.parse(localStorage.getItem(storageKey) || '{}');
      existingCompletions[criterioId] = {
        concluido: completed,
        dataConclusao: completed ? new Date().toISOString() : undefined
      };
      localStorage.setItem(storageKey, JSON.stringify(existingCompletions));
    } catch {
      // Ignorar erros
    }
  }, [user?.id]);

  // Cálculos com debounce para evitar recálculos excessivos
  const alertasNaoLidos = useMemo(() => {
    if (!alertas || alertas.length === 0) return [];
    return alertas.filter(a => !a.lido);
  }, [alertas]);

  const filteredCriterios = useMemo(() => {
    if (!user?.id || !initialized || !criterios) return [];
    
    // Cache simples para evitar recálculos
    if (user.role === 'admin') {
      return criterios;
    }
    
    if (user.secretaria) {
      return criterios.filter(criterio => criterio.secretaria === user.secretaria);
    }
    
    return [];
  }, [user?.id, user?.role, user?.secretaria, criterios, initialized]);

  const calculatedMetricas = useMemo(() => {
    // Retorno rápido para evitar cálculos desnecessários
    if (!user?.id || !initialized || !filteredCriterios || filteredCriterios.length === 0) {
      return {
        totalCriterios: 0,
        ativas: 0,
        pendentes: 0,
        vencidas: 0,
        percentualCumprimento: 0,
        alertasAtivos: alertasNaoLidos?.length || 0,
        criteriosConcluidos: 0,
        percentualConclusao: 0
      };
    }

    // Cálculos otimizados com breaks antecipados
    let criteriosConcluidos = 0;
    let ativas = 0;
    let pendentes = 0;
    let vencidas = 0;
    let valorTotal = 0;

    // Otimização: verificar se há mais de 100 critérios para fazer sample
    const criteriosToProcess = filteredCriterios.length > 100 
      ? filteredCriterios.slice(0, 100) // Sample para evitar travamentos
      : filteredCriterios;

    // Single loop otimizado
    for (let i = 0; i < criteriosToProcess.length; i++) {
      const criterio = criteriosToProcess[i];
      
      if (criterio.conclusoesPorUsuario?.[user.id]?.concluido) {
        criteriosConcluidos++;
      }
      
      switch (criterio.status) {
        case 'ativo':
          ativas++;
          break;
        case 'pendente':
          pendentes++;
          break;
        case 'vencido':
          vencidas++;
          break;
      }
      
      valorTotal += (criterio.valor / (criterio.meta || 100));
    }

    const total = criteriosToProcess.length;
    
    return {
      totalCriterios: filteredCriterios.length, // Total real
      ativas,
      pendentes,
      vencidas,
      percentualCumprimento: total > 0 ? Math.round((valorTotal / total) * 100) : 0,
      alertasAtivos: alertasNaoLidos?.length || 0,
      criteriosConcluidos,
      percentualConclusao: total > 0 ? Math.round((criteriosConcluidos / total) * 100) : 0
    };
  }, [filteredCriterios, alertasNaoLidos, user?.id, initialized]);

  // Atualizar métricas de forma direta para melhor performance
  useEffect(() => {
    if (initialized) {
      setMetricas(calculatedMetricas);
    }
  }, [calculatedMetricas, initialized]);

  if ((loading || !initialized) && !forceInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--jardim-gray-light)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--jardim-green)] mx-auto mb-4"></div>
          <p className="text-[var(--jardim-gray)]">
            {initTimeout ? 'Sistema carregando...' : 'Carregando TranspJardim...'}
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                setForceInitialized(true);
                setInitialized(true);
                setLoading(false);
                // Garantir que há dados mínimos
                if (criterios.length === 0) {
                  setCriterios((mockCriterios || []).map(criterio => ({ ...criterio, meta: 100 })));
                }
              }}
              className="block mx-auto px-4 py-2 bg-[var(--jardim-green)] text-white rounded-lg hover:bg-[var(--jardim-green-light)] transition-colors"
            >
              Forçar Carregamento
            </button>
            {initTimeout && (
              <button
                onClick={() => window.location.reload()}
                className="block mx-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Recarregar Página
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            criterios={filteredCriterios}
            alertas={alertas}
            metricas={metricas}
            onMarkAlertAsRead={handleMarkAlertAsRead}
            user={user}
            onToggleCompletion={handleToggleCriterioCompletion}
          />
        );
      
      case 'criterios':
        return (
          <CriteriosList 
            criterios={criterios}
            user={user}
            onAddCriterio={handleAddCriterio}
            onEditCriterio={handleEditCriterio}
            onDeleteCriterio={handleDeleteCriterio}
            onToggleCompletion={handleToggleCriterioCompletion}
          />
        );

      case 'alertas':
        return (
          <div className="space-y-6">
            <JardimBreadcrumb 
              items={[{ label: 'Alertas' }]}
              onHomeClick={() => handleViewChange('dashboard')}
            />
            
            <AdvancedAlertsPanel 
              alertas={alertas} 
              onMarkAsRead={handleMarkAlertAsRead}
              onMarkAllAsRead={handleMarkAllAlertsAsRead}
              onDeleteAlert={handleDeleteAlert}
              onArchiveAlert={handleArchiveAlert}
              onSendEmailAlert={handleSendEmailAlert}
              criterios={criterios}
            />
          </div>
        );
      
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel onNavigate={handleViewChange} /> : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Acesso negado. Apenas administradores.</p>
          </div>
        );
      
      case 'relatorios':
        return user?.role === 'admin' ? (
          <div className="space-y-6">
            <JardimBreadcrumb 
              items={[{ label: 'Relatórios Avançados' }]}
              onHomeClick={() => handleViewChange('dashboard')}
            />
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-shrink-0">
                  <ImageWithFallback 
                    src={logoRedonda}
                    alt="Prefeitura de Jardim - CE"
                    className="w-11 h-11 object-contain rounded-full"
                    style={{ 
                      filter: 'drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)',
                      background: 'transparent'
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Relatórios Avançados</h2>
                  <p className="text-[var(--jardim-gray)]">
                    Análises detalhadas e métricas avançadas do sistema
                  </p>
                </div>
              </div>
              <AdvancedMetrics criterios={criterios} user={user} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Acesso negado. Apenas administradores.</p>
          </div>
        );
      
      default:
        return <Dashboard criterios={filteredCriterios} alertas={alertas} metricas={metricas} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--jardim-gray-light)] flex flex-col">
      <JardimHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        alertCount={alertasNaoLidos.length}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {renderContent()}
        </div>
      </main>

      <JardimFooter />
      <RecoveryNotification />
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}