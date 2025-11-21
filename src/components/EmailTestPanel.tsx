import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Mail, Send, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { emailService, sendTestEmail } from '../lib/emailService';
import { useEmailDebouncer } from '../hooks/useEmailDebouncer';

interface EmailTestResult {
  success: boolean;
  emailId?: string;
  message?: string;
  error?: string;
  timestamp: string;
  testMode?: boolean;
  authorizedEmail?: string;
  note?: string;
}

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<EmailTestResult | null>(null);
  const { state: debouncerState, executeWithDebounce } = useEmailDebouncer();

  const handleQuickTest = async () => {
    if (!testEmail) {
      toast.error('Digite um e-mail para teste');
      return;
    }

    if (!emailService.isValidEmail(testEmail)) {
      toast.error('Digite um e-mail válido');
      return;
    }

    setIsTesting(true);
    setLastResult(null);

    // 🆕 Verificar se a Edge Function existe ANTES de tentar enviar
    const availability = await emailService.checkEdgeFunctionAvailability();
    
    if (!availability.available) {
      setIsTesting(false);
      
      const errorResult: EmailTestResult = {
        success: false,
        error: '⚠️ A Edge Function ainda não foi criada no Supabase',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(errorResult);
      
      toast.error('Edge Function não configurada', {
        description: 'Siga o guia "Configuração Necessária" acima para criar a Edge Function no Supabase.'
      });
      
      return;
    }

    await executeWithDebounce(
      async () => {
        console.log('🧪 [EmailTestPanel] Iniciando teste rápido de e-mail...');
        return await sendTestEmail(testEmail);
      },
      (result) => {
        // Sucesso
        const testResult: EmailTestResult = {
          success: true,
          emailId: result.emailId,
          message: result.message,
          testMode: result.testMode,
          authorizedEmail: result.authorizedEmail,
          note: result.note,
          timestamp: new Date().toISOString()
        };
        
        setLastResult(testResult);
        
        if (result.testMode) {
          toast.success(`✅ API Key configurada corretamente!`);
          toast.info(`📧 Modo de teste: E-mails enviados para ${result.authorizedEmail}`);
        } else {
          toast.success(`✅ E-mail enviado para ${testEmail}!`);
        }
        
        console.log('✅ [EmailTestPanel] Teste concluído com sucesso:', result);
      },
      (error) => {
        // Erro (apenas para erros que não são de rate limit/debounce)
        if (!error.message.includes('rate limit') && !error.message.includes('Aguarde')) {
          console.error('❌ [EmailTestPanel] Erro no teste:', error);
          
          const testResult: EmailTestResult = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          };
          
          setLastResult(testResult);
          
          // Mensagem amigável para erro de conectividade
          if (error.message.includes('conectividade')) {
            toast.error('Não foi possível conectar', {
              description: 'Verifique se a Edge Function foi criada no Supabase.'
            });
          } else {
            toast.error('Erro ao enviar e-mail', {
              description: error.message
            });
          }
        }
      }
    );
    
    setIsTesting(false);
  };

  const handleTestAlert = async () => {
    setIsTesting(true);
    
    try {
      console.log('🚨 [EmailTestPanel] Testando alerta de exemplo...');
      
      const mockEmailData = {
        to: testEmail,
        subject: emailService.generateEmailSubject('urgent', 'Teste de Critério'),
        alertType: 'urgent' as const,
        criterio: {
          id: 'test-001',
          nome: 'Critério de Teste - Sistema de E-mail',
          secretaria: 'Controladoria Municipal'
        },
        usuario: {
          id: 'test-user',
          name: 'Teste TranspJardim'
        },
        dueDate: new Date().toISOString()
      };
      
      const result = await emailService.sendAlert(mockEmailData);
      
      const testResult: EmailTestResult = {
        success: true,
        emailId: result.emailId,
        message: 'Alerta de teste enviado com sucesso',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.success(`🚨 Alerta de teste enviado para ${testEmail}!`);
      
      console.log('✅ [EmailTestPanel] Alerta de teste enviado:', result);
      
    } catch (error) {
      console.error('❌ [EmailTestPanel] Erro no teste de alerta:', error);
      
      const testResult: EmailTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      };
      
      setLastResult(testResult);
      toast.error(`❌ Falha no teste de alerta: ${testResult.error}`);
      
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <span>Teste Rápido de E-mail</span>
        </CardTitle>
        <CardDescription>
          Teste o sistema de e-mail para verificar se está funcionando corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Banner de modo simulação */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">✅ Sistema Pronto para Testes</AlertTitle>
          <AlertDescription className="text-green-800">
            <p className="mb-2">
              O sistema está em <strong>modo de simulação</strong>. Você pode testar todas as funcionalidades sem enviar e-mails reais.
            </p>
            <p className="text-xs text-green-700">
              📄 Para ativar envio real de e-mails, consulte o arquivo <code className="bg-green-100 px-1 rounded">CONFIGURAR_EMAIL.md</code>
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="test-email">E-mail de Teste</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="seu-email@exemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isTesting}
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleQuickTest}
            disabled={!testEmail || isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Teste Simples
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleTestAlert}
            disabled={!testEmail || isTesting}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Teste Alerta
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <Alert className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center space-x-2">
              {getStatusIcon(lastResult.success)}
              <AlertTitle>
                {lastResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {lastResult.success ? (
                <div className="space-y-1">
                  <p>{lastResult.message}</p>
                  {lastResult.testMode && lastResult.authorizedEmail && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="text-blue-800">
                        <strong>🧪 Modo de Teste Ativo:</strong> E-mails só podem ser enviados para: {lastResult.authorizedEmail}
                      </p>
                      {lastResult.note && (
                        <p className="text-blue-700 text-xs mt-1">{lastResult.note}</p>
                      )}
                    </div>
                  )}
                  {lastResult.emailId && (
                    <p className="text-sm">
                      <Badge variant="outline">ID: {lastResult.emailId}</Badge>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enviado em: {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-red-700">Erro: {lastResult.error}</p>
                  <p className="text-xs text-muted-foreground">
                    Falhou em: {new Date(lastResult.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p><strong>Teste Simples:</strong> Envia um e-mail básico de verificação</p>
          <p><strong>Teste Alerta:</strong> Envia um e-mail formatado como alerta do sistema</p>
          <p><strong>Nota:</strong> Verifique sua caixa de entrada e pasta de spam</p>
        </div>
      </CardContent>
    </Card>
  );
}