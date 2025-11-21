/**
 * Supabase Edge Function - Envio de E-mail via Hostinger SMTP
 * 
 * Arquivo: supabase/functions/email/index.ts
 * 
 * IMPORTANTE: Este arquivo é um EXEMPLO de como implementar a função no Supabase.
 * Copie este código para: supabase/functions/email/index.ts
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Importar nodemailer para envio via SMTP
import nodemailer from 'npm:nodemailer@6.9.7';

// ===============================================
// CONFIGURAÇÃO CORS
// ===============================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ===============================================
// CONFIGURAÇÃO SMTP HOSTINGER
// ===============================================
const SMTP_CONFIG = {
  host: Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
  secure: true, // SSL
  auth: {
    user: Deno.env.get('SMTP_USER') || 'controleinterno@transpjardim.com',
    pass: Deno.env.get('SMTP_PASSWORD'), // ⚠️ OBRIGATÓRIO: Configurar no Supabase
  },
};

// Criar transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// ===============================================
// CONSTANTES DE E-MAIL
// ===============================================
const SENDER_NAME = 'TranspJardim';
const SENDER_EMAIL = 'controleinterno@transpjardim.com';
const SENDER_FULL = `${SENDER_NAME} <${SENDER_EMAIL}>`;
const WEBSITE_URL = 'https://transpjardim.com';

// ===============================================
// TEMPLATES DE E-MAIL
// ===============================================

// Template HTML base
const getEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Cabeçalho -->
  <div style="background: linear-gradient(135deg, #4a7c59 0%, #6fa37f 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">🏛️ TranspJardim</h1>
    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
      Controladoria Municipal de Jardim/CE
    </p>
  </div>

  <!-- Conteúdo -->
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    ${content}
  </div>

  <!-- Rodapé -->
  <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280;">
    <p style="margin: 0 0 8px 0;">
      <strong>Controladoria Municipal de Jardim/CE</strong>
    </p>
    <p style="margin: 0 0 8px 0;">
      📧 ${SENDER_EMAIL} | 📞 (88) 3000-0000
    </p>
    <p style="margin: 0 0 8px 0;">
      🌐 <a href="${WEBSITE_URL}" style="color: #4a7c59; text-decoration: none;">${WEBSITE_URL}</a>
    </p>
    <p style="margin: 0; font-size: 11px; color: #9ca3af;">
      Horário de atendimento: Segunda a Sexta, 8h às 17h
    </p>
    <p style="margin: 10px 0 0 0; font-size: 11px; color: #9ca3af;">
      Este é um e-mail automático. Por favor, não responda.
    </p>
  </div>

</body>
</html>
`;

// Template de alerta
const getAlertEmailContent = (data: {
  tipo: 'warning' | 'urgent';
  titulo: string;
  mensagem: string;
  criterio: string;
  secretaria: string;
  vencimento: string;
  responsavel: string;
}) => {
  const isUrgent = data.tipo === 'urgent';
  const alertColor = isUrgent ? '#dc2626' : '#f59e0b';
  const alertBg = isUrgent ? '#fee2e2' : '#fef3c7';
  const alertIcon = isUrgent ? '🔴' : '🟡';
  const alertLabel = isUrgent ? 'URGENTE' : 'AVISO';

  return `
    <!-- Tipo de Alerta -->
    <div style="background: ${alertBg}; border-left: 4px solid ${alertColor}; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <strong style="color: ${alertColor};">${alertIcon} ${alertLabel}</strong>
    </div>

    <!-- Título -->
    <h2 style="color: #1f2937; margin-top: 0;">${data.titulo}</h2>
    
    <!-- Mensagem -->
    <p style="color: #4b5563; font-size: 16px;">
      ${data.mensagem}
    </p>

    <!-- Detalhes -->
    <div style="background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Critério:</strong> ${data.criterio}</p>
      <p style="margin: 5px 0;"><strong>Secretaria:</strong> ${data.secretaria}</p>
      <p style="margin: 5px 0;"><strong>Vencimento:</strong> ${data.vencimento}</p>
      <p style="margin: 5px 0;"><strong>Responsável:</strong> ${data.responsavel}</p>
    </div>

    <!-- Botão de Ação -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${WEBSITE_URL}" 
         style="background: #4a7c59; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Acessar Sistema
      </a>
    </div>
  `;
};

// ===============================================
// FUNÇÃO PRINCIPAL
// ===============================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar senha SMTP
    if (!SMTP_CONFIG.auth.pass) {
      throw new Error('SMTP_PASSWORD não configurada nas variáveis de ambiente');
    }

    // Parse do body
    const url = new URL(req.url);
    const pathname = url.pathname;

    // ===============================================
    // ROTA: /email/test - Enviar e-mail de teste
    // ===============================================
    if (pathname.includes('/test')) {
      const { testEmail } = await req.json();

      if (!testEmail) {
        throw new Error('E-mail de teste não fornecido');
      }

      const content = getAlertEmailContent({
        tipo: 'warning',
        titulo: 'Teste de Configuração SMTP',
        mensagem: 'Este é um e-mail de teste enviado pelo sistema TranspJardim via Hostinger SMTP.',
        criterio: 'Teste Manual',
        secretaria: 'Sistema',
        vencimento: new Date().toLocaleDateString('pt-BR'),
        responsavel: 'Administrador',
      });

      const html = getEmailTemplate(content, 'Teste - TranspJardim');

      await transporter.sendMail({
        from: SENDER_FULL,
        to: testEmail,
        subject: '🧪 TESTE: Configuração SMTP - TranspJardim',
        html,
        text: 'Teste de configuração SMTP do TranspJardim via Hostinger',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'E-mail de teste enviado com sucesso',
          to: testEmail,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // ===============================================
    // ROTA: /email/send-alert - Enviar alerta
    // ===============================================
    if (pathname.includes('/send-alert')) {
      const { to, subject, alertType, criterio, usuario, dueDate } = await req.json();

      if (!to || !subject) {
        throw new Error('Destinatário e assunto são obrigatórios');
      }

      // Gerar conteúdo do alerta
      const content = getAlertEmailContent({
        tipo: alertType === 'urgent' ? 'urgent' : 'warning',
        titulo: criterio.nome,
        mensagem: `O critério "${criterio.nome}" requer sua atenção.`,
        criterio: criterio.nome,
        secretaria: criterio.secretaria,
        vencimento: new Date(dueDate).toLocaleDateString('pt-BR'),
        responsavel: usuario.name,
      });

      const html = getEmailTemplate(content, subject);

      const info = await transporter.sendMail({
        from: SENDER_FULL,
        to,
        subject,
        html,
        text: `${criterio.nome} - TranspJardim`,
      });

      // Salvar log no Supabase (opcional)
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('email_logs').insert({
          to,
          subject,
          alert_type: alertType,
          criterio_id: criterio.id,
          usuario_id: usuario.id,
          message_id: info.messageId,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Erro ao salvar log:', logError);
        // Não falhar o envio se log falhar
      }

      return new Response(
        JSON.stringify({
          success: true,
          emailId: info.messageId,
          message: 'Alerta enviado com sucesso',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // ===============================================
    // ROTA: /email/status - Verificar status SMTP
    // ===============================================
    if (pathname.includes('/status')) {
      // Verificar conexão com SMTP
      await transporter.verify();

      return new Response(
        JSON.stringify({
          success: true,
          configured: true,
          provider: 'Hostinger',
          host: SMTP_CONFIG.host,
          port: SMTP_CONFIG.port,
          secure: SMTP_CONFIG.secure,
          user: SMTP_CONFIG.auth.user,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Rota não encontrada
    throw new Error(`Rota não encontrada: ${pathname}`);

  } catch (error) {
    console.error('Erro:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro desconhecido',
        details: error.stack,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ===============================================
// INSTRUÇÕES DE DEPLOY
// ===============================================
/*

1. Criar a função no Supabase:
   supabase functions new email

2. Copiar este código para:
   supabase/functions/email/index.ts

3. Configurar variáveis de ambiente no Supabase:
   - SMTP_HOST=smtp.hostinger.com
   - SMTP_PORT=465
   - SMTP_USER=controleinterno@transpjardim.com
   - SMTP_PASSWORD=sua_senha_aqui

4. Fazer deploy:
   supabase functions deploy email

5. Testar:
   curl -X POST https://seu-projeto.supabase.co/functions/v1/email/test \
     -H "Authorization: Bearer sua_anon_key" \
     -H "Content-Type: application/json" \
     -d '{"testEmail":"seu-email@exemplo.com"}'

*/
