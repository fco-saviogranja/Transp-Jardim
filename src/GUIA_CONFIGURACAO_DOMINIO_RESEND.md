# 🌐 Guia: Configurar Domínio Personalizado no Resend

Este guia explica como adicionar e verificar um domínio personalizado no Resend para enviar e-mails de `controleinterno@transpjardim.tech` sem limitações de sandbox.

---

## 📋 Pré-requisitos

1. ✅ Conta no Resend (https://resend.com)
2. ✅ Acesso ao painel de DNS do domínio `transpjardim.tech`
3. ✅ Permissões de administrador no Resend

---

## 🚀 Passo 1: Adicionar Domínio no Resend

### 1.1. Acessar o Dashboard do Resend
1. Faça login em https://resend.com/login
2. No menu lateral, clique em **"Domains"**
3. Clique no botão **"Add Domain"**

### 1.2. Inserir o Domínio
1. Digite: `transpjardim.tech`
2. Clique em **"Add"**

> ⚠️ **Importante:** Adicione apenas o domínio raiz (`transpjardim.tech`), não subdomínios como `www.transpjardim.tech`

---

## 🔧 Passo 2: Configurar Registros DNS

Após adicionar o domínio, o Resend mostrará uma lista de **registros DNS** que você precisa adicionar no seu provedor de DNS.

### 2.1. Registros Necessários

O Resend solicitará que você adicione os seguintes registros DNS:

#### **A) Registro SPF (TXT)**
```
Tipo: TXT
Nome: @ (ou transpjardim.tech)
Valor: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### **B) Registro DKIM (CNAME ou TXT)**
```
Tipo: CNAME (ou TXT)
Nome: resend._domainkey
Valor: [valor fornecido pelo Resend - algo como resend._domainkey.u123456.wl.sendgrid.net]
TTL: 3600
```

#### **C) Registro DMARC (TXT) - Opcional mas Recomendado**
```
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
TTL: 3600
```

#### **D) Registro de Rastreamento (CNAME) - Opcional**
```
Tipo: CNAME
Nome: [fornecido pelo Resend]
Valor: [fornecido pelo Resend]
TTL: 3600
```

### 2.2. Onde Adicionar os Registros DNS?

Depende de onde o domínio `transpjardim.tech` está registrado/hospedado:

#### **Se estiver em Registro.br:**
1. Acesse https://registro.br
2. Faça login com suas credenciais
3. Vá em **"Domínios" → "transpjardim.tech" → "Editar Zona"**
4. Adicione cada registro DNS conforme especificado

#### **Se estiver em Cloudflare:**
1. Acesse https://dash.cloudflare.com
2. Selecione o domínio `transpjardim.tech`
3. Vá em **"DNS" → "Records"**
4. Clique em **"Add record"** para cada registro

#### **Se estiver em GoDaddy:**
1. Acesse https://account.godaddy.com
2. Vá em **"My Products" → "DNS"**
3. Clique em **"Add"** para cada registro

#### **Se estiver em HostGator/Locaweb/Hostinger:**
1. Acesse o painel cPanel
2. Vá em **"Zona DNS"** ou **"DNS Zone Editor"**
3. Adicione cada registro

---

## ✅ Passo 3: Verificar Domínio no Resend

### 3.1. Aguardar Propagação DNS
Após adicionar os registros DNS:
- ⏱️ **Tempo de propagação:** 15 minutos a 48 horas (geralmente 1-2 horas)
- 🔍 **Verificar propagação:** Use https://dnschecker.org

### 3.2. Verificar no Resend
1. Volte ao painel **"Domains"** no Resend
2. Clique em **"Verify"** ao lado do domínio `transpjardim.tech`
3. Se os registros estiverem corretos, verá: ✅ **"Verified"**

### 3.3. Status dos Registros

No painel do Resend, você verá o status de cada registro:
- ✅ **Verde (Verified):** Configurado corretamente
- ⚠️ **Amarelo (Pending):** Aguardando propagação
- ❌ **Vermelho (Failed):** Erro na configuração

---

## 📧 Passo 4: Configurar E-mail Remetente

### 4.1. Criar API Key de Produção
1. No Resend, vá em **"API Keys"**
2. Clique em **"Create API Key"**
3. Selecione:
   - **Name:** `TranspJardim Production`
   - **Permission:** `Sending access`
   - **Domain:** `transpjardim.tech`
4. Copie a API Key gerada (você só verá uma vez!)

### 4.2. Atualizar API Key no Supabase

Se você estiver usando Supabase Edge Functions:

1. Acesse seu projeto no Supabase
2. Vá em **"Edge Functions" → "send-email"**
3. Atualize a variável de ambiente `RESEND_API_KEY` com a nova chave
4. Ou adicione via CLI:

```bash
supabase secrets set RESEND_API_KEY="re_NOVA_CHAVE_AQUI"
```

### 4.3. Configurar E-mail Remetente

No código do backend, use:
```typescript
from: 'Controle Interno <controleinterno@transpjardim.tech>'
```

---

## 🧪 Passo 5: Testar Envio

### 5.1. Teste via Interface do TranspJardim
1. Acesse o sistema TranspJardim
2. Vá em **"Gerenciamento de Usuários"**
3. Clique no ícone de envelope (📧) ao lado de qualquer usuário
4. Verifique se o e-mail foi entregue corretamente

### 5.2. Teste via Dashboard do Resend
1. No Resend, vá em **"Emails"** (menu lateral)
2. Você verá todos os e-mails enviados
3. Status possíveis:
   - ✅ **Sent:** Enviado com sucesso
   - ⏳ **Queued:** Na fila
   - ❌ **Bounced:** Rejeitado pelo destinatário
   - ⚠️ **Complained:** Marcado como spam

---

## 🔍 Solução de Problemas

### ❌ Problema 1: "Domain not verified"
**Solução:**
- Verifique se todos os registros DNS foram adicionados corretamente
- Use https://mxtoolbox.com/SuperTool.aspx para verificar registros SPF/DKIM
- Aguarde mais tempo para propagação DNS

### ❌ Problema 2: "You must verify your domain before sending"
**Solução:**
- Certifique-se de que o domínio está verificado (status verde no Resend)
- Use uma API Key de produção (não de sandbox)

### ❌ Problema 3: E-mails caindo em spam
**Solução:**
- Configure registro DMARC
- Adicione registro SPF corretamente
- Use um "from name" profissional: `Controle Interno <controleinterno@transpjardim.tech>`
- Evite palavras como "teste" no assunto

### ❌ Problema 4: "Invalid API key"
**Solução:**
- Verifique se a API Key foi copiada corretamente
- Certifique-se de estar usando uma API Key de **produção**, não de sandbox
- Regenere a API Key se necessário

---

## 📊 Verificação de Registros DNS

Use estas ferramentas para verificar se os registros foram adicionados corretamente:

### **SPF:**
```bash
nslookup -type=TXT transpjardim.tech
```
Deve retornar: `v=spf1 include:_spf.resend.com ~all`

### **DKIM:**
```bash
nslookup -type=TXT resend._domainkey.transpjardim.tech
```
Deve retornar o valor fornecido pelo Resend

### **Ferramentas Online:**
- https://mxtoolbox.com - Verificação completa de DNS/Email
- https://dnschecker.org - Propagação DNS global
- https://www.mail-tester.com - Teste qualidade de e-mail (envie para o endereço fornecido)

---

## ✅ Checklist Final

Antes de considerar a configuração completa:

- [ ] Domínio `transpjardim.tech` adicionado no Resend
- [ ] Registro SPF (TXT) adicionado no DNS
- [ ] Registro DKIM (CNAME/TXT) adicionado no DNS
- [ ] Registro DMARC (TXT) adicionado no DNS (opcional)
- [ ] Aguardou propagação DNS (mínimo 1 hora)
- [ ] Domínio verificado no Resend (status verde ✅)
- [ ] API Key de produção criada
- [ ] API Key atualizada no backend (Supabase/Edge Function)
- [ ] E-mail de teste enviado com sucesso
- [ ] E-mail recebido na caixa de entrada (não spam)

---

## 📚 Recursos Adicionais

- **Documentação Resend:** https://resend.com/docs/dashboard/domains/introduction
- **SPF Record Checker:** https://mxtoolbox.com/spf.aspx
- **DKIM Validator:** https://dkimvalidator.com
- **Suporte Resend:** support@resend.com

---

## 🎯 Resultado Esperado

Após completar todos os passos:

✅ Sistema **não estará mais em modo sandbox**  
✅ E-mails poderão ser enviados para **qualquer endereço**  
✅ Remetente aparecerá como `controleinterno@transpjardim.tech`  
✅ Alta taxa de entrega (não cairá em spam)  
✅ Rastreamento completo de envios no dashboard do Resend  

---

## 🆘 Precisa de Ajuda?

Se encontrar dificuldades:

1. **Suporte Resend:** https://resend.com/support
2. **Documentação técnica:** https://resend.com/docs
3. **Provedor DNS:** Contate o suporte do seu provedor de domínio

---

**Última atualização:** Novembro 2025  
**Sistema:** TranspJardim - Controladoria Municipal de Jardim/CE
