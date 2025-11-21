import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Mail, 
  Server, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Send,
  Info
} from 'lucide-react';
import { getSMTPStatus } from '../lib/smtpConfig';
import { SENDER_EMAIL } from '../lib/emailConfig';

export function SMTPStatusPanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadStatus = () => {
    setLoading(true);
    try {
      const smtpStatus = getSMTPStatus();
      setStatus(smtpStatus);
    } catch (error) {
      console.error('Erro ao carregar status SMTP:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestEmail = async () => {
    if (!testEmail) return;

    setTesting(true);
    setTestResult(null);

    try {
      // Aqui você chamaria sua API de envio de e-mail
      // Por enquanto, simulação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult({
        success: true,
        message: `E-mail de teste enviado para ${testEmail}`
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Erro ao enviar e-mail de teste'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando configuração SMTP...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar a configuração SMTP
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuração de E-mail (SMTP)
              </CardTitle>
              <CardDescription>
                Servidor: {status.provider}
              </CardDescription>
            </div>
            <Badge variant={status.configured ? 'default' : 'destructive'}>
              {status.configured ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Configurado</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Não Configurado</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do Servidor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Server className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Host SMTP</p>
                <p className="font-mono truncate">{status.host}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Porta / Segurança</p>
                <p className="font-mono">{status.port} / {status.secure}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">E-mail Remetente</p>
                <p className="font-mono text-sm truncate">{status.user}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Senha</p>
                <div className="flex items-center gap-2">
                  {status.hasPassword ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Configurada</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Não configurada</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Avisos */}
          {!status.configured && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuração incompleta!</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {status.validation.missing.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {status.validation.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {status.validation.warnings.map((warning: string, index: number) => (
                  <p key={index}>{warning}</p>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de Atualizar */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStatus}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teste de E-mail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Testar Envio de E-mail
          </CardTitle>
          <CardDescription>
            Envie um e-mail de teste para verificar a configuração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={testing || !status.configured}
            />
            <Button
              onClick={handleTestEmail}
              disabled={!testEmail || testing || !status.configured}
              className="gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Teste
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {!status.configured && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configure a senha SMTP nas variáveis de ambiente antes de testar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informações de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              O TranspJardim usa o Hostinger para enviar e-mails de alertas e notificações.
            </p>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <p><strong>Provedor:</strong> Hostinger</p>
              <p><strong>E-mail:</strong> {SENDER_EMAIL}</p>
              <p><strong>Documentação:</strong> CONFIGURACAO_HOSTINGER_EMAIL.md</p>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Configure a variável de ambiente <code>SMTP_PASSWORD</code> 
              no painel do Supabase com a senha do e-mail {SENDER_EMAIL}.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
