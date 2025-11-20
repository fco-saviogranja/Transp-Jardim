# 🔧 Solução: E-mails Redirecionando para E-mail Autorizado

## 🚨 Problema Identificado

Você mencionou que:
- ✅ Já adicionou o domínio `transpjardim.tech` no Resend
- ✅ Já configurou os registros DNS
- ❌ **MAS** os e-mails ainda estão sendo redirecionados para `controleinterno.jardimce@gmail.com`

## 🔍 Diagnóstico

Este problema acontece quando:

1. **O domínio foi adicionado mas NÃO foi verificado** ✅ → ❌
2. **A API Key ainda é de "sandbox"** (modo de teste)
3. **Os registros DNS não propagaram completamente**

---

## ✅ Solução Passo a Passo

### **Passo 1: Verificar Status do Domínio no Resend**

1. Acesse: https://resend.com/domains
2. Encontre `transpjardim.tech` na lista
3. Verifique o **STATUS** ao lado do domínio:

#### ✅ **Status VERDE "Verified":**
- Domínio está verificado e pronto para uso
- Pule para o **Passo 2**

#### ⚠️ **Status AMARELO "Pending" ou VERMELHO "Failed":**
- Domínio NÃO está verificado
- Continue abaixo para verificar os registros DNS

---

### **Passo 1.1: Verificar Registros DNS Individualmente**

No painel do Resend, ao lado de cada registro DNS, você verá um status:

#### **✅ Verde (Verified):** Registro está OK
#### **❌ Vermelho (Not Found):** Registro não foi encontrado

**Se algum registro estiver vermelho:**

1. **Verifique se o registro foi adicionado corretamente no seu provedor DNS**
2. **Aguarde a propagação** (pode levar até 48 horas, mas geralmente 1-2 horas)
3. **Use ferramentas de verificação:**
   - SPF: https://mxtoolbox.com/spf.aspx
   - DKIM: https://mxtoolbox.com/dkim.aspx
   - DNS Geral: https://dnschecker.org

#### **Exemplo de Verificação:**

**Para SPF:**
```bash
nslookup -type=TXT transpjardim.tech
```
Deve retornar algo como:
```
v=spf1 include:_spf.resend.com ~all
```

**Para DKIM:**
```bash
nslookup -type=TXT resend._domainkey.transpjardim.tech
```
Deve retornar o valor fornecido pelo Resend.

---

### **Passo 2: Verificar Qual API Key Está Sendo Usada**

**O problema mais comum é usar uma API Key de SANDBOX em vez de PRODUÇÃO!**

1. Acesse: https://resend.com/api-keys
2. Encontre a API Key que você está usando no TranspJardim
3. Verifique a coluna **"Permissions"** ou **"Type"**

#### **🔴 Se aparecer "Test Mode" ou "Sandbox":**
Esta é a causa do problema! Esta API Key só pode enviar para o e-mail do dono da conta.

**Solução:**
1. Clique em **"Create API Key"**
2. Em **"Name"**, digite: `TranspJardim Production`
3. Em **"Permission"**, selecione: **"Sending access"**
4. Em **"Domain"**, selecione: **"transpjardim.tech"**
5. Clique em **"Create"**
6. **COPIE A CHAVE IMEDIATAMENTE** (você só verá uma vez!)

#### **✅ Se aparecer "Full Access" ou "Sending Access":**
A API Key está correta. O problema deve estar no domínio não verificado.

---

### **Passo 3: Atualizar API Key no Sistema**

#### **Opção A: Via Interface do TranspJardim**

1. Faça login como **admin**
2. Vá em **"Configurações do Sistema"**
3. Localize **"Configuração de E-mail"** ou **"Resend API Key"**
4. Cole a nova API Key de produção
5. Clique em **"Salvar"** ou **"Testar Configuração"**

#### **Opção B: Via Supabase Dashboard** (se aplicável)

1. Acesse seu projeto no Supabase
2. Vá em **"Edge Functions"**
3. Selecione a função **"server"** ou equivalente
4. Clique em **"Secrets"** ou **"Environment Variables"**
5. Atualize `RESEND_API_KEY` com a nova chave
6. Salve e faça redeploy da função

#### **Opção C: Via CLI do Supabase**

```bash
supabase secrets set RESEND_API_KEY="re_SUA_NOVA_CHAVE_AQUI"
```

---

### **Passo 4: Fazer Deploy das Mudanças no Backend**

**IMPORTANTE:** As mudanças que fizemos no código do backend (`/supabase/functions/server/index.tsx`) precisam ser deployadas!

Se você estiver usando Supabase:

```bash
# Fazer deploy da Edge Function atualizada
supabase functions deploy server

# Ou se estiver em um projeto com todas as funções:
supabase functions deploy
```

Se você estiver usando outro provedor (Netlify, Vercel, etc.), faça commit e push das mudanças:

```bash
git add .
git commit -m "fix: remove forced test mode redirect in email service"
git push
```

---

### **Passo 5: Testar Novamente**

