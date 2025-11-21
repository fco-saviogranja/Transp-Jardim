# 📧 Configuração de E-mail Hostinger - TranspJardim

**Provedor:** Hostinger  
**E-mail:** controleinterno@transpjardim.com  
**Domínio:** transpjardim.com

---

## 🎯 Resumo da Configuração

O TranspJardim usa o serviço de e-mail do **Hostinger** para enviar alertas e notificações.

### ✅ Servidor SMTP Configurado:

```
Host: smtp.hostinger.com
Porta: 465
Segurança: SSL
Usuário: controleinterno@transpjardim.com
Senha: [Configurar nas variáveis de ambiente]
```

---

## 📋 Servidores de E-mail Hostinger

### 📤 Servidor de Saída (SMTP) - Para Enviar E-mails
```
Host: smtp.hostinger.com
Porta: 465
Protocolo: SSL
```

### 📥 Servidor de Entrada (IMAP) - Para Receber E-mails
```
Host: imap.hostinger.com
Porta: 993
Protocolo: SSL
```

### 📥 Servidor de Entrada (POP3) - Alternativa
```
Host: pop.hostinger.com
Porta: 995
Protocolo: SSL
```

---

## 🔧 Configuração no Backend (Supabase Edge Functions)

### 1. Criar Variáveis de Ambiente no Supabase

Acesse o painel do Supabase:

1. Vá em **Project Settings** → **Edge Functions**
2. Em **Environment Variables**, adicione:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=controleinterno@transpjardim.com
SMTP_PASSWORD=SUA_SENHA_AQUI
```

⚠️ **IMPORTANTE:** Nunca commite a senha no código! Use sempre variáveis de ambiente.

---

### 2. Instalar Biblioteca SMTP no Backend

No seu Edge Function, você precisará de uma biblioteca para enviar e-mails via SMTP.

**Opção 1: nodemailer (recomendado)**

```typescript
// supabase/functions/email/index.ts
import nodemailer from 'npm:nodemailer@6';

// Criar transporter
const transporter = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
  secure: true, // SSL
  auth: {
    user: Deno.env.get('SMTP_USER') || 'controleinterno@transpjardim.com',
    pass: Deno.env.get('SMTP_PASSWORD'),
  },
});

// Verificar conexão
await transporter.verify();
console.log('✅ Servidor SMTP conectado');
```

**Opção 2: deno-smtp (nativo Deno)**

```typescript
// supabase/functions/email/index.ts
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const client = new SmtpClient();

await client.connectTLS({
  hostname: "smtp.hostinger.com",
  port: 465,
  username: Deno.env.get('SMTP_USER'),
  password: Deno.env.get('SMTP_PASSWORD'),
});

console.log('✅ Servidor SMTP conectado');
```

---

### 3. Exemplo de Função para Enviar E-mail

```typescript
// supabase/functions/email/send-alert.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer@6';

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: Deno.env.get('SMTP_USER'),
    pass: Deno.env.get('SMTP_PASSWORD'),
  },
});

