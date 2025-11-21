# 📧 Configuração do Sistema de E-mail - TranspJardim

## 🧪 Modo Atual: SIMULAÇÃO

O sistema está configurado para funcionar em **modo de simulação local**. Isso significa que:

✅ **Todas as funcionalidades estão disponíveis**
✅ **Não precisa configurar servidor de e-mail**
✅ **Perfeito para desenvolvimento e testes**
❌ **E-mails NÃO são enviados realmente**

---

## 🚀 Como Ativar Envio Real de E-mails (HOSTINGER)

### Passo 1: Obter Credenciais SMTP do Hostinger

O e-mail `controleinterno@transpjardim.com` já está criado na Hostinger. Você precisará:

1. Acesse o painel da Hostinger: https://hpanel.hostinger.com
2. Vá em **E-mails** → Selecione `controleinterno@transpjardim.com`
3. Anote as credenciais SMTP:
   - **Servidor SMTP**: `smtp.hostinger.com`
   - **Porta**: `465` (SSL) ou `587` (TLS)
   - **Usuário**: `controleinterno@transpjardim.com`
   - **Senha**: (a senha configurada no Hostinger)

### Passo 2: Criar Edge Function no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **dpnvtorphsxrncqtojvp**
3. Vá em **Edge Functions** → **New Function**
4. Nome: `enviar-email`
5. Cole o código da função (veja exemplo abaixo)
6. Faça o **Deploy**

### Passo 3: Configurar Secrets no Supabase

No terminal ou via dashboard do Supabase, configure as credenciais:

```bash
supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=controleinterno@transpjardim.com
supabase secrets set SMTP_PASS=sua_senha_aqui
```

### Passo 4: Configurar Variável de Ambiente Local

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_EMAIL_ENABLED=true
```

### Passo 5: Reiniciar o Servidor

```bash
npm run dev
```

---

## 📝 Exemplo de Edge Function (Supabase + Hostinger SMTP)

Crie o arquivo no Supabase Edge Functions:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { to, subject, message } = await req.json()

    // Configurar cliente SMTP da Hostinger
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com',
        port: Number(Deno.env.get('SMTP_PORT')) || 465,
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') || 'controleinterno@transpjardim.com',
          password: Deno.env.get('SMTP_PASS') || '',
        },
      },
    })

    // Enviar e-mail
    await client.send({
      from: 'controleinterno@transpjardim.com',
      to: to,
      subject: subject,
      content: 'text/html',
      html: message,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'E-mail enviado com sucesso' }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🔍 Verificar Modo Atual

Abra o console do navegador (F12) e procure por:

```
[EmailService] Modo: 🧪 SIMULAÇÃO
```

ou

```
[EmailService] Modo: ✉️ REAL
```

---

## 📚 Recursos Adicionais

- **Hostinger E-mail**: https://hpanel.hostinger.com
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **Documentação SMTP Hostinger**: https://support.hostinger.com/pt-BR/articles/1583229-como-configurar-uma-conta-de-e-mail-em-clientes-de-e-mail
- **Documentação do Sistema**: Ver README.md

---

## ⚠️ Notas Importantes

1. **Modo de Simulação é seguro** - Use sem preocupações em desenvolvimento
2. **E-mail remetente**: controleinterno@transpjardim.com (já configurado na Hostinger)
3. **Rate Limits**: O sistema já implementa proteção contra spam
4. **Logs**: Todos os envios são registrados no console do navegador
5. **Segurança**: NUNCA commite o arquivo `.env` com as senhas no Git

---

## 🆘 Problemas Comuns

### "Failed to fetch"
✅ **Normal em modo simulação** - Sistema funcionando corretamente

### Após ativar modo real e continua em simulação
1. Verifique se o arquivo `.env` está na raiz do projeto
2. Reinicie o servidor (`npm run dev`)
3. Limpe o cache do navegador (Ctrl+F5)

### E-mails não chegam (modo real ativo)
1. Verifique se a Edge Function foi deployada
2. Confirme os secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) no Supabase
3. Verifique pasta de spam do destinatário
4. Confira logs na aba "Edge Functions" do Supabase
5. Teste as credenciais SMTP em outro cliente de e-mail

### Erro de autenticação SMTP
1. Confirme a senha do e-mail no painel da Hostinger
2. Verifique se o e-mail `controleinterno@transpjardim.com` está ativo
3. Confirme que a porta está correta (465 para SSL, 587 para TLS)

---

## 📋 Checklist de Ativação

- [ ] Obter credenciais SMTP da Hostinger
- [ ] Criar Edge Function `enviar-email` no Supabase
- [ ] Configurar secrets no Supabase (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- [ ] Criar arquivo `.env` com `VITE_EMAIL_ENABLED=true`
- [ ] Reiniciar servidor local
- [ ] Testar envio na página de testes
- [ ] Verificar recebimento do e-mail

---

**Desenvolvido para a Controladoria Municipal de Jardim/CE** 🏛️