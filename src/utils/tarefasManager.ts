import { Criterio, Tarefa } from '../types';

/**
 * Calcula a próxima data de vencimento baseada na periodicidade do critério
 */
export function calcularProximoVencimento(
  periodicidade: Criterio['periodicidade'],
  dataBase: Date = new Date()
): Date {
  const proximaData = new Date(dataBase);

  switch (periodicidade) {
    case '15_dias':
      proximaData.setDate(proximaData.getDate() + 15);
      break;
    case '30_dias':
      proximaData.setDate(proximaData.getDate() + 30);
      break;
    case 'mensal':
      proximaData.setMonth(proximaData.getMonth() + 1);
      break;
    case 'bimestral':
      proximaData.setMonth(proximaData.getMonth() + 2);
      break;
    case 'semestral':
      proximaData.setMonth(proximaData.getMonth() + 6);
      break;
    case 'anual':
      proximaData.setFullYear(proximaData.getFullYear() + 1);
      break;
  }

  return ajustarParaDiaUtil(proximaData);
}

/**
 * Ajusta a data para o próximo dia útil se cair em fim de semana
 */
export function ajustarParaDiaUtil(data: Date): Date {
  const diaSemana = data.getDay();
  const dataAjustada = new Date(data);

  // Se é sábado (6), adiciona 2 dias para segunda
  if (diaSemana === 6) {
    dataAjustada.setDate(dataAjustada.getDate() + 2);
  }
  // Se é domingo (0), adiciona 1 dia para segunda
  else if (diaSemana === 0) {
    dataAjustada.setDate(dataAjustada.getDate() + 1);
  }

  return dataAjustada;
}

/**
 * Gera uma nova tarefa baseada no critério
 */
export function gerarTarefaDoCriterio(
  criterio: Criterio,
  dataBase?: Date
): Tarefa {
  const dataVencimento = calcularProximoVencimento(criterio.periodicidade, dataBase);
  const agora = new Date();

  return {
    id: `tarefa-${criterio.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    criterioId: criterio.id,
    criteriNome: criterio.nome,
    descricao: criterio.descricao,
    dataVencimento: dataVencimento.toISOString(),
    status: 'pendente',
    responsavel: criterio.responsavel,
    secretaria: criterio.secretaria,
    dataCriacao: agora.toISOString()
  };
}

/**
 * Verifica se uma tarefa está vencida
 */
export function verificarTarefaVencida(tarefa: Tarefa): boolean {
  if (tarefa.status === 'concluida') return false;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimento = new Date(tarefa.dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  
  return vencimento < hoje;
}

/**
 * Atualiza o status das tarefas verificando vencimentos
 */
export function atualizarStatusTarefas(tarefas: Tarefa[]): Tarefa[] {
  return tarefas.map(tarefa => {
    if (tarefa.status === 'pendente' && verificarTarefaVencida(tarefa)) {
      return { ...tarefa, status: 'vencida' as const };
    }
    return tarefa;
  });
}

/**
 * Verifica se é necessário gerar novas tarefas para um critério
 */
export function verificarGeracaoTarefas(
  criterio: Criterio,
  tarefasExistentes: Tarefa[]
): boolean {
  if (criterio.status !== 'ativo') return false;

  // Verificar se já existe uma tarefa pendente ou futura para este critério
  const hoje = new Date();
  const tarefasPendentesOuFuturas = tarefasExistentes.filter(
    tarefa => 
      tarefa.criterioId === criterio.id &&
      (tarefa.status === 'pendente' || new Date(tarefa.dataVencimento) > hoje)
  );

  // Se não tem nenhuma tarefa pendente/futura, precisa gerar
  return tarefasPendentesOuFuturas.length === 0;
}

/**
 * Gera tarefas automáticas para critérios ativos que precisam
 */
export function gerarTarefasAutomaticas(
  criterios: Criterio[],
  tarefasExistentes: Tarefa[]
): Tarefa[] {
  const novasTarefas: Tarefa[] = [];

  criterios.forEach(criterio => {
    if (verificarGeracaoTarefas(criterio, tarefasExistentes)) {
      const novaTarefa = gerarTarefaDoCriterio(criterio);
      novasTarefas.push(novaTarefa);
    }
  });

  return novasTarefas;
}

/**
 * Formata a periodicidade para exibição
 */
export function formatarPeriodicidade(periodicidade: Criterio['periodicidade']): string {
  const map: Record<Criterio['periodicidade'], string> = {
    '15_dias': 'A cada 15 dias',
    '30_dias': 'A cada 30 dias',
    'mensal': 'Mensal',
    'bimestral': 'Bimestral',
    'semestral': 'Semestral',
    'anual': 'Anual'
  };
  return map[periodicidade] || periodicidade;
}

/**
 * Calcula dias até o vencimento
 */
export function calcularDiasParaVencimento(dataVencimento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  
  const diff = vencimento.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}
