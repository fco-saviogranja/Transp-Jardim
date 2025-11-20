import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../hooks/useAuth';
import { AutoInitializer } from './AutoInitializer';
import { JardimLogo } from './JardimLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoRedonda from 'figma:asset/f6a9869d371560fae8a34486a3ae60bdf404d376.png';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  // Estado para o modal de cadastro
  const [showCadastro, setShowCadastro] = useState(false);
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroEmail, setCadastroEmail] = useState('');
  const [cadastroSecretaria, setCadastroSecretaria] = useState('');
  const [cadastroLoading, setCadastroLoading] = useState(false);
  const [cadastroSuccess, setCadastroSuccess] = useState(false);
  
  // Lista de secretarias
  const secretarias = [
    'Secretaria de Educação',
    'Secretaria de Saúde',
    'Secretaria de Obras e Infraestrutura',
    'Secretaria de Meio Ambiente',
    'Secretaria de Habitação e Desenvolvimento Social',
    'Secretaria de Agricultura e Desenvolvimento Rural',
    'Secretaria de Administração e Finanças',
    'Secretaria de Cultura, Esporte e Lazer'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log(`🔐 Tentando login: ${username}`);
      const success = await login(username, password);
      
      if (!success) {
        console.log(`❌ Login falhou para: ${username}`);
        setError(`Usuário ou senha incorretos. Se você ainda não tem acesso, clique em "Cadastrar" abaixo.`);
      } else {
        console.log(`✅ Login bem-sucedido para: ${username}`);
      }
    } catch (err) {
      console.error('❌ Erro crítico no login:', err);
      setError('Erro interno do sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroLoading(true);
    
    try {
      // Validar campos
      if (!cadastroNome || !cadastroEmail || !cadastroSecretaria) {
        const { toast } = await import('sonner@2.0.3');
        toast.error('Por favor, preencha todos os campos');
        setCadastroLoading(false);
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cadastroEmail)) {
        const { toast } = await import('sonner@2.0.3');
        toast.error('Por favor, insira um e-mail válido');
        setCadastroLoading(false);
        return;
      }
      
      // Criar solicitação de cadastro
      const { SolicitacaoCadastro } = await import('../types');
      const novaSolicitacao = {
        id: `sol_${Date.now()}`,
        nome: cadastroNome,
        email: cadastroEmail,
        secretaria: cadastroSecretaria,
        status: 'pendente' as const,
        dataSolicitacao: new Date().toISOString()
      };
      
      // Salvar no localStorage
      const solicitacoesExistentes = localStorage.getItem('transpjardim-solicitacoes-cadastro');
      const solicitacoes = solicitacoesExistentes ? JSON.parse(solicitacoesExistentes) : [];
      solicitacoes.push(novaSolicitacao);
      localStorage.setItem('transpjardim-solicitacoes-cadastro', JSON.stringify(solicitacoes));
      
      setCadastroSuccess(true);
      const { toast } = await import('sonner@2.0.3');
      toast.success('✅ Solicitação enviada com sucesso!', {
        description: 'Sua solicitação foi enviada para a administração. Você receberá suas credenciais por e-mail em breve.'
      });
      
      // Limpar campos
      setCadastroNome('');
      setCadastroEmail('');
      setCadastroSecretaria('');
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        setShowCadastro(false);
        setCadastroSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar cadastro:', error);
      const { toast } = await import('sonner@2.0.3');
      toast.error('Erro ao enviar solicitação', {
        description: 'Por favor, tente novamente ou entre em contato com a administração.'
      });
    } finally {
      setCadastroLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--jardim-green-lighter)] to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="jardim-header-logo rounded-xl p-3">
              <ImageWithFallback 
                src={logoRedonda}
                alt="Prefeitura de Jardim - CE"
                className="w-16 h-16 object-contain rounded-xl"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(74, 124, 89, 0.1)) brightness(1.05) contrast(1.05)',
                  background: 'transparent'
                }}
              />
            </div>
          </div>
          <CardTitle className="transpjardim-title transpjardim-title-large mb-2">
            TranspJardim
          </CardTitle>
          <CardDescription className="text-[var(--jardim-gray)]">
            Plataforma de Transparência - Prefeitura de Jardim/CE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status do Sistema */}
          <div className="mb-6">
            <AutoInitializer />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)] text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-[var(--jardim-gray)]">
              Ainda não tem acesso ao sistema?
            </p>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full border-[var(--jardim-green)] text-[var(--jardim-green)] hover:bg-[var(--jardim-green-lighter)]"
              onClick={() => setShowCadastro(true)}
            >
              Cadastrar
            </Button>
            
            {error?.includes('inicialização') && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800 mb-2">
                  ⚠️ Sistema precisa ser inicializado
                </p>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-225e1157/init-data`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        }
                      });
                      
                      if (response.ok) {
                        setError('');
                        const { toast } = await import('sonner@2.0.3');
                        toast.success('✅ Sistema inicializado! Tente fazer login novamente.');
                      } else {
                        throw new Error('Falha na inicialização');
                      }
                    } catch (err) {
                      setError('Erro ao inicializar sistema.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Inicializando...' : 'Inicializar Sistema'}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de Cadastro */}
      <Dialog open={showCadastro} onOpenChange={setShowCadastro}>
        <DialogTrigger className="hidden">Abrir Modal de Cadastro</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastre-se</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para solicitar acesso ao sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cadastroNome">Nome Completo</Label>
              <Input
                id="cadastroNome"
                type="text"
                value={cadastroNome}
                onChange={(e) => setCadastroNome(e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cadastroEmail">E-mail</Label>
              <Input
                id="cadastroEmail"
                type="email"
                value={cadastroEmail}
                onChange={(e) => setCadastroEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cadastroSecretaria">Secretaria</Label>
              <Select
                value={cadastroSecretaria}
                onValueChange={(value) => setCadastroSecretaria(value)}
                required
              >
                <SelectTrigger id="cadastroSecretaria">
                  <SelectValue placeholder="Selecione a secretaria">
                    {cadastroSecretaria}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map(secretaria => (
                    <SelectItem key={secretaria} value={secretaria}>
                      {secretaria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cadastroSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✅ Solicitação enviada com sucesso!
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[var(--jardim-green)] hover:bg-[var(--jardim-green-light)] text-white"
              disabled={cadastroLoading}
            >
              {cadastroLoading ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowCadastro(false)}
            >
              Cancelar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};