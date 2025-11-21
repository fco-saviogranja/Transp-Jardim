// ========================================
// 📧 EDGE FUNCTION: enviar-email
// ========================================
// 
// INSTRUÇÕES DE DEPLOY:
// 
// 1. Instale o Supabase CLI:
//    npm install -g supabase
//
// 2. Faça login no Supabase:
//    supabase login
//
// 3. Link com seu projeto:
//    supabase link --project-ref [SEU_PROJECT_ID]
//
// 4. Crie a função:
//    supabase functions new enviar-email
//
// 5. Copie este código para: supabase/functions/enviar-email/index.ts
//
// 6. Configure os Secrets (variáveis de ambiente):
//    supabase secrets set SMTP_HOST=smtp.hostinger.com
//    supabase secrets set SMTP_PORT=587
//    supabase secrets set SMTP_USER=controleinterno@transpjardim.com
//    supabase secrets set SMTP_PASS=[SUA_SENHA_AQUI]
//
// 7. Faça o deploy:
//    supabase functions deploy enviar-email
//
// ========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Configurações SMTP da Hostinger
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.hostinger.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER") || "controleinterno@transpjardim.com";
const SMTP_PASS = Deno.env.get("SMTP_PASS") || "";

// Validar configuração
if (!SMTP_PASS) {
  console.error("⚠️ SMTP_PASS não configurado! Use: supabase secrets set SMTP_PASS=sua_senha");
}

console.log(`📧 Edge Function iniciada - SMTP: ${SMTP_USER}@${SMTP_HOST}:${SMTP_PORT}`);

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
}

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-test-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`📨 Requisição recebida: ${req.method} ${req.url}`);

    // Validar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Método não permitido. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse do body
    let body: EmailRequest;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'JSON inválido no body da requisição',
          details: error.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { to, subject, message } = body;

    // Validações
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: to, subject, message',
          received: { to: !!to, subject: !!subject, message: !!message }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ 
          error: 'E-mail de destino inválido',
          to 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📧 Enviando e-mail para: ${to}`);
    console.log(`📧 Assunto: ${subject}`);

    // Conectar ao servidor SMTP
    const client = new SmtpClient();

    try {
      await client.connectTLS({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASS,
      });

      console.log(`✅ Conectado ao SMTP: ${SMTP_HOST}:${SMTP_PORT}`);

      // Enviar e-mail
      await client.send({
        from: SMTP_USER,
        to: to,
        subject: subject,
        content: message,
        html: message, // Suporte a HTML
      });

      console.log(`✅ E-mail enviado com sucesso para: ${to}`);

      await client.close();

      // Resposta de sucesso
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'E-mail enviado com sucesso',
          emailId: `${Date.now()}-${to}`,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (smtpError: any) {
      console.error('❌ Erro SMTP:', smtpError);

      // Tentar fechar conexão
      try {
        await client.close();
      } catch (closeError) {
        console.error('⚠️ Erro ao fechar conexão SMTP:', closeError);
      }

      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar e-mail via SMTP',
          details: smtpError.message || smtpError.toString(),
          config: {
            host: SMTP_HOST,
            port: SMTP_PORT,
            user: SMTP_USER,
            passwordConfigured: !!SMTP_PASS
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro geral:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor',
        details: error.message || error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
