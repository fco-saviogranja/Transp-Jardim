import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle2, Copy, ExternalLink, Terminal, Code, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { projectId } from '../utils/supabase/info';

export function EdgeFunctionSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = async (text: string, stepId: string) => {
    try {
      // Método 1: Clipboard API (moderno)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedStep(stepId);
        setTimeout(() => setCopiedStep(null), 2000);
        return;
      }
      
      // Método 2: Fallback usando textarea (funciona sempre)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedStep(stepId);
          setTimeout(() => setCopiedStep(null), 2000);
        } else {
          console.warn('Fallback copy falhou');
        }
      } catch (err) {
        console.error('Erro ao copiar (fallback):', err);
      }
      
      document.body.removeChild(textarea);
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
      // Mesmo com erro, mostrar feedback visual
      setCopiedStep(stepId);
      setTimeout(() => setCopiedStep(null), 1000);
    }
  };

  const edgeFunctionCode = `// Edge Function: enviar-email
// Ver arquivo completo em: /supabase/functions/enviar-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.7";

// Configurações SMTP da Hostinger
const SMTP_CONFIG = {
  host: Deno.env.get("SMTP_HOST") || "smtp.hostinger.com",
  port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
  secure: true, // SSL na porta 465
  auth: {
    user: Deno.env.get("SMTP_USER") || "controleinterno@transpjardim.com",
    pass: Deno.env.get("SMTP_PASSWORD")
  }
};

const transporter = nodemailer.createTransport(SMTP_CONFIG);

serve(async (req) => {
  // Rotas: /test, /send-alert, /status
  // ... código completo no arquivo /supabase/functions/enviar-email/index.ts
});`;

  return (
    <Card className="w-full border-2 border-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Settings className="h-6 w-6" />
          ⚠️ Configuração Necessária: Edge Function
        </CardTitle>
        <CardDescription>
          A Edge Function <code>enviar-email</code> ainda não foi criada no Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <AlertDescription>
            <strong>❌ Problema Detectado:</strong> Não foi possível conectar à Edge Function.<br/>
            <strong>📍 Solução:</strong> Siga os passos abaixo para criar e fazer deploy da função no Supabase.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="web" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="web">🌐 Via Web (Mais Fácil)</TabsTrigger>
            <TabsTrigger value="cli">💻 Via CLI (Avançado)</TabsTrigger>
          </TabsList>

          {/* MÉTODO WEB */}
          <TabsContent value="web" className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Passo 1</Badge>
                  <h3 className="font-semibold">Acessar o Dashboard do Supabase</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Abra o Dashboard do seu projeto no Supabase:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}`, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir Supabase Dashboard
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Passo 2</Badge>
                  <h3 className="font-semibold">Criar a Edge Function</h3>
                </div>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>No menu lateral, clique em <strong>"Edge Functions"</strong></li>
                  <li>Clique em <strong>"Create a new function"</strong></li>
                  <li>Nome da função: <code className="bg-muted px-1 rounded">enviar-email</code></li>
                  <li>Clique em <strong>"Create function"</strong></li>
                </ol>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Passo 3</Badge>
                  <h3 className="font-semibold">Copiar o Código</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  O código completo está no arquivo <code>/supabase/functions/enviar-email/index.ts</code>
                </p>
                <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-40">
                  {edgeFunctionCode}
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>📝 Ação:</strong> Abra o arquivo <code>/supabase/functions/enviar-email/index.ts</code> no projeto, 
                    copie TODO o conteúdo e cole no editor da Edge Function no Supabase.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Passo 4</Badge>
                  <h3 className="font-semibold">Configurar os Secrets</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  No Supabase Dashboard, vá em <strong>Edge Functions → Settings → Secrets</strong> e adicione:
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'SMTP_HOST', value: 'smtp.hostinger.com' },
                    { key: 'SMTP_PORT', value: '465' },
                    { key: 'SMTP_USER', value: 'controleinterno@transpjardim.com' },
                    { key: 'SMTP_PASSWORD', value: '[SUA_SENHA_DO_EMAIL]' }
                  ].map((secret) => (
                    <div key={secret.key} className="flex items-center gap-2">
                      <div className="flex-1 bg-muted p-2 rounded font-mono text-xs">
                        <strong>{secret.key}</strong> = {secret.value}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(secret.value, secret.key)}
                      >
                        {copiedStep === secret.key ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <Alert className="mt-3">
                  <AlertDescription className="text-xs">
                    ⚠️ <strong>IMPORTANTE:</strong> Substitua <code>[SUA_SENHA_DO_EMAIL]</code> pela senha 
                    real do e-mail <code>controleinterno@transpjardim.com</code> configurado na Hostinger.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Passo 5</Badge>
                  <h3 className="font-semibold">Deploy e Teste</h3>
                </div>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Clique em <strong>"Deploy"</strong> no editor da função</li>
                  <li>Aguarde o deploy finalizar (aparecerá um ✅)</li>
                  <li>Volte para o TranspJardim</li>
                  <li>Execute o <strong>"Diagnóstico Completo de E-mail"</strong></li>
                  <li>A Etapa 3 deve ficar <span className="text-green-600 font-semibold">VERDE ✅</span></li>
                </ol>
              </div>
            </div>
          </TabsContent>

          {/* MÉTODO CLI */}
          <TabsContent value="cli" className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <strong>Pré-requisito:</strong> Node.js instalado (versão 16 ou superior)
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Instalar Supabase CLI',
                  command: 'npm install -g supabase',
                  description: 'Instala a ferramenta de linha de comando do Supabase'
                },
                {
                  step: 2,
                  title: 'Fazer Login',
                  command: 'supabase login',
                  description: 'Abrirá o navegador para autorização'
                },
                {
                  step: 3,
                  title: 'Linkar o Projeto',
                  command: `supabase link --project-ref ${projectId}`,
                  description: 'Conecta o CLI ao seu projeto do Supabase'
                },
                {
                  step: 4,
                  title: 'Criar a Função',
                  command: 'supabase functions new enviar-email',
                  description: 'Cria a estrutura da Edge Function localmente'
                },
                {
                  step: 5,
                  title: 'Copiar o Código',
                  command: '# Copie o conteúdo de /supabase/functions/enviar-email/index.ts\n# Cole em: supabase/functions/enviar-email/index.ts',
                  description: 'O código completo está no arquivo /supabase/functions/enviar-email/index.ts do projeto'
                },
                {
                  step: 6,
                  title: 'Configurar Secrets',
                  command: `supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=controleinterno@transpjardim.com
supabase secrets set SMTP_PASSWORD=SUA_SENHA_AQUI`,
                  description: '⚠️ Substitua SUA_SENHA_AQUI pela senha real'
                },
                {
                  step: 7,
                  title: 'Fazer Deploy',
                  command: 'supabase functions deploy enviar-email',
                  description: 'Faz o upload da função para o Supabase'
                }
              ].map((item) => (
                <div key={item.step} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>Passo {item.step}</Badge>
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-start gap-2">
                    <pre className="flex-1 bg-muted p-3 rounded text-xs font-mono overflow-auto">
                      {item.command}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(item.command, `cli-${item.step}`)}
                    >
                      {copiedStep === `cli-${item.step}` ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="mt-6">
          <Code className="h-4 w-4" />
          <AlertDescription>
            <strong>📄 Arquivos Criados:</strong>
            <ul className="list-disc list-inside mt-2 text-sm">
              <li><code>/supabase/functions/enviar-email/index.ts</code> - Código completo da função</li>
              <li><code>/GUIA-DEPLOY-EDGE-FUNCTION.md</code> - Guia detalhado em Markdown</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}