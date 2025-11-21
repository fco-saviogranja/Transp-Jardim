# 🎨 Guia Visual Simplificado - Configurar E-mail no Supabase

**Para quem:** Nunca usou Supabase antes  
**Tempo:** 15 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

---

## 🎯 O QUE VOCÊ VAI FAZER (EM PALAVRAS SIMPLES)

Imagine que o Supabase é um "ajudante na nuvem" que vai enviar e-mails para você.

Você vai:
1. **Dar a senha do e-mail** para o ajudante (de forma segura)
2. **Ensinar o ajudante a enviar e-mails** (copiar um código pronto)
3. **Ativar o ajudante** (fazer deploy)

---

## 📦 OPÇÃO FÁCIL: SEM INSTALAR NADA

Se você não quer instalar o Supabase CLI, pode fazer **tudo pelo navegador**!

### **PASSO 1: Criar a Função pelo Painel Web**

1. Acesse: https://supabase.com/dashboard
2. Clique no seu projeto **TranspJardim**
3. No menu lateral esquerdo, procure por **"Functions"** ou **"Edge Functions"**
4. Clique em **"+ New Function"** (botão verde/azul no canto)
5. Preencha:
   - **Name (Nome):** `email`
   - **Template:** Pode deixar o padrão ou escolher "Blank"
6. Clique em **"Create Function"**

**✅ Pronto! Função criada.**

---

### **PASSO 2: Colar o Código da Função**

1. Depois de criar, você vai ver um **editor de código** (igual ao VS Code)
2. **DELETE todo o código** que está lá
3. Abra o arquivo `supabase-edge-function-email-example.ts` (no seu projeto)
4. **COPIE TODO O CÓDIGO** (Ctrl+A, Ctrl+C)
5. **COLE** no editor do Supabase (Ctrl+V)
6. Clique em **"Deploy"** ou **"Save"** (botão no canto superior direito)

**✅ Código copiado e salvo!**

---

### **PASSO 3: Configurar a Senha do E-mail**

1. Ainda no painel do Supabase
2. Menu lateral → **Project Settings** (ícone de engrenagem ⚙️)
3. Procure por **"Edge Functions"** na lista
4. Role até encontrar **"Secrets"** ou **"Environment Variables"**

**Se não encontrar "Secrets", procure por:**
- "Configuration" → "Secrets"
- "Functions" → "Manage secrets"
- Ou um botão **"+ Add secret"**

5. Clique em **"Add new secret"** ou **"+ New"**
6. Preencha:

```
Name:  SMTP_PASSWORD
Value: [Cole aqui a senha do e-mail controleinterno@transpjardim.com]
```

7. Clique em **"Add"** ou **"Save"**

**IMPORTANTE:** A senha vai ficar escondida (••••••••), isso é normal e seguro!

**✅ Senha configurada!**

---

### **PASSO 4: Pegar a URL da Função**

1. Volte para **Edge Functions** (menu lateral)
2. Clique na função **"email"** que você criou
3. Procure por **"Function URL"** ou **"Endpoint"**
4. Deve ser algo como:
   ```
   https://abc123xyz.supabase.co/functions/v1/email
   ```
5. **COPIE ESSA URL** (você vai precisar dela)

**✅ URL copiada!**

---

### **PASSO 5: Atualizar o Frontend**

