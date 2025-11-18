export interface User {
  id: string;
  username: string;
  role: 'admin' | 'padrão';
  name: string;
  email: string; // E-mail do usuário para recebimento de notificações
  secretaria?: string; // Secretaria do usuário (opcional para admin)
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface Criterio {
  id: string;
  nome: string;
  status: 'ativo' | 'inativo';
  responsavel: string;
  secretaria: string; // Secretaria responsável pelo critério
  descricao: string;
  periodicidade: '15_dias' | '30_dias' | 'mensal' | 'bimestral' | 'semestral' | 'anual';
  dataCriacao?: string;
  dataProximaGeracao?: string; // Quando a próxima tarefa deve ser gerada
}

export interface Tarefa {
  id: string;
  criterioId: string;
  criteriNome?: string; // Nome do critério para facilitar exibição
  descricao: string;
  dataVencimento: string;
  status: 'pendente' | 'concluida' | 'vencida';
  responsavel: string; // userId do responsável
  responsavelNome?: string; // Nome do responsável para exibição
  secretaria: string;
  dataConclusao?: string;
  concluidaPor?: string; // userId de quem concluiu
  dataCriacao: string;
}

export interface Alerta {
  id: string;
  tarefaId: string; // Alertas são vinculados a tarefas
  tipo: 'vencimento' | 'meta' | 'status';
  mensagem: string;
  prioridade: 'alta' | 'média' | 'baixa';
  dataEnvio: string;
  lido: boolean;
  resolvidoPor?: string; // userId de quem resolveu/leu o alerta
}

export interface Metricas {
  totalCriterios: number;
  criteriosAtivos: number;
  criteriosInativos: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  tarefasVencidas: number;
  percentualCumprimento: number;
  alertasAtivos: number;
}