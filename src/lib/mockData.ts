import { Criterio, Alerta, Metricas, User, Tarefa } from '../types';

// Lista de secretarias do município de Jardim/CE
export const secretarias = [
  'Secretaria de Educação',
  'Secretaria de Saúde',
  'Secretaria de Obras e Infraestrutura',
  'Secretaria de Meio Ambiente',
  'Secretaria de Habitação e Desenvolvimento Social',
  'Secretaria de Agricultura e Desenvolvimento Rural',
  'Secretaria de Cultura, Esporte e Lazer',
  'Secretaria de Administração e Finanças',
  'Secretaria de Assistência Social',
  'Secretaria de Turismo e Desenvolvimento Econômico'
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: 'Administrador Sistema',
    email: 'admin@jardim.ce.gov.br',
    dataCriacao: '2024-10-01T10:00:00Z'
    // Admin não tem secretaria específica - vê todos os critérios
  },
  {
    id: '2',
    username: 'educacao',
    role: 'padrão',
    name: 'João Silva',
    email: 'educacao@jardim.ce.gov.br',
    secretaria: 'Secretaria de Educação',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '3',
    username: 'saude',
    role: 'padrão',
    name: 'Maria Santos',
    email: 'saude@jardim.ce.gov.br',
    secretaria: 'Secretaria de Saúde',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '4',
    username: 'obras',
    role: 'padrão',
    name: 'Carlos Oliveira',
    email: 'obras@jardim.ce.gov.br',
    secretaria: 'Secretaria de Obras e Infraestrutura',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '5',
    username: 'ambiente',
    role: 'padrão',
    name: 'Ana Costa',
    email: 'ambiente@jardim.ce.gov.br',
    secretaria: 'Secretaria de Meio Ambiente',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '6',
    username: 'habitacao',
    role: 'padrão',
    name: 'Pedro Rocha',
    email: 'habitacao@jardim.ce.gov.br',
    secretaria: 'Secretaria de Habitação e Desenvolvimento Social',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '7',
    username: 'agricultura',
    role: 'padrão',
    name: 'Lucia Fernandes',
    email: 'agricultura@jardim.ce.gov.br',
    secretaria: 'Secretaria de Agricultura e Desenvolvimento Rural',
    dataCriacao: '2024-10-01T10:00:00Z'
  },
  {
    id: '8',
    username: 'financas',
    role: 'padrão',
    name: 'Carlos Mendes',
    email: 'financas@jardim.ce.gov.br',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-10-01T10:00:00Z'
  }
];

// CRITÉRIOS SÃO TEMPLATES PERIÓDICOS - NÃO SÃO CONCLUÍDOS
export const mockCriterios: Criterio[] = [
  {
    id: '1',
    nome: 'Taxa de Escolarização Infantil',
    status: 'ativo',
    responsavel: '2', // João Silva
    secretaria: 'Secretaria de Educação',
    descricao: 'Verificar percentual de crianças de 4 a 5 anos matriculadas na educação infantil',
    periodicidade: 'bimestral',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    nome: 'Cobertura de Saúde Básica',
    status: 'ativo',
    responsavel: '3', // Maria Santos
    secretaria: 'Secretaria de Saúde',
    descricao: 'Verificar percentual da população coberta por serviços básicos de saúde',
    periodicidade: 'mensal',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    nome: 'Pavimentação de Vias Urbanas',
    status: 'ativo',
    responsavel: '4', // Carlos Oliveira
    secretaria: 'Secretaria de Obras e Infraestrutura',
    descricao: 'Verificar percentual de vias urbanas pavimentadas no município',
    periodicidade: 'semestral',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    nome: 'Coleta Seletiva de Resíduos',
    status: 'ativo',
    responsavel: '5', // Ana Costa
    secretaria: 'Secretaria de Meio Ambiente',
    descricao: 'Verificar percentual de resíduos coletados seletivamente',
    periodicidade: '15_dias',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    nome: 'Programa Habitacional Popular',
    status: 'ativo',
    responsavel: '6', // Pedro Rocha
    secretaria: 'Secretaria de Habitação e Desenvolvimento Social',
    descricao: 'Verificar percentual de famílias atendidas pelo programa habitacional',
    periodicidade: 'anual',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    nome: 'Divulgação da classificação orçamentária por natureza da receita',
    status: 'ativo',
    responsavel: '8', // Carlos Mendes
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'Verificar se divulga a classificação orçamentária por natureza da receita (categoria econômica, origem, espécie)',
    periodicidade: 'mensal',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    nome: 'Divulgação da lista dos inscritos em dívida ativa',
    status: 'ativo',
    responsavel: '8',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'Verificar se divulga a lista dos inscritos em dívida ativa, com nome do inscrito e valor total da dívida',
    periodicidade: 'mensal',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    nome: 'Divulgação do total das despesas empenhadas, liquidadas e pagas',
    status: 'ativo',
    responsavel: '8',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'Verificar se divulga o total das despesas empenhadas, liquidadas e pagas',
    periodicidade: 'mensal',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '9',
    nome: 'Consulta de empenhos com detalhes do beneficiário',
    status: 'ativo',
    responsavel: '8',
    secretaria: 'Secretaria de Administração e Finanças',
    descricao: 'Verificar se possibilita a consulta de empenhos com detalhes do beneficiário, bem/serviço e procedimento licitatório',
    periodicidade: 'mensal',
    dataCriacao: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    nome: 'Relatório de Atividades Culturais',
    status: 'ativo',
    responsavel: '1',
    secretaria: 'Secretaria de Cultura, Esporte e Lazer',
    descricao: 'Verificar realização e divulgação de atividades culturais e esportivas',
    periodicidade: '30_dias',
    dataCriacao: '2024-01-01T00:00:00Z'
  }
];

