import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Mail, ExternalLink, Server, CheckCircle, Info } from 'lucide-react';

/**
 * Componente informativo sobre configuração de e-mail
 * Agora que o sistema usa Hostinger SMTP via Supabase Edge Function,
 * a configuração é feita diretamente no Supabase, não mais no frontend
 */
export function EmailConfigInfo() {
  const openGuide = (fileName: string) => {
    // Abre o arquivo de guia em uma nova aba
    window.open(`/${fileName}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Mail className="h-8 w-8 text-[var(--jardim-green)]" />
            <div>
              <CardTitle className="text-2xl">Configuração de E-mail Hostinger</CardTitle>
              <CardDescription>
                Sistema de e-mail configurado via Supabase Edge Function
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">✨ Nova Configuração</AlertTitle>
        <AlertDescription className="text-blue-800">
          O TranspJardim agora usa <strong>Hostinger SMTP</strong> em vez do Resend.
          A configuração é feita diretamente no Supabase (backend), garantindo maior segurança.
        </AlertDescription>
      </Alert>

      {/* Como Configurar */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Como Configurar</CardTitle>
          <CardDescription>
            Siga estes 3 passos simples para configurar o sistema de e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--jardim-green)] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Criar Edge Function no Supabase</h4>
                <p className="text-sm text-muted-foreground">
                  Execute: <code className="bg-gray-200 px-2 py-1 rounded text-xs">supabase functions new email</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--jardim-green)] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Fazer Deploy do Código</h4>
                <p className="text-sm text-muted-foreground">
                  Copie o código do arquivo <code className="bg-gray-200 px-2 py-1 rounded text-xs">CODIGO_EDGE_FUNCTION_EMAIL.ts</code> e faça deploy
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--jardim-green)] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Configurar Secret SMTP_PASSWORD</h4>
                <p className="text-sm text-muted-foreground">
                  Execute: <code className="bg-gray-200 px-2 py-1 rounded text-xs">supabase secrets set SMTP_PASSWORD="sua-senha"</code>
                </p>
              </div>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50 mt-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Pronto!</strong> Após completar estes 3 passos, o sistema estará configurado e funcionando.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Guias de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Guias de Configuração</CardTitle>
          <CardDescription>
            Acesse os guias detalhados para configurar o sistema de e-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => openGuide('INICIO_RAPIDO_EMAIL.md')}
          >
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>📄 Início Rápido (3 passos)</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => openGuide('GUIA_SIMPLIFICADO_3_PASSOS.md')}
          >
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>📘 Guia Simplificado</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => openGuide('GUIA_VISUAL_CONFIGURACAO_EMAIL.html')}
          >
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>🎨 Guia Visual Interativo (HTML)</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => openGuide('FAQ_EMAIL_HOSTINGER.md')}
          >
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>❓ FAQ - Perguntas Frequentes</span>
            </div>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Servidor SMTP:</span>
              <p className="font-medium">smtp.hostinger.com</p>
            </div>
            <div>
              <span className="text-muted-foreground">Porta:</span>
              <p className="font-medium">465 (SSL)</p>
            </div>
            <div>
              <span className="text-muted-foreground">E-mail Remetente:</span>
              <p className="font-medium">controleinterno@transpjardim.com</p>
            </div>
            <div>
              <span className="text-muted-foreground">Método:</span>
              <p className="font-medium">Supabase Edge Function</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota Final */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota:</strong> A configuração agora é feita no backend (Supabase) por questões de segurança.
          As credenciais SMTP não ficam mais expostas no frontend.
        </AlertDescription>
      </Alert>
    </div>
  );
}
