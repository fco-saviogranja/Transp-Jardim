# 📘 Guia Passo a Passo: Configurar E-mail no Supabase

**Para:** TranspJardim  
**Objetivo:** Configurar o Hostinger SMTP no Supabase para enviar e-mails

---

## 🎯 O QUE VOCÊ VAI FAZER

Você vai criar uma "função" (um pedaço de código) no Supabase que vai enviar e-mails usando o servidor do Hostinger.

**Resumo simples:**
1. Colocar a senha do e-mail no Supabase (de forma segura)
2. Criar uma "função" que envia e-mails
3. Testar se funciona

**Tempo estimado:** 15-20 minutos

---

## 📋 ANTES DE COMEÇAR - VOCÊ VAI PRECISAR DE:

- [ ] Acesso ao painel do Supabase (https://supabase.com)
- [ ] Senha do e-mail **controleinterno@transpjardim.com**
- [ ] Terminal/Prompt de Comando instalado no seu computador
- [ ] Supabase CLI instalado (vou ensinar como instalar)

---

## PARTE 1: INSTALAR O SUPABASE CLI (Linha de Comando)

### **Opção A: Windows**

1. Abra o **PowerShell** (ou Prompt de Comando)
2. Cole e execute este comando:

```powershell
# Instalar Scoop (gerenciador de pacotes)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

3. Verifique se instalou:
```bash
supabase --version
```

### **Opção B: Mac**

1. Abra o **Terminal**
2. Cole e execute:

```bash
brew install supabase/tap/supabase
```

3. Verifique:
```bash
supabase --version
```

### **Opção C: Linux**

```bash
# Baixar e instalar
wget -O supabase.tar.gz https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz
tar -xzf supabase.tar.gz
sudo mv supabase /usr/local/bin/
```

**✅ Teste:** Digite `supabase --version` - deve aparecer algo como `1.x.x`

---

## PARTE 2: CONECTAR NO SEU PROJETO SUPABASE

### **Passo 1: Pegar as Credenciais do Seu Projeto**

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto **TranspJardim**
3. No menu lateral esquerdo, clique em **⚙️ Project Settings** (Configurações do Projeto)
4. Clique em **API**
5. Copie e guarde estes valores:

```
Project URL: https://xxxxxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGc................. (um texto bem grande)
service_role key: eyJhbGc................. (outro texto grande)
```

### **Passo 2: Fazer Login no Supabase CLI**

1. No terminal, digite:
```bash
supabase login
```

2. Vai abrir uma página no navegador
3. Clique em **"Authorize"** (Autorizar)
4. Pronto! Agora você está conectado

### **Passo 3: Linkar com Seu Projeto**

1. No terminal, navegue até a pasta do seu projeto TranspJardim:
```bash
cd caminho/para/transpjardim
```

2. Inicialize o Supabase no projeto:
```bash
supabase init
```

3. Linkar com seu projeto online:
```bash
supabase link --project-ref SEU_PROJECT_ID
```

**Como pegar o PROJECT_ID:**
- Na URL do seu projeto: `https://supabase.com/dashboard/project/ESTE_É_O_ID`
- Ou em Project Settings → General → Reference ID

**Exemplo:**
```bash
supabase link --project-ref abc123xyz
```

4. Vai pedir a senha do banco de dados (Database Password) - digite a senha que você criou quando criou o projeto

**✅ Sucesso:** Deve aparecer "Linked to project abc123xyz"

---

## PARTE 3: CONFIGURAR VARIÁVEIS DE AMBIENTE (A SENHA DO E-MAIL)

Aqui você vai colocar a senha do e-mail de forma **SEGURA** no Supabase.

### **Método 1: Pelo Terminal (Recomendado)**

```bash
# Configurar a senha do e-mail
supabase secrets set SMTP_PASSWORD="SUA_SENHA_AQUI"

# Configurar outras variáveis (opcional, já tem padrão)
supabase secrets set SMTP_HOST="smtp.hostinger.com"
supabase secrets set SMTP_PORT="465"
supabase secrets set SMTP_USER="controleinterno@transpjardim.com"
```

**Substitua `SUA_SENHA_AQUI` pela senha real do e-mail controleinterno@transpjardim.com**

**✅ Sucesso:** Deve aparecer "Finished supabase secrets set."

### **Método 2: Pelo Painel Web do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto
3. Menu lateral → **⚙️ Project Settings**
4. Clique em **Edge Functions**
5. Role até encontrar **"Secrets"** ou **"Environment Variables"**
6. Clique em **"Add new secret"** ou **"+ New variable"**
7. Preencha:
   - **Name (Nome):** `SMTP_PASSWORD`
   - **Value (Valor):** Sua senha do e-mail
8. Clique em **"Save"** ou **"Add"**

**Repita para as outras (opcional):**
- `SMTP_HOST` = `smtp.hostinger.com`
- `SMTP_PORT` = `465`
- `SMTP_USER` = `controleinterno@transpjardim.com`

---

## PARTE 4: CRIAR A FUNÇÃO DE E-MAIL

### **Passo 1: Criar a Função**

No terminal, dentro da pasta do projeto:

```bash
supabase functions new email
```

**✅ Sucesso:** Deve criar a pasta `supabase/functions/email/`

### **Passo 2: Copiar o Código**

1. Abra o arquivo que acabou de ser criado:
   ```
   supabase/functions/email/index.ts
   ```

2. **DELETE TODO O CONTEÚDO** que está lá dentro

3. Abra o arquivo `supabase-edge-function-email-example.ts` (que eu criei para você)

4. **COPIE TODO O CONTEÚDO** desse arquivo

5. **COLE** no arquivo `supabase/functions/email/index.ts`

6. **SALVE** o arquivo

**Estrutura do projeto agora:**
```
transpjardim/
├── supabase/
│   ├── functions/
│   │   └── email/
│   │       └── index.ts  ← Código que você colou aqui
│   └── config.toml
├── src/
├── ...
```

---

## PARTE 5: FAZER DEPLOY (PUBLICAR) DA FUNÇÃO

### **Passo 1: Deploy**

No terminal:

```bash
supabase functions deploy email
```

**O que vai acontecer:**
- Vai subir seu código para o Supabase
- Vai criar a função online
- Pode demorar 30-60 segundos

**✅ Sucesso:** Deve aparecer:
```
Deployed Function email with version xxxxx
URL: https://xxxxxxxx.supabase.co/functions/v1/email
```

**GUARDE ESSA URL!** Você vai precisar dela.

### **Passo 2: Verificar se Subiu**

1. Acesse o painel do Supabase
2. Menu lateral → **Edge Functions**
3. Deve aparecer uma função chamada **"email"** ✅

---

## PARTE 6: TESTAR SE ESTÁ FUNCIONANDO

### **Teste 1: Pelo Terminal**

Substitua os valores e execute:

```bash
curl -X POST https://SEU_PROJECT_ID.supabase.co/functions/v1/email/test \
  -H "Authorization: Bearer SUA_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"SEU_EMAIL@gmail.com"}'
```

**Onde pegar:**
- `SEU_PROJECT_ID`: Na URL do projeto ou em Project Settings → API → Project URL
- `SUA_ANON_KEY`: Project Settings → API → anon public (o token grande)
- `SEU_EMAIL@gmail.com`: Seu e-mail pessoal para receber o teste

**Exemplo real:**
```bash
curl -X POST https://abc123xyz.supabase.co/functions/v1/email/test \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"testEmail":"joao@gmail.com"}'
```

**✅ Sucesso:** Deve retornar:
```json
{
  "success": true,
  "message": "E-mail de teste enviado com sucesso",
  "to": "joao@gmail.com"
}
```

**E você deve receber o e-mail em alguns segundos!**

### **Teste 2: Verificar Logs**

1. No painel do Supabase
2. Menu → **Edge Functions**
3. Clique na função **"email"**
4. Clique em **"Logs"**
5. Deve aparecer:
   ```
   ✅ Servidor SMTP conectado
   📧 Enviando para: joao@gmail.com
   ✅ E-mail enviado: <message-id>
   ```

---

## PARTE 7: ATUALIZAR O FRONTEND PARA USAR A FUNÇÃO

### **Atualizar o arquivo `/lib/emailService.ts`**

Agora você precisa atualizar a URL base no frontend para apontar para sua função:

1. Abra o arquivo `/lib/emailService.ts`

2. Encontre esta linha (linha 3):
```typescript
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157`;
```

3. Substitua por:
```typescript
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/email`;
```

4. Salve o arquivo

**Pronto!** Agora o frontend vai chamar a nova função de e-mail.

---

## ✅ CHECKLIST FINAL

Marque o que você já fez:

### Instalação:
- [ ] Instalei o Supabase CLI
- [ ] Testei `supabase --version` e funcionou
- [ ] Fiz login com `supabase login`
- [ ] Linkei o projeto com `supabase link`

### Configuração:
- [ ] Configurei a variável `SMTP_PASSWORD` com a senha do e-mail
- [ ] (Opcional) Configurei as outras variáveis SMTP

### Função:
- [ ] Criei a função com `supabase functions new email`
- [ ] Copiei o código de `supabase-edge-function-email-example.ts`
- [ ] Colei no arquivo `supabase/functions/email/index.ts`
- [ ] Salvei o arquivo

### Deploy:
- [ ] Fiz deploy com `supabase functions deploy email`
- [ ] Vi a mensagem de sucesso com a URL
- [ ] Verifiquei no painel que a função apareceu

### Teste:
- [ ] Executei o comando curl de teste
- [ ] Recebi o e-mail de teste
- [ ] Verifiquei os logs no painel

### Frontend:
- [ ] Atualizei a URL no `/lib/emailService.ts`
- [ ] Testei enviar um alerta pelo sistema

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "SMTP_PASSWORD não configurada"**

**Solução:**
```bash
# Configurar novamente
supabase secrets set SMTP_PASSWORD="sua_senha"

# Verificar se foi salva
supabase secrets list
```

### **Erro: "Authentication failed"**

**Causas possíveis:**
1. Senha do e-mail está errada
2. E-mail controleinterno@transpjardim.com não existe ou está bloqueado

**Solução:**
- Verifique a senha no painel do Hostinger
- Tente fazer login manualmente no e-mail
- Confirme que o e-mail está ativo

### **Erro: "Function not found"**

**Solução:**
```bash
# Verificar se a função existe
supabase functions list

# Se não aparecer, criar novamente
supabase functions new email

# E fazer deploy
supabase functions deploy email
```

### **Erro: "Project not linked"**

**Solução:**
```bash
# Linkar novamente
supabase link --project-ref SEU_PROJECT_ID
```

### **Curl não funciona no Windows**

**Solução:** Use PowerShell ou instale o Git Bash:
- Download: https://git-scm.com/download/win
- Use o "Git Bash" para rodar os comandos curl

**Ou use o Postman:**
1. Baixe: https://www.postman.com/downloads/
2. Crie uma requisição POST
3. URL: `https://seu-projeto.supabase.co/functions/v1/email/test`
4. Headers:
   - `Authorization`: `Bearer sua_anon_key`
   - `Content-Type`: `application/json`
5. Body (raw, JSON):
   ```json
   {"testEmail":"seu-email@gmail.com"}
   ```
6. Clique em **Send**

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verifique os logs:**
   ```bash
   supabase functions logs email
   ```

2. **Teste a conexão SMTP manualmente:**
   - Use um cliente de e-mail (Thunderbird, Outlook)
   - Configure com os dados do Hostinger
   - Tente enviar um e-mail manual

3. **Contate o suporte:**
   - **Hostinger:** Chat 24/7 - https://www.hostinger.com.br/suporte
   - **Supabase:** Discord - https://discord.supabase.com/

---

## 🎯 RESUMO DO QUE VOCÊ FEZ

Quando terminar todos os passos, você terá:

✅ **Supabase CLI instalado** no seu computador  
✅ **Função de e-mail criada** no Supabase  
✅ **Senha configurada** de forma segura  
✅ **Sistema enviando e-mails** via Hostinger  
✅ **Frontend conectado** à função  

---

## 🎉 PRÓXIMO PASSO

Depois que tudo funcionar, teste no sistema:

1. Faça login como admin
2. Crie um critério de teste
3. Atribua a um usuário com e-mail
4. Aguarde o alerta ser disparado
5. Verifique se o e-mail chegou!

---

<div align="center">
  <h2>🚀 Boa sorte!</h2>
  <p>Se tiver qualquer dúvida, me avise!</p>
</div>
