import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Clock,
  Server,
  Mail,
  Shield,
  Globe,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DnsConfigurationGuideProps {
  domain?: string;
  onComplete?: () => void;
}

export function DnsConfigurationGuide({ 
  domain = 'transpjardim.tech',
  onComplete 
}: DnsConfigurationGuideProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado para área de transferência!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar. Tente selecionar e copiar manualmente.');
    }
  };

  const dnsRecords = {
    spf: {
      name: '@',
      type: 'TXT',
      value: 'v=spf1 include:resend.com ~all',
      description: 'Autoriza o Resend a enviar e-mails pelo seu domínio'
    },
    dkim: {
      name: 'resend._domainkey',
      type: 'TXT',
      value: '[Obtenha este valor no painel do Resend]',
      description: 'Assinatura digital para autenticar seus e-mails',
      needsResend: true
    },
    dmarc: {
      name: '_dmarc',
      type: 'TXT',
      value: `v=DMARC1; p=none; rua=mailto:controleinterno@${domain}`,
      description: 'Política de autenticação e relatórios de e-mail'
    }
  };

  const providers = [
    {
      id: 'registro-br',
      name: 'Registro.br',
      url: 'https://registro.br',
      instructions: [
        'Acesse registro.br e faça login',
        'Vá em "Meus Domínios"',
        'Clique em "DNS" → "Gerenciar DNS"',
        'Adicione os registros TXT conforme mostrado',
        'Use "@" para o nome do registro SPF'
      ]
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      url: 'https://dash.cloudflare.com',
      instructions: [
        'Acesse o dashboard do Cloudflare',
        'Selecione seu domínio',
        'Vá em "DNS" → "Records"',
        'Adicione os registros com "DNS only" (sem proxy)',
        '⚠️ Desative a nuvem laranja para registros TXT'
      ]
    },
    {
      id: 'godaddy',
      name: 'GoDaddy',
      url: 'https://dcc.godaddy.com',
      instructions: [
        'Acesse o Domain Control Center',
        'Clique em "DNS" ao lado do domínio',
        'Na seção "Records", clique em "Add"',
        'Selecione Type: TXT',
        'Adicione cada registro'
      ]
    },
    {
      id: 'cpanel',
      name: 'cPanel (HostGator, Hostinger, etc)',
      url: '#',
      instructions: [
        'Acesse seu cPanel',
        'Procure por "Zone Editor" ou "Editor de Zona"',
        'Selecione o domínio',
        'Clique em "Add Record"',
        'Adicione os registros TXT'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-orange-600 mt-1 shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-orange-900">
                Configuração DNS Pendente
              </CardTitle>
              <CardDescription className="text-orange-700 mt-2">
                Para enviar e-mails para qualquer destinatário usando <strong>{domain}</strong>, 
                você precisa adicionar registros DNS no seu provedor de domínio.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <Info className="size-4" />
            <span>
              <strong>Sistema já está funcionando!</strong> Em modo teste, e-mails são enviados para controleinterno@transpjardim.tech
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Configuração */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">
            <Server className="size-4 mr-2" />
            Registros DNS
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Globe className="size-4 mr-2" />
            Provedores
          </TabsTrigger>
          <TabsTrigger value="verify">
            <CheckCircle2 className="size-4 mr-2" />
            Verificar
          </TabsTrigger>
        </TabsList>

        {/* Tab: Registros DNS */}
        <TabsContent value="records" className="space-y-4">
          <Alert>
            <Shield className="size-4" />
            <AlertDescription>
              Você precisa adicionar <strong>3 registros TXT</strong> no seu provedor de DNS. 
              Copie os valores abaixo e adicione-os no painel do seu provedor.
            </AlertDescription>
          </Alert>

          {/* Registro SPF */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">1</Badge>
                    Registro SPF
                    <Badge>Obrigatório</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {dnsRecords.spf.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">TXT</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('TXT', 'Tipo SPF')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nome / Host</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">{dnsRecords.spf.name}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dnsRecords.spf.name, 'Nome SPF')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Valor / Conteúdo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1 text-xs">
                      {dnsRecords.spf.value}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dnsRecords.spf.value, 'Valor SPF')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="size-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Nota:</strong> Se você já tem um registro SPF, não crie um novo. 
                  Adicione <code>include:resend.com</code> ao registro existente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Registro DKIM */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">2</Badge>
                    Registro DKIM
                    <Badge>Obrigatório</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {dnsRecords.dkim.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="size-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>Ação necessária:</strong> Acesse o painel do Resend para obter o valor DKIM específico.
                </AlertDescription>
              </Alert>
              <div className="grid gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">TXT</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('TXT', 'Tipo DKIM')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nome / Host</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">{dnsRecords.dkim.name}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dnsRecords.dkim.name, 'Nome DKIM')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Valor / Conteúdo</label>
                  <div className="bg-muted px-3 py-2 rounded text-xs text-muted-foreground italic">
                    Obtenha este valor no painel do Resend
                  </div>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open('https://resend.com/domains', '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                Abrir Painel do Resend
              </Button>
            </CardContent>
          </Card>

          {/* Registro DMARC */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">3</Badge>
                    Registro DMARC
                    <Badge variant="secondary">Recomendado</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {dnsRecords.dmarc.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">TXT</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('TXT', 'Tipo DMARC')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nome / Host</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1">{dnsRecords.dmarc.name}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dnsRecords.dmarc.name, 'Nome DMARC')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Valor / Conteúdo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded flex-1 text-xs">
                      {dnsRecords.dmarc.value}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dnsRecords.dmarc.value, 'Valor DMARC')}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Provedores */}
        <TabsContent value="providers" className="space-y-4">
          <Alert>
            <Globe className="size-4" />
            <AlertDescription>
              Selecione seu provedor de domínio abaixo para ver instruções específicas.
            </AlertDescription>
          </Alert>

          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <CardTitle className="text-base">{provider.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2 text-sm">
                  {provider.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
                {provider.url !== '#' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(provider.url, '_blank')}
                  >
                    <ExternalLink className="size-4 mr-2" />
                    Acessar {provider.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900">
                  <strong>Não encontrou seu provedor?</strong>
                  <p className="mt-1">
                    Procure por "Zone Editor", "DNS Management" ou "Gerenciar DNS" 
                    no painel de controle do seu provedor. Se tiver dúvidas, entre em 
                    contato com o suporte técnico deles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Verificar */}
        <TabsContent value="verify" className="space-y-4">
          <Alert>
            <Clock className="size-4" />
            <AlertDescription>
              Após adicionar os registros, aguarde a propagação DNS (2-24 horas) e 
              verifique no painel do Resend.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tempo de Propagação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Mínimo</span>
                  <span className="text-sm">1-2 horas</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">Normal</span>
                  <span className="text-sm">4-8 horas</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Máximo</span>
                  <span className="text-sm">24-48 horas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ferramentas de Verificação</CardTitle>
              <CardDescription>
                Use estas ferramentas para verificar se os registros DNS foram propagados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`https://mxtoolbox.com/SuperTool.aspx?action=txt:${domain}`, '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                MX Toolbox - Verificar TXT Records
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`https://dnschecker.org/#TXT/${domain}`, '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                DNS Checker - Propagação Global
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('https://resend.com/domains', '_blank')}
              >
                <ExternalLink className="size-4 mr-2" />
                Resend - Verificar Domínio
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                <div className="text-sm text-green-900">
                  <strong>Após verificação bem-sucedida:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>E-mails serão enviados de controleinterno@{domain}</li>
                    <li>Poderá enviar para qualquer destinatário</li>
                    <li>Melhor taxa de entrega (deliverability)</li>
                    <li>Nenhuma mudança no código necessária!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer com Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links Úteis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => window.open('https://resend.com/docs/dashboard/domains/introduction', '_blank')}
          >
            <ExternalLink className="size-3 mr-2" />
            Documentação Resend - Domínios
          </Button>
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => window.open('https://resend.com/docs/knowledge-base/why-is-my-domain-pending', '_blank')}
          >
            <ExternalLink className="size-3 mr-2" />
            Por que meu domínio está pendente?
          </Button>
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => window.open('/GUIA-CONFIGURACAO-DNS-SPF.md', '_blank')}
          >
            <ExternalLink className="size-3 mr-2" />
            Guia Completo (Português)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
