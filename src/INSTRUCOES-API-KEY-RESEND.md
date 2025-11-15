# 🔑 Como Obter e Configurar a API Key do Resend

## Sistema TranspJardim - Controladoria Municipal de Jardim/CE

---

## ❓ **POR QUE PRECISO DISSO?**

A API Key do Resend permite que o TranspJardim envie e-mails automáticos de:
- ✅ Alertas de critérios vencidos
- ✅ Notificações de vencimento em 7 dias
- ✅ Alertas de baixo desempenho
- ✅ Notificações de critérios inativos

**Importante:** Sem a API Key, o sistema funciona normalmente, mas **não envia e-mails automáticos**.

---

## 📋 **PASSO A PASSO COMPLETO**

### **PASSO 1: Criar Conta no Resend** (2 minutos)

1. **Acesse:** https://resend.com/signup

2. **Clique em "Sign Up"**

3. **Preencha os dados:**
   - Nome completo
   - E-mail institucional (ex: `controleinterno@transpjardim.tech`)
   - Senha forte

4. **Confirme o e-mail:**
   - Acesse sua caixa de entrada
   - Clique no link de confirmação

5. **Faça login:** https://resend.com/login

✅ **Pronto!** Sua conta está criada.

---

### **PASSO 2: Gerar API Key** (2 minutos)

1. **No dashboard do Resend, vá em "API Keys"**
   - URL direta: https://resend.com/api-keys
   - Ou clique no menu lateral: **"API Keys"**

2. **Clique no botão "Create API Key"**

3. **Preencha os dados:**
   - **Name:** `TranspJardim-Producao`
   - **Permission:** `Sending access` (ou `Full access`)
   - **Domain:** (deixe em branco por enquanto)

4. **Clique em "Add"**

5. **COPIE A API KEY GERADA**
   ```
   re_AbCdEfGh1234567890abcdefghijklmnopqrs
   ```
   
   ⚠️ **MUITO IMPORTANTE:**
   - A API Key só é mostrada **UMA VEZ**
   - Copie e cole em um lugar seguro (ex: gerenciador de senhas)
   - Se perder, terá que gerar uma nova

✅ **Pronto!** Sua API Key foi gerada.

---

### **PASSO 3: Configurar no TranspJardim** (1 minuto)

Agora você precisa adicionar a API Key no sistema.

#### **Opção A: Via Interface Web (Recomendado)**

1. **Faça login no TranspJardim**
   - Usuário: `admin`
   - Senha: `admin`

2. **Vá até:** Painel de Administração → **Configuração de E-mail**

3. **Clique na aba "Status"**

4. **Cole sua API Key no campo:**
   ```
   ┌─────────────────────────────────────────┐
   │ API Key do Resend                       │
   │ re_AbCdEfGh1234567890...                │
   └─────────────────────────────────────────┘
   ```

5. **Clique em "Salvar Configuração"**

6. **Aguarde a validação:**
   - ✅ Se aparecer "Configuração válida" → Sucesso!
   - ❌ Se der erro, verifique se a API Key está correta

#### **Opção B: Via Supabase Dashboard**

