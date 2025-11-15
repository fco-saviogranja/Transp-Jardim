import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { Key, CheckCircle, XCircle, AlertTriangle, Mail, ExternalLink, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ResendTestModeInfo } from './ResendTestModeInfo';

export function EmailConfigSimple() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [testModeInfo, setTestModeInfo] = useState<{ authorizedEmail?: string } | null>(null);

  const handleConfigure = async () => {
    // Validações
    if (!apiKey.trim()) {
      toast.error('Digite sua API Key do Resend');
      return;
    }

    if (!apiKey.startsWith('re_')) {
      toast.error('API Key do Resend deve começar com "re_"');
      setErrorMessage('A API Key deve começar com "re_"');
      setStatus('error');
      return;
    }

    if (apiKey.length < 32) {
      toast.error('API Key muito curta. Deve ter pelo menos 32 caracteres.');
      setErrorMessage('A API Key deve ter pelo menos 32 caracteres');
      setStatus('error');
      return;
    }

    setIsConfiguring(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      console.log('🔧 Iniciando configuração da API Key...');
      
      // Pegar as informações do Supabase
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Primeiro, salvar a API Key no servidor
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/save-api-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            apiKey: apiKey,
          }),
          signal: AbortSignal.timeout(15000), // 15 segundos de timeout
        }
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok || !saveData.success) {
        throw new Error(saveData.error || 'Erro ao salvar API Key');
      }

      // Sucesso ao salvar!
      setStatus('success');
      setApiKey(''); // Limpar por segurança
      
      // Verificar se está em modo de teste
      if (saveData.testMode && saveData.authorizedEmail) {
        toast.success('✅ API Key configurada com sucesso!', {
          description: `Modo de teste ativo. E-mails serão enviados para: ${saveData.authorizedEmail}`,
          duration: 8000,
        });
        
        toast.info('📧 Modo de Teste do Resend', {
          description: 'Para enviar e-mails para qualquer destinatário, verifique seu domínio no Resend.',
          duration: 10000,
        });
        
        setTestModeInfo({ authorizedEmail: saveData.authorizedEmail });
      } else {
        toast.success('✅ API Key configurada com sucesso!', {
          description: 'O sistema de e-mail está funcionando.',
          duration: 5000,
        });
      }

      // Sugerir recarregar a página
      setTimeout(() => {
        toast.info('💡 Recarregue a página para aplicar as mudanças', {
          action: {
            label: 'Recarregar',
            onClick: () => window.location.reload(),
          },
          duration: 10000,
        });
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao configurar API Key:', error);
      setStatus('error');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          setErrorMessage('Tempo esgotado. Verifique sua conexão e tente novamente.');
          toast.error('Timeout na configuração');
        } else if (error.message.includes('API')) {
          setErrorMessage(error.message);
          toast.error('API Key inválida', {
            description: error.message,
          });
        } else {
          setErrorMessage('Erro ao conectar com o servidor. Verifique sua conexão.');
          toast.error('Erro de conexão');
        }
      } else {
        setErrorMessage('Erro desconhecido. Tente novamente.');
        toast.error('Erro desconhecido');
      }
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfigure();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Título */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <Mail className="h-8 w-8 text-[var(--jardim-green)]" />
          <h2 className="text-3xl font-bold text-[var(--jardim-green)]">
            Configurar E-mail
          </h2>
        </div>
        <p className="text-[var(--jardim-gray)]">
          Configure sua API Key do Resend para habilitar alertas automáticos
        </p>
      </div>

      {/* Card de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Key do Resend</span>
          </CardTitle>
          <CardDescription>
            Cole aqui a API Key que você obteve no Resend
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Visual */}
          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Configurado com Sucesso!</AlertTitle>
              <AlertDescription className="text-green-700">
                O sistema de e-mail está funcionando corretamente.
                <br />
                <strong>Recarregue a página</strong> para ver as mudanças.
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Erro na Configuração</AlertTitle>
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">Sua API Key</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isConfiguring}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={isConfiguring}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button 
                onClick={handleConfigure}
                disabled={!apiKey.trim() || isConfiguring}
                className="min-w-[120px]"
              >
                {isConfiguring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Configurar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ✅ Deve começar com "re_" e ter pelo menos 32 caracteres
            </p>
          </div>

          {/* Instruções */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ainda não tem uma API Key?</AlertTitle>
            <AlertDescription>
              <div className="space-y-3 mt-2">
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Acesse <strong>resend.com/signup</strong> e crie uma conta gratuita</li>
                  <li>Faça login e vá em <strong>"API Keys"</strong></li>
                  <li>Clique em <strong>"Create API Key"</strong></li>
                  <li>Dê um nome (ex: "TranspJardim")</li>
                  <li>Copie a chave gerada e cole acima</li>
                </ol>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://resend.com/signup', '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Criar Conta
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://resend.com/api-keys', '_blank')}
                  >
                    <Key className="h-3 w-3 mr-2" />
                    Gerar API Key
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Informações Adicionais */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  💰 Plano Gratuito do Resend
                </p>
                <ul className="text-xs text-blue-800 space-y-0.5">
                  <li>✅ 3.000 e-mails por mês</li>
                  <li>✅ 100 e-mails por dia</li>
                  <li>✅ Sem cartão de crédito</li>
                  <li>✅ Mais que suficiente para TranspJardim</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">❓ Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium text-sm">O que é a API Key?</p>
            <p className="text-sm text-muted-foreground">
              É uma chave de acesso que permite o TranspJardim enviar e-mails através do Resend.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-sm">É seguro?</p>
            <p className="text-sm text-muted-foreground">
              Sim! A API Key é enviada diretamente para o servidor e armazenada de forma segura.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-sm">E se eu errar a API Key?</p>
            <p className="text-sm text-muted-foreground">
              Sem problema! Você pode configurar novamente quantas vezes precisar.
            </p>
          </div>

          <div>
            <p className="font-medium text-sm">Preciso recarregar a página?</p>
            <p className="text-sm text-muted-foreground">
              Sim, após configurar com sucesso, recarregue a página para aplicar as mudanças.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Modo de Teste */}
      {testModeInfo && (
        <ResendTestModeInfo authorizedEmail={testModeInfo.authorizedEmail} />
      )}
    </div>
  );
}