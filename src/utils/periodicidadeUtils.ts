/**
 * Utilitários para cálculo de próximo vencimento baseado em periodicidade
 * TranspJardim - Prefeitura de Jardim/CE
 */

import { proximoDiaUtil } from './businessDays';

/**
 * Calcula o próximo vencimento baseado na periodicidade do critério
 * Garante que o vencimento sempre caia em dia útil
 */
export function calcularProximoVencimento(
  periodicidade: string,
  dataBase: Date = new Date()
): Date {
  const novaData = new Date(dataBase);
  novaData.setHours(23, 59, 59, 999); // Fim do dia

  switch (periodicidade) {
    case '15_dias':
      // A cada 15 dias
      novaData.setDate(novaData.getDate() + 15);
      break;

    case '30_dias':
      // A cada 30 dias
      novaData.setDate(novaData.getDate() + 30);
      break;

    case 'mensal':
      // Próximo mês, mesmo dia
      novaData.setMonth(novaData.getMonth() + 1);
      break;

    case 'bimestral':
      // Daqui a 2 meses
      novaData.setMonth(novaData.getMonth() + 2);
      break;

    case 'semestral':
      // Daqui a 6 meses
      novaData.setMonth(novaData.getMonth() + 6);
      break;

    case 'anual':
      // Próximo ano, mesmo dia
      novaData.setFullYear(novaData.getFullYear() + 1);
      break;

    default:
      // Padrão: 30 dias se periodicidade não reconhecida
      novaData.setDate(novaData.getDate() + 30);
  }

  // Garantir que caia em dia útil
  return proximoDiaUtil(novaData);
}

/**
 * Calcula múltiplos vencimentos futuros baseado na periodicidade
 * Útil para gerar tarefas antecipadamente
 */
export function calcularProximosVencimentos(
  periodicidade: string,
  quantidade: number = 3,
  dataBase: Date = new Date()
): Date[] {
  const vencimentos: Date[] = [];
  let dataAtual = new Date(dataBase);

  for (let i = 0; i < quantidade; i++) {
    dataAtual = calcularProximoVencimento(periodicidade, dataAtual);
    vencimentos.push(new Date(dataAtual));
  }

  return vencimentos;
}

/**
 * Obtém descrição legível da periodicidade
 */
export function getPeriodicidadeLabel(periodicidade: string): string {
  const labels: Record<string, string> = {
    '15_dias': 'A cada 15 dias',
    '30_dias': 'A cada 30 dias',
    'mensal': 'Mensal',
    'bimestral': 'Bimestral',
    'semestral': 'Semestral',
    'anual': 'Anual'
  };
  return labels[periodicidade] || periodicidade;
}

/**
 * Calcula quando a próxima tarefa deve ser gerada automaticamente
 * baseado na última tarefa criada para um critério
 */
export function calcularDataGeracaoProximaTarefa(
  periodicidade: string,
  ultimaDataVencimento: Date
): Date {
  // A próxima tarefa deve ser gerada imediatamente após o vencimento da anterior
  return calcularProximoVencimento(periodicidade, ultimaDataVencimento);
}
