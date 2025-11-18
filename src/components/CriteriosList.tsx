import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Download, Search, Filter, Plus, Edit, Trash2, ChevronDown, ChevronRight, CheckCircle2, Clock, CalendarPlus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { JardimBreadcrumb } from './JardimBreadcrumb';
import { Criterio, User, Tarefa } from '../types';
import { exportCriteriosToExcel } from '../lib/exportExcel';
import { CriterioForm } from './CriterioForm';
import { JardimLogo } from './JardimLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

interface CriteriosListProps {
  criterios: Criterio[];
  user?: User | null;
  tarefas?: Tarefa[]; // Adicionar tarefas
  onAddCriterio?: (criterio: Omit<Criterio, 'id'>) => void;
  onEditCriterio?: (id: string, criterio: Omit<Criterio, 'id'>) => void;
  onDeleteCriterio?: (id: string) => void;
  onConcluirTarefa?: (tarefaId: string) => void; // Adicionar handler
  onCriarTarefa?: (criterioId: string) => void; // Handler para criar nova tarefa
  onExcluirTarefa?: (tarefaId: string) => void; // Handler para excluir tarefa
}

export const CriteriosList = ({ 
  criterios, 
  user, 
  tarefas = [], // Default vazio
  onAddCriterio, 
  onEditCriterio, 
  onDeleteCriterio,
  onConcluirTarefa,
  onCriarTarefa,
  onExcluirTarefa
}: CriteriosListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedCriterios, setExpandedCriterios] = useState<Set<string>>(new Set());

  const [showForm, setShowForm] = useState(false);
  const [editingCriterio, setEditingCriterio] = useState<Criterio | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Filtros - incluindo filtro por secretaria do usuário
  const filteredCriterios = criterios.filter(criterio => {
    const matchesSearch = (criterio.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (criterio.secretaria || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (criterio.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (criterio.status || 'pendente') === statusFilter;
    
    // Filtro por secretaria: admin vê todos, usuário padrão vê apenas da sua secretaria
    const matchesSecretaria = isAdmin || !user?.secretaria || (criterio.secretaria || '') === user.secretaria;

    return matchesSearch && matchesStatus && matchesSecretaria;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'default',
      pendente: 'secondary',
      vencido: 'destructive',
      inativo: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    exportCriteriosToExcel(filteredCriterios);
  };

  const handleAddCriterio = (criterioData: Omit<Criterio, 'id'>) => {
    if (onAddCriterio) {
      onAddCriterio(criterioData);
    }
  };

  const handleEditCriterio = (criterioData: Omit<Criterio, 'id'>) => {
    if (onEditCriterio && editingCriterio) {
      onEditCriterio(editingCriterio.id, criterioData);
      setEditingCriterio(null);
    }
  };

  const handleDeleteCriterio = (id: string) => {
    if (onDeleteCriterio) {
      onDeleteCriterio(id);
    }
  };

  const openEditForm = (criterio: Criterio) => {
    setEditingCriterio(criterio);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCriterio(null);
  };

  const getPeriodicidadeLabel = (periodicidade: string) => {
    const labels = {
      '15_dias': 'A cada 15 dias',
      '30_dias': 'A cada 30 dias',
      'mensal': 'Mensal',
      'bimestral': 'Bimestral',
      'semestral': 'Semestral',
      'anual': 'Anual'
    };
    return labels[periodicidade as keyof typeof labels] || periodicidade;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCriterios);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCriterios(newExpanded);
  };

  // Obter tarefas de um critério específico
  const getTarefasByCriterio = (criterioId: string) => {
    return tarefas.filter(t => t.criterioId === criterioId);
  };

  // Formatar data de vencimento
  const formatarDataVencimento = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Calcular dias para vencimento
  const calcularDiasVencimento = (dataISO: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataISO);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Badge de status da tarefa
  const getStatusTarefaBadge = (tarefa: Tarefa) => {
    if (tarefa.status === 'concluida') {
      return <Badge variant="default" className="bg-green-500">Concluída</Badge>;
    }
    if (tarefa.status === 'vencida') {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    
    const dias = calcularDiasVencimento(tarefa.dataVencimento);
    if (dias < 0) {
      return <Badge variant="destructive">Vencida</Badge>;
    } else if (dias <= 3) {
      return <Badge variant="destructive" className="bg-orange-500">Vence em {dias} dia{dias !== 1 ? 's' : ''}</Badge>;
    } else {
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const handleConcluir = async (tarefaId: string) => {
    if (onConcluirTarefa) {
      onConcluirTarefa(tarefaId);
    }
  };

  const handleCriarTarefa = (criterioId: string) => {
    if (onCriarTarefa) {
      onCriarTarefa(criterioId);
    }
  };

  const handleExcluirTarefa = (tarefaId: string) => {
    if (onExcluirTarefa) {
      onExcluirTarefa(tarefaId);
    }
  };

  return (
    <div className="space-y-6">
      <JardimBreadcrumb items={[{ label: 'Critérios' }]} />
      
      <Card className="shadow-sm border border-[var(--border)]">
        <CardHeader className="bg-[var(--jardim-green-lighter)] border-b border-[var(--border)] pb-4">
          {/* Cabeçalho Principal */}
          <div className="flex items-center space-x-3 mb-4">
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
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--jardim-green)]">Critérios e Indicadores</h2>
              <p className="text-[var(--jardim-gray)]">
                Gerencie e acompanhe todos os critérios de transparência municipal
              </p>
            </div>
          </div>


          {/* Controles de Busca e Filtros */}
          <div className="bg-white/60 rounded-lg p-4 mb-4 border border-white/80">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar critérios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>

                {isAdmin && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Critério
                  </Button>
                )}
              </div>
            </div>
          </div>


        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-72 max-w-72">Nome</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24">Periodicidade</TableHead>
                  <TableHead className="w-24">Secretaria</TableHead>
                  <TableHead className="w-32">Responsável</TableHead>
                  {isAdmin && <TableHead className="w-20">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCriterios.map((criterio, index) => {
                  const isExpanded = expandedCriterios.has(criterio.id);
                  const criterioTarefas = getTarefasByCriterio(criterio.id);
                  
                  return (
                    <React.Fragment key={criterio.id || `criterio-${index}`}>
                      <TableRow className="hover:bg-muted/50">
                        {/* Botão Expandir/Colapsar */}
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(criterio.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>

                        <TableCell className="font-medium w-72 max-w-72 p-3">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-sm leading-relaxed break-words hyphens-auto whitespace-pre-wrap">
                                {criterio.nome || 'Sem nome'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground break-words hyphens-auto leading-relaxed whitespace-pre-wrap">
                              {criterio.descricao || ''}
                            </div>
                            {criterioTarefas.length > 0 && (
                              <div className="text-xs text-[var(--jardim-green)] flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {criterioTarefas.length} tarefa{criterioTarefas.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(criterio.status || 'pendente')}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getPeriodicidadeLabel(criterio.periodicidade || '')}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm w-24">
                          <div className="truncate" title={criterio.secretaria || ''}>
                            {criterio.secretaria || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm w-32">
                          <div className="truncate" title={criterio.responsavel || ''}>
                            {criterio.responsavel || 'N/A'}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCriarTarefa(criterio.id)}
                                className="h-8 w-8 p-0 text-[var(--jardim-green)] hover:text-[var(--jardim-green-dark)] hover:bg-[var(--jardim-green-lighter)]"
                                title="Criar nova tarefa (tarefas são geradas automaticamente)"
                              >
                                <CalendarPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(criterio)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o critério "{criterio.nome}"? 
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCriterio(criterio.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>

                      {/* Subtabela de Tarefas Expandida */}
                      {isExpanded && criterioTarefas.length > 0 && (
                        <TableRow key={`${criterio.id}-tarefas`}>
                          <TableCell colSpan={isAdmin ? 7 : 6} className="p-0 bg-muted/30">
                            <div className="p-4">
                              <div className="text-sm font-medium mb-3 text-[var(--jardim-green)]">
                                📋 Tarefas do Critério
                              </div>
                              <Table className="bg-white">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-64">Descrição</TableHead>
                                    <TableHead className="w-32">Vencimento</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-32">Ação</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {criterioTarefas.map((tarefa) => (
                                    <TableRow key={tarefa.id}>
                                      <TableCell className="text-sm">
                                        {tarefa.descricao}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          {formatarDataVencimento(tarefa.dataVencimento)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getStatusTarefaBadge(tarefa)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-2 items-center">
                                          {tarefa.status !== 'concluida' ? (
                                            <Button
                                              variant="default"
                                              size="sm"
                                              onClick={() => handleConcluir(tarefa.id)}
                                              className="bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-dark)]"
                                            >
                                              <CheckCircle2 className="h-4 w-4 mr-1" />
                                              Concluir
                                            </Button>
                                          ) : (
                                            <div className="text-xs text-muted-foreground">
                                              Concluída em {tarefa.dataConclusao ? formatarDataVencimento(tarefa.dataConclusao) : '-'}
                                            </div>
                                          )}
                                          
                                          {/* Botão Excluir - apenas para administradores */}
                                          {isAdmin && (
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  title="Excluir tarefa"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Tem certeza que deseja excluir esta tarefa? 
                                                    Esta ação não pode ser desfeita.
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() => handleExcluirTarefa(tarefa.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                  >
                                                    Excluir
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Mensagem quando expandido mas sem tarefas */}
                      {isExpanded && criterioTarefas.length === 0 && (
                        <TableRow key={`${criterio.id}-sem-tarefas`}>
                          <TableCell colSpan={isAdmin ? 7 : 6} className="p-4 bg-muted/30 text-center text-sm text-muted-foreground">
                            Nenhuma tarefa gerada para este critério ainda.
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            {filteredCriterios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum critério encontrado com os filtros aplicados.
              </div>
            )}
          </div>

          {/* Resumo */}
          {filteredCriterios.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Total:</span> {filteredCriterios.length} critério(s) encontrado(s)
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Formulário de Critério */}
        <CriterioForm
          isOpen={showForm}
          onClose={closeForm}
          onSubmit={editingCriterio ? handleEditCriterio : handleAddCriterio}
          editCriterio={editingCriterio}
        />
      </Card>
    </div>
  );
};