import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Mail, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';

interface ResendTestModeInfoProps {
  authorizedEmail?: string;
  onDismiss?: () => void;
}

export function ResendTestModeInfo({ authorizedEmail, onDismiss }: ResendTestModeInfoProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-900">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Modo de Teste Ativo</span>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Resend Test Mode
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-300 bg-blue-100">
          <CheckCircle className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-900">✅ API Key Configurada com Sucesso!</AlertTitle>
          <AlertDescription className="text-blue-800">
            {authorizedEmail ? (
              <p>
                Sua conta está em <strong>modo de teste</strong>. 
                E-mails serão enviados apenas para: <strong>{authorizedEmail}</strong>
              </p>
            ) : (
              <p>
                Sua conta está em <strong>modo de teste</strong>. 
                E-mails serão enviados apenas para o e-mail cadastrado no Resend.
              </p>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-blue-900 font-medium">
            📧 O que isso significa?
          </p>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>
              <strong>Modo de teste:</strong> O Resend só permite enviar e-mails para o e-mail usado no cadastro
            </li>
            <li>
              <strong>Sistema funcionando:</strong> Sua API Key está válida e o sistema pode enviar e-mails
            </li>
            <li>
              <strong>Redirecionamento automático:</strong> Todos os alertas serão enviados para {authorizedEmail || 'seu e-mail'} 
            </li>
          </ul>
        </div>

        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-700" />
          <AlertTitle className="text-yellow-900">Para Enviar para Qualquer E-mail:</AlertTitle>
          <AlertDescription className="text-yellow-800">
            <div className="space-y-2 mt-2">
              <p className="font-medium">Você precisa verificar um domínio no Resend:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Acesse o dashboard do Resend</li>
                <li>Vá em <strong>"Domains"</strong></li>
                <li>Adicione o domínio <code className="bg-yellow-100 px-1 rounded">transpjardim.tech</code></li>
                <li>Configure os registros DNS (SPF, DKIM, DMARC)</li>
                <li>Aguarde a verificação (até 48h)</li>
              </ol>
              
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-yellow-400 hover:bg-yellow-100"
                onClick={() => window.open('https://resend.com/domains', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Configurar Domínio no Resend
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900 font-medium mb-2">
            ✅ Por Enquanto, o Sistema Funciona Perfeitamente!
          </p>
          <p className="text-xs text-green-800">
            Em modo de teste, todos os alertas serão enviados para {authorizedEmail || 'seu e-mail de cadastro'}. 
            Isso é útil para testar e garantir que tudo está funcionando antes de configurar o domínio.
          </p>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-700 hover:bg-blue-100"
            onClick={onDismiss}
          >
            Entendi, fechar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
