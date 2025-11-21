# 🚀 Como Sair do Modo Sandbox do Resend

## 🎯 Objetivo
Sair do modo sandbox para enviar e-mails para **qualquer destinatário** (não apenas controleinterno.jardimce@gmail.com).

---

## ⏱️ TEMPO ESTIMADO
- **Configuração:** 15-30 minutos
- **Propagação DNS:** 10 minutos a 48 horas
- **Total:** ~1-2 dias (considerando tempo de DNS)

---

## 📝 PRÉ-REQUISITOS

✅ Acesso ao painel de controle do domínio `transpjardim.tech`  
✅ Conta no Resend (você já tem)  
✅ Sistema TranspJardim funcionando (você já tem)

---

## 🔧 PASSO 1: Adicionar Domínio no Resend

### 1.1 Acesse o Painel do Resend
```
https://resend.com/login
```

### 1.2 Vá em "Domains"
```
Menu lateral → Domains → Add Domain
```

### 1.3 Digite seu Domínio
```
transpjardim.tech
```

### 1.4 Clique em "Add"

**Resultado:** Resend vai exibir 3 registros DNS que você precisa adicionar.

---

## 🔧 PASSO 2: Configurar DNS

### 2.1 Copie os Registros DNS

O Resend vai te dar algo assim:

#### Registro 1: Verificação de Domínio (TXT)
```
Tipo: TXT
Nome: _resend
Valor: resend-verify-abc123xyz... (valor único)
TTL: 3600
```

#### Registro 2: E-mail Delivery (MX)
```
Tipo: MX
Nome: @ (ou transpjardim.tech)
Valor: feedback-smtp.us-east-1.amazonses.com
Prioridade: 10
TTL: 3600
```

#### Registro 3: SPF (TXT)
```
Tipo: TXT
Nome: @ (ou transpjardim.tech)
Valor: v=spf1 include:amazonses.com ~all
TTL: 3600
```

---

### 2.2 Onde Adicionar esses Registros?

**Acesse o painel onde você registrou o domínio `transpjardim.tech`.**

Exemplos comuns:
- **Registro.br** → Meus domínios → DNS
- **GoDaddy** → Meus produtos → DNS
- **Hostgator** → cPanel → Zone Editor
- **Cloudflare** → DNS → Records

---

### 2.3 Como Adicionar Cada Registro

#### No Painel do seu Provedor DNS:

**Para Registro TXT (_resend):**
```
Tipo: TXT
Nome/Host: _resend
Valor: [Cole o valor fornecido pelo Resend]
TTL: 3600 (ou deixe padrão)
```

**Para Registro MX:**
```
Tipo: MX
Nome/Host: @ (ou deixe em branco ou "transpjardim.tech")
Valor: feedback-smtp.us-east-1.amazonses.com
Prioridade: 10
TTL: 3600 (ou deixe padrão)
```

**Para Registro TXT (SPF):**
```
Tipo: TXT
Nome/Host: @ (ou deixe em branco ou "transpjardim.tech")
Valor: v=spf1 include:amazonses.com ~all
TTL: 3600 (ou deixe padrão)
```

---

### 2.4 Salvar Alterações

- Clique em **"Salvar"** ou **"Add Record"**
- Repita para os 3 registros
- **Aguarde propagação do DNS**

---

## ⏰ PASSO 3: Aguardar Verificação

### 3.1 Tempo de Espera
```
Mínimo: 10 minutos
Máximo: 48 horas
Média: 2-4 horas
```

### 3.2 Verificar Status

**Volte ao Resend:**
```
https://resend.com/domains
```

**Você verá:**
```
🟡 Pending → Aguardando verificação
🟢 Verified → Pronto! Saiu do sandbox!
```

### 3.3 Notificação

Resend vai enviar um e-mail quando verificar:
```
Subject: Domain verified
To: controleinterno.jardimce@gmail.com
```

---

## 🔧 PASSO 4: Atualizar Remetente no Sistema

### 4.1 Login no TranspJardim
```
Usuário: admin
Senha: admin
```

### 4.2 Ir em Configurações
```
Menu → Configurações do Sistema → Aba "E-mail"
```

### 4.3 Atualizar E-mail Remetente

**Campo "E-mail Remetente":**
```
Antes: onboarding@resend.dev
Depois: controleinterno@transpjardim.tech
```

**Ou pode usar:**
```
alertas@transpjardim.tech
noreply@transpjardim.tech
controle.interno@transpjardim.tech
```

### 4.4 Salvar
```
Clique em "Salvar Configurações"
```

---

## ✅ PASSO 5: Validar Saída do Sandbox

### 5.1 Teste de Envio Real

**No TranspJardim:**
1. Vá em "Gerenciamento de Usuários"
2. Clique em 📧 de um usuário com e-mail DIFERENTE de controleinterno.jardimce@gmail.com
3. Aguarde confirmação

### 5.2 Verificar Resultado

**✅ Sucesso (saiu do sandbox):**
```
E-mail enviado com sucesso!
(sem mensagem de "modo teste")

E-mail chega no destinatário REAL
```

