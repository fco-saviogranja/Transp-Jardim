# 📧 Guia de Configuração DNS/SPF para TranspJardim

## 🔍 O Que Está Acontecendo?

Você está vendo esta mensagem no Resend:

```
Sending: Missing required SPF records. 
Make sure you've added the correct record into your domain provider.
```

### **Por Que Isso Acontece?**

✅ **Sua API Key está funcionando corretamente**  
✅ **O sistema TranspJardim está operacional**  
✅ **E-mails estão sendo enviados** (para controleinterno.jardimce@gmail.com)  
⚠️ **MAS:** O domínio `transpjardim.tech` ainda não está verificado no Resend

---

## 📋 Passo a Passo Completo

### **PASSO 1: Acessar o Painel do Resend**

1. Acesse: https://resend.com/domains
2. Faça login com sua conta
3. Você deverá ver o domínio `transpjardim.tech` listado

### **PASSO 2: Ver os Registros DNS Necessários**

No painel do Resend, clique no domínio `transpjardim.tech`. Você verá 3 registros que precisam ser adicionados:

#### **1️⃣ Registro SPF (TXT)**
```
Tipo: TXT
Nome/Host: @ ou transpjardim.tech
Valor: v=spf1 include:resend.com ~all
TTL: 3600 (ou padrão)
```

#### **2️⃣ Registro DKIM (TXT)**
```
Tipo: TXT
Nome/Host: resend._domainkey
Valor: [será fornecido pelo Resend - algo como p=MIGfMA0...]
TTL: 3600 (ou padrão)
```

#### **3️⃣ Registro DMARC (TXT)** *(Recomendado)*
```
Tipo: TXT
Nome/Host: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
TTL: 3600 (ou padrão)
```

---

## 🌐 Configurar no Provedor DNS

Você precisa adicionar estes registros no painel de controle do seu provedor de domínio. Aqui estão instruções para os provedores mais comuns:

### **🔹 Se usar Registro.br**

1. Acesse: https://registro.br
2. Faça login com sua conta
3. Vá em **"Meus Domínios"**
4. Clique em `transpjardim.tech`
5. Vá em **"DNS"** → **"Gerenciar DNS"**
6. Clique em **"Adicionar Registro"**
7. Adicione os 3 registros conforme mostrado acima

**Formato Registro.br:**
```
# SPF
Tipo: TXT
Nome: @
Conteúdo: v=spf1 include:resend.com ~all

# DKIM
Tipo: TXT
Nome: resend._domainkey
Conteúdo: [valor fornecido pelo Resend]

# DMARC
Tipo: TXT
Nome: _dmarc
Conteúdo: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
```

### **🔹 Se usar Cloudflare**

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio `transpjardim.tech`
3. Vá em **"DNS"** → **"Records"**
4. Clique em **"Add record"**
5. Adicione os 3 registros

**Formato Cloudflare:**
```
# SPF
Type: TXT
Name: @
Content: v=spf1 include:resend.com ~all
Proxy status: DNS only (⚠️ IMPORTANTE: Desative o proxy laranja)
TTL: Auto

# DKIM
Type: TXT
Name: resend._domainkey
Content: [valor fornecido pelo Resend]
Proxy status: DNS only
TTL: Auto

# DMARC
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
Proxy status: DNS only
TTL: Auto
```

### **🔹 Se usar GoDaddy**

1. Acesse: https://dcc.godaddy.com
2. Faça login
3. Clique em **"DNS"** ao lado do domínio
4. Vá até a seção **"Records"**
5. Clique em **"Add"**

**Formato GoDaddy:**
```
# SPF
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 1 Hour

# DKIM
Type: TXT
Name: resend._domainkey
Value: [valor fornecido pelo Resend]
TTL: 1 Hour

# DMARC
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
TTL: 1 Hour
```

### **🔹 Se usar HostGator / Hostinger / Outros cPanel**

1. Acesse o cPanel do seu hosting
2. Procure por **"Zone Editor"** ou **"Editor de Zona"**
3. Selecione o domínio `transpjardim.tech`
4. Clique em **"Add Record"** ou **"Adicionar Registro"**

