import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function SimpleEmailDebug() {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    if (!testEmail) {
      setResult({
        success: false,
        error: 'Digite um e-mail para teste'
      });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      console.log('🧪 [SimpleEmailDebug] Iniciando teste de e-mail para:', testEmail);
      
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-225e1157/email/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ testEmail })
        }
      );

      console.log('📡 [SimpleEmailDebug] Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 [SimpleEmailDebug] Response data:', data);

      setResult({
        success: response.ok,
        status: response.status,
        ...data
      });

    } catch (error) {
      console.error('❌ [SimpleEmailDebug] Erro no teste:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        exception: error
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-semibold">Teste Simples de E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Diagnóstico detalhado da configuração de e-mail
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="seu@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={testing}
            className="flex-1"
          />
          <Button
            onClick={handleTest}
            disabled={testing || !testEmail}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Testar
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 mt-4">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">✅ Teste Bem-Sucedido!</AlertTitle>
                <AlertDescription className="text-green-700 space-y-2">
                  <p className="font-semibold">{result.message}</p>
                  {result.emailId && (
                    <p className="text-sm">📧 ID do e-mail: <code className="bg-green-100 px-1 rounded">{result.emailId}</code></p>
                  )}
                  {result.testMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                      <p className="text-sm text-blue-800">
                        <strong>🧪 Modo Teste Ativo</strong>
                      </p>
                      <p className="text-sm text-blue-700">
                        E-mail autorizado: <strong>{result.authorizedEmail}</strong>
                      </p>
                      {result.note && (
                        <p className="text-xs text-blue-600 mt-1">{result.note}</p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">❌ Erro no Teste</AlertTitle>
                <AlertDescription className="text-red-700 space-y-2">
                  <p className="font-semibold">{result.error}</p>
                  
                  {result.status && (
                    <p className="text-sm">Status HTTP: <code className="bg-red-100 px-1 rounded">{result.status}</code></p>
                  )}
                  
                  {result.errorType && (
                    <p className="text-sm">Tipo: <code className="bg-red-100 px-1 rounded">{result.errorType}</code></p>
                  )}
                  
                  {result.details && (
                    <div className="bg-white border border-red-200 rounded p-2 mt-2">
                      <p className="text-xs font-mono text-red-800">{result.details}</p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="text-sm font-semibold text-yellow-900 mb-1">💡 Possíveis soluções:</p>
                    <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                      <li>Verifique se a RESEND_API_KEY está configurada corretamente</li>
                      <li>Certifique-se de que a API Key começa com "re_"</li>
                      <li>Verifique se a API Key não expirou</li>
                      <li>Consulte os logs do navegador (F12) para mais detalhes</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Debug Information */}
            <details className="bg-gray-50 border border-gray-200 rounded p-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                🔍 Ver Detalhes Técnicos
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
          <p>💡 <strong>Dica:</strong> Verifique o console do navegador (F12) para logs detalhados</p>
        </div>
      </div>
    </Card>
  );
}
