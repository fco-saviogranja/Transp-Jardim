# ⚡ Início Rápido - Configurar E-mail em 5 Minutos

**Para:** TranspJardim  
**Objetivo:** Ativar envio de e-mails via Hostinger

---

## 🎯 APENAS 3 PASSOS

### **PASSO 1: Criar a Função** (2 minutos)

1. Acesse: **https://supabase.com/dashboard**
2. Clique no projeto **TranspJardim**
3. Menu lateral → **⚡ Edge Functions**
4. Botão **+ New Function**
5. Nome: `email`
6. Clique **Create**

---

### **PASSO 2: Colar o Código** (1 minuto)

1. Vai abrir um editor de código
2. **Apague tudo** que está lá (Ctrl+A, Delete)
3. Abra o arquivo `supabase-edge-function-email-example.ts` (no seu projeto)
4. **Copie tudo** (Ctrl+A, Ctrl+C)
5. **Cole** no editor do Supabase (Ctrl+V)
6. Botão **Deploy** (canto superior direito)
7. Aguarde "Deployed successfully" ✅

---

### **PASSO 3: Configurar a Senha** (2 minutos)

1. Menu lateral → **⚙️ Project Settings**
2. Clique em **Edge Functions** (na lista)
3. Procure **"Secrets"** (role a página)
4. Botão **+ Add secret** ou **+ New**
5. Preencha:
   ```
   Name:  SMTP_PASSWORD
   Value: [senha do e-mail controleinterno@transpjardim.com]
   ```
6. Botão **Add** ou **Save**

---

## ✅ PRONTO!

**Está funcionando!** Agora o sistema pode enviar e-mails.

---

## 🧪 TESTAR (Opcional)

### **Opção 1: Pelo Sistema**
1. Abra o TranspJardim
2. Login como admin
3. Configurações → E-mail
4. Digite seu e-mail
5. Botão "Enviar Teste"
6. Verifique sua caixa de entrada 📧

### **Opção 2: Pelo Site reqbin.com**
1. Acesse: **https://reqbin.com/**
2. Escolha **POST**
3. URL: `https://SEU_PROJECT_ID.supabase.co/functions/v1/email/test`
   - Pegue o PROJECT_ID em Project Settings → API → Project URL
4. Clique **Headers**, adicione:
   ```
   Authorization: Bearer SUA_ANON_KEY
   Content-Type: application/json
   ```
   - Pegue ANON_KEY em Project Settings → API → anon public
5. Clique **Content**, cole:
   ```json
   {"testEmail": "seu-email@gmail.com"}
   ```
6. Botão **Send**
7. Se retornar `{"success": true}`, funcionou! ✅

---

## 📍 ONDE ESTÁ CADA COISA NO SUPABASE

```
🏠 Dashboard Supabase
  │
  ├─ ⚡ Edge Functions ← Criar função aqui
  │   └─ + New Function → Nome: "email"
  │       └─ Editor → Colar código → Deploy
  │
  └─ ⚙️ Project Settings
      ├─ API ← Copiar URLs e Keys
      │   ├─ Project URL
      │   └─ anon public (key)
      │
      └─ Edge Functions ← Configurar senha
          └─ Secrets → + Add secret
              └─ SMTP_PASSWORD = senha
```

---

## 🆘 PROBLEMAS?

### **"Não encontro Edge Functions no menu"**
→ Procure por "Functions" apenas (sem "Edge")

### **"Não encontro Secrets"**
→ Em Project Settings → Edge Functions → Role a página para baixo

### **"O código não está sendo salvo"**
→ Clique no botão **Deploy** no canto superior direito

### **"Testei mas não recebeu e-mail"**
→ Verifique:
1. Senha está correta? (Project Settings → Edge Functions → Secrets)
2. Função foi criada? (Edge Functions → deve aparecer "email")
3. Veja os logs: Edge Functions → email → Logs

---

## 📞 PRECISA DE AJUDA DETALHADA?

Abra um destes arquivos no projeto:

- **GUIA_VISUAL_SUPABASE.md** ← Explicação visual detalhada
- **GUIA_PASSO_A_PASSO_SUPABASE.md** ← Guia completo com troubleshooting
- **CONFIGURACAO_HOSTINGER_EMAIL.md** ← Documentação técnica completa

---

<div align="center">
  <h2>✅ Só isso! Simples assim.</h2>
  <p>Qualquer dúvida, me chame! 😊</p>
</div>