// TAREFAS SÃO GERADAS PELOS CRITÉRIOS E PODEM SER CONCLUÍDAS
export const mockTarefas: Tarefa[] = [
  {
    id: 'tarefa-1-1',
    criterioId: '1',
    criteriNome: 'Taxa de Escolarização Infantil',
    descricao: 'Verificar percentual de crianças de 4 a 5 anos matriculadas na educação infantil',
    dataVencimento: '2024-12-15T23:59:59Z',
    status: 'pendente',
    responsavel: '2',
    responsavelNome: 'João Silva',
    secretaria: 'Secretaria de Educação',
    dataCriacao: '2024-10-15T00:00:00Z'
  },
  {
    id: 'tarefa-2-1',
    criterioId: '2',
    criteriNome: 'Cobertura de Saúde Básica',
    descricao: 'Verificar percentual da população coberta por serviços básicos de saúde',
    dataVencimento: '2024-11-30T23:59:59Z',
    status: 'pendente',
    responsavel: '3',
    responsavelNome: 'Maria Santos',
    secretaria: 'Secretaria de Saúde',
    dataCriacao: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tarefa-2-2',
    criterioId: '2',
    criteriNome: 'Cobertura de Saúde Básica',
    descricao: 'Verificar percentual da população coberta por serviços básicos de saúde',
    dataVencimento: '2024-10-31T23:59:59Z',
    status: 'concluida',
    responsavel: '3',
    responsavelNome: 'Maria Santos',
    secretaria: 'Secretaria de Saúde',
    dataCriacao: '2024-10-01T00:00:00Z',
    dataConclusao: '2024-10-28T15:30:00Z',
    concluidaPor: '3'
  },
  {
    id: 'tarefa-4-1',
    criterioId: '4',
    criteriNome: 'Coleta Seletiva de Resíduos',
    descricao: 'Verificar percentual de resíduos coletados seletivamente',
    dataVencimento: '2024-11-15T23:59:59Z',
    status: 'pendente',
    responsavel: '5',
    responsavelNome: 'Ana Costa',
    secretaria: 'Secretaria de Meio Ambiente',
    dataCriacao: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tarefa-4-2',
    criterioId: '4',
    criteriNome: 'Coleta Seletiva de Resíduos',
    descricao: 'Verificar percentual de resíduos coletados seletivamente',
    dataVencimento: '2024-10-15T23:59:59Z',
    status: 'vencida',
    responsavel: '5',
    responsavelNome: 'Ana Costa',
    secretaria: 'Secretaria de Meio Ambiente',
    dataCriacao: '2024-10-01T00:00:00Z'
  },
  {
    id: 'tarefa-6-1',
    criterioId: '6',
    criteriNome: 'Divulgação da classificação orçamentária',
    descricao: 'Verificar se divulga a classificação orçamentária por natureza da receita',
    dataVencimento: '2024-11-30T23:59:59Z',
    status: 'pendente',
    responsavel: '8',
    responsavelNome: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tarefa-6-2',
    criterioId: '6',
    criteriNome: 'Divulgação da classificação orçamentária',
    descricao: 'Verificar se divulga a classificação orçamentária por natureza da receita',
    dataVencimento: '2024-10-31T23:59:59Z',
    status: 'concluida',
    responsavel: '8',
    responsavelNome: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-10-01T00:00:00Z',
    dataConclusao: '2024-10-30T16:45:00Z',
    concluidaPor: '8'
  },
  {
    id: 'tarefa-7-1',
    criterioId: '7',
    criteriNome: 'Divulgação da lista dos inscritos em dívida ativa',
    descricao: 'Verificar se divulga a lista dos inscritos em dívida ativa',
    dataVencimento: '2024-11-30T23:59:59Z',
    status: 'pendente',
    responsavel: '8',
    responsavelNome: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tarefa-8-1',
    criterioId: '8',
    criteriNome: 'Divulgação do total das despesas',
    descricao: 'Verificar se divulga o total das despesas empenhadas, liquidadas e pagas',
    dataVencimento: '2024-11-30T23:59:59Z',
    status: 'pendente',
    responsavel: '8',
    responsavelNome: 'Carlos Mendes',
    secretaria: 'Secretaria de Administração e Finanças',
    dataCriacao: '2024-11-01T00:00:00Z'
  },
  {
    id: 'tarefa-10-1',
    criterioId: '10',
    criteriNome: 'Relatório de Atividades Culturais',
    descricao: 'Verificar realização e divulgação de atividades culturais e esportivas',
    dataVencimento: '2024-11-20T23:59:59Z',
    status: 'pendente',
    responsavel: '1',
    responsavelNome: 'Administrador Sistema',
    secretaria: 'Secretaria de Cultura, Esporte e Lazer',
    dataCriacao: '2024-10-20T00:00:00Z'
  }
];

