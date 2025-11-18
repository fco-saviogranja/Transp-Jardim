import { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';
import { AlertCircle, CheckCircle2, ExternalLink, Key, RefreshCw } from 'lucide-react';

export function ResendApiKeyHelper() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    valid: boolean;
    testMode: boolean;
    authorizedEmail?: string;
    error?: string;
  } | null>(null);

  const checkApiKey = async () => {
    setChecking(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/check-config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const result = await response.json();
      
      if (result.configured) {
        setStatus({
          configured: true,
          valid: true,
          testMode: result.testMode || false,
          authorizedEmail: result.authorizedEmail
        });
      } else {
        setStatus({
          configured: false,
          valid: false,
          testMode: false,
          error: result.error
        });
      }
    } catch (error) {
      setStatus({
        configured: false,
        valid: false,
        testMode: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Diagnóstico da API Key do Resend</h3>
              <p className="text-sm text-muted-foreground">
                Verifique o status da configuração de e-mail
              </p>
            </div>
          </div>
          <Button
            onClick={checkApiKey}
            disabled={checking}
            variant="outline"
            size="sm"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Agora
              </>
            )}
          </Button>
        </div>

        {status && (
          <div className="space-y-3 mt-4">
            {status.configured && status.valid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">API Key Configurada!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {status.testMode ? (
                    <div className="space-y-2 mt-2">
                      <p>✅ Sistema funcionando em <strong>modo teste</strong></p>
                      <p className="text-sm">
                        📧 E-mails serão enviados para: <strong>{status.authorizedEmail}</strong>
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        ℹ️ Para enviar para qualquer e-mail, adicione e verifique seu domínio no Resend
                      </p>
                    </div>
                  ) : (
                    <p>✅ Sistema configurado e pronto para enviar e-mails</p>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Problema com API Key</AlertTitle>
                <AlertDescription className="text-red-700">
                  <div className="space-y-3 mt-2">
                    <p>{status.error || 'API Key não configurada ou inválida'}</p>
                    
                    <div className="bg-white border border-red-200 rounded-md p-3 text-sm">
                      <p className="font-semibold text-red-900 mb-2">📋 Como resolver:</p>
                      <ol className="list-decimal list-inside space-y-1 text-red-800">
                        <li>Acesse <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                          resend.com/api-keys <ExternalLink className="h-3 w-3 inline" />
                        </a></li>
                        <li>Crie ou copie uma API Key válida (começa com "re_")</li>
                        <li>Cole a chave no campo RESEND_API_KEY acima</li>
                        <li>Clique em "Verificar Agora" novamente</li>
                      </ol>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                      <p className="font-semibold text-yellow-900 mb-1">⚠️ Importante:</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-800">
                        <li>A API Key deve começar com <code className="bg-yellow-100 px-1 rounded">re_</code></li>
                        <li>Não compartilhe sua API Key</li>
                        <li>Se expirou, gere uma nova no Resend</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!status && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Clique em "Verificar Agora" para diagnosticar a configuração de e-mail
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
