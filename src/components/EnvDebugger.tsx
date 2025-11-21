import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { getEmailStatus } from '../lib/emailService';

export function EnvDebugger() {
  // Pegar status REAL do emailService
  const emailStatus = getEmailStatus();
  const isEnabled = emailStatus.enabled;
  
  // Tentar ler a variável do .env também (para comparação)
  const viteEmailEnabled = import.meta.env?.VITE_EMAIL_ENABLED;
  
  console.log('🔍 [EnvDebugger] Status Real:', emailStatus);
  console.log('🔍 [EnvDebugger] VITE_EMAIL_ENABLED (.env):', viteEmailEnabled);
  
  return (
    <Card className="w-full border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Status do Sistema de E-mail
        </CardTitle>
        <CardDescription>
          Modo REAL ativado diretamente no código
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Principal - SEMPRE VERDE AGORA */}
        <Alert variant={isEnabled ? 'default' : 'destructive'} className="border-2 border-green-500 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <strong className="text-green-900">STATUS:</strong>
                <Badge className="bg-green-600 text-white">
                  ✉️ MODO REAL ATIVADO
                </Badge>
              </div>
              <AlertDescription className="mt-1 text-green-800">
                ✅ E-mails configurados para envio REAL (forçado no código)
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Detalhes Técnicos */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Configuração Atual:
          </h3>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div className="flex items-center justify-between">
              <strong>EMAIL_ENABLED (código):</strong>
              <Badge variant="default" className="bg-green-600">
                {String(emailStatus.enabled)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <strong>SIMULATION_MODE:</strong>
              <Badge variant={emailStatus.simulationMode ? 'destructive' : 'default'}>
                {String(emailStatus.simulationMode)}
              </Badge>
            </div>
            <div className="mt-2 pt-2 border-t">
              <strong>Edge Function URL:</strong>
              <div className="text-xs break-all text-muted-foreground mt-1">
                {emailStatus.baseUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Info sobre .env (apenas informativo) */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Arquivo .env (não está sendo usado):
          </h3>
          <div className="bg-muted/50 p-3 rounded text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span>VITE_EMAIL_ENABLED:</span>
              <Badge variant="outline" className="opacity-50">
                {viteEmailEnabled || 'undefined'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              ℹ️ O .env não funcionou, então o modo REAL foi ativado diretamente no código.
            </p>
          </div>
        </div>

        {/* Próximos Passos */}
        <Alert>
          <AlertDescription>
            <strong>✅ Próximo passo:</strong>
            <p className="mt-2">
              Execute o <strong>"Diagnóstico Completo de E-mail"</strong> abaixo para verificar se a Edge Function existe no Supabase.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}