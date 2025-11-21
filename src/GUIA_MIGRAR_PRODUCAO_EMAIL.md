# 🚀 GUIA: Migrar E-mails para Produção

## 📊 Status Atual

✅ **Sistema funcionando em modo TESTE**
- API Key válida
- E-mails sendo enviados
- Redirecionamento para: `controleinterno.jardimce@gmail.com`

---

## 🎯 Quando Migrar para Produção?

Migre quando:
- ✅ Sistema totalmente testado
- ✅ Pronto para usuários reais
- ✅ Precisa enviar e-mails para múltiplos destinatários

**NÃO precisa migrar agora se está apenas testando!**

---

## 🔧 PASSO 1: Verificar Domínio no Resend

### 1.1 Acesse o Resend
```
https://resend.com/domains
```

### 1.2 Adicionar Domínio
1. Clique em **"Add Domain"**
2. Digite: `transpjardim.tech`
3. Clique em **"Add"**

### 1.3 Configurar DNS
O Resend vai fornecer 3 registros DNS:

```
Tipo: TXT
Nome: _resend
Valor: [valor fornecido pelo Resend]

Tipo: MX
Nome: transpjardim.tech
Valor: feedback-smtp.us-east-1.amazonses.com
Prioridade: 10

Tipo: TXT (SPF)
Nome: transpjardim.tech
Valor: v=spf1 include:amazonses.com ~all
```

### 1.4 Onde Adicionar esses Registros?
- Vá no **painel de controle do seu domínio** (onde comprou transpjardim.tech)
- Procure por "DNS", "Zona DNS" ou "DNS Management"
- Adicione os 3 registros fornecidos pelo Resend

### 1.5 Aguardar Verificação
- ⏰ Pode levar de **10 minutos a 48 horas**
- Resend vai verificar automaticamente
- Você receberá um e-mail confirmando

---

## 🔧 PASSO 2: Gerar Nova API Key (Produção)

### 2.1 Acesse API Keys
```
https://resend.com/api-keys
```

### 2.2 Criar Nova Key
1. Clique em **"Create API Key"**
2. Nome: `TranspJardim - Produção`
3. Permissão: **"Sending access"** ✅
4. Clique em **"Add"**

### 2.3 Copiar a Key
```
re_XxXxXxXxXxXxXxXxXxXxXx
```
⚠️ **IMPORTANTE:** Salve em local seguro! Só aparece uma vez.

---

## 🔧 PASSO 3: Atualizar API Key no Sistema

### Opção A: Via Interface (Mais Fácil) ⭐

1. **Faça login no TranspJardim:**
   - Usuário: `admin`
   - Senha: `admin`

2. **Vá em Configurações:**
   - Menu → "Configurações do Sistema"
   - Aba "E-mail"

3. **Cole a Nova API Key:**
   - Campo "API Key do Resend"
   - Colar: `re_XxXxXxXxXxXxXxXxXxXxXx`
   - Clique "Salvar"

4. **Teste:**
   - Clique em "Testar Envio"
   - Se aparecer ✅ "E-mail enviado com sucesso" (sem mensagem de "modo teste")
   - **PRONTO! Sistema em produção!**

---

### Opção B: Via Variável de Ambiente (Supabase)

1. **Acesse o Supabase:**
   ```
   https://supabase.com/dashboard/project/[seu-projeto]/settings/functions
   ```

2. **Vá em "Edge Functions":**
   - Settings → Functions → Environment Variables

3. **Adicione a variável:**
   ```
   Nome: RESEND_API_KEY
   Valor: re_XxXxXxXxXxXxXxXxXxXxXx
   ```

4. **Salve e Reinicie:**
   - Clique "Save"
   - Aguarde 1-2 minutos

---

## ✅ PASSO 4: Validar Produção

### 4.1 Teste de Envio Real

1. **Login no TranspJardim**
2. **Vá em "Gerenciamento de Usuários"**
3. **Clique em 📧 de qualquer usuário**

**Resultado esperado:**
```
✅ E-mail enviado com sucesso!
```
(SEM mensagem de "modo teste")

### 4.2 Verificar Recebimento

- ✅ E-mail deve chegar no destinatário REAL
- ✅ Não mais redirecionado para controleinterno.jardimce@gmail.com
- ✅ Remetente: `controleinterno@transpjardim.tech`

---

## 🎨 PASSO 5 (Opcional): Personalizar Remetente

Depois que o domínio estiver verificado, você pode usar:

```
controleinterno@transpjardim.tech
alertas@transpjardim.tech
noreply@transpjardim.tech
```

Para mudar o remetente:
1. Menu → Configurações do Sistema
2. Aba "E-mail"
3. Campo "E-mail Remetente"
4. Digite: `controleinterno@transpjardim.tech`
5. Salvar

---

## ⚠️ PROBLEMAS COMUNS

### "Domain not verified"
**Causa:** DNS ainda não propagou  
**Solução:** Aguarde 24-48h, depois tente novamente

### "Invalid API Key"
**Causa:** API Key copiada errada  
**Solução:** Gere nova key, copie COM CUIDADO

### E-mails ainda vão para gmail
**Causa:** Ainda está usando API Key antiga (sandbox)  
**Solução:** Confirme que atualizou a API Key para a nova (produção)

### "SPF check failed"
**Causa:** Registro SPF incorreto no DNS  
**Solução:** Adicione: `v=spf1 include:amazonses.com ~all`

---

## 📊 Comparação: Teste vs Produção

| Característica | Modo Teste 🧪 | Modo Produção 🚀 |
|---------------|---------------|------------------|
| API Key | Sandbox | Verificada |
| Domínio | Não verificado | Verificado ✅ |
| Destinatários | 1 (seu e-mail) | Ilimitados |
| Remetente | `onboarding@resend.dev` | `controleinterno@transpjardim.tech` |
| Limite | 100 e-mails/dia | 3.000 e-mails/dia (plano gratuito) |
| Redirecionamento | Sim ⚠️ | Não ✅ |
| Custo | Grátis | Grátis até 3k/dia |

---

## 🎯 RESUMO EXECUTIVO

### Para Continuar em TESTE (agora):
✅ **Nada a fazer!** Sistema funciona perfeitamente.

### Para Migrar para PRODUÇÃO (quando pronto):
1. ✅ Verificar domínio `transpjardim.tech` no Resend
2. ✅ Gerar nova API Key (produção)
3. ✅ Atualizar API Key no TranspJardim
4. ✅ Testar envio real

**Tempo estimado:** 30 minutos + tempo de propagação DNS (24-48h)

---

## 🆘 SUPORTE

Se precisar de ajuda:
1. Me informe em qual passo está
2. Copie a mensagem de erro (se houver)
3. Confirme se o domínio já foi verificado

---

**Sistema:** TranspJardim  
**Status Atual:** ✅ Operacional (Modo Teste)  
**Próximo Passo:** Testar funcionalidades OU migrar para produção  
**Prioridade:** Baixa (sistema funciona perfeitamente em teste)
