import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AuthProvider } from "./components/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoginForm } from "./components/LoginForm";
import { JardimHeader } from "./components/JardimHeader";
import { JardimFooter } from "./components/JardimFooter";
import { JardimBreadcrumb } from "./components/JardimBreadcrumb";
import { Dashboard } from "./components/Dashboard";
import { CriteriosList } from "./components/CriteriosList";
import { AdvancedAlertsPanel } from "./components/AdvancedAlertsPanel";
import { AdminPanel } from "./components/AdminPanel";
import { AdvancedMetrics } from "./components/AdvancedMetrics";
import { TarefasList } from "./components/TarefasList";
import { UserCompletionHistory } from "./components/UserCompletionHistory";
import { Toaster } from "./components/ui/sonner";
import { JardimLogo } from "./components/JardimLogo";
import { RecoveryNotification } from "./components/RecoveryNotification";
import { AlertSystemStatus } from "./components/AlertSystemStatus";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import logoRedonda from "figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png";
import { useAuth } from "./hooks/useAuth";
import { useAlertManager } from "./hooks/useAlertManager";
import {
  mockCriterios,
  mockAlertas,
  mockMetricas,
  mockUsers,
  mockTarefas,
} from "./lib/mockData";
import { Alerta, Criterio, Metricas, Tarefa } from "./types";
import { isDevelopment } from "./utils/environment";
import {
  optimizeMemoryUsage,
  cleanupComponentMemory,
} from "./utils/memoryOptimizer";

