# ✅ CHECKLIST - Configuração E-mail TranspJardim

Imprima ou mantenha esta página aberta enquanto configura!

---

## 📋 ANTES DE COMEÇAR

- [ ] Tenho acesso ao dashboard do Supabase (https://supabase.com/dashboard)
- [ ] Sei a senha do e-mail controleinterno@transpjardim.com
- [ ] O arquivo `supabase-edge-function-email-example.ts` está disponível

---

## 🟢 PASSO 1: Criar a Edge Function

### Navegação:
- [ ] Acessei https://supabase.com/dashboard
- [ ] Selecionei o projeto "TranspJardim"
- [ ] Encontrei o menu "Edge Functions" (ou apenas "Functions")

### Ação:
- [ ] Cliquei no botão "+ New Function"
- [ ] Digitei "email" no campo Name
- [ ] Cliquei em "Create"

### Confirmação:
- [ ] Abriu um editor de código
- [ ] Vejo "email" no nome da função no topo da tela

**Status:** ☐ Incompleto | ☐ Completo

---

## 🔵 PASSO 2: Deploy do Código

### Preparação:
- [ ] Abri o arquivo `supabase-edge-function-email-example.ts`
- [ ] Copiei TODO o conteúdo do arquivo (Ctrl+A → Ctrl+C)

### No Editor Supabase:
- [ ] Selecionei TODO o código existente (Ctrl+A)
- [ ] Apaguei o código existente (Delete)
- [ ] Colei o novo código (Ctrl+V)
- [ ] Verifiquei que o código foi colado completamente

### Deploy:
- [ ] Cliquei no botão "Deploy" (canto superior direito)
- [ ] Aguardei o processo de deploy
- [ ] Vi a mensagem "✅ Deployed successfully"

### Verificação:
- [ ] O status da função mostra "Active" ou "Deployed"
- [ ] Não há erros em vermelho na tela

**Status:** ☐ Incompleto | ☐ Completo

---

## 🟡 PASSO 3: Configurar SMTP_PASSWORD

### Navegação:
- [ ] Cliquei no ícone de ⚙️ Settings no menu lateral
- [ ] Cliquei em "Project Settings"
- [ ] Encontrei "Edge Functions" na lista
- [ ] Rolei a página até encontrar "Secrets"

### Configuração:
- [ ] Cliquei em "+ Add secret" ou "+ New"
- [ ] No campo "Name", digitei: `SMTP_PASSWORD` (exatamente assim)
- [ ] No campo "Value", colei a senha do e-mail
- [ ] Cliquei em "Add" ou "Save"

### Confirmação:
- [ ] A variável "SMTP_PASSWORD" aparece na lista
- [ ] O valor está oculto (••••••) ou marcado como "hidden"

**Status:** ☐ Incompleto | ☐ Completo

---

## 🎉 CONCLUSÃO

- [ ] Todos os 3 passos foram completados
- [ ] Vou testar o envio de e-mail agora

---

## 🧪 TESTE DO SISTEMA

### No TranspJardim:
- [ ] Fiz login como administrador
- [ ] Acessei Configurações → E-mail
- [ ] Digitei meu e-mail pessoal no campo
- [ ] Cliquei em "Enviar E-mail de Teste"

### Verificação:
- [ ] Recebi o e-mail de teste (pode levar até 2 minutos)
- [ ] O remetente é: TranspJardim <controleinterno@transpjardim.com>
- [ ] O design do e-mail tem as cores verde do sistema
- [ ] O e-mail não foi para SPAM/Lixeira

**Teste:** ☐ Não Funcionou | ☐ Funcionou Perfeitamente!

---

## 🔧 TROUBLESHOOTING

Se o teste não funcionou, marque o que você já verificou:

### Verificações Básicas:
- [ ] A função "email" está com status "Active/Deployed"
- [ ] A variável SMTP_PASSWORD está configurada
- [ ] A senha está correta
- [ ] Aguardei pelo menos 2 minutos

### Verificações Avançadas:
- [ ] Verifiquei logs em: Edge Functions → email → Logs
- [ ] Procurei o e-mail na pasta SPAM
- [ ] Testei com outro endereço de e-mail
- [ ] Reiniciei a função (redeploy)

### Erros Comuns:

#### "SMTP_PASSWORD não configurada"
- [ ] Verifiquei que o nome é exatamente `SMTP_PASSWORD` (maiúsculas)
- [ ] Configurei em: Project Settings → Edge Functions → Secrets

#### "Authentication failed"
- [ ] Verifiquei se a senha está correta
- [ ] Testei fazer login no Webmail Hostinger com a mesma senha
- [ ] Verifiquei se não tem espaços antes/depois da senha

#### "Function not found"
- [ ] Verifiquei que o nome da função é exatamente "email" (minúsculo)
- [ ] Fiz deploy da função com sucesso

---

## 📞 ONDE BUSCAR AJUDA

Se nada funcionou, consulte:

1. **GUIA_VISUAL_CONFIGURACAO_EMAIL.html** - Guia interativo
2. **GUIA_SIMPLIFICADO_3_PASSOS.md** - Explicação detalhada
3. **GUIA_VISUAL_SUPABASE.md** - Screenshots e exemplos
4. **CONFIGURACAO_HOSTINGER_EMAIL.md** - Documentação técnica completa

---

## 📊 RESUMO DA CONFIGURAÇÃO

```
┌─────────────────────────────────────────────┐
│          CONFIGURAÇÃO FINAL                 │
├─────────────────────────────────────────────┤
│ Provedor:        Hostinger SMTP             │
│ Host:            smtp.hostinger.com         │
│ Porta:           465 (SSL)                  │
│ Usuário:         controleinterno@           │
│                  transpjardim.com           │
│ Função Supabase: email                      │
│ Secret:          SMTP_PASSWORD              │
└─────────────────────────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASSOS (Após Configuração)

- [ ] Configurar alertas automáticos
- [ ] Testar envio em diferentes horários
- [ ] Verificar que e-mails respeitam dias úteis
- [ ] Monitorar logs de envio
- [ ] Configurar e-mails de notificação para outros usuários

---

<div align="center">

### ✨ Configuração Concluída! ✨

**Data:** ___/___/______  
**Hora:** ___:___  
**Configurado por:** _________________

</div>

---

## 📝 NOTAS E OBSERVAÇÕES

Use este espaço para anotar qualquer problema encontrado ou observação:

```
_____________________________________________________

_____________________________________________________

_____________________________________________________

_____________________________________________________

_____________________________________________________
```
