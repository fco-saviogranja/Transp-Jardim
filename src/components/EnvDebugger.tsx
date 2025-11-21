import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export function EnvDebugger() {
  // Tentar ler a variável de várias formas
  const viteEmailEnabled = import.meta.env?.VITE_EMAIL_ENABLED;
  const allEnvVars = import.meta.env;
  
  console.log('🔍 [EnvDebugger] VITE_EMAIL_ENABLED:', viteEmailEnabled);
  console.log('🔍 [EnvDebugger] Todas as variáveis:', allEnvVars);
  
  const isEnabled = viteEmailEnabled === 'true';
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Debug de Variáveis de Ambiente
        </CardTitle>
        <CardDescription>
          Verificando se o .env está sendo lido corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal */}
        <Alert variant={isEnabled ? 'default' : 'destructive'}>
          <div className="flex items-center gap-3">
            {isEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong>VITE_EMAIL_ENABLED:</strong>
                <Badge variant={isEnabled ? 'default' : 'destructive'}>
                  {viteEmailEnabled || 'undefined'}
                </Badge>
              </div>
              <AlertDescription className="mt-1">
                {isEnabled 
                  ? '✅ E-mails habilitados (modo REAL)'
                  : '❌ Sistema em modo SIMULAÇÃO'
                }
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Detalhes Técnicos */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Detalhes Técnicos:</h3>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div>
              <strong>Valor bruto:</strong> "{String(viteEmailEnabled)}"
            </div>
            <div>
              <strong>Tipo:</strong> {typeof viteEmailEnabled}
            </div>
            <div>
              <strong>Comparação estrita:</strong> {String(viteEmailEnabled === 'true')}
            </div>
            <div>
              <strong>Comparação solta:</strong> {String(viteEmailEnabled == 'true')}
            </div>
          </div>
        </div>

        {/* Todas as variáveis VITE_ */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Todas as variáveis VITE_*:</h3>
          <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-40">
            <pre>{JSON.stringify(
              Object.entries(allEnvVars || {})
                .filter(([key]) => key.startsWith('VITE_'))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
              null,
              2
            )}</pre>
          </div>
        </div>

        {/* Instruções */}
        {!isEnabled && (
          <Alert>
            <AlertDescription>
              <strong>Como resolver:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Certifique-se de que existe um arquivo <code>.env</code> na raiz do projeto</li>
                <li>O arquivo deve conter: <code>VITE_EMAIL_ENABLED=true</code></li>
                <li><strong>IMPORTANTE:</strong> Pare o servidor (Ctrl+C) e inicie novamente</li>
                <li>Variáveis de ambiente só são carregadas ao iniciar o servidor</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