**❌ Ainda em sandbox:**
```
Modo de teste ativo
E-mails enviados para: controleinterno.jardimce@gmail.com
```

### 5.3 Checklist Final

- [ ] Domínio verificado no Resend
- [ ] E-mail remetente atualizado no sistema
- [ ] Teste de envio para e-mail diferente
- [ ] E-mail chegou no destinatário correto
- [ ] Sem mensagem de "modo teste"

---

## 🎉 PRONTO! Você saiu do sandbox!

### Agora você tem:
```
✅ E-mails para QUALQUER destinatário
✅ Limite de 3.000 e-mails/dia (plano gratuito)
✅ Remetente personalizado (@transpjardim.tech)
✅ Sistema em PRODUÇÃO
```

---

## ⚠️ PROBLEMAS COMUNS

### Problema 1: "Domain not verified" após 48h

**Causas possíveis:**
- Registros DNS incorretos
- Registros DNS não salvos
- Cache de DNS

**Solução:**
1. Volte no painel DNS
2. Confirme que os 3 registros estão lá
3. Valores exatamente como o Resend forneceu
4. Aguarde mais 24h
5. Se não resolver, delete e recrie os registros

---

### Problema 2: E-mails ainda vão para gmail

**Causa:** Sistema ainda usa API Key antiga ou remetente não foi atualizado

**Solução:**
1. Confirme que atualizou o e-mail remetente
2. Use um e-mail @transpjardim.tech como remetente
3. Teste novamente

---

### Problema 3: "Invalid from address"

**Causa:** Remetente não usa o domínio verificado

**Solução:**
```
❌ NÃO funciona: onboarding@resend.dev
❌ NÃO funciona: admin@gmail.com
✅ FUNCIONA: controleinterno@transpjardim.tech
✅ FUNCIONA: qualquercoisa@transpjardim.tech
```

---

### Problema 4: Registro MX já existe

**Causa:** Você usa o domínio para receber e-mails (Gmail, Outlook, etc)

**Solução:**
```
Opção A: Use um subdomínio
- Verificar: mail.transpjardim.tech
- Remetente: controleinterno@mail.transpjardim.tech

Opção B: Mantenha MX existente e adicione SPF
- Não adicione o registro MX do Resend
- Apenas adicione o TXT de verificação
- E o SPF (pode precisar combinar com o existente)
```

---

## 📊 COMPARAÇÃO: Antes e Depois

| Aspecto | Sandbox (Antes) | Produção (Depois) |
|---------|-----------------|-------------------|
| **Domínio** | ❌ Não verificado | ✅ Verificado |
| **Remetente** | onboarding@resend.dev | controleinterno@transpjardim.tech |
| **Destinatários** | 1 (seu e-mail) | ∞ (qualquer e-mail) |
| **Redirecionamento** | Sim ⚠️ | Não ✅ |
| **Limite diário** | 100 e-mails | 3.000 e-mails |
| **Custo** | Grátis | Grátis (até 3k/dia) |
| **Produção ready** | ❌ Não | ✅ Sim |

---

## 🔍 Como Saber Se Ainda Está em Sandbox?

### Sinais de Sandbox Ativo:
```
⚠️ E-mails sempre chegam em controleinterno.jardimce@gmail.com
⚠️ Toast exibe "Modo de teste ativo"
⚠️ Remetente é "onboarding@resend.dev"
⚠️ Domínio não aparece como verificado no Resend
```

### Sinais de Produção Ativa:
```
✅ E-mails chegam no destinatário especificado
✅ Toast: "E-mail enviado com sucesso" (sem "modo teste")
✅ Remetente é "controleinterno@transpjardim.tech"
✅ Domínio aparece como "Verified" no Resend
```

---

## 🎯 RESUMO EXECUTIVO

### Para Sair do Sandbox:

1. **Adicionar domínio no Resend** (5 min)
2. **Configurar 3 registros DNS** (10 min)
3. **Aguardar verificação** (10min - 48h)
4. **Atualizar remetente no sistema** (2 min)
5. **Testar envio real** (1 min)

### Quando Fazer:
- ✅ Quando sistema estiver pronto para produção
- ✅ Quando precisar enviar para usuários reais
- ✅ Quando tiver terminado os testes

### Quando NÃO Fazer:
- ❌ Se ainda está testando
- ❌ Se não tem certeza do sistema
- ❌ Se não tem acesso ao DNS do domínio

---

## 💡 DICA PRO

**Você pode testar ANTES de verificar o domínio:**

1. Use um subdomínio temporário
2. Verifique: `test.transpjardim.tech`
3. Teste com: `controleinterno@test.transpjardim.tech`
4. Valide tudo funcionando
5. Depois migre para o domínio principal

---

## 📞 PRECISA DE AJUDA?

Se tiver dificuldades em algum passo:
1. Me informe qual passo está travado
2. Copie mensagens de erro
3. Envie screenshot do status no Resend
4. Informe seu provedor DNS

---

**Última Atualização:** 20/11/2025  
**Tempo Estimado Total:** 1-2 dias  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil/Médio)  
**Custo:** 💰 Gratuito (plano free do Resend)