function AppContent() {
  // Remover monitoring excessivo para reduzir uso de memória

  const { isAuthenticated, loading, user } = useAuth();

  // Estado inicial pré-carregado para evitar timeouts
  const [currentView, setCurrentView] = useState(() => {
    // Carregar view salva imediatamente
    try {
      const savedView = localStorage.getItem(
        "transpjardim-current-view",
      );
      return [
        "dashboard",
        "criterios",
        "alertas",
        "tarefas",
        "admin",
        "relatorios",
      ].includes(savedView || "")
        ? savedView
        : "dashboard";
    } catch {
      return "dashboard";
    }
  });

  const [alertas, setAlertas] = useState<Alerta[]>(
    mockAlertas || [],
  );
  const [criterios, setCriterios] = useState<Criterio[]>(mockCriterios || []);
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    // Carregar tarefas do localStorage ao inicializar
    try {
      const savedTarefas = localStorage.getItem('transpjardim-tarefas');
      if (savedTarefas) {
        const parsed = JSON.parse(savedTarefas);
        console.log(`✅ ${parsed.length} tarefas carregadas do localStorage`);
        return parsed;
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
    }
    return mockTarefas || [];
  });
  const [metricas, setMetricas] = useState<Metricas>(mockMetricas);
  const [initialized, setInitialized] = useState(true); // Já inicializado
  const [forceInitialized, setForceInitialized] =
    useState(false);

  // Handlers - Definir antes do useAlertManager
  const handleNewAlert = useCallback((novoAlerta: Alerta) => {
    setAlertas((prev) => [novoAlerta, ...prev]);
  }, []);

  // 🔔 SISTEMA DE ALERTAS AUTOMÁTICO - Integrado
  // Processa alertas automaticamente baseado em periodicidade e dias úteis
  const { alertHistory } = useAlertManager(
    tarefas,
    criterios,
    handleNewAlert,
  );

  // Log de inicialização apenas uma vez
  useEffect(() => {
    console.log("✅ TranspJardim pré-carregado e pronto!");
    console.log("🔔 Sistema de alertas automático ativado");
  }, []);

  // Salvar tarefas no localStorage sempre que mudarem
  useEffect(() => {
    if (tarefas && tarefas.length >= 0) {
      try {
        localStorage.setItem('transpjardim-tarefas', JSON.stringify(tarefas));
        console.log(`💾 ${tarefas.length} tarefas salvas no localStorage`);
      } catch (error) {
        console.error('Erro ao salvar tarefas no localStorage:', error);
      }
    }
  }, [tarefas]);

  // Monitoramento de memória completamente desabilitado para evitar timeouts

  // Carregar critérios do backend ao iniciar
  useEffect(() => {
    if (initialized && isAuthenticated) {
      const loadCriterios = async () => {
        try {
          const { projectId, publicAnonKey } = await import(
            "./utils/supabase/info"
          );

          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
              },
            }
          );

          const result = await response.json();

          if (response.ok && result.success && Array.isArray(result.data)) {
            console.log(`✅ ${result.data.length} critérios carregados do backend`);
            setCriterios(result.data.map(c => ({ 
              ...c, 
              valor: c.valor ?? 0,
              meta: c.meta ?? 100,
              dataVencimento: c.dataVencimento || new Date().toISOString()
            })));
          } else {
            console.warn("Usando critérios mock - backend não disponível");
          }
        } catch (error) {
          console.error("Erro ao carregar critérios do backend:", error);
          console.warn("Usando critérios mock como fallback");
        }
      };

      loadCriterios();
    }
  }, [initialized, isAuthenticated]);

  // Carregar completions do usuário somente quando necessário
  useEffect(() => {
    if (user?.id && initialized && criterios.length > 0) {
      // Carregar completions de forma extremamente rápida
      requestAnimationFrame(() => {
        try {
          const storageKey = `transpjardim-user-completions-${user.id}`;
          const savedCompletions =
            localStorage.getItem(storageKey);

          if (savedCompletions) {
            const completions = JSON.parse(savedCompletions);
            setCriterios((prev) =>
              prev.map((criterio) => {
                const completion = completions[criterio.id];
                return completion
                  ? {
                      ...criterio,
                      conclusoesPorUsuario: {
                        ...criterio.conclusoesPorUsuario,
                        [user.id]: completion,
                      },
                    }
                  : criterio;
              }),
            );
          }
        } catch {
          // Ignorar erros silenciosamente
        }
      });
    }
  }, [user?.id, initialized, criterios.length]);

  // Navegação otimizada
  const handleViewChange = useCallback(
    (newView: string) => {
      const validViews = [
        "dashboard",
        "criterios",
        "alertas",
        "tarefas",
        "admin",
        "relatorios",
      ];
      if (!validViews.includes(newView)) return;

      if (
        (newView === "admin" || newView === "relatorios") &&
        user?.role !== "admin"
      )
        return;

      setCurrentView(newView);

      // Salvar no localStorage de forma síncrona para melhor performance
      try {
        localStorage.setItem(
          "transpjardim-current-view",
          newView,
        );
      } catch {
        // Ignorar erros
      }
    },
    [user?.role],
  );

  // Carregar alertas do backend e manter sincronizado
  useEffect(() => {
    const loadAlertasFromBackend = async () => {
      try {
        const { projectId, publicAnonKey } = await import('./utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setAlertas(result.data);
            console.log(`✅ ${result.data.length} alertas carregados do backend`);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar alertas do backend:', error);
      }
    };

    if (isAuthenticated) {
      // Carregar imediatamente
      loadAlertasFromBackend();
      
      // Sincronizar a cada 5 minutos para manter os alertas atualizados
      const syncInterval = setInterval(() => {
        loadAlertasFromBackend();
      }, 5 * 60 * 1000); // 5 minutos
      
      return () => clearInterval(syncInterval);
    }
  }, [isAuthenticated]);

  // Handlers
  const handleMarkAlertAsRead = useCallback(
    async (alertaId: string) => {
      try {
        const { projectId, publicAnonKey } = await import('./utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas/${alertaId}/toggle-lido`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAlertas((prev) =>
              prev.map((alerta) =>
                alerta.id === alertaId
                  ? { ...alerta, lido: result.data.lido }
                  : alerta,
              ),
            );
          }
        }
      } catch (error) {
        console.error('Erro ao marcar alerta como lido:', error);
      }
    },
    [],
  );

  const handleMarkAllAlertsAsRead = useCallback(async () => {
    try {
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas/mark-all-read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setAlertas((prev) =>
          prev.map((alerta) => ({ ...alerta, lido: true })),
        );
      }
    } catch (error) {
      console.error('Erro ao marcar todos alertas como lidos:', error);
    }
  }, []);

  const handleDeleteAlert = useCallback(async (alertaId: string) => {
    // ✅ Validação: Apenas administradores podem deletar alertas
    if (user?.role !== 'admin') {
      const { toast } = await import("sonner@2.0.3");
      toast.error("❌ Apenas administradores podem excluir alertas");
      return;
    }

    try {
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas/${alertaId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        // Remover do estado local de alertas
        setAlertas((prev) =>
          prev.filter((alerta) => alerta.id !== alertaId),
        );
        
        const { toast } = await import("sonner@2.0.3");
        toast.success("✅ Alerta excluído com sucesso!");
        
        // ✅ CRÍTICO: Recarregar a página para sincronizar o alertHistory
        // Isso evita que o alerta seja recriado imediatamente
        console.log('🔄 Alerta deletado - recarregando dados para sincronizar...');
      } else {
        const error = await response.text();
        console.error('Erro ao deletar alerta:', error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("❌ Erro ao excluir alerta");
      }
    } catch (error) {
      console.error('Erro ao deletar alerta:', error);
      const { toast } = await import("sonner@2.0.3");
      toast.error("❌ Erro ao excluir alerta");
    }
  }, [user?.role]);

  const handleArchiveAlert = useCallback(
    (alertaId: string) => {
      handleMarkAlertAsRead(alertaId);
    },
    [handleMarkAlertAsRead],
  );

  const handleSendEmailAlert = useCallback(
    async (alertaId: string) => {
      try {
        // Mostrar toast de início do processo
        const { toast } = await import("sonner@2.0.3");
        toast.loading("📤 Enviando alerta por email...", {
          id: `email-${alertaId}`,
        });

        // Buscar o alerta específico
        const alerta = alertas.find((a) => a.id === alertaId);
        if (!alerta) {
          throw new Error("Alerta não encontrado");
        }

        // Buscar o critério relacionado
        const criterio = criterios.find(
          (c) => c.id === alerta.criterioId,
        );
        if (!criterio) {
          throw new Error(
            "Critério relacionado não encontrado",
          );
        }

        // Buscar o usuário responsável pela secretaria do critério
        const responsavel = mockUsers.find(
          (u) => u.secretaria === criterio.secretaria,
        );
        if (!responsavel) {
          throw new Error(
            `Responsável pela ${criterio.secretaria} não encontrado`,
          );
        }

        // Chamar a API para enviar o email
        const { projectId, publicAnonKey } = await import(
          "./utils/supabase/info"
        );

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/send-alert`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              to: responsavel.email,
              subject: `Alerta TranspJardim: ${alerta.mensagem}`,
              alertType:
                alerta.prioridade === "alta"
                  ? "urgent"
                  : "normal",
              criterio: {
                id: criterio.id,
                nome: criterio.nome,
                secretaria: criterio.secretaria,
              },
              usuario: {
                id: responsavel.id,
                name: responsavel.name,
              },
              dueDate: criterio.dataVencimento,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Erro ao enviar email",
          );
        }

        if (result.success) {
          const { toast } = await import("sonner@2.0.3");
          toast.success(`✉️ Email enviado com sucesso!`, {
            id: `email-${alertaId}`,
            description: result.testMode
              ? `📧 Enviado para ${responsavel.name} (${result.authorizedEmail} - modo teste)`
              : `📧 Enviado para ${responsavel.name} (${responsavel.email})`,
            duration: 5000,
          });
        } else {
          throw new Error(
            result.error || "Falha no envio do email",
          );
        }
      } catch (error) {
        console.error("Erro ao enviar email do alerta:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("❌ Erro ao enviar email", {
          id: `email-${alertaId}`,
          description:
            error instanceof Error
              ? error.message
              : "Erro desconhecido ao enviar alerta por email",
          duration: 7000,
        });
      }
    },
    [alertas, criterios],
  );

  const handleAddCriterio = useCallback(
    async (criterioData: Omit<Criterio, "id">) => {
      try {
        const { toast } = await import("sonner@2.0.3");
        toast.loading("Criando critério...", { id: "create-criterio" });

        const { projectId, publicAnonKey } = await import(
          "./utils/supabase/info"
        );

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(criterioData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao criar critério");
        }

        // Adicionar ao estado local com valores padrão
        setCriterios((prev) => [...prev, {
          ...result.data,
          valor: result.data.valor ?? 0,
          meta: result.data.meta ?? 100,
          dataVencimento: result.data.dataVencimento || new Date().toISOString()
        }]);

        toast.success("✅ Critério criado com sucesso!", {
          id: "create-criterio",
        });
      } catch (error) {
        console.error("Erro ao criar critério:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao criar critério",
          { id: "create-criterio" }
        );
      }
    },
    [],
  );

  const handleEditCriterio = useCallback(
    async (id: string, criterioData: Omit<Criterio, "id">) => {
      try {
        const { toast } = await import("sonner@2.0.3");
        toast.loading("Atualizando critério...", { id: "edit-criterio" });

        const { projectId, publicAnonKey } = await import(
          "./utils/supabase/info"
        );

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(criterioData),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao atualizar critério");
        }

        // Atualizar no estado local com valores padrão
        setCriterios((prev) =>
          prev.map((criterio) =>
            criterio.id === id ? {
              ...result.data,
              valor: result.data.valor ?? 0,
              meta: result.data.meta ?? 100,
              dataVencimento: result.data.dataVencimento || new Date().toISOString()
            } : criterio
          )
        );

        toast.success("✅ Critério atualizado com sucesso!", {
          id: "edit-criterio",
        });
      } catch (error) {
        console.error("Erro ao atualizar critério:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar critério",
          { id: "edit-criterio" }
        );
      }
    },
    [],
  );

  const handleDeleteCriterio = useCallback(
    async (id: string) => {
      // ✅ Validação: Apenas administradores podem deletar critérios
      if (user?.role !== 'admin') {
        const { toast } = await import("sonner@2.0.3");
        toast.error("❌ Apenas administradores podem excluir critérios");
        return;
      }

      try {
        const { toast } = await import("sonner@2.0.3");
        toast.loading("Deletando critério...", { id: "delete-criterio" });

        const { projectId, publicAnonKey } = await import(
          "./utils/supabase/info"
        );

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erro ao deletar critério");
        }

        // Remover do estado local
        setCriterios((prev) =>
          prev.filter((criterio) => criterio.id !== id)
        );

        toast.success("✅ Critério deletado com sucesso!", {
          id: "delete-criterio",
        });
      } catch (error) {
        console.error("Erro ao deletar critério:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao deletar critério",
          { id: "delete-criterio" }
        );
      }

      // Limpar completion de forma otimizada
      if (user?.id) {
        try {
          const storageKey = `transpjardim-user-completions-${user.id}`;
          const existingCompletions = JSON.parse(
            localStorage.getItem(storageKey) || "{}",
          );
          delete existingCompletions[id];
          localStorage.setItem(
            storageKey,
            JSON.stringify(existingCompletions),
          );
        } catch {
          // Ignorar erros
        }
      }
    },
    [user?.id, user?.role],
  );

  const handleToggleCriterioCompletion = useCallback(
    (criterioId: string, completed: boolean) => {
      if (!user?.id) return;

      setCriterios((prev) =>
        prev.map((criterio) => {
          if (criterio.id === criterioId) {
            const updatedConclusoes = {
              ...criterio.conclusoesPorUsuario,
            };

            updatedConclusoes[user.id] = {
              concluido: completed,
              dataConclusao: completed
                ? new Date().toISOString()
                : undefined,
            };

            return {
              ...criterio,
              conclusoesPorUsuario: updatedConclusoes,
            };
          }
          return criterio;
        }),
      );

      // Persistir no localStorage de forma otimizada
      try {
        const storageKey = `transpjardim-user-completions-${user.id}`;
        const existingCompletions = JSON.parse(
          localStorage.getItem(storageKey) || "{}",
        );
        existingCompletions[criterioId] = {
          concluido: completed,
          dataConclusao: completed
            ? new Date().toISOString()
            : undefined,
        };
        localStorage.setItem(
          storageKey,
          JSON.stringify(existingCompletions),
        );
      } catch {
        // Ignorar erros
      }
    },
    [user?.id],
  );

  // Handlers para Tarefas
  const handleConcluirTarefa = useCallback(
    async (tarefaId: string) => {
      if (!user?.id) return;

      try {
        const { toast } = await import("sonner@2.0.3");
        
        setTarefas((prev) =>
          prev.map((tarefa) => {
            if (tarefa.id === tarefaId) {
              return {
                ...tarefa,
                status: 'concluida' as const,
                dataConclusao: new Date().toISOString(),
                concluidaPor: user.id,
              };
            }
            return tarefa;
          }),
        );

        toast.success("✅ Tarefa concluída!");
      } catch (error) {
        console.error("Erro ao concluir tarefa:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("Erro ao concluir tarefa");
      }
    },
    [user?.id],
  );

  const handleReverterConclusao = useCallback(
    async (tarefaId: string) => {
      try {
        const { toast } = await import("sonner@2.0.3");
        
        setTarefas((prev) =>
          prev.map((tarefa) => {
            if (tarefa.id === tarefaId) {
              return {
                ...tarefa,
                status: 'pendente' as const,
                dataConclusao: undefined,
                concluidaPor: undefined,
              };
            }
            return tarefa;
          }),
        );

        toast.info("↩️ Conclusão revertida");
      } catch (error) {
        console.error("Erro ao reverter conclusão:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("Erro ao reverter conclusão");
      }
    },
    [],
  );

  const handleExcluirTarefa = useCallback(
    async (tarefaId: string) => {
      if (user?.role !== 'admin') {
        const { toast } = await import("sonner@2.0.3");
        toast.error("Apenas administradores podem excluir tarefas");
        return;
      }

      try {
        const { toast } = await import("sonner@2.0.3");
        
        setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== tarefaId));
        
        toast.success("🗑️ Tarefa excluída com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("Erro ao excluir tarefa");
      }
    },
    [user?.role],
  );

  const handleEditarTarefa = useCallback(
    async (tarefaId: string, dados: { dataVencimento: string; status: Tarefa['status'] }) => {
      if (user?.role !== 'admin') {
        const { toast } = await import("sonner@2.0.3");
        toast.error("Apenas administradores podem editar tarefas");
        return;
      }

      try {
        const { toast } = await import("sonner@2.0.3");
        
        setTarefas((prev) =>
          prev.map((tarefa) => {
            if (tarefa.id === tarefaId) {
              return {
                ...tarefa,
                dataVencimento: dados.dataVencimento,
                status: dados.status,
              };
            }
            return tarefa;
          }),
        );
        
        toast.success("✅ Tarefa atualizada com sucesso!");
      } catch (error) {
        console.error("Erro ao editar tarefa:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("Erro ao editar tarefa");
      }
    },
    [user?.role],
  );

  const handleCriarTarefa = useCallback(
    async (criterioId: string) => {
      try {
        const { toast } = await import("sonner@2.0.3");
        
        // Buscar o critério para obter informações
        const criterio = criterios.find(c => c.id === criterioId);
        if (!criterio) {
          toast.error("Critério não encontrado");
          return;
        }

        // Importar função de cálculo de vencimento
        const { calcularProximoVencimento } = await import('./utils/periodicidadeUtils');
        
        // Buscar tarefas existentes deste critério para calcular próximo vencimento
        const tarefasExistentes = tarefas.filter(t => t.criterioId === criterio.id);
        
        // Determinar data base para cálculo
        let dataBase = new Date();
        if (tarefasExistentes.length > 0) {
          // Se já existem tarefas, calcular baseado na última tarefa
          const ultimaTarefa = tarefasExistentes.sort((a, b) => 
            new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime()
          )[0];
          dataBase = new Date(ultimaTarefa.dataVencimento);
        }

        // Calcular próximo vencimento baseado na periodicidade do critério
        const proximoVencimento = calcularProximoVencimento(
          criterio.periodicidade || '30_dias',
          dataBase
        );

        // Criar nova tarefa baseada no critério
        const novaTarefa: Tarefa = {
          id: `tarefa-${Date.now()}`,
          criterioId: criterio.id,
          criteriNome: criterio.nome,
          descricao: criterio.descricao || `${criterio.nome}`,
          dataVencimento: proximoVencimento.toISOString(),
          status: 'pendente',
          prioridade: 'media',
          secretaria: criterio.secretaria,
          dataCriacao: new Date().toISOString(),
        };

        setTarefas((prev) => [...prev, novaTarefa]);
        
        const { getPeriodicidadeLabel } = await import('./utils/periodicidadeUtils');
        toast.success(
          `📋 Nova tarefa criada!`,
          {
            description: `Vencimento: ${proximoVencimento.toLocaleDateString('pt-BR')} (${getPeriodicidadeLabel(criterio.periodicidade || '30_dias')})`
          }
        );
      } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        const { toast } = await import("sonner@2.0.3");
        toast.error("Erro ao criar tarefa");
      }
    },
    [criterios, tarefas],
  );

  // Cálculos com debounce para evitar recálculos excessivos
  const alertasNaoLidos = useMemo(() => {
    if (!alertas || alertas.length === 0) return [];
    return alertas.filter((a) => !a.lido);
  }, [alertas]);

  const filteredCriterios = useMemo(() => {
    if (!user?.id || !initialized || !criterios) return [];

    // Cache simples para evitar recálculos
    if (user.role === "admin") {
      return criterios;
    }

    if (user.secretaria) {
      return criterios.filter(
        (criterio) => criterio.secretaria === user.secretaria,
      );
    }

    return [];
  }, [
    user?.id,
    user?.role,
    user?.secretaria,
    criterios,
    initialized,
  ]);

  const calculatedMetricas = useMemo(() => {
    // Retorno rápido para evitar cálculos desnecessários
    if (
      !user?.id ||
      !initialized ||
      !filteredCriterios ||
      filteredCriterios.length === 0
    ) {
      return {
        totalCriterios: 0,
        ativas: 0,
        pendentes: 0,
        vencidas: 0,
        percentualCumprimento: 0,
        alertasAtivos: alertasNaoLidos?.length || 0,
        criteriosConcluidos: 0,
        percentualConclusao: 0,
      };
    }

    // Cálculos otimizados com breaks antecipados
    let criteriosConcluidos = 0;
    let ativas = 0;
    let pendentes = 0;
    let vencidas = 0;
    let valorTotal = 0;

    // Otimização: verificar se há mais de 100 critérios para fazer sample
    const criteriosToProcess =
      filteredCriterios.length > 100
        ? filteredCriterios.slice(0, 100) // Sample para evitar travamentos
        : filteredCriterios;

    // Single loop otimizado
    for (let i = 0; i < criteriosToProcess.length; i++) {
      const criterio = criteriosToProcess[i];

      if (criterio.conclusoesPorUsuario?.[user.id]?.concluido) {
        criteriosConcluidos++;
      }

      switch (criterio.status) {
        case "ativo":
          ativas++;
          break;
        case "pendente":
          pendentes++;
          break;
        case "vencido":
          vencidas++;
          break;
      }

      valorTotal += criterio.valor / (criterio.meta || 100);
    }

    const total = criteriosToProcess.length;

    return {
      totalCriterios: filteredCriterios.length, // Total real
      ativas,
      pendentes,
      vencidas,
      percentualCumprimento:
        total > 0 ? Math.round((valorTotal / total) * 100) : 0,
      alertasAtivos: alertasNaoLidos?.length || 0,
      criteriosConcluidos,
      percentualConclusao:
        total > 0
          ? Math.round((criteriosConcluidos / total) * 100)
          : 0,
    };
  }, [
    filteredCriterios,
    alertasNaoLidos,
    user?.id,
    initialized,
  ]);

  // Atualizar métricas de forma direta para melhor performance
  useEffect(() => {
    if (initialized) {
      setMetricas(calculatedMetricas);
    }
  }, [calculatedMetricas, initialized]);

  // Pular tela de loading - sistema pré-carregado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--jardim-gray-light)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--jardim-green)] mx-auto mb-4"></div>
          <p className="text-[var(--jardim-gray)]">
            Carregando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
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

      case "criterios":
        return (
          <CriteriosList
            criterios={criterios}
            user={user}
            tarefas={tarefas}
            onAddCriterio={handleAddCriterio}
            onEditCriterio={handleEditCriterio}
            onDeleteCriterio={handleDeleteCriterio}
            onConcluirTarefa={handleConcluirTarefa}
            onCriarTarefa={handleCriarTarefa}
            onExcluirTarefa={handleExcluirTarefa}
          />
        );

      case "alertas":
        return (
          <div className="space-y-6">
            <JardimBreadcrumb
              items={[{ label: "Alertas" }]}
              onHomeClick={() => handleViewChange("dashboard")}
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

      case "tarefas":
        return (
          <div className="space-y-6">
            <JardimBreadcrumb
              items={[{ label: "Minhas Tarefas" }]}
              onHomeClick={() => handleViewChange("dashboard")}
            />

            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-shrink-0">
                  <ImageWithFallback
                    src={logoRedonda}
                    alt="Prefeitura de Jardim - CE"
                    className="w-11 h-11 object-contain rounded-full"
                    style={{
                      filter:
                        "drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)",
                      background: "transparent",
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">
                    Minhas Tarefas
                  </h2>
                  <p className="text-[var(--jardim-gray)]">
                    Acompanhe suas tarefas concluídas e pendentes
                  </p>
                </div>
              </div>

              {user && (
                <div className="space-y-6">
                  <UserCompletionHistory
                    criterios={filteredCriterios}
                    user={user}
                  />

                  <TarefasList
                    tarefas={tarefas}
                    criterios={criterios}
                    user={user}
                    onConcluir={handleConcluirTarefa}
                    onReverter={handleReverterConclusao}
                    onExcluir={handleExcluirTarefa}
                    onEditar={handleEditarTarefa}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "admin":
        return user?.role === "admin" ? (
          <AdminPanel onNavigate={handleViewChange} />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Acesso negado. Apenas administradores.
            </p>
          </div>
        );

      case "relatorios":
        return user?.role === "admin" ? (
          <div className="space-y-6">
            <JardimBreadcrumb
              items={[{ label: "Relatórios Avançados" }]}
              onHomeClick={() => handleViewChange("dashboard")}
            />

            <div className="bg-white rounded-lg p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-shrink-0">
                  <ImageWithFallback
                    src={logoRedonda}
                    alt="Prefeitura de Jardim - CE"
                    className="w-11 h-11 object-contain rounded-full"
                    style={{
                      filter:
                        "drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)",
                      background: "transparent",
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--jardim-green)]">
                    Relatórios Avançados
                  </h2>
                  <p className="text-[var(--jardim-gray)]">
                    Análises detalhadas e métricas avançadas do
                    sistema
                  </p>
                </div>
              </div>
              <AdvancedMetrics
                criterios={criterios}
                user={user}
                alertas={alertas}
                usuarios={mockUsers}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Acesso negado. Apenas administradores.
            </p>
          </div>
        );

      default:
        return (
          <Dashboard
            criterios={filteredCriterios}
            alertas={alertas}
            metricas={metricas}
          />
        );
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
      <AlertSystemStatus isActive={true} />

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