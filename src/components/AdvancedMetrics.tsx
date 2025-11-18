import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Criterio, User, Alerta } from '../types';
import { Calendar, Users, Target, AlertTriangle, Trophy, TrendingUp } from 'lucide-react';

interface AdvancedMetricsProps {
  criterios: Criterio[];
  user: User | null;
  alertas?: Alerta[];
  usuarios?: User[];
}

export const AdvancedMetrics = ({ criterios, user, alertas = [], usuarios = [] }: AdvancedMetricsProps) => {
  const metrics = useMemo(() => {
    if (!criterios.length) {
      return {
        performancePorSecretaria: [],
        proximosVencimentos: [],
        statusDistribution: {},
        performancePorUsuario: []
      };
    }

    // Performance por Secretaria (baseado em valor/meta dos critérios)
    const secretariasMap = new Map<string, { total: number; valor: number }>();
    
    criterios.forEach(criterio => {
      if (!criterio.secretaria) return;
      
      const key = criterio.secretaria;
      const current = secretariasMap.get(key) || { total: 0, valor: 0 };
      
      secretariasMap.set(key, {
        total: current.total + 1,
        valor: current.valor + (criterio.valor ?? 0)
      });
    });

    const performancePorSecretaria = Array.from(secretariasMap.entries()).map(([secretaria, data]) => ({
      secretaria: secretaria ? secretaria.replace('Secretaria de ', '') : 'Sem Secretaria',
      performance: Math.round((data.valor / data.total) || 0),
      total: data.total
    })).sort((a, b) => b.performance - a.performance);

    // Próximos Vencimentos (critérios que precisam de atenção)
    const hoje = new Date();
    const proximoMes = new Date();
    proximoMes.setDate(hoje.getDate() + 30);

    const proximosVencimentos = criterios
      .filter(c => {
        if (!c.dataVencimento) return false;
        const vencimento = new Date(c.dataVencimento);
        return vencimento >= hoje && vencimento <= proximoMes && c.status !== 'vencido';
      })
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
      .slice(0, 5);

    // Distribuição por status
    const statusDistribution = criterios.reduce((acc, c) => {
      const status = c.status || 'inativo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance por Usuário
    // Analisa quantas tarefas cada usuário concluiu e quantos alertas foram resolvidos
    const usuariosPerformance = new Map<string, {
      nome: string;
      tarefasConcluidas: number;
      tarefasDentroDoPrazo: number;
      alertasResolvidos: number;
      secretaria?: string;
    }>();

    // Inicializar com todos os usuários
    usuarios.forEach(u => {
      usuariosPerformance.set(u.id, {
        nome: u.name,
        tarefasConcluidas: 0,
        tarefasDentroDoPrazo: 0,
        alertasResolvidos: 0,
        secretaria: u.secretaria
      });
    });

    // Analisar conclusões de tarefas por critério
    criterios.forEach(criterio => {
      if (!criterio.conclusoesPorUsuario) return;

      Object.entries(criterio.conclusoesPorUsuario).forEach(([userId, conclusao]) => {
        if (!conclusao.concluido) return;

        const userPerf = usuariosPerformance.get(userId);
        if (!userPerf) {
          // Se o usuário não está na lista, criar entrada
          usuariosPerformance.set(userId, {
            nome: 'Usuário Desconhecido',
            tarefasConcluidas: 1,
            tarefasDentroDoPrazo: 0,
            alertasResolvidos: 0
          });
        } else {
          userPerf.tarefasConcluidas++;

          // Verificar se foi concluído dentro do prazo
          if (conclusao.dataConclusao && criterio.dataVencimento) {
            const dataConclusao = new Date(conclusao.dataConclusao);
            const dataVencimento = new Date(criterio.dataVencimento);
            
            if (dataConclusao <= dataVencimento) {
              userPerf.tarefasDentroDoPrazo++;
            }
          }
        }
      });
    });

    // Analisar alertas resolvidos (alertas que foram lidos)
    alertas.forEach(alerta => {
      if (alerta.lido) {
        // Encontrar o critério relacionado
        const criterio = criterios.find(c => c.id === alerta.criterioId);
        if (criterio?.responsavel) {
          const userPerf = usuariosPerformance.get(criterio.responsavel);
          if (userPerf) {
            userPerf.alertasResolvidos++;
          }
        }
      }
    });

    const performancePorUsuario = Array.from(usuariosPerformance.entries())
      .map(([userId, data]) => ({
        userId,
        nome: data.nome,
        tarefasConcluidas: data.tarefasConcluidas,
        tarefasDentroDoPrazo: data.tarefasDentroDoPrazo,
        alertasResolvidos: data.alertasResolvidos,
        secretaria: data.secretaria,
        percentualNoPrazo: data.tarefasConcluidas > 0 
          ? Math.round((data.tarefasDentroDoPrazo / data.tarefasConcluidas) * 100)
          : 0,
        pontuacao: (data.tarefasDentroDoPrazo * 3) + (data.alertasResolvidos * 1) // Peso: tarefas no prazo valem mais
      }))
      .filter(u => u.tarefasConcluidas > 0 || u.alertasResolvidos > 0) // Mostrar apenas usuários ativos
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, 10); // Top 10 usuários

    return {
      performancePorSecretaria,
      proximosVencimentos,
      statusDistribution,
      performancePorUsuario
    };
  }, [criterios, alertas, usuarios]);

  const getDiasParaVencimento = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';  
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!criterios.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum critério disponível para análise</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance por Usuário - DESTAQUE */}
      {metrics.performancePorUsuario.length > 0 && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              Ranking de Performance por Usuário
            </CardTitle>
            <CardDescription>
              Usuários com melhor desempenho em conclusão de tarefas e resolução de alertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.performancePorUsuario.map((usuario, index) => (
                <div 
                  key={usuario.userId} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? 'bg-amber-50 border-amber-200' :
                    index === 1 ? 'bg-slate-50 border-slate-200' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-slate-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{usuario.nome}</p>
                      {usuario.secretaria && (
                        <p className="text-xs text-muted-foreground">{usuario.secretaria}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Tarefas</p>
                      <p className="font-semibold text-green-600">{usuario.tarefasConcluidas}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">No Prazo</p>
                      <p className="font-semibold text-blue-600">{usuario.tarefasDentroDoPrazo}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Alertas</p>
                      <p className="font-semibold text-orange-600">{usuario.alertasResolvidos}</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">Taxa</p>
                      <div className="flex items-center gap-1">
                        <p className="font-semibold">{usuario.percentualNoPrazo}%</p>
                        {usuario.percentualNoPrazo >= 80 && (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance por Secretaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Desempenho por Secretaria
          </CardTitle>
          <CardDescription>
            Média de desempenho dos critérios por secretaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.performancePorSecretaria.map((item, index) => (
              <div key={item.secretaria} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium">{item.secretaria}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.total} critério{item.total !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.performance}%</span>
                  {index === 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Vencimentos
          </CardTitle>
          <CardDescription>
            Critérios que precisam de atenção nos próximos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.proximosVencimentos.length > 0 ? (
            <div className="space-y-3">
              {metrics.proximosVencimentos.map(criterio => {
                const dias = getDiasParaVencimento(criterio.dataVencimento);
                return (
                  <div key={criterio.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{criterio.nome || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">{criterio.secretaria || 'Sem secretaria'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={dias <= 7 ? "destructive" : dias <= 15 ? "secondary" : "outline"}>
                        {dias === 1 ? '1 dia' : `${dias} dias`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum critério com vencimento próximo
            </p>
          )}
        </CardContent>
      </Card>

      {/* Distribuição por Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Distribuição por Status
          </CardTitle>
          <CardDescription>
            Visão geral do status dos critérios periódicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(metrics.statusDistribution).map(([status, count]) => (
              <div key={status} className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg">
                <Badge className={getStatusColor(status)}>
                  {status.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