1. Abra o projeto TranspJardim no VS Code
2. Abra o arquivo `/lib/emailService.ts`
3. Procure por esta linha (linha 3):
   ```typescript
   const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-225e1157`;
   ```
4. Mude para:
   ```typescript
   const BASE_URL = `https://${projectId}.supabase.co/functions/v1/email`;
   ```
5. Salve o arquivo (Ctrl+S)

**✅ Frontend atualizado!**

---

### **PASSO 6: Testar (Opção Fácil - Pelo Frontend)**

1. Abra o sistema TranspJardim no navegador
2. Faça login como **administrador**
3. Vá em **Configurações** → **E-mail** (ou onde tiver teste de e-mail)
4. Digite seu e-mail pessoal
5. Clique em **"Enviar E-mail de Teste"**
6. Aguarde alguns segundos...
7. **Verifique sua caixa de entrada!** 📧

**✅ Se recebeu o e-mail, FUNCIONOU!** 🎉

---

## 🔍 VISUALIZANDO ONDE ESTÃO AS COISAS NO PAINEL SUPABASE

### **📍 Localização 1: Edge Functions**

```
🏠 Painel Principal
  └─ 📁 Menu Lateral Esquerdo
      └─ ⚡ Edge Functions
          └─ ➕ New Function (criar)
          └─ 📧 email (sua função)
              └─ 📝 Editor de Código
              └─ 🚀 Deploy (botão)
              └─ 📊 Logs
```

### **📍 Localização 2: Secrets (Senhas)**

```
🏠 Painel Principal
  └─ ⚙️ Project Settings (menu lateral, ícone engrenagem)
      └─ 📂 Edge Functions
          └─ 🔐 Secrets / Environment Variables
              └─ ➕ Add new secret
              └─ 📝 SMTP_PASSWORD: •••••••••
```

### **📍 Localização 3: API Keys**

```
🏠 Painel Principal
  └─ ⚙️ Project Settings
      └─ 🔑 API
          └─ 📋 Project URL: https://abc123xyz.supabase.co
          └─ 🔑 anon public: eyJhbGc... (copiar)
```

---

## 🧪 TESTAR PELO NAVEGADOR (SEM CURL)

Se você não consegue usar o terminal, use esta página web:

### **Usando reqbin.com:**

1. Acesse: https://reqbin.com/
2. Escolha **POST** no dropdown
3. Cole a URL:
   ```
   https://SEU_PROJECT_ID.supabase.co/functions/v1/email/test
   ```
4. Clique em **"Headers"**
5. Adicione estes headers:
   ```
   Authorization: Bearer SUA_ANON_KEY
   Content-Type: application/json
   ```
6. Clique em **"Content"**
7. Cole este JSON:
   ```json
   {
     "testEmail": "seu-email@gmail.com"
   }
   ```
8. Clique em **"Send"**
9. Veja a resposta abaixo!

---

## 📸 EXEMPLO VISUAL DO PAINEL SUPABASE

### **Tela 1: Dashboard Principal**
```
┌─────────────────────────────────────────────────────────┐
│  Supabase                                      [Perfil]  │
├───────────────────┬─────────────────────────────────────┤
│                   │                                     │
│  🏠 Home          │  🎉 Bem-vindo ao TranspJardim!     │
│  📊 Table Editor  │                                     │
│  🔧 SQL Editor    │  Projeto: TranspJardim              │
│  🔐 Authentication│                                     │
│  💾 Storage       │  Status: ● Ativo                    │
│  ⚡ Edge Functions│                                     │  ← CLICAR AQUI
│  📈 Database      │                                     │
│  ⚙️ Project Settings                                    │  ← OU AQUI
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