serve(async (req) => {
  try {
    const { to, subject, html, text } = await req.json();

    // Enviar e-mail
    const info = await transporter.sendMail({
      from: 'TranspJardim <controleinterno@transpjardim.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('✅ E-mail enviado:', info.messageId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: 'E-mail enviado com sucesso',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

---

## 🎨 Template de E-mail

### HTML Completo:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TranspJardim</title>
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
    
    <!-- TIPO DE ALERTA -->
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
      <strong style="color: #f59e0b;">🟡 AVISO</strong>
    </div>

    <!-- MENSAGEM -->
    <h2 style="color: #1f2937; margin-top: 0;">Título do Alerta</h2>
    <p style="color: #4b5563; font-size: 16px;">
      Mensagem do alerta aqui...
    </p>

    <!-- DETALHES -->
    <div style="background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Critério:</strong> Nome do Critério</p>
      <p style="margin: 5px 0;"><strong>Secretaria:</strong> Nome da Secretaria</p>
      <p style="margin: 5px 0;"><strong>Vencimento:</strong> DD/MM/AAAA</p>
      <p style="margin: 5px 0;"><strong>Responsável:</strong> Nome do Responsável</p>
    </div>

    <!-- BOTÃO DE AÇÃO -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://transpjardim.com" 
         style="background: #4a7c59; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Acessar Sistema
      </a>
    </div>

  </div>

  <!-- Rodapé -->
  <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280;">
    <p style="margin: 0 0 8px 0;">
      <strong>Controladoria Municipal de Jardim/CE</strong>
    </p>
    <p style="margin: 0 0 8px 0;">
      📧 controleinterno@transpjardim.com | 📞 (88) 3000-0000
    </p>
    <p style="margin: 0 0 8px 0;">
      🌐 <a href="https://transpjardim.com" style="color: #4a7c59; text-decoration: none;">https://transpjardim.com</a>
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
```

---

## 🧪 Testar Configuração SMTP

### No Terminal (usando curl):

```bash
curl -X POST https://SEU_PROJETO.supabase.co/functions/v1/email/test \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "testEmail": "seu-email@exemplo.com"
  }'
```

### No Frontend (React):

```typescript
import { getSMTPStatus } from '../lib/smtpConfig';

// Verificar status
const status = getSMTPStatus();
console.log('SMTP Status:', status);

// Enviar e-mail de teste
const testEmail = async () => {
  const response = await fetch('/api/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testEmail: 'destinatario@exemplo.com'
    })
  });
  
  const result = await response.json();
  console.log('Resultado:', result);
};
```

---

## 🔒 Segurança

### ✅ Boas Práticas:

1. **NUNCA commite senhas no código**
   - Use sempre variáveis de ambiente
   - Adicione `.env` no `.gitignore`

2. **Use SSL/TLS**
   - Porta 465 com SSL (configurada)
   - Ou porta 587 com STARTTLS

3. **Limite de envio**
   - Hostinger tem limites de envio por hora/dia
   - Verifique seu plano para evitar bloqueios

4. **Autenticação**
   - Use senhas fortes
   - Considere senha de aplicativo se disponível

5. **Monitoramento**
   - Registre todos os envios
   - Monitore falhas e bloqueios

---

## 📊 Limites do Hostinger

Verifique os limites do seu plano:

| Plano | E-mails/Hora | E-mails/Dia |
|-------|--------------|-------------|
| Básico | 100 | 500 |
| Premium | 200 | 1000 |
| Business | 300 | 2000 |

⚠️ **Atenção:** Exceder limites pode resultar em bloqueio temporário.

---

## 🛠️ Troubleshooting

### ❌ Erro: "Authentication failed"
- Verifique usuário e senha
- Confirme que o e-mail está ativo no Hostinger
- Verifique se há autenticação de dois fatores

### ❌ Erro: "Connection timeout"
- Verifique firewall do servidor
- Confirme porta 465 está aberta
- Teste conectividade: `telnet smtp.hostinger.com 465`

### ❌ Erro: "Relay access denied"
- Verifique autenticação SMTP
- Confirme que está usando o e-mail correto

### ❌ E-mails caindo no spam
- Configure SPF, DKIM e DMARC (veja próxima seção)
- Use domínio verificado
- Evite palavras de spam no assunto

---

## 🌐 Configuração DNS (Opcional mas Recomendado)

Para melhorar a entregabilidade dos e-mails, configure os registros DNS:

### **SPF (Sender Policy Framework)**
```
Tipo: TXT
Nome: @
Valor: v=spf1 include:_spf.hostinger.com ~all
```

### **DKIM (DomainKeys Identified Mail)**
Solicite ao suporte do Hostinger:
```
Suporte Hostinger → Solicitar chaves DKIM
```

### **DMARC (Domain-based Message Authentication)**
```
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.com
```

---

## 📞 Suporte Hostinger

- 🌐 https://www.hostinger.com.br/suporte
- 💬 Chat ao vivo: 24/7
- 📧 E-mail: suporte@hostinger.com
- 📚 Base de conhecimento: https://support.hostinger.com/

---

## ✅ Checklist de Configuração

### Backend (Supabase):
- [ ] Instalar biblioteca SMTP (nodemailer ou deno-smtp)
- [ ] Configurar variáveis de ambiente
- [ ] Criar função de envio de e-mail
- [ ] Testar envio de e-mail
- [ ] Implementar logs de envio
- [ ] Configurar tratamento de erros

### DNS (Opcional):
- [ ] Configurar SPF
- [ ] Solicitar e configurar DKIM
- [ ] Configurar DMARC
- [ ] Aguardar propagação DNS (até 48h)
- [ ] Testar entregabilidade

### Monitoramento:
- [ ] Implementar logs de envio
- [ ] Monitorar taxa de falhas
- [ ] Verificar limite de envios
- [ ] Configurar alertas de erro

---

## 🎯 Próximos Passos

1. **Configurar senha nas variáveis de ambiente do Supabase**
2. **Implementar função de envio no backend**
3. **Testar envio de e-mail**
4. **Configurar DNS para melhor entregabilidade**
5. **Monitorar envios e ajustar conforme necessário**

---

<div align="center">
  <strong>✅ Hostinger configurado como provedor de e-mail!</strong>
  <br>
  <em>TranspJardim - Controladoria Municipal de Jardim/CE</em>
</div>
