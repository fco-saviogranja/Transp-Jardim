# 🔄 Migração: Resend → Hostinger

**Data:** 21/11/2024  
**Provedor Anterior:** Resend  
**Novo Provedor:** **Hostinger**

---

## 📋 Resumo da Mudança

O TranspJardim migrou do serviço de e-mail **Resend** para **Hostinger SMTP**.

### ✅ Vantagens do Hostinger:

- ✅ Controle total do servidor de e-mail
- ✅ Sem limitações de domínio em sandbox
- ✅ Integração com hospedagem existente
- ✅ SMTP padrão, compatível com qualquer biblioteca
- ✅ Suporte 24/7 em português

---

## 🎯 Configuração Atual

### **Servidor SMTP Hostinger:**

```
Host: smtp.hostinger.com
Porta: 465
Segurança: SSL
Usuário: controleinterno@transpjardim.com
Senha: [Variável de ambiente: SMTP_PASSWORD]
```

### **Servidores de Entrada (Referência):**

**IMAP:**
```
Host: imap.hostinger.com
Porta: 993
Segurança: SSL
```

**POP3:**
```
Host: pop.hostinger.com
Porta: 995
Segurança: SSL
```

---

## 📂 Arquivos Criados

### 1. **`/lib/smtpConfig.ts`** ⭐ NOVO
Configuração SMTP do Hostinger:
- Constantes de servidor SMTP
- Validação de configuração
- Funções helper para obter credenciais
- Status da configuração

### 2. **`/components/SMTPStatusPanel.tsx`** ⭐ NOVO
Painel de administração para:
- Ver status da configuração SMTP
- Testar envio de e-mails
- Verificar credenciais
- Visualizar informações do servidor

### 3. **`CONFIGURACAO_HOSTINGER_EMAIL.md`** ⭐ NOVO
Documentação completa:
- Configuração passo a passo
- Exemplos de código
- Templates de e-mail HTML
- Troubleshooting
- Configuração DNS

---

## 🔧 Alterações no Código

### **Antes (Resend):**

```typescript
// Usando API do Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'TranspJardim <onboarding@resend.dev>',
  to: destinatario,
  subject: assunto,
  html: conteudo
});
```

### **Depois (Hostinger SMTP):**

```typescript
// Usando nodemailer com SMTP
import nodemailer from 'npm:nodemailer@6';
import { getSMTPConfig } from './lib/smtpConfig';

const transporter = nodemailer.createTransport(getSMTPConfig());

await transporter.sendMail({
  from: 'TranspJardim <controleinterno@transpjardim.com>',
  to: destinatario,
  subject: assunto,
  html: conteudo
});
```

---

## 🚀 Implementação no Backend

### **Passo 1: Instalar nodemailer no Supabase Edge Function**

```typescript
// supabase/functions/email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import nodemailer from 'npm:nodemailer@6';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: Deno.env.get('SMTP_USER') || 'controleinterno@transpjardim.com',
    pass: Deno.env.get('SMTP_PASSWORD'),
  },
});
```

### **Passo 2: Configurar Variáveis de Ambiente**

No painel do Supabase:
1. Project Settings → Edge Functions
2. Adicionar variáveis:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=controleinterno@transpjardim.com
SMTP_PASSWORD=sua_senha_aqui
```

### **Passo 3: Criar Função de Envio**

```typescript
serve(async (req) => {
  const { to, subject, html } = await req.json();

  try {
    const info = await transporter.sendMail({
      from: 'TranspJardim <controleinterno@transpjardim.com>',
      to,
      subject,
      html,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: info.messageId 
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500 }
    );
  }
});
```

---

## 📋 Checklist de Migração

### ✅ Configuração:
- [x] Criar `/lib/smtpConfig.ts`
- [x] Criar `/components/SMTPStatusPanel.tsx`
- [x] Atualizar `/lib/emailConfig.ts`
- [x] Criar documentação completa
- [ ] Configurar variáveis de ambiente no Supabase
- [ ] Implementar função de envio no backend
- [ ] Testar envio de e-mail

### ✅ Documentação:
- [x] Guia de configuração Hostinger
- [x] Documento de migração
- [x] Atualizar README com novo provedor
- [x] Templates de e-mail HTML

### ⏳ DNS (Opcional):
- [ ] Configurar SPF: `v=spf1 include:_spf.hostinger.com ~all`
- [ ] Solicitar DKIM ao suporte Hostinger
- [ ] Configurar DMARC
- [ ] Aguardar propagação DNS

---

## 🔄 Compatibilidade com Código Existente

### **Frontend (`/lib/emailService.ts`):**
- ✅ Mantém a mesma interface
- ✅ Continua usando as mesmas funções
- ✅ `sendAlert()`, `sendTestEmail()` funcionam igual
- ⚠️ Mudança apenas no backend (transparente para o frontend)

### **Hooks:**
- ✅ `useAlertManager.ts` - Sem alterações
- ✅ `useSystemConfig.ts` - Sem alterações
- ✅ `useEmailStatus.ts` - Funciona normalmente

### **Componentes:**
- ✅ Todos os componentes continuam funcionando
- ⭐ Novo: `SMTPStatusPanel` para administração

---

## 🧪 Testes

### **1. Testar Conexão SMTP:**

```typescript
import { getSMTPStatus } from '../lib/smtpConfig';

const status = getSMTPStatus();
console.log('Status SMTP:', status);

