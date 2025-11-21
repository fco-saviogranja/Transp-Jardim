# 🚀 Comece Aqui: Configurar E-mail no TranspJardim

## ⚡ Início Rápido

Siga estes 3 passos simples para ativar o envio de e-mails:

### 📍 Passo 1: Abra o Sistema
```
1. Execute o TranspJardim localmente
2. Faça login como Administrador
3. Vá para o AdminPanel
```

### 📍 Passo 2: Siga o Guia Visual
```
1. Localize o card laranja: "⚠️ Configuração Necessária: Edge Function"
2. Clique na aba "🌐 Via Web (Mais Fácil)"
3. Siga os 5 passos apresentados
```

### 📍 Passo 3: Configure os Secrets
```
No Supabase Dashboard, adicione:

SMTP_HOST = smtp.hostinger.com
SMTP_PORT = 465
SMTP_USER = controleinterno@transpjardim.com
SMTP_PASSWORD = [SUA_SENHA_DO_EMAIL_AQUI]
```

⚠️ **IMPORTANTE**: Use a senha do e-mail da Hostinger, não a senha do Supabase!

---

## 📚 Precisa de Mais Ajuda?

### 🎯 Guia Visual Interativo
Abra o sistema → AdminPanel → Card "Configuração Edge Function"

### 📖 Guia Completo Passo a Passo
Leia: `/GUIA_PASSO_A_PASSO_EDGE_FUNCTION.md`

### 📊 Documentação Técnica Completa
Leia: `/CONFIGURACAO_EDGE_FUNCTION_PRONTA.md`

### 💻 Código da Edge Function
Veja: `/supabase/functions/enviar-email/index.ts`

---

## ✅ Como Saber se Funcionou?

Após seguir o guia:

1. ✅ Execute o "Diagnóstico Completo de E-mail"
2. ✅ Todas as 3 etapas devem ficar verdes
3. ✅ Envie um e-mail de teste
4. ✅ Verifique sua caixa de entrada (e spam)

Se recebeu o e-mail: **PARABÉNS!** 🎉

---

## 🆘 Problemas?

### Etapa 3 está vermelha?
→ A Edge Function não foi criada ou não foi feito deploy  
→ Volte ao guia e refaça os passos 1-5

### Erro "SMTP_PASSWORD não configurada"?
→ O secret não foi adicionado corretamente  
→ Vá em Edge Functions → Settings → Secrets

### E-mail não chegou?
→ Verifique a caixa de spam  
→ Aguarde até 5 minutos  
→ Teste com outro endereço de e-mail

### Outros erros?
→ Consulte a seção de Troubleshooting em:  
→ `/GUIA_PASSO_A_PASSO_EDGE_FUNCTION.md`

---

## ⏱️ Tempo Necessário

- **Via Web**: 10-15 minutos
- **Via CLI**: 15-20 minutos

---

## 🎯 Pré-requisitos

✅ Conta no Supabase  
✅ Projeto TranspJardim criado no Supabase  
✅ E-mail controleinterno@transpjardim.com configurado na Hostinger  
✅ Senha do e-mail em mãos  

---

**💡 Dica**: O guia visual no sistema tem tudo que você precisa. Basta seguir!

**Última atualização**: 21/11/2024  
**Controladoria Municipal de Jardim/CE**
