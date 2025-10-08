import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log(`🔐 Tentando login: ${username}`);
      const success = await login(username, password);
      
      if (!success) {
        console.log(`❌ Login falhou para: ${username}`);
        
        // Verificar se o usuário existe mas a senha está errada
        const { mockUsers } = await import('../lib/mockData');
        
        // Verificar usuários dinâmicos
        let dynamicUsers: any[] = [];
        try {
          const storedDynamicUsers = localStorage.getItem('transpjardim_dynamic_users');
          if (storedDynamicUsers) {
            dynamicUsers = JSON.parse(storedDynamicUsers);
          }
        } catch (error) {
          console.warn('Erro ao verificar usuários dinâmicos:', error);
        }
        
        const allUsers = [...mockUsers, ...dynamicUsers];
        const userExists = allUsers.find(u => u.username === username);
        
        if (userExists) {
          setError(`Senha incorreta para "${username}". Tente "123" ou consulte o administrador.`);
        } else {
          setError(`Usuário "${username}" não encontrado. Use uma das credenciais de teste abaixo ou peça para o administrador criar sua conta.`);
        }
      } else {
        console.log(`✅ Login bem-sucedido para: ${username}`);
      }
    } catch (err) {
      console.error('❌ Erro crítico no login:', err);
      setError('Erro interno do sistema. Tente uma das credenciais de teste.');
    } finally {
      setLoading(false);
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
              💡 Entre em contato com a administração para obter suas credenciais de acesso
            </p>
            
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
                      setError('Erro ao inicializar sistema. Use as credenciais de teste.');
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
            
            <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border">
              <p className="font-medium text-blue-800 mb-1">📋 Credenciais de Teste:</p>
              <div className="space-y-1 text-blue-700">
                <p><strong>Admin:</strong> admin / admin</p>
                <p><strong>Educação:</strong> educacao / 123</p>
                <p><strong>Saúde:</strong> saude / 123</p>
                <p><strong>Obras:</strong> obras / 123</p>
                <p><strong>Francisco:</strong> franciscosavio / 123</p>
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ Sistema funciona online e offline
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};