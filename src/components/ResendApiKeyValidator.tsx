import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function ResendApiKeyValidator() {
  const [apiKey, setApiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Digite uma API Key para validar');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // Validação de formato
      if (!apiKey.startsWith('re_')) {
        setValidationResult({
          valid: false,
          message: 'Formato Inválido',
          details: 'A API Key do Resend deve começar com "re_"'
        });
        setValidating(false);
        return;
      }

      if (apiKey.length < 32) {
        setValidationResult({
          valid: false,
          message: 'API Key Muito Curta',
          details: 'A API Key deve ter pelo menos 32 caracteres'
        });
        setValidating(false);
        return;
      }

      // Testar com a API do Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ['test@test.local'], // E-mail inválido de propósito
          subject: 'Validation Test',
          html: '<p>Test</p>',
        }),
      });

      const contentType = response.headers.get('content-type');
      
      // Se retornar HTML, a API Key é inválida
      if (contentType && !contentType.includes('application/json')) {
        const htmlResponse = await response.text();
        
        if (htmlResponse.includes('<!DOCTYPE') || htmlResponse.includes('<html')) {
          setValidationResult({
            valid: false,
            message: 'API Key Inválida',
            details: 'O Resend retornou HTML em vez de JSON. A API Key está incorreta ou expirada.'
          });
          setValidating(false);
          return;
        }
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        setValidationResult({
          valid: false,
          message: 'Erro ao Validar',
          details: 'Não foi possível processar a resposta do Resend'
        });
        setValidating(false);
        return;
      }

      // Análise do resultado
      if (response.status === 401) {
        setValidationResult({
          valid: false,
          message: 'API Key Inválida ou Expirada',
          details: 'O Resend rejeitou a API Key. Ela pode estar incorreta ou expirada.'
        });
      } else if (response.status === 422) {
        // Erro de validação é esperado (e-mail inválido), mas API Key funciona
        setValidationResult({
          valid: true,
          message: 'API Key Válida! ✅',
          details: 'A API Key foi aceita pelo Resend e está funcionando corretamente.'
        });
      } else if (response.status === 403) {
        // API Key válida, mas pode estar em modo teste
        if (result.message && result.message.includes('testing emails')) {
          setValidationResult({
            valid: true,
            message: 'API Key Válida (Modo Teste) ⚠️',
            details: 'A API Key funciona, mas está em modo teste. E-mails só podem ser enviados para seu e-mail cadastrado no Resend.'
          });
        } else {
          setValidationResult({
            valid: true,
            message: 'API Key Válida ✅',
            details: 'A API Key foi aceita pelo Resend.'
          });
        }
      } else if (response.ok) {
        setValidationResult({
          valid: true,
          message: 'API Key Válida! ✅',
          details: 'A API Key foi aceita pelo Resend e está funcionando corretamente.'
        });
      } else {
        setValidationResult({
          valid: false,
          message: 'Erro Desconhecido',
          details: `Código HTTP ${response.status}: ${result.message || 'Erro desconhecido'}`
        });
      }

    } catch (error) {
      console.error('Erro ao validar API Key:', error);
      setValidationResult({
        valid: false,
        message: 'Erro de Conexão',
        details: error instanceof Error ? error.message : 'Não foi possível conectar ao Resend'
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          Validador de API Key do Resend
        </CardTitle>
        <CardDescription>
          Verifique se sua API Key do Resend está correta e funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key do Resend</label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="re_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={validateApiKey}
              disabled={validating || !apiKey.trim()}
              className="gap-2"
            >
              {validating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Validar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Cole sua API Key do Resend para validar. Ela não será salva automaticamente.
          </p>
        </div>

        {/* Resultado da Validação */}
        {validationResult && (
          <Alert className={validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {validationResult.valid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle className={validationResult.valid ? 'text-green-900' : 'text-red-900'}>
              {validationResult.message}
            </AlertTitle>
            <AlertDescription className={validationResult.valid ? 'text-green-700' : 'text-red-700'}>
              {validationResult.details}
            </AlertDescription>
          </Alert>
        )}

        {/* Informações Adicionais */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Como Obter uma API Key</AlertTitle>
          <AlertDescription className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Acesse <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com/api-keys</a></li>
              <li>Clique em "Create API Key"</li>
              <li>Dê um nome (ex: "TranspJardim")</li>
              <li>Defina permissões como "Sending access"</li>
              <li>Clique em "Add"</li>
              <li>Copie a API Key (começa com "re_")</li>
            </ol>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 mt-3"
              onClick={() => window.open('https://resend.com/api-keys', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Painel do Resend
            </Button>
          </AlertDescription>
        </Alert>

        {/* Possíveis Problemas */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">❌ Possíveis Problemas</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">API Key Expirada</p>
                <p className="text-xs text-muted-foreground">
                  Solução: Gere uma nova API Key no painel do Resend
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">API Key Incorreta</p>
                <p className="text-xs text-muted-foreground">
                  Solução: Copie novamente a API Key do painel, garantindo que pegou tudo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Espaços ou Caracteres Extras</p>
                <p className="text-xs text-muted-foreground">
                  Solução: Certifique-se de que não há espaços antes ou depois da API Key
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <p className="font-medium">Permissões Insuficientes</p>
                <p className="text-xs text-muted-foreground">
                  Solução: A API Key precisa ter permissão de "Sending access"
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
