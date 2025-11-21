# 🚀 Guia Simplificado - 3 Passos para Ativar E-mail

## O que você vai fazer:
Configurar o Supabase para enviar e-mails automáticos via Hostinger SMTP.

---

## ✅ PASSO 1: Criar a Função (2 minutos)

### Onde fazer:
1. Acesse: **https://supabase.com/dashboard**
2. Entre no projeto **TranspJardim**
3. Menu lateral → **Edge Functions** (ou apenas "Functions")

### O que fazer:
1. Clique no botão **"+ New Function"**
2. Digite o nome: **`email`** (sem aspas, tudo minúsculo)
3. Clique **"Create"**

### ✅ Você completou quando:
- Aparecer uma tela de editor de código
- O nome "email" estiver visível no topo

---

## ✅ PASSO 2: Colar o Código (1 minuto)

### Onde fazer:
No editor que acabou de abrir (da função "email")

### O que fazer:
1. **Apague TODO o código** que está no editor (Ctrl+A → Delete)
2. **Abra o arquivo** `supabase-edge-function-email-example.ts` no seu projeto
3. **Copie TODO o conteúdo** do arquivo (Ctrl+A → Ctrl+C)
4. **Cole no editor** do Supabase (Ctrl+V)
5. Clique no botão **"Deploy"** (canto superior direito)
6. **Aguarde** até ver: ✅ "Deployed successfully"

### ✅ Você completou quando:
- Aparecer mensagem verde de sucesso
- O status mostrar "deployed" ou "active"

---

## ✅ PASSO 3: Configurar Senha (2 minutos)

### Onde fazer:
1. Menu lateral → **⚙️ Settings** (ícone de engrenagem)
2. Clique em **"Project Settings"**
3. Na lista lateral → **"Edge Functions"**
4. Role a página até **"Secrets"** (ou "Environment Variables")

### O que fazer:
1. Clique em **"+ Add secret"** ou **"+ New"**
2. Preencha:
   - **Name:** `SMTP_PASSWORD` (exatamente assim, maiúsculas)
   - **Value:** A senha do e-mail controleinterno@transpjardim.com
3. Clique **"Add"** ou **"Save"**

### ⚠️ IMPORTANTE:
- O nome DEVE ser exatamente: `SMTP_PASSWORD`
- Use a senha correta do e-mail Hostinger
- A senha ficará oculta após salvar (isso é normal!)

### ✅ Você completou quando:
- A variável "SMTP_PASSWORD" aparecer na lista de secrets
- O valor estiver marcado como "hidden" ou com asteriscos (••••)

---

## 🎉 PRONTO!

Se você completou os 3 passos, o sistema está **100% configurado** e pronto para enviar e-mails!

---

## 🧪 TESTAR (Recomendado)

### Pelo sistema TranspJardim:
1. Faça login como admin
2. Vá em **Configurações → E-mail**
3. Digite seu e-mail pessoal
4. Clique **"Enviar E-mail de Teste"**
5. Verifique sua caixa de entrada

### O que você deve receber:
- Um e-mail com o assunto: "🧪 TESTE: Configuração SMTP - TranspJardim"
- Remetente: TranspJardim <controleinterno@transpjardim.com>
- Design com as cores do sistema (verde)

---

## 🆘 PROBLEMAS COMUNS

### "Não encontro Edge Functions no menu"
→ Procure apenas por "Functions" (sem "Edge")
→ Pode estar em "Database" → "Functions"

### "Não encontro Secrets"
→ Em Project Settings → Edge Functions → Role BEM para baixo
→ Pode chamar "Environment Variables" ou "Secrets"

### "O Deploy não funciona"
→ Verifique se colou TODO o código (deve ter mais de 300 linhas)
→ Aguarde pelo menos 30 segundos após clicar Deploy
→ Veja se há erros em vermelho na tela

### "Testei mas não recebeu e-mail"
1. Verifique se a senha está correta (Secrets)
2. Veja os logs: Edge Functions → email → Logs
3. Verifique spam/lixeira no seu e-mail
4. Aguarde até 2 minutos (pode demorar um pouco)

---

## 📞 PRECISA DE AJUDA VISUAL?

Abra no navegador o arquivo:
**`GUIA_VISUAL_CONFIGURACAO_EMAIL.html`**

Ele tem:
- ✅ Checklist interativo
- 📋 Botão para copiar código
- 🎯 Instruções passo a passo
- 🖼️ Indicações visuais

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes técnicos:
- **GUIA_VISUAL_SUPABASE.md** - Guia detalhado com imagens
- **GUIA_PASSO_A_PASSO_SUPABASE.md** - Troubleshooting completo
- **CONFIGURACAO_HOSTINGER_EMAIL.md** - Documentação técnica

---

<div align="center">

### ✨ Só isso! Simples assim! ✨

**Tempo total:** ~5 minutos  
**Dificuldade:** ⭐⭐ (Fácil)

</div>
