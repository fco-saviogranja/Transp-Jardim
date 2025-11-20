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

export interface SolicitacaoCadastro {
  id: string;
  nome: string;
  email: string;
  secretaria: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  dataSolicitacao: string;
  dataResposta?: string;
  respondidoPor?: string; // userId do admin que respondeu
  observacoes?: string;
}