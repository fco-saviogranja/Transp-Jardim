import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Mail, Server, Key, Send } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

export function EmailDiagnostico() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runFullDiagnostic = async () => {
    setLoading(true);
    setResults([]);

    try {
      // PASSO 1: Verificar variável de ambiente
      addResult({
        step: '1. Variável de Ambiente',
        status: import.meta.env?.VITE_EMAIL_ENABLED === 'true' ? 'success' : 'warning',
        message: import.meta.env?.VITE_EMAIL_ENABLED === 'true' 
          ? 'VITE_EMAIL_ENABLED está ativado' 
          : 'Sistema em modo SIMULAÇÃO (VITE_EMAIL_ENABLED não está true)',
        details: { value: import.meta.env?.VITE_EMAIL_ENABLED }
      });

      // PASSO 2: Verificar URL da Edge Function
      const edgeFunctionUrl = `https://${projectId}.supabase.co/functions/v1/enviar-email`;
      addResult({
        step: '2. URL Edge Function',
        status: 'info',
        message: `URL configurada: ${edgeFunctionUrl}`,
        details: { url: edgeFunctionUrl }
      });

      // PASSO 3: Testar conectividade com Edge Function
      try {
        const testResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            to: email || 'test@example.com',
            subject: '🔍 Diagnóstico TranspJardim',
            message: '<p>E-mail de diagnóstico do sistema</p>'
          })
        });

        const responseText = await testResponse.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }

        if (testResponse.ok) {
          addResult({
            step: '3. Teste de Envio',
            status: 'success',
            message: '✅ Edge Function respondeu com sucesso!',
            details: { 
              status: testResponse.status,
              response: responseData 
            }
          });
        } else {
          addResult({
            step: '3. Teste de Envio',
            status: 'error',
            message: `❌ Edge Function retornou erro (${testResponse.status})`,
            details: { 
              status: testResponse.status,
              statusText: testResponse.statusText,
              response: responseData 
            }
          });
        }
      } catch (error: any) {
        addResult({
          step: '3. Teste de Envio',
          status: 'error',
          message: `❌ Erro ao conectar com Edge Function: ${error.message}`,
          details: { error: error.toString() }
        });
      }

      // PASSO 4: Verificar logs do console
      addResult({
        step: '4. Instruções Finais',
        status: 'info',
        message: 'Abra o Console do Navegador (F12) para ver logs detalhados',
        details: {
          tip: 'Procure por [EmailService] e erros em vermelho'
        }
      });

    } catch (error: any) {
      addResult({
        step: 'Erro Geral',
        status: 'error',
        message: error.message,
        details: { error }
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Server className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Diagnóstico Completo de E-mail
        </CardTitle>
        <CardDescription>
          Ferramenta para identificar problemas no envio de e-mails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="font-medium text-sm">E-mail de Teste (opcional)</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button 
          onClick={runFullDiagnostic} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando Diagnóstico...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Iniciar Diagnóstico Completo
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="font-semibold">Resultados:</h3>
            {results.map((result, index) => (
              <Alert key={index} variant={result.status === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-3">
                  {getIcon(result.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.step}</span>
                      <Badge variant={getBadgeVariant(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <AlertDescription>{result.message}</AlertDescription>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          Ver detalhes técnicos
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>Checklist de Configuração:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>✅ Edge Function criada no Supabase com nome <code>enviar-email</code></li>
              <li>✅ Secrets configurados: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS</li>
              <li>✅ Credenciais SMTP da Hostinger corretas</li>
              <li>✅ E-mail controleinterno@transpjardim.com ativo na Hostinger</li>
              <li>✅ Arquivo .env com VITE_EMAIL_ENABLED=true</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
