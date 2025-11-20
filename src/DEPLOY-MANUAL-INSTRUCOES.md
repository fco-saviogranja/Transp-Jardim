# 🚀 Deploy Manual - Instruções

## ❌ Erro Encontrado
```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" 
failed with status 403
```

Este erro acontece porque não temos permissão para fazer deploy direto via Figma Make.

---

## ✅ Soluções Alternativas

### **Opção 1: Deploy via Supabase CLI (Recomendado)**

Se você tem o projeto clonado localmente com Supabase CLI instalado:

```bash
# 1. Navegue até a pasta do projeto
cd transpjardim

# 2. Faça login no Supabase (se ainda não estiver logado)
supabase login

# 3. Conecte ao projeto remoto
supabase link --project-ref vxviVQs5SvXJckSTiehyZh

# 4. Faça deploy da Edge Function atualizada
supabase functions deploy server

# 5. Verifique se o deploy foi bem-sucedido
supabase functions list
```

---

### **Opção 2: Deploy via Dashboard do Supabase**

1. **Baixar os arquivos atualizados:**
   - `/supabase/functions/server/index.tsx` (corrigido)
   - `/supabase/functions/server/kv_store.tsx`
   - `/supabase/functions/server/email-test-fixed.tsx`

2. **Acessar o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard/project/vxviVQs5SvXJckSTiehyZh
   - No menu lateral, clique em **"Edge Functions"**

3. **Atualizar a função:**
   - Clique na função **"server"** (ou o nome da sua Edge Function)
   - Clique em **"Edit Function"** ou **"Deploy New Version"**
   - Cole o conteúdo do arquivo `index.tsx` atualizado
   - Clique em **"Deploy"**

---

### **Opção 3: Deploy via Git + CI/CD** (se configurado)

Se o projeto está conectado a um repositório Git com CI/CD:

```bash
# 1. Baixar as mudanças do Figma Make
# (copie os arquivos /supabase/functions/server/*)

# 2. Commitar as mudanças
git add supabase/functions/server/index.tsx
git commit -m "fix: remove forced email test mode redirect"

# 3. Fazer push
git push origin main

# 4. O CI/CD deve fazer o deploy automaticamente
```

---

### **Opção 4: Copiar e Colar Código Manualmente**

Se você não tem acesso ao CLI ou Git:

#### **Passo 1: Copiar o código atualizado**

Copie o conteúdo completo de `/supabase/functions/server/index.tsx` (o arquivo já está atualizado neste projeto).

#### **Passo 2: Acessar o Editor Online**

1. Vá para: https://supabase.com/dashboard/project/vxviVQs5SvXJckSTiehyZh/functions
2. Clique na função **"server"**
3. Procure por um botão **"Edit"**, **"Code"** ou **"Deploy New Version"**

#### **Passo 3: Substituir o código**

1. Delete todo o código antigo
2. Cole o código atualizado de `index.tsx`
3. Salve e faça deploy

#### **Passo 4: Verificar**

1. Teste o endpoint de health check:
   ```bash
   curl https://vxviVQs5SvXJckSTiehyZh.supabase.co/functions/v1/make-server-225e1157/health
   ```
2. Deve retornar `{"status": "ok", ...}`

---

## 🔍 Verificar se o Deploy é Realmente Necessário

### **Cenário 1: Backend já está em produção**

Se o seu backend **JÁ ESTÁ RODANDO** em um servidor (Netlify, Vercel, Railway, etc.) separado do Supabase:

1. As mudanças em `/supabase/functions/server/index.tsx` **NÃO afetam** o backend atual
2. Você precisa encontrar onde o backend está hospedado
3. Fazer deploy lá

**Como verificar onde está o backend:**
```bash
# Verifique o arquivo de configuração
cat /lib/supabaseService.ts
# ou
cat /lib/emailService.ts

# Procure pela URL do backend (algo como):
# - https://transpjardim-api.netlify.app
# - https://transpjardim.railway.app
# - https://api.transpjardim.tech
```

---

### **Cenário 2: Backend não usa Supabase Edge Functions**

Se o backend é um servidor Node.js/Express separado:

1. Ignore as mudanças em `/supabase/functions/`
2. Procure pelo código do servidor em outra pasta (ex: `/server`, `/backend`, `/api`)
3. Aplique as correções lá

**Onde pode estar o código do servidor:**
- `/server/index.js` ou `/server/index.ts`
- `/backend/index.js`
- `/api/index.js`
- Repositório separado

---

## 🎯 Solução Temporária: Usar Configuração do Frontend

Enquanto o deploy do backend não é feito, você pode desativar o modo de teste **via frontend**:

### **Modificar `/lib/emailService.ts`**

Adicione uma flag de configuração:

```typescript
// No topo do arquivo
const FORCE_PRODUCTION_MODE = true; // Ativar quando domínio estiver verificado

// Na função sendTestEmail
async sendTestEmail(testEmail: string): Promise<ApiResponse<EmailResponse>> {
  // Não ajustar e-mail se em modo de produção forçado
  const emailToSend = FORCE_PRODUCTION_MODE ? testEmail : this.adjustEmailForTestMode(testEmail);
  
  const result = await this.request('/email/test', {
    method: 'POST',
    body: JSON.stringify({ testEmail: emailToSend }),
  });
  // ...
}
```

Isso fará com que o frontend envie o e-mail correto, **mas o backend ainda pode redirecionar**.

---

## 📝 Resumo: O Que Fazer Agora

### ✅ **Se você tem acesso ao Supabase CLI:**
```bash
supabase functions deploy server
```

### ✅ **Se você tem acesso ao Dashboard do Supabase:**
- Vá para Edge Functions → server → Deploy New Version
- Cole o código de `/supabase/functions/server/index.tsx`

### ✅ **Se o backend NÃO usa Supabase:**
- Encontre onde o backend está hospedado
- Aplique as correções lá

### ✅ **Não tem certeza?**
- Execute este comando e me mostre o resultado:
  ```bash
  curl -v https://vxviVQs5SvXJckSTiehyZh.supabase.co/functions/v1/make-server-225e1157/health
  ```

---

## 🆘 Precisa de Ajuda?

Me informe:
1. **Você tem o Supabase CLI instalado?**
2. **Consegue acessar o Dashboard do Supabase?**
3. **O backend está em outro lugar (Netlify, Vercel, etc.)?**

Com essas informações, posso dar instruções mais específicas! 🚀

---

**Projeto:** TranspJardim  
**Supabase Project ID:** vxviVQs5SvXJckSTiehyZh  
**Edge Function:** server