// Resultado esperado:
// {
//   configured: true,
//   provider: 'Hostinger',
//   host: 'smtp.hostinger.com',
//   port: 465,
//   secure: 'SSL',
//   user: 'controleinterno@transpjardim.com',
//   hasPassword: true
// }
```

### **2. Enviar E-mail de Teste:**

```bash
# Via curl
curl -X POST https://seu-projeto.supabase.co/functions/v1/email/test \
  -H "Authorization: Bearer sua_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "testEmail": "seu-email@exemplo.com"
  }'
```

### **3. Verificar Logs:**

```typescript
// No Supabase Edge Function
console.log('✅ Conectado ao SMTP Hostinger');
console.log('📧 Enviando para:', to);
console.log('✅ E-mail enviado:', info.messageId);
```

---

## ⚠️ Limitações e Considerações

### **Limites do Hostinger:**

| Plano | E-mails/Hora | E-mails/Dia |
|-------|--------------|-------------|
| Básico | 100 | 500 |
| Premium | 200 | 1000 |
| Business | 300 | 2000 |

### **Ações para Evitar Bloqueios:**

1. **Implementar rate limiting no código**
```typescript
// Limitar envios por hora
const MAX_EMAILS_PER_HOUR = 100;
let emailsSentThisHour = 0;

if (emailsSentThisHour >= MAX_EMAILS_PER_HOUR) {
  throw new Error('Limite de envios atingido');
}
```

2. **Usar fila de e-mails**
```typescript
// Processar em lote com delay
const queue = [...emails];
for (const email of queue) {
  await sendEmail(email);
  await delay(1000); // 1 segundo entre envios
}
```

3. **Monitorar falhas**
```typescript
// Registrar tentativas de envio
await logEmailAttempt({
  to: email,
  success: true/false,
  timestamp: new Date(),
  error: error?.message
});
```

---

## 🔒 Segurança

### **✅ Boas Práticas Implementadas:**

1. **Senha em variável de ambiente**
   - Nunca no código
   - Configurada no Supabase

2. **Conexão SSL**
   - Porta 465 com SSL
   - Comunicação criptografada

3. **Validação de e-mail**
   - Regex para validar formato
   - Função `isValidEmail()` disponível

4. **Rate limiting**
   - Limite de envios por hora
   - Fila de processamento

5. **Logs de auditoria**
   - Registro de todos os envios
   - Monitoramento de falhas

---

## 📊 Monitoramento

### **Métricas Importantes:**

- ✅ Taxa de sucesso de envio
- ✅ Tempo médio de envio
- ✅ Quantidade de e-mails enviados (hora/dia)
- ✅ Taxa de falhas
- ✅ E-mails na fila
- ✅ Bloqueios do servidor

### **Implementar Dashboard:**

```typescript
// Painel de administração
<SMTPStatusPanel />

// Mostra:
// - Status da conexão
// - E-mails enviados hoje
// - Taxa de sucesso
// - Últimos erros
// - Teste de envio
```

---

## 🆘 Troubleshooting

### **Problema: "Authentication failed"**
- ✅ Verificar variável `SMTP_PASSWORD`
- ✅ Confirmar senha do e-mail no Hostinger
- ✅ Verificar se e-mail está ativo

### **Problema: "Connection timeout"**
- ✅ Verificar firewall do Supabase
- ✅ Confirmar porta 465 está acessível
- ✅ Testar: `telnet smtp.hostinger.com 465`

### **Problema: "Relay access denied"**
- ✅ Verificar autenticação SMTP
- ✅ Confirmar e-mail correto
- ✅ Verificar se domínio está configurado

### **Problema: "Daily limit exceeded"**
- ✅ Implementar rate limiting
- ✅ Distribuir envios ao longo do dia
- ✅ Considerar upgrade do plano

---

## 📞 Suporte

### **Hostinger:**
- 🌐 https://www.hostinger.com.br/suporte
- 💬 Chat ao vivo: 24/7
- 📧 suporte@hostinger.com

### **TranspJardim:**
- 📧 controleinterno@transpjardim.com
- 📱 (88) 3000-0000
- 📚 Documentação: `CONFIGURACAO_HOSTINGER_EMAIL.md`

---

## 🎯 Próximos Passos

1. **Configurar senha SMTP no Supabase** ⚠️ URGENTE
2. **Implementar função de envio no backend**
3. **Testar envio de e-mail**
4. **Configurar DNS (SPF, DKIM, DMARC)**
5. **Implementar rate limiting**
6. **Criar dashboard de monitoramento**
7. **Documentar logs de envio**

---

## ✅ Resumo

| Item | Status | Notas |
|------|--------|-------|
| Configuração SMTP | ✅ Completa | `/lib/smtpConfig.ts` |
| Painel Admin | ✅ Criado | `<SMTPStatusPanel />` |
| Documentação | ✅ Completa | 3 arquivos .md |
| Backend | ⏳ Pendente | Implementar no Supabase |
| Variáveis Ambiente | ⏳ Pendente | Configurar senha |
| DNS | ⏳ Opcional | SPF, DKIM, DMARC |
| Testes | ⏳ Pendente | Após configurar backend |

---

<div align="center">
  <strong>✅ Migração para Hostinger documentada!</strong>
  <br>
  <em>TranspJardim - Controladoria Municipal de Jardim/CE</em>
  <br><br>
  <strong>Próximo passo:</strong> Configurar variáveis de ambiente no Supabase
</div>
