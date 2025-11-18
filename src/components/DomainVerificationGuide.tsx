import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, AlertCircle, ExternalLink, Mail, Globe } from "lucide-react";
import { Button } from "./ui/button";

export function DomainVerificationGuide() {
  return (
    <div className="space-y-4">
      {/* Status Atual */}
      <Alert className="border-blue-200 bg-blue-50">
        <Mail className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Configuração Atual de E-mail</AlertTitle>
        <AlertDescription className="text-blue-700 space-y-3">
          <div className="space-y-2">
            <div>
              <p className="font-medium mb-1">✅ Remetente Atual (Funcionando):</p>
              <code className="block bg-white p-2 rounded border text-sm">
                TranspJardim <onboarding@resend.dev>
              </code>
              <p className="text-xs mt-1">
                Domínio padrão do Resend - <strong>verificado e funcional</strong>
              </p>
            </div>

            <div className="border-t border-blue-200 pt-2 mt-2">
              <p className="font-medium mb-1">🎯 E-mail Principal do Sistema:</p>
              <code className="block bg-blue-100 p-2 rounded border border-blue-300 text-sm">
                controleinterno@transpjardim.tech
              </code>
              <p className="text-xs mt-1">
                Para usar este e-mail como remetente, é necessário verificar o domínio no Resend
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Guia de Verificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Como Verificar o Domínio transpjardim.tech
          </CardTitle>
          <CardDescription>
            Siga estes passos para usar seu domínio personalizado como remetente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Passo 1 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600">Passo 1</Badge>
              <span className="font-medium">Acessar Painel do Resend</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Acesse o painel de domínios do Resend
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://resend.com/domains', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir resend.com/domains
            </Button>
          </div>

          {/* Passo 2 */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600">Passo 2</Badge>
              <span className="font-medium">Adicionar Domínio</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Clique em "Add Domain" e digite:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm border">
              transpjardim.tech
            </code>
          </div>

          {/* Passo 3 */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-yellow-600">Passo 3</Badge>
              <span className="font-medium">Configurar Registros DNS</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              O Resend fornecerá 3 registros DNS para adicionar:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-50 p-2 rounded border">
                <span className="font-medium">SPF:</span> Autoriza o Resend a enviar e-mails
              </div>
              <div className="bg-gray-50 p-2 rounded border">
                <span className="font-medium">DKIM:</span> Assina digitalmente os e-mails
              </div>
              <div className="bg-gray-50 p-2 rounded border">
                <span className="font-medium">DMARC:</span> Política de autenticação
              </div>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-600">Passo 4</Badge>
              <span className="font-medium">Aguardar Verificação</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Após adicionar os registros DNS, aguarde alguns minutos (até 48h) para propagação.
              O Resend verificará automaticamente.
            </p>
          </div>

          {/* Passo 5 */}
          <div className="border-l-4 border-emerald-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-600">Passo 5</Badge>
              <span className="font-medium">Sistema Detectará Automaticamente</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Quando o domínio estiver verificado, o sistema começará a usar
              automaticamente <code>controleinterno@transpjardim.tech</code> como remetente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            <strong>Enquanto o domínio não estiver verificado:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li>O sistema continuará usando <code>onboarding@resend.dev</code></li>
            <li>Os e-mails funcionam normalmente</li>
            <li>Destinatários verão "TranspJardim" como nome do remetente</li>
            <li>Em modo teste, e-mails são redirecionados para <code>controleinterno@transpjardim.tech</code></li>
          </ul>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
            <p className="text-sm font-medium text-blue-900 mb-1">
              💡 Dica: Quem configura os DNS?
            </p>
            <p className="text-sm text-blue-700">
              Os registros DNS devem ser configurados no painel de gerenciamento do domínio 
              transpjardim.tech (ex: Registro.br, GoDaddy, Hostinger, etc.)
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