Se você tiver acesso ao Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `dpnvtorphsxrncqtojvp`
3. Vá em: **Edge Functions** → **server** → **Secrets**
4. Adicione uma nova secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_AbCdEfGh1234567890...` (sua API Key)
5. Clique em "Save"
6. Reinicie a Edge Function

---

## ✅ **TESTAR A CONFIGURAÇÃO**

Depois de configurar, teste o envio:

1. **No TranspJardim, vá em:** Configuração de E-mail → **Teste Rápido**

2. **Preencha:**
   - E-mail de destino: `seu.email@exemplo.com`
   - Tipo de teste: `Envio Real`

3. **Clique em "Enviar E-mail de Teste"**

4. **Verifique:**
   - ✅ Se recebeu o e-mail → Funcionando!
   - ❌ Se não recebeu → Veja a seção "Problemas Comuns"

---

## 🐛 **PROBLEMAS COMUNS**

### **Erro: "API Key inválida"**

**Causa:** API Key copiada incorretamente

**Solução:**
1. Verifique se copiou a API Key completa (começa com `re_`)
2. Não deve ter espaços no início ou fim
3. Não deve ter quebras de linha
4. A API Key tem cerca de 40-50 caracteres

**Como copiar corretamente:**
```
❌ ERRADO: " re_AbC...xyz " (com espaços)
✅ CERTO:  "re_AbC...xyz"   (sem espaços)
```

---

### **Erro: "Timeout ao validar"**

**Causa:** Problema de conexão com o Resend

**Solução:**
1. Verifique sua conexão com a internet
2. Tente novamente em alguns segundos
3. Verifique se o Resend está online: https://status.resend.com

---

### **Erro: "E-mail não foi enviado"**

**Causa:** API Key sem permissões ou domínio não verificado

**Solução:**
1. No Resend, verifique se a API Key tem permissão de "Sending access"
2. Verifique se a API Key não foi deletada/revogada
3. Se usar domínio customizado, verifique se está verificado

---

### **Botão "Ir para Configuração" não funciona**

**Causa:** Bug corrigido na versão mais recente

**Solução Alternativa:**
1. Feche o modal de configuração rápida
2. Vá manualmente em: **Painel de Administração** → **Configuração de E-mail**
3. Clique na aba **"Status"**
4. Configure a API Key lá

---

## 💰 **PLANO GRATUITO DO RESEND**

O plano gratuito oferece:

| Recurso                | Quantidade      |
|------------------------|-----------------|
| **E-mails/mês**        | 3.000           |
| **E-mails/dia**        | 100             |
| **Domínios**           | 1               |
| **API Keys**           | Ilimitadas      |
| **Suporte**            | Comunidade      |
| **Cartão de crédito**  | ❌ Não necessário |

**Análise para TranspJardim:**
- Com 6 usuários e 20 critérios
- Média de 10-15 e-mails/dia
- Total mensal: ~300-450 e-mails
- ✅ **Plano gratuito é mais que suficiente!**

---

## 🔒 **SEGURANÇA DA API KEY**

### ⚠️ **NÃO COMPARTILHE** sua API Key:
- ❌ Não envie por e-mail sem criptografia
- ❌ Não poste em grupos/fóruns públicos
- ❌ Não commite no Git/GitHub
- ❌ Não deixe em arquivos texto no computador

### ✅ **BOAS PRÁTICAS:**
- ✅ Salve em gerenciador de senhas (LastPass, 1Password, Bitwarden)
- ✅ Configure apenas no servidor (Supabase Edge Functions)
- ✅ Use variáveis de ambiente
- ✅ Revogue APIs Keys antigas se não usar mais

---

## 🔄 **REVOGAR/REGENERAR API KEY**

Se sua API Key foi comprometida:

1. **Vá em:** https://resend.com/api-keys
2. **Encontre a API Key comprometida**
3. **Clique em "Delete"**
4. **Crie uma nova API Key** (Passo 2)
5. **Atualize no TranspJardim** (Passo 3)

---

## 📧 **E-MAILS DE REMETENTE**

O TranspJardim envia e-mails de:
```
controleinterno@transpjardim.tech
```

### **Configurar Domínio Customizado (Opcional):**

Para melhor reputação e evitar spam:

1. **No Resend, vá em "Domains"**
2. **Clique em "Add Domain"**
3. **Digite:** `transpjardim.tech`
4. **Copie os registros DNS:**
   - SPF (TXT)
   - DKIM (TXT)
   - DMARC (TXT)
5. **Configure no seu provedor DNS** (Registro.br, Cloudflare, etc.)
6. **Aguarde verificação** (pode levar até 48 horas)

⚠️ **Nota:** Isso é opcional. O Resend permite enviar e-mails sem domínio verificado, mas pode cair na caixa de spam.

---

## 📞 **SUPORTE**

### **Suporte Resend:**
- Documentação: https://resend.com/docs
- Status: https://status.resend.com
- Discord: https://resend.com/discord
- E-mail: support@resend.com

### **Suporte TranspJardim:**
- Documentação: Veja os arquivos `.md` no projeto
- Logs do servidor: Supabase Dashboard → Edge Functions → Logs

---

## 🎯 **CHECKLIST FINAL**

Use esta checklist para garantir que tudo está configurado:

- [ ] ✅ Conta criada no Resend
- [ ] ✅ E-mail confirmado
- [ ] ✅ API Key gerada
- [ ] ✅ API Key salva em lugar seguro
- [ ] ✅ API Key configurada no TranspJardim
- [ ] ✅ Validação bem-sucedida (ícone verde)
- [ ] ✅ E-mail de teste enviado e recebido
- [ ] ✅ Sistema de alertas funcionando

---

## 📊 **MONITORAMENTO**

Depois de configurado, monitore o sistema:

1. **Dashboard Resend:**
   - https://resend.com/emails
   - Veja e-mails enviados, falhas, etc.

2. **TranspJardim - Histórico:**
   - Painel de Administração → Configuração de E-mail → **Histórico**
   - Veja logs de todos os e-mails enviados

3. **Alertas do Sistema:**
   - O banner no topo do sistema mostra o status em tempo real

---

## 📝 **EXEMPLO DE API KEY VÁLIDA**

```
re_123456789abcdefghijklmnopqrstuvwxyzABCDEF
```

**Características:**
- ✅ Começa com `re_`
- ✅ Tem ~40-50 caracteres
- ✅ Contém letras (maiúsculas e minúsculas) e números
- ✅ Sem espaços ou caracteres especiais

---

**Status:** ✅ DOCUMENTAÇÃO COMPLETA  
**Última atualização:** 15/11/2024  
**Desenvolvido para:** Controladoria Municipal de Jardim/CE  
**Sistema:** TranspJardim
