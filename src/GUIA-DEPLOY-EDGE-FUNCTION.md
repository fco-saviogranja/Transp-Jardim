# 📧 Guia Completo: Deploy da Edge Function no Supabase

## 🎯 O que vamos fazer?

Criar e fazer deploy da Edge Function `enviar-email` no Supabase para que o sistema TranspJardim consiga enviar e-mails reais via SMTP da Hostinger.

---

## 📋 Pré-requisitos

1. ✅ Node.js instalado (versão 16 ou superior)
2. ✅ Conta no Supabase (você já tem)
3. ✅ Acesso às credenciais SMTP da Hostinger:
   - **Host:** smtp.hostinger.com
   - **Porta:** 587
   - **Usuário:** controleinterno@transpjardim.com
   - **Senha:** [sua senha do e-mail]

---

## 🚀 MÉTODO 1: Deploy pela Interface do Supabase (MAIS FÁCIL)

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto
3. No menu lateral, clique em **"Edge Functions"**

### Passo 2: Criar a Função

1. Clique no botão **"Create a new function"**
2. Nome da função: `enviar-email`
3. Clique em **"Create function"**

### Passo 3: Copiar o Código

1. No editor que aparece, **DELETE TODO O CÓDIGO** existente
2. Abra o arquivo `/supabase-edge-function.ts` que acabei de criar
3. **COPIE TODO O CONTEÚDO** do arquivo
4. **COLE** no editor do Supabase
5. Clique em **"Deploy"** ou **"Save"**

### Passo 4: Configurar os Secrets (Variáveis de Ambiente)

1. No menu lateral, clique em **"Edge Functions"** novamente
2. Clique na aba **"Settings"** ou **"Secrets"**
3. Adicione os seguintes secrets:

   ```
   SMTP_HOST = smtp.hostinger.com
   SMTP_PORT = 587
   SMTP_USER = controleinterno@transpjardim.com
   SMTP_PASS = [SUA_SENHA_DO_EMAIL_AQUI]
   ```

4. Clique em **"Save"** após adicionar cada secret

### Passo 5: Testar

1. Volte para o TranspJardim
2. Vá em **Administração**
3. Clique em **"Iniciar Diagnóstico Completo"**
4. A **Etapa 3** agora deve estar **VERDE** ✅

---

## 🚀 MÉTODO 2: Deploy via CLI (Mais Técnico)

### Passo 1: Instalar o Supabase CLI

```bash
npm install -g supabase
```

### Passo 2: Fazer Login

```bash
supabase login
```

Isso abrirá o navegador para você autorizar.

### Passo 3: Encontrar o Project ID

1. No dashboard do Supabase, vá em **"Settings"** → **"General"**
2. Copie o **"Reference ID"** (exemplo: `abcdefghijklmnop`)

### Passo 4: Linkar o Projeto

```bash
supabase link --project-ref SEU_PROJECT_ID_AQUI
```

Substitua `SEU_PROJECT_ID_AQUI` pelo ID que copiou.

### Passo 5: Criar a Estrutura da Função

```bash
supabase functions new enviar-email
```

Isso criará a pasta `supabase/functions/enviar-email/`

### Passo 6: Copiar o Código

1. Abra o arquivo `/supabase-edge-function.ts` que criei
2. Copie TODO o conteúdo
3. Cole em `supabase/functions/enviar-email/index.ts`

### Passo 7: Configurar os Secrets

```bash
supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=controleinterno@transpjardim.com
supabase secrets set SMTP_PASS=SUA_SENHA_AQUI
```

⚠️ **IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela senha real do e-mail.

### Passo 8: Fazer o Deploy

```bash
supabase functions deploy enviar-email
```

### Passo 9: Testar

1. Volte para o TranspJardim
2. Vá em **Administração**
3. Clique em **"Iniciar Diagnóstico Completo"**
4. A **Etapa 3** deve estar **VERDE** ✅

---

## 🔍 Verificar se funcionou

### 1. No Dashboard do Supabase:

- Vá em **Edge Functions**
- Você deve ver a função `enviar-email` listada
- Status deve estar **"deployed"** ou **"active"**

### 2. No TranspJardim:

1. Vá em **Administração**
2. Painel **"Teste de E-mail"**
3. Digite um e-mail válido
4. Clique em **"Enviar E-mail de Teste"**
5. Deve aparecer: ✅ **"E-mail enviado com sucesso"**

---

## ❌ Troubleshooting (Solução de Problemas)

### Erro: "SMTP authentication failed"

**Causa:** Senha incorreta ou e-mail não configurado na Hostinger

**Solução:**
1. Verifique se o e-mail `controleinterno@transpjardim.com` existe na Hostinger
2. Confirme a senha do e-mail
3. Atualize o secret `SMTP_PASS` com a senha correta

---

### Erro: "Failed to fetch"

**Causa:** A Edge Function ainda não foi criada

**Solução:**
- Siga os passos do **MÉTODO 1** ou **MÉTODO 2** acima

---

### Erro: "Connection timeout"

**Causa:** Firewall ou porta bloqueada

**Solução:**
1. Confirme que a porta 587 está aberta
2. Tente usar porta 465 (SSL):
   ```bash
   supabase secrets set SMTP_PORT=465
   ```
3. Faça deploy novamente

---

### Erro: "Invalid email address"

**Causa:** E-mail de destino inválido

**Solução:**
- Verifique se digitou o e-mail corretamente
- Use um e-mail válido no teste

---

## 📞 Precisa de Ajuda?

### Verificar Logs da Edge Function:

1. No Dashboard do Supabase
2. Vá em **Edge Functions**
3. Clique na função `enviar-email`
4. Clique na aba **"Logs"**
5. Veja os erros em tempo real

### Console do Navegador:

1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Me envie a mensagem completa do erro

---

## ✅ Checklist Final

- [ ] Edge Function `enviar-email` criada no Supabase
- [ ] Código da função copiado e salvo
- [ ] Secrets configurados (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- [ ] Deploy feito com sucesso
- [ ] Teste no TranspJardim funcionando
- [ ] E-mail de teste recebido na caixa de entrada

---

## 🎉 Próximos Passos

Depois que a Edge Function estiver funcionando:

1. ✅ Enviar e-mail de teste real
2. ✅ Configurar alertas automáticos
3. ✅ Testar notificações de tarefas pendentes
4. ✅ Monitorar logs de e-mails enviados

---

**Boa sorte! 🚀**

Se tiver algum problema, me envie:
- Print do erro
- Logs da Edge Function (Dashboard do Supabase)
- Console do navegador (F12)