1. Acesse o sistema TranspJardim
2. Vá em **"Gerenciamento de Usuários"**
3. Clique no ícone de envelope (📧) ao lado de um usuário com e-mail DIFERENTE do autorizado
4. Verifique se o e-mail foi enviado para o destinatário correto

#### **✅ Sucesso:**
```
✅ E-mail de teste enviado para usuario@transpjardim.tech!
Verifique a caixa de entrada do usuário.
```

#### **⚠️ Ainda em Sandbox:**
```
⚠️ Sistema em modo sandbox (Resend): e-mail só pode ser enviado para 
controleinterno.jardimce@gmail.com. Para testar envio real, use uma 
API key de produção.
```
→ Volte ao **Passo 2** e verifique se está usando a API Key correta

---

## 🔧 Troubleshooting Avançado

### **Problema: Domínio não verifica mesmo após 48 horas**

#### **Causa 1: Registros DNS incorretos**

Verifique novamente os valores EXATOS fornecidos pelo Resend:

1. No painel do Resend, clique em `transpjardim.tech`
2. Compare CARACTERE POR CARACTERE os valores que você adicionou no DNS
3. **Erro comum:** Espaços extras, caracteres invisíveis, vírgulas faltando

#### **Causa 2: DNS Proxy ativo (Cloudflare)**

Se você usa Cloudflare:
- Alguns registros (como DKIM CNAME) **NÃO podem ter proxy ativo**
- Desative o proxy (ícone de nuvem laranja → cinza)

#### **Causa 3: TTL muito alto**

- Alguns provedores DNS têm TTL padrão de 86400 (24 horas)
- Isso faz com que as mudanças demorem mais para propagar
- Reduza o TTL para 300 ou 3600

---

### **Problema: API Key de Produção mas ainda redireciona**

Isso significa que o **backend ainda tem a configuração antiga** de `testMode: true`.

**Solução:**

1. Limpe o cache do KV Store (se aplicável):

```bash
# No Supabase
supabase functions invoke server --data '{"clearCache": true}'
```

2. Ou acesse o sistema como admin e vá em "Configurações" para reconfigurar

---

### **Problema: E-mails caindo em spam**

Mesmo com domínio verificado, e-mails podem cair em spam se:

1. **DMARC não está configurado** → Adicione registro DMARC (opcional mas recomendado)
2. **Sem "warm-up"** → Envie poucos e-mails inicialmente, aumente gradualmente
3. **Conteúdo suspeito** → Evite palavras como "teste", "grátis", muitos links

**Registro DMARC recomendado:**
```
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
TTL: 3600
```

---

## 📊 Checklist Final de Verificação

Antes de considerar o problema resolvido, verifique:

- [ ] Domínio `transpjardim.tech` aparece como **VERDE/Verified** no Resend
- [ ] Todos os registros DNS (SPF, DKIM, DMARC) aparecem como **verificados** no Resend
- [ ] API Key sendo usada é de **PRODUÇÃO** (não sandbox/test mode)
- [ ] API Key foi **atualizada** no sistema (Supabase ou arquivo de configuração)
- [ ] Backend foi **redeployado** com as mudanças do código
- [ ] Teste de e-mail enviado para usuário com e-mail **diferente** do autorizado
- [ ] E-mail **recebido** na caixa de entrada do destinatário correto
- [ ] E-mail **NÃO caiu em spam**

---

## 🆘 Ainda Não Funcionou?

Se após seguir todos os passos o problema persistir:

### **1. Verificar Logs do Backend**

Acesse os logs da Edge Function para ver mensagens de erro:

```bash
supabase functions logs server --tail
```

Procure por:
- `📧 Modo de teste: ATIVO` → Ainda está em modo teste
- `📧 Modo de teste: DESATIVADO` → Modo teste desativado (correto!)
- Erros 403 do Resend
- Mensagens sobre e-mail autorizado

### **2. Testar Direto na API do Resend**

Use cURL para testar se o problema está no código ou na configuração do Resend:

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer SUA_API_KEY_AQUI' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "controleinterno@transpjardim.tech",
    "to": ["educacao@transpjardim.tech"],
    "subject": "Teste Manual",
    "html": "<p>Teste direto na API</p>"
  }'
```

**Se retornar erro 403:** O problema está na configuração do Resend (domínio ou API Key)
**Se funcionar:** O problema está no código do sistema

### **3. Contatar Suporte do Resend**

Se o domínio aparece como verificado mas ainda assim não funciona:
- E-mail: support@resend.com
- Discord: https://discord.gg/resend
- Forneça: ID do domínio, API Key mascarada (primeiros 10 chars), e erro específico

---

## 📚 Recursos Úteis

- **Dashboard Resend:** https://resend.com/domains
- **API Keys:** https://resend.com/api-keys
- **Documentação Domínios:** https://resend.com/docs/dashboard/domains/introduction
- **Guia Completo (local):** `/GUIA_CONFIGURACAO_DOMINIO_RESEND.md`
- **Status API Resend:** https://resend.statuspage.io

---

**Última atualização:** Novembro 2025  
**Sistema:** TranspJardim - Controladoria Municipal de Jardim/CE