**Formato cPanel:**
```
# SPF
Type: TXT
Name: transpjardim.tech.
Record: v=spf1 include:resend.com ~all
TTL: 14400

# DKIM
Type: TXT
Name: resend._domainkey.transpjardim.tech.
Record: [valor fornecido pelo Resend]
TTL: 14400

# DMARC
Type: TXT
Name: _dmarc.transpjardim.tech.
Record: v=DMARC1; p=none; rua=mailto:controleinterno@transpjardim.tech
TTL: 14400
```

---

## ⏱️ Tempo de Propagação

Após adicionar os registros:

- **Mínimo:** 1-2 horas
- **Normal:** 4-8 horas
- **Máximo:** 24-48 horas

### **Como Verificar a Propagação:**

**Opção 1: Ferramenta Online**
```
https://mxtoolbox.com/SuperTool.aspx
Digite: transpjardim.tech
Tipo: TXT Lookup
```

**Opção 2: Terminal/CMD**
```bash
# Linux/Mac
nslookup -type=TXT transpjardim.tech

# Windows
nslookup -type=TXT transpjardim.tech

# Verificar especificamente o SPF
nslookup -type=TXT transpjardim.tech 8.8.8.8
```

Você deverá ver algo como:
```
transpjardim.tech	text = "v=spf1 include:resend.com ~all"
```

---

## ✅ Verificar no Resend

Depois de adicionar os registros e aguardar a propagação:

1. Volte para https://resend.com/domains
2. Clique no domínio `transpjardim.tech`
3. Clique em **"Verify"** ou **"Verificar"**

Se tudo estiver correto, você verá:
```
✅ SPF: Verified
✅ DKIM: Verified  
✅ DMARC: Verified (opcional)
```

---

## 🎯 O Que Muda Após Verificação?

### **ANTES (Modo Teste - Atual):**
```
📧 Remetente: Controladoria Jardim <onboarding@resend.dev>
📨 Destinatário: Apenas controleinterno.jardimce@gmail.com
⚠️ Aviso: "Missing SPF records"
```

### **DEPOIS (Modo Produção):**
```
📧 Remetente: controleinterno@transpjardim.tech
📨 Destinatário: Qualquer e-mail válido
✅ Status: Domínio verificado
✅ Melhor deliverability
✅ Sem avisos
```

---

## 🔧 Troubleshooting

### **❌ Problema: "Record not found"**

**Solução:**
- Verifique se digitou o nome do registro corretamente
- Use `@` em vez de `transpjardim.tech` para o SPF
- Para DKIM, use apenas `resend._domainkey` (sem o domínio)
- Aguarde mais tempo (até 48h)

### **❌ Problema: "Multiple SPF records"**

**Solução:**
Se você já tem um registro SPF existente como:
```
v=spf1 include:_spf.google.com ~all
```

Você deve **combinar** os registros:
```
v=spf1 include:_spf.google.com include:resend.com ~all
```

⚠️ **IMPORTANTE:** Você só pode ter **UM** registro SPF por domínio!

### **❌ Problema: "DKIM verification failed"**

**Solução:**
- Copie o valor DKIM **exatamente** como fornecido pelo Resend
- Não adicione espaços ou quebras de linha
- Certifique-se que o nome está como `resend._domainkey`
- Aguarde a propagação completa

### **❌ Problema: "Domain already exists"**

**Solução:**
Isso significa que o domínio já está adicionado no Resend. Você só precisa:
1. Adicionar os registros DNS no seu provedor
2. Aguardar propagação
3. Clicar em "Verify" no Resend

---

## 📊 Exemplo Completo de Configuração

### **Situação Ideal no seu Provedor DNS:**

```
Tipo    Nome                          Valor                                              TTL
-----------------------------------------------------------------------------------------
TXT     @                             "v=spf1 include:resend.com ~all"                  3600
TXT     resend._domainkey             "p=MIGfMA0GCSqGSIb3DQEBA..."                      3600
TXT     _dmarc                        "v=DMARC1; p=none; rua=mailto:..."               3600
```

### **Verificação no Terminal:**

```bash
# Verificar SPF
$ nslookup -type=TXT transpjardim.tech
transpjardim.tech	text = "v=spf1 include:resend.com ~all"

# Verificar DKIM
$ nslookup -type=TXT resend._domainkey.transpjardim.tech
resend._domainkey.transpjardim.tech	text = "p=MIGfMA0GCSq..."

# Verificar DMARC
$ nslookup -type=TXT _dmarc.transpjardim.tech
_dmarc.transpjardim.tech	text = "v=DMARC1; p=none..."
```

---

## 🎯 Checklist Final

