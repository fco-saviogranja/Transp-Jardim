// IMPORT DO CLIENTE SMTP DO DENO
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

Deno.serve(async (req) => {
  try {
    const { to, subject, message } = await req.json();

    // Validar dados de entrada
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Parâmetros obrigatórios: to, subject, message" 
        }), 
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const password = Deno.env.get("EMAIL_PASSWORD");
    
    // Verificar se a senha está configurada
    if (!password) {
      console.error("❌ EMAIL_PASSWORD não está configurado no Supabase");
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "Configuração de e-mail incompleta. Secret EMAIL_PASSWORD não encontrado." 
        }), 
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📧 Tentando enviar e-mail para: ${to}`);
    console.log(`📧 Assunto: ${subject}`);
    console.log(`📧 Usuario SMTP: controleinterno@transpjardim.com`);

    const client = new SmtpClient();

    // CONECTAR VIA SMTP HOSTINGER
    try {
      await client.connectTLS({
        hostname: "smtp.hostinger.com",
        port: 465,
        username: "controleinterno@transpjardim.com",
        password: password,
      });
      console.log("✅ Conectado ao servidor SMTP");
    } catch (connectError) {
      console.error("❌ Erro ao conectar ao SMTP:", connectError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Falha na autenticação SMTP: ${connectError.message}`,
          details: "Verifique se a senha do e-mail está correta no secret EMAIL_PASSWORD"
        }), 
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ENVIAR MENSAGEM
    try {
      await client.send({
        from: "controleinterno@transpjardim.com",
        to,
        subject,
        content: message,
      });
      console.log("✅ E-mail enviado com sucesso");
    } catch (sendError) {
      console.error("❌ Erro ao enviar e-mail:", sendError);
      await client.close();
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Falha ao enviar e-mail: ${sendError.message}` 
        }), 
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await client.close();

    return new Response(JSON.stringify({ ok: true, message: "E-mail enviado com sucesso" }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Erro geral:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});