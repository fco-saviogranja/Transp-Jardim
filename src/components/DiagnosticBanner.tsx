import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticData {
  criterios: number;
  tarefas: number;
  alertas: number;
  tarefasOrfas: number;
  alertasOrfaos: number;
}

export function DiagnosticBanner() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDiagnostic = async () => {
    setLoading(true);
    try {
      // Carregar critérios
      const criteriosResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/criterios`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const criteriosData = await criteriosResponse.json();
      const criterios = criteriosData.success ? criteriosData.data : [];
      const criterioIds = new Set(criterios.map((c: any) => c.id));

      // Carregar tarefas
      const tarefasResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/tarefas`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const tarefasData = await tarefasResponse.json();
      const tarefas = tarefasData.success ? tarefasData.data : [];
      
      // Identificar tarefas órfãs
      const tarefasOrfas = tarefas.filter((t: any) => 
        t.criterioId && !criterioIds.has(t.criterioId)
      ).length;

      const tarefaIds = new Set(tarefas.map((t: any) => t.id));

      // Carregar alertas
      const alertasResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/alertas`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const alertasData = await alertasResponse.json();
      const alertas = alertasData.success ? alertasData.data : [];

      // Identificar alertas órfãos
      const alertasOrfaos = alertas.filter((a: any) => 
        !a.tarefaId || !tarefaIds.has(a.tarefaId)
      ).length;

      setDiagnostic({
        criterios: criterios.length,
        tarefas: tarefas.length,
        alertas: alertas.length,
        tarefasOrfas,
        alertasOrfaos
      });
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostic();
  }, []);

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Carregando diagnóstico do sistema...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!diagnostic) return null;

  const hasOrphans = diagnostic.tarefasOrfas > 0 || diagnostic.alertasOrfaos > 0;

  return (
    <Card className={hasOrphans ? "border-yellow-200 bg-yellow-50/50" : "border-blue-200 bg-blue-50/50"}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${hasOrphans ? 'text-yellow-700' : 'text-blue-700'}`}>
          {hasOrphans ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Database className="h-5 w-5" />
          )}
          Diagnóstico do Sistema
        </CardTitle>
        <CardDescription>
          Estado atual do banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-600">Critérios</div>
            <div className="text-2xl font-bold text-gray-900">{diagnostic.criterios}</div>
          </div>

          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-600">Tarefas</div>
            <div className="text-2xl font-bold text-gray-900">{diagnostic.tarefas}</div>
          </div>

          <div className="bg-white p-3 rounded-md border">
            <div className="text-sm text-gray-600">Alertas</div>
            <div className="text-2xl font-bold text-gray-900">{diagnostic.alertas}</div>
          </div>

          <div className={`p-3 rounded-md border ${diagnostic.tarefasOrfas > 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-white'}`}>
            <div className="text-sm text-gray-600">Tarefas Órfãs</div>
            <div className={`text-2xl font-bold ${diagnostic.tarefasOrfas > 0 ? 'text-yellow-700' : 'text-green-600'}`}>
              {diagnostic.tarefasOrfas}
            </div>
          </div>

          <div className={`p-3 rounded-md border ${diagnostic.alertasOrfaos > 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-white'}`}>
            <div className="text-sm text-gray-600">Alertas Órfãos</div>
            <div className={`text-2xl font-bold ${diagnostic.alertasOrfaos > 0 ? 'text-yellow-700' : 'text-green-600'}`}>
              {diagnostic.alertasOrfaos}
            </div>
          </div>
        </div>

        {hasOrphans && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-700 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-800 text-sm">
              <strong>⚠️ Detectados dados órfãos no sistema!</strong>
              <br />
              {diagnostic.tarefasOrfas > 0 && (
                <>• {diagnostic.tarefasOrfas} tarefa(s) sem critério válido<br /></>
              )}
              {diagnostic.alertasOrfaos > 0 && (
                <>• {diagnostic.alertasOrfaos} alerta(s) sem tarefa válida<br /></>
              )}
              <br />
              <strong>Recomendação:</strong> Use o botão "Limpar Dados Órfãos" ou "Limpar Alertas Órfãos" na Zona de Perigo abaixo.
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDiagnostic}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