Use esta lista para garantir que tudo foi configurado:

### **No Resend:**
- [ ] Domínio `transpjardim.tech` adicionado
- [ ] Valores dos registros SPF, DKIM e DMARC copiados

### **No Provedor DNS:**
- [ ] Registro SPF (TXT) adicionado com nome `@`
- [ ] Registro DKIM (TXT) adicionado com nome `resend._domainkey`
- [ ] Registro DMARC (TXT) adicionado com nome `_dmarc`
- [ ] Todos os valores copiados corretamente (sem espaços extras)

### **Aguardar:**
- [ ] Esperar 2-24 horas para propagação DNS
- [ ] Verificar com `nslookup` ou mxtoolbox.com

### **Verificar no Resend:**
- [ ] Voltar em https://resend.com/domains
- [ ] Clicar em "Verify" no domínio
- [ ] Confirmar que SPF e DKIM estão verificados

---

## 💡 Dicas Importantes

### **1. Não Delete Registros Existentes**
Se você já usa o domínio para outros serviços (Google Workspace, etc.), **não delete** os registros SPF existentes. Combine-os:

```
# ERRADO (só um include):
v=spf1 include:resend.com ~all

# CERTO (múltiplos includes):
v=spf1 include:_spf.google.com include:resend.com ~all
```

### **2. Use DNS Only no Cloudflare**
Se usar Cloudflare, desative o proxy (nuvem laranja) para os registros TXT. Use "DNS only" (nuvem cinza).

### **3. Respeite a Propagação**
Mesmo que algumas ferramentas mostrem os registros imediatamente, o Resend pode levar algumas horas para verificar. Seja paciente.

### **4. Copie Exatamente**
Ao copiar o valor DKIM do Resend, certifique-se de copiar **todo** o texto, geralmente começa com `p=MIGf...`

---

## 🚀 Próximos Passos

### **Enquanto o DNS Propaga:**

O sistema TranspJardim continua funcionando perfeitamente! E-mails estão sendo enviados para `controleinterno.jardimce@gmail.com`.

### **Após Verificação do Domínio:**

1. ✅ Sistema automaticamente detectará o domínio verificado
2. ✅ E-mails começarão a usar `controleinterno@transpjardim.tech`
3. ✅ Poderá enviar para qualquer destinatário
4. ✅ Nenhuma mudança no código necessária!

---

## 📞 Precisa de Ajuda?

### **Problema com DNS:**
- Entre em contato com o suporte do seu provedor de domínio
- Informe que precisa adicionar registros TXT para configuração de e-mail

### **Problema com Resend:**
- Documentação: https://resend.com/docs
- Suporte: https://resend.com/support

### **Sistema TranspJardim:**
- Tudo está funcionando corretamente!
- A configuração DNS é apenas para habilitar e-mails para múltiplos destinatários

---

## 📖 Recursos Úteis

### **Ferramentas de Verificação DNS:**
- https://mxtoolbox.com/SuperTool.aspx
- https://dnschecker.org/
- https://www.whatsmydns.net/

### **Documentação Resend:**
- https://resend.com/docs/dashboard/domains/introduction
- https://resend.com/docs/knowledge-base/why-is-my-domain-pending

### **Guias de Registros SPF:**
- https://www.cloudflare.com/learning/dns/dns-records/dns-spf-record/
- https://support.google.com/a/answer/33786

---

## ✨ Resumo Executivo

### **O Que Fazer:**
1. Acessar https://resend.com/domains
2. Copiar os valores dos registros SPF e DKIM
3. Adicionar estes registros no painel DNS do seu provedor
4. Aguardar 2-24 horas
5. Voltar no Resend e clicar em "Verify"

### **O Que Não Fazer:**
- ❌ Não deletar registros SPF existentes
- ❌ Não adicionar múltiplos registros SPF separados
- ❌ Não se preocupar - o sistema já está funcionando!

### **Resultado:**
✅ E-mails enviados de `controleinterno@transpjardim.tech`  
✅ Qualquer destinatário receberá os alertas  
✅ Melhor reputação e deliverability  

---

**Status:** 📋 Aguardando configuração DNS  
**Urgência:** ⏳ Não urgente - sistema já funciona em modo teste  
**Benefício:** 🎯 Enviar e-mails para múltiplos usuários  
**Tempo Estimado:** ⏱️ 30 minutos configuração + 2-24h propagação
