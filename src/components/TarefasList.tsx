import { useState, useMemo } from 'react';
import { Tarefa, User, Criterio } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, Circle, Clock, Search, AlertTriangle, Calendar, Edit } from 'lucide-react';
import { calcularDiasParaVencimento } from '../utils/tarefasManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';

interface TarefasListProps {
  tarefas: Tarefa[];
  user: User | null;
  criterios?: Criterio[];
  onConcluir?: (tarefaId: string) => void;
  onReverter?: (tarefaId: string) => void;
  onExcluir?: (tarefaId: string) => void;
  onEditar?: (tarefaId: string, dados: { dataVencimento: string; status: Tarefa['status'] }) => void;
  onConcluirTarefa?: (tarefaId: string) => void;
  onReverterConclusao?: (tarefaId: string) => void;
}

export const TarefasList = ({ tarefas, user, criterios, onConcluir, onReverter, onExcluir, onEditar, onConcluirTarefa, onReverterConclusao }: TarefasListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'concluida' | 'vencida'>('all');
  const [secretariaFilter, setSecretariaFilter] = useState<string>('all');
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDataVencimento, setEditDataVencimento] = useState('');
  const [editStatus, setEditStatus] = useState<Tarefa['status']>('pendente');

  // Normalizar props para compatibilidade com diferentes usos do componente
  const handleConcluir = onConcluir || onConcluirTarefa;
  const handleReverter = onReverter || onReverterConclusao;
  const handleExcluir = onExcluir;
  const handleEditar = onEditar;

  // Filtrar tarefas
  const tarefasFiltradas = useMemo(() => {
    let filtered = tarefas;

    // Filtro por secretaria (se não for admin)
    if (user?.role !== 'admin' && user?.secretaria) {
      filtered = filtered.filter(t => t.secretaria === user.secretaria);
    } else if (secretariaFilter !== 'all') {
      filtered = filtered.filter(t => t.secretaria === secretariaFilter);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.criteriNome?.toLowerCase().includes(term) ||
        t.descricao.toLowerCase().includes(term) ||
        t.secretaria.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => {
      // Ordenar por: vencidas > pendentes > concluídas
      // E dentro de cada grupo, por data de vencimento
      if (a.status !== b.status) {
        const ordem = { vencida: 0, pendente: 1, concluida: 2 };
        return ordem[a.status] - ordem[b.status];
      }
      return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
    });
  }, [tarefas, user, statusFilter, secretariaFilter, searchTerm]);

  // Estatísticas
  const stats = useMemo(() => {
    const minhasTarefas = user?.role !== 'admin' && user?.secretaria
      ? tarefas.filter(t => t.secretaria === user.secretaria)
      : tarefas;

    return {
      total: minhasTarefas.length,
      pendentes: minhasTarefas.filter(t => t.status === 'pendente').length,
      concluidas: minhasTarefas.filter(t => t.status === 'concluida').length,
      vencidas: minhasTarefas.filter(t => t.status === 'vencida').length,
    };
  }, [tarefas, user]);

  // Secretarias únicas para filtro
  const secretarias = useMemo(() => {
    const unique = Array.from(new Set(tarefas.map(t => t.secretaria)));
    return unique.sort();
  }, [tarefas]);

  const getStatusBadge = (status: Tarefa['status']) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'vencida':
        return <Badge className="bg-red-100 text-red-800">Vencida</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDiasVencimento = (tarefa: Tarefa) => {
    if (tarefa.status === 'concluida') return null;
    const dias = calcularDiasParaVencimento(tarefa.dataVencimento);
    
    if (dias < 0) {
      return <span className="text-red-600 text-sm font-medium">Venceu há {Math.abs(dias)} dias</span>;
    } else if (dias === 0) {
      return <span className="text-orange-600 text-sm font-medium">Vence hoje!</span>;
    } else if (dias <= 3) {
      return <span className="text-orange-500 text-sm font-medium">Vence em {dias} dia{dias > 1 ? 's' : ''}</span>;
    } else if (dias <= 7) {
      return <span className="text-yellow-600 text-sm">Vence em {dias} dias</span>;
    } else {
      return <span className="text-muted-foreground text-sm">Vence em {dias} dias</span>;
    }
  };

  const handleEditTarefa = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa);
    // Converter ISO string para formato yyyy-MM-dd
    const dataFormatada = tarefa.dataVencimento.split('T')[0];
    setEditDataVencimento(dataFormatada);
    setEditStatus(tarefa.status);
    setDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (tarefaEditando && handleEditar) {
      // Converter a data do formato yyyy-MM-dd para ISO
      const dataISO = new Date(editDataVencimento + 'T00:00:00').toISOString();
      handleEditar(tarefaEditando.id, { dataVencimento: dataISO, status: editStatus });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
              <p className="text-sm text-muted-foreground">Vencidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Tarefas</CardTitle>
          <CardDescription>
            Tarefas geradas automaticamente pelos critérios periódicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="vencida">Vencidas</SelectItem>
                <SelectItem value="concluida">Concluídas</SelectItem>
              </SelectContent>
            </Select>
            {user?.role === 'admin' && (
              <Select value={secretariaFilter} onValueChange={setSecretariaFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Secretaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Secretarias</SelectItem>
                  {secretarias.map(sec => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Lista de Tarefas */}
          <div className="space-y-3">
            {tarefasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
              </div>
            ) : (
              tarefasFiltradas.map(tarefa => (
                <Card key={tarefa.id} className={`${
                  tarefa.status === 'vencida' ? 'border-red-300 bg-red-50/50' :
                  tarefa.status === 'concluida' ? 'border-green-300 bg-green-50/50' :
                  'border-yellow-300 bg-yellow-50/50'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {tarefa.status === 'concluida' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                        ) : tarefa.status === 'vencida' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                        ) : (
                          <Circle className="w-5 h-5 text-yellow-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{tarefa.criteriNome}</h4>
                            {getStatusBadge(tarefa.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{tarefa.descricao}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              Vencimento: {formatarData(tarefa.dataVencimento)}
                            </span>
                            {getDiasVencimento(tarefa)}
                            <Badge variant="outline">{tarefa.secretaria}</Badge>
                          </div>
                          {tarefa.status === 'concluida' && tarefa.dataConclusao && (
                            <p className="text-xs text-muted-foreground mt-2">
                              ✓ Concluída em {formatarData(tarefa.dataConclusao)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {tarefa.status === 'concluida' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReverter(tarefa.id)}
                          >
                            Reverter
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConcluir(tarefa.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        {user?.role === 'admin' && handleEditar && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTarefa(tarefa)}
                            title="Editar tarefa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da tarefa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label>Data de Vencimento</Label>
              <Input
                type="date"
                value={editDataVencimento}
                onChange={(e) => setEditDataVencimento(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};