### **Tela 2: Edge Functions**
```
┌─────────────────────────────────────────────────────────┐
│  Edge Functions                        [+ New Function] │ ← CLICAR AQUI
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📧 email                                    ●  Active  │ ← SUA FUNÇÃO
│     https://abc123.supabase.co/functions/v1/email      │
│                                                         │
│     [Deploy] [Logs] [Settings]                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Tela 3: Editor de Código**
```
┌─────────────────────────────────────────────────────────┐
│  email/index.ts                            [💾 Deploy]  │ ← CLICAR PARA SALVAR
├─────────────────────────────────────────────────────────┤
│   1  import { serve } from '...';                       │
│   2                                                     │
│   3  // COLE SEU CÓDIGO AQUI                           │ ← COLAR AQUI
│   4                                                     │
│   5  serve(async (req) => {                            │
│   6    // ...                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Tela 4: Secrets (Senhas)**
```
┌─────────────────────────────────────────────────────────┐
│  Secrets                                  [+ Add secret] │ ← CLICAR AQUI
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Name              Value           Updated              │
│  ──────────────    ──────────      ────────             │
│  SMTP_PASSWORD     •••••••••       2 min ago           │ ← SUA SENHA
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST SIMPLIFICADO

Marque conforme for fazendo:

- [ ] **1.** Acessei o painel do Supabase
- [ ] **2.** Cliquei em "Edge Functions"
- [ ] **3.** Cliquei em "+ New Function"
- [ ] **4.** Nomeei como "email"
- [ ] **5.** Abri o editor de código
- [ ] **6.** Deletei o código padrão
- [ ] **7.** Copiei o código de `supabase-edge-function-email-example.ts`
- [ ] **8.** Colei no editor
- [ ] **9.** Cliquei em "Deploy" para salvar
- [ ] **10.** Fui em "Project Settings"
- [ ] **11.** Cliquei em "Edge Functions" nas configurações
- [ ] **12.** Encontrei "Secrets" ou "Environment Variables"
- [ ] **13.** Cliquei em "Add new secret"
- [ ] **14.** Coloquei Name: `SMTP_PASSWORD`
- [ ] **15.** Coloquei Value: senha do e-mail
- [ ] **16.** Salvei
- [ ] **17.** Copiei a URL da função
- [ ] **18.** Atualizei `/lib/emailService.ts`
- [ ] **19.** Testei enviar um e-mail
- [ ] **20.** RECEBI O E-MAIL! 🎉

---

## 🎬 VÍDEO TUTORIAL (ALTERNATIVA)

Se preferir assistir um vídeo (em inglês), pesquise no YouTube:
- "Supabase Edge Functions Tutorial"
- "How to create Supabase Functions"

**Exemplo de busca:** `supabase edge functions tutorial beginner`

---

## 💡 DICAS

### **Dica 1: Salvando as Configurações**
Sempre clique em **"Save"** ou **"Deploy"** depois de fazer mudanças!

### **Dica 2: Verificando se Funcionou**
Depois de configurar, vá em **Edge Functions** → **email** → **Logs**
- Se aparecer mensagens de erro, algo está errado
- Se aparecer "✅ E-mail enviado", está funcionando!

### **Dica 3: Copiando Código**
No VS Code: `Ctrl+A` (selecionar tudo) → `Ctrl+C` (copiar)
No Supabase: `Ctrl+A` (selecionar tudo) → `Delete` → `Ctrl+V` (colar)

---

## 🆘 AINDA COM DÚVIDAS?

### **Onde está o Project Settings?**
→ Menu lateral esquerdo, ícone de engrenagem ⚙️ bem embaixo

### **Não encontro "Edge Functions" no menu**
→ Pode estar como "Functions" apenas, ou dentro de "Database"

### **Não encontro "Secrets"**
→ Procure por "Environment Variables" ou "Configuration" em Project Settings

### **O botão "Deploy" não aparece**
→ Tente clicar em "Save" ou apertar `Ctrl+S` no editor

### **Como sei se a senha foi salva?**
→ Ela vai aparecer na lista com pontinhos (••••••••)

### **Posso ver a senha depois de salvar?**
→ Não, por segurança. Se errou, delete e adicione de novo.

---

## 🎯 EM RESUMO

**3 passos principais:**

```
1️⃣ CRIAR FUNÇÃO
   Supabase → Edge Functions → + New → "email"

2️⃣ COLAR CÓDIGO
   Editor → Deletar tudo → Colar código → Deploy

3️⃣ CONFIGURAR SENHA
   Project Settings → Secrets → Add → SMTP_PASSWORD
```

**Pronto!** 🎉

---

<div align="center">
  <h2>✅ Agora você consegue!</h2>
  <p>Siga os passos com calma, um de cada vez.</p>
  <p>Se travar em algum, me avise e eu ajudo! 😊</p>
</div>