export const mockAlertas: Alerta[] = [
  {
    id: '1',
    tarefaId: 'tarefa-4-2',
    tipo: 'vencimento',
    mensagem: 'Tarefa "Coleta Seletiva de Resíduos" venceu em 15/10/2024',
    prioridade: 'alta',
    dataEnvio: '2024-10-16T08:00:00Z',
    lido: false
  },
  {
    id: '2',
    tarefaId: 'tarefa-2-1',
    tipo: 'vencimento',
    mensagem: 'Tarefa "Cobertura de Saúde Básica" vence em 7 dias',
    prioridade: 'média',
    dataEnvio: '2024-11-23T10:00:00Z',
    lido: false
  },
  {
    id: '3',
    tarefaId: 'tarefa-1-1',
    tipo: 'vencimento',
    mensagem: 'Tarefa "Taxa de Escolarização Infantil" vence em 15 dias',
    prioridade: 'baixa',
    dataEnvio: '2024-11-30T14:00:00Z',
    lido: true,
    resolvidoPor: '2'
  },
  {
    id: '4',
    tarefaId: 'tarefa-6-1',
    tipo: 'status',
    mensagem: 'Tarefa "Divulgação da classificação orçamentária" precisa ser iniciada',
    prioridade: 'média',
    dataEnvio: '2024-11-15T16:30:00Z',
    lido: false
  },
  {
    id: '5',
    tarefaId: 'tarefa-10-1',
    tipo: 'vencimento',
    mensagem: 'Tarefa "Relatório de Atividades Culturais" vence em breve',
    prioridade: 'alta',
    dataEnvio: '2024-11-18T09:15:00Z',
    lido: false
  }
];

export const mockMetricas: Metricas = {
  totalCriterios: 10,
  criteriosAtivos: 10,
  criteriosInativos: 0,
  totalTarefas: 10,
  tarefasPendentes: 7,
  tarefasConcluidas: 2,
  tarefasVencidas: 1,
  percentualCumprimento: 75,
  alertasAtivos: 4
};
