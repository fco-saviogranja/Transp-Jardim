import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Edit, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from '../utils/toast';
import { SolicitacaoCadastro, User } from '../types';
import { secretarias } from '../lib/mockData';

interface SolicitacoesCadastroProps {
  currentUserId?: string;
  onUsuarioCriado?: () => void;
}

export const SolicitacoesCadastro = ({ currentUserId, onUsuarioCriado }: SolicitacoesCadastroProps) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCadastro[]>([]);
  const [solicitacaoEditando, setSolicitacaoEditando] = useState<SolicitacaoCadastro | null>(null);
  const [isAprovarDialogOpen, setIsAprovarDialogOpen] = useState(false);
  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioUsername, setUsuarioUsername] = useState('');
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const [usuarioSecretaria, setUsuarioSecretaria] = useState('');
  const [usuarioSenha, setUsuarioSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carregar solicitações do localStorage
  const loadSolicitacoes = () => {
    try {
      const stored = localStorage.getItem('transpjardim-solicitacoes-cadastro');
      if (stored) {
        const todasSolicitacoes = JSON.parse(stored);
        // Mostrar apenas as pendentes
        setSolicitacoes(todasSolicitacoes.filter((s: SolicitacaoCadastro) => s.status === 'pendente'));
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const handleAbrirDialogoAprovar = (solicitacao: SolicitacaoCadastro) => {
    setSolicitacaoEditando(solicitacao);
    setUsuarioNome(solicitacao.nome);
    setUsuarioEmail(solicitacao.email);
    setUsuarioSecretaria(solicitacao.secretaria);
    // Gerar username baseado no nome
    const usernameGerado = solicitacao.nome.toLowerCase().replace(/\s+/g, '.');
    setUsuarioUsername(usernameGerado);
    // Gerar senha padrão
    setUsuarioSenha('123');
    setIsAprovarDialogOpen(true);
  };

  const handleAprovar = () => {
    if (!solicitacaoEditando) return;

    // Validações
    if (!usuarioNome || !usuarioUsername || !usuarioEmail || !usuarioSecretaria || !usuarioSenha) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuarioEmail)) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    setLoading(true);

    try {
      // Criar o novo usuário
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: usuarioNome,
        username: usuarioUsername,
        email: usuarioEmail,
        role: 'padrão',
        secretaria: usuarioSecretaria,
        dataCriacao: new Date().toISOString()
      };

      // Adicionar aos usuários dinâmicos
      const existingDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
      const dynamicUsers = existingDynamicUsers ? JSON.parse(existingDynamicUsers) : [];
      dynamicUsers.push(newUser);
      localStorage.setItem('transpjardim_dynamic_users', JSON.stringify(dynamicUsers));

      // Persistir senha
      const userPasswords = JSON.parse(localStorage.getItem('transpjardim_user_passwords') || '{}');
      userPasswords[usuarioUsername] = usuarioSenha;
      localStorage.setItem('transpjardim_user_passwords', JSON.stringify(userPasswords));

      // Atualizar status da solicitação
      const stored = localStorage.getItem('transpjardim-solicitacoes-cadastro');
      if (stored) {
        const todasSolicitacoes = JSON.parse(stored);
        const updated = todasSolicitacoes.map((s: SolicitacaoCadastro) =>
          s.id === solicitacaoEditando.id
            ? {
                ...s,
                status: 'aprovada' as const,
                dataResposta: new Date().toISOString(),
                respondidoPor: currentUserId
              }
            : s
        );
        localStorage.setItem('transpjardim-solicitacoes-cadastro', JSON.stringify(updated));
      }

      toast.success(`✅ Usuário "${usuarioUsername}" criado com sucesso!`, {
        description: `Senha: ${usuarioSenha}`
      });

      // Limpar e fechar
      setIsAprovarDialogOpen(false);
      setSolicitacaoEditando(null);
      loadSolicitacoes();
      
      console.log('✅ Chamando callback onUsuarioCriado para recarregar lista de usuários...');
      if (onUsuarioCriado) {
        onUsuarioCriado();
      }
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleRejeitar = (solicitacao: SolicitacaoCadastro) => {
    if (!confirm(`Tem certeza que deseja rejeitar a solicitação de "${solicitacao.nome}"?`)) {
      return;
    }

    try {
      const stored = localStorage.getItem('transpjardim-solicitacoes-cadastro');
      if (stored) {
        const todasSolicitacoes = JSON.parse(stored);
        const updated = todasSolicitacoes.map((s: SolicitacaoCadastro) =>
          s.id === solicitacao.id
            ? {
                ...s,
                status: 'rejeitada' as const,
                dataResposta: new Date().toISOString(),
                respondidoPor: currentUserId
              }
            : s
        );
        localStorage.setItem('transpjardim-solicitacoes-cadastro', JSON.stringify(updated));
      }

      toast.success('Solicitação rejeitada');
      loadSolicitacoes();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {solicitacoes.length === 0 ? (
        <Alert>
          <AlertDescription className="text-center py-8">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma solicitação de cadastro pendente</p>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>{solicitacoes.length}</strong> solicitação{solicitacoes.length > 1 ? 'ões' : ''} pendente{solicitacoes.length > 1 ? 's' : ''} de análise
            </AlertDescription>
          </Alert>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((solicitacao) => (
                  <TableRow key={solicitacao.id}>
                    <TableCell className="font-medium">{solicitacao.nome}</TableCell>
                    <TableCell className="text-sm text-blue-600">{solicitacao.email}</TableCell>
                    <TableCell>
                      <span className="text-sm">{solicitacao.secretaria}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatarData(solicitacao.dataSolicitacao)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAbrirDialogoAprovar(solicitacao)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejeitar(solicitacao)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Dialog de Aprovar */}
      <Dialog open={isAprovarDialogOpen} onOpenChange={setIsAprovarDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Aprovar Solicitação de Cadastro</DialogTitle>
            <DialogDescription>
              Revise e edite os dados do usuário antes de aprovar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aprovarnome">Nome Completo</Label>
              <Input
                id="aprovarnome"
                value={usuarioNome}
                onChange={(e) => setUsuarioNome(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprovarusername">Nome de Usuário</Label>
              <Input
                id="aprovarusername"
                value={usuarioUsername}
                onChange={(e) => setUsuarioUsername(e.target.value)}
                placeholder="nome.sobrenome"
                required
              />
              <p className="text-xs text-muted-foreground">
                Este será o login do usuário
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprovaremail">E-mail</Label>
              <Input
                id="aprovaremail"
                type="email"
                value={usuarioEmail}
                onChange={(e) => setUsuarioEmail(e.target.value)}
                placeholder="email@jardim.ce.gov.br"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprovarsecretaria">Secretaria</Label>
              <Select
                value={usuarioSecretaria}
                onValueChange={(value) => setUsuarioSecretaria(value)}
              >
                <SelectTrigger id="aprovarsecretaria">
                  <SelectValue placeholder="Selecione a secretaria" />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprovarsenha">Senha</Label>
              <div className="relative">
                <Input
                  id="aprovarsenha"
                  type={showPassword ? "text" : "password"}
                  value={usuarioSenha}
                  onChange={(e) => setUsuarioSenha(e.target.value)}
                  placeholder="Senha inicial"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O usuário deverá alterar a senha no primeiro acesso
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAprovarDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAprovar}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};