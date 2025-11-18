import { useState } from 'react';
import { Button } from './ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from './ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CleanupStats {
  criteriosDeleted: number;
  alertasDeleted: number;
}

export function DataCleanupPanel() {
  const [showCriteriosDialog, setShowCriteriosDialog] = useState(false);
  const [showAlertasDialog, setShowAlertasDialog] = useState(false);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<CleanupStats | null>(null);

  const deleteCriterios = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios/delete-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ ${result.count} critérios deletados com sucesso!`);
        setStats(prev => ({ ...prev, criteriosDeleted: result.count } as CleanupStats));
        
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`❌ Erro ao deletar critérios: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar critérios:', error);
      toast.error(`❌ Erro ao deletar critérios: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
      setShowCriteriosDialog(false);
    }
  };

  const deleteAlertas = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas/delete-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ ${result.count} alertas deletados com sucesso!`);
        setStats(prev => ({ ...prev, alertasDeleted: result.count } as CleanupStats));
        
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`❌ Erro ao deletar alertas: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar alertas:', error);
      toast.error(`❌ Erro ao deletar alertas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
      setShowAlertasDialog(false);
    }
  };

  const deleteAll = async () => {
    setIsDeleting(true);
    try {
      // Deletar critérios primeiro
      const criteriosResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios/delete-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const criteriosResult = await criteriosResponse.json();

      // Depois deletar alertas
      const alertasResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas/delete-all`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const alertasResult = await alertasResponse.json();

      if (criteriosResult.success && alertasResult.success) {
        const totalDeleted = criteriosResult.count + alertasResult.count;
        toast.success(
          `✅ Limpeza completa! ${criteriosResult.count} critérios e ${alertasResult.count} alertas deletados.`,
          { duration: 5000 }
        );
        setStats({
          criteriosDeleted: criteriosResult.count,
          alertasDeleted: alertasResult.count
        });
        
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('❌ Erro durante a limpeza completa');
      }
    } catch (error) {
      console.error('Erro ao deletar tudo:', error);
      toast.error(`❌ Erro ao deletar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
      setShowAllDialog(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo - Limpeza de Dados
        </CardTitle>
        <CardDescription>
          Use estas opções para deletar critérios e alertas do sistema. <strong>Esta ação não pode ser desfeita!</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="destructive"
            onClick={() => setShowCriteriosDialog(true)}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Todos os Critérios
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowAlertasDialog(true)}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Todos os Alertas
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowAllDialog(true)}
            disabled={isDeleting}
            className="gap-2 bg-red-700 hover:bg-red-800"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Tudo (Critérios + Alertas)
          </Button>
        </div>

        {stats && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-700 mt-0.5" />
            <div>
              <p className="text-green-800">
                <strong>Limpeza concluída!</strong>
              </p>
              <ul className="text-green-700 text-sm mt-1">
                {stats.criteriosDeleted > 0 && (
                  <li>• {stats.criteriosDeleted} critérios deletados</li>
                )}
                {stats.alertasDeleted > 0 && (
                  <li>• {stats.alertasDeleted} alertas deletados</li>
                )}
              </ul>
              <p className="text-green-700 text-sm mt-2">
                A página será recarregada automaticamente...
              </p>
            </div>
          </div>
        )}

        {/* Dialog para confirmar deleção de critérios */}
        <AlertDialog open={showCriteriosDialog} onOpenChange={setShowCriteriosDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Deletar Todos os Critérios?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>deletar permanentemente TODOS os critérios</strong> cadastrados no sistema.
                <br /><br />
                <strong className="text-red-600">⚠️ Esta ação não pode ser desfeita!</strong>
                <br /><br />
                Você tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deleteCriterios();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  'Sim, Deletar Tudo'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para confirmar deleção de alertas */}
        <AlertDialog open={showAlertasDialog} onOpenChange={setShowAlertasDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Deletar Todos os Alertas?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>deletar permanentemente TODOS os alertas</strong> do sistema.
                <br /><br />
                <strong className="text-red-600">⚠️ Esta ação não pode ser desfeita!</strong>
                <br /><br />
                Você tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deleteAlertas();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  'Sim, Deletar Tudo'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog para confirmar deleção de TUDO */}
        <AlertDialog open={showAllDialog} onOpenChange={setShowAllDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Deletar TUDO?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>deletar permanentemente:</strong>
                <ul className="list-disc list-inside mt-2 mb-2">
                  <li>TODOS os critérios cadastrados</li>
                  <li>TODOS os alertas do sistema</li>
                </ul>
                <strong className="text-red-600">⚠️ Esta é uma ação IRREVERSÍVEL!</strong>
                <br /><br />
                O sistema ficará completamente limpo e você precisará criar novos critérios do zero.
                <br /><br />
                Você tem <strong>ABSOLUTA CERTEZA</strong> que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deleteAll();
                }}
                disabled={isDeleting}
                className="bg-red-700 hover:bg-red-800"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  'Sim, Deletar TUDO'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
