# ✔️ Verificador de Configuração

Use este guia para **verificar se tudo está configurado corretamente** após seguir os 3 passos.

---

## 🎯 COMO USAR ESTE VERIFICADOR

Para cada item abaixo:
- ✅ Marque se estiver OK
- ❌ Marque se tiver problema
- 🔧 Siga a solução se houver erro

---

## 📋 CHECKLIST DE VERIFICAÇÃO

### ✅ PASSO 1: Edge Function Criada

#### Verificação 1.1: Função existe?

**Como verificar:**
1. Acesse: https://supabase.com/dashboard
2. Entre no projeto TranspJardim
3. Menu lateral → Edge Functions
4. Procure por uma função chamada "email"

**Status:**
- [ ] ✅ A função "email" aparece na lista
- [ ] ❌ Não encontro a função "email"

**Se ❌, solução:**
→ Volte ao Passo 1 do guia
→ Crie a função com o nome "email"

---

#### Verificação 1.2: Status da função

**Como verificar:**
1. Edge Functions → email (clique na função)
2. Veja o status no topo da página

**Status:**
- [ ] ✅ Status: "Active" ou "Deployed"
- [ ] ⚠️ Status: "Inactive" ou outro
- [ ] ❌ Aparece erro

**Se ⚠️ ou ❌, solução:**
→ Refaça o deploy
→ Verifique se há erros na aba "Logs"

---

### ✅ PASSO 2: Código Implementado

#### Verificação 2.1: Código está presente?

**Como verificar:**
1. Edge Functions → email
2. Veja o editor de código
3. Procure por "nodemailer" no código

**Status:**
- [ ] ✅ Vejo código com "nodemailer"
- [ ] ✅ O código tem ~345 linhas
- [ ] ❌ Código está vazio ou diferente

**Se ❌, solução:**
→ Volte ao Passo 2
→ Copie e cole o código novamente
→ Clique em "Deploy"

---

#### Verificação 2.2: Deploy bem-sucedido?

**Como verificar:**
1. Edge Functions → email
2. Veja se há mensagem de sucesso
3. Ou veja se o status é "Deployed"

**Status:**
- [ ] ✅ Vi "Deployed successfully"
- [ ] ✅ Status mostra "Deployed" ou "Active"
- [ ] ❌ Apareceu erro no deploy

**Se ❌, solução:**
→ Veja a mensagem de erro
→ Copie o código novamente do arquivo original
→ Tente deploy novamente

---

#### Verificação 2.3: Configurações SMTP no código

**Como verificar:**
1. Abra o editor da função "email"
2. Procure por estas linhas no código:
   ```
   host: 'smtp.hostinger.com'
   port: 465
   user: 'controleinterno@transpjardim.com'
   ```

**Status:**
- [ ] ✅ Encontrei essas configurações
- [ ] ❌ Não encontro ou estão diferentes

**Se ❌, solução:**
→ O código está incorreto
→ Cole novamente do arquivo original

---

### ✅ PASSO 3: Senha Configurada

#### Verificação 3.1: Secret existe?

**Como verificar:**
1. Settings → Project Settings
2. Edge Functions (na lista)
3. Role até "Secrets"
4. Procure por "SMTP_PASSWORD"

**Status:**
- [ ] ✅ Vejo "SMTP_PASSWORD" na lista
- [ ] ❌ Não vejo "SMTP_PASSWORD"
- [ ] ⚠️ Vejo com outro nome

**Se ❌ ou ⚠️, solução:**
→ Volte ao Passo 3
→ Adicione o secret com nome "SMTP_PASSWORD"
→ Use EXATAMENTE esse nome (maiúsculas)

---

#### Verificação 3.2: Nome está correto?

**Como verificar:**
1. Veja o nome do secret na lista
2. Compare: `SMTP_PASSWORD`

**Status:**
- [ ] ✅ Nome é exatamente "SMTP_PASSWORD"
- [ ] ❌ Nome está diferente

**Se ❌, solução:**
→ Delete o secret incorreto
→ Crie novamente com o nome correto

---

#### Verificação 3.3: Valor está oculto?

**Como verificar:**
1. Olhe a coluna "Value" do secret
2. Deve mostrar "••••••" ou "hidden"

**Status:**
- [ ] ✅ O valor está oculto (••••••)
- [ ] ❌ Vejo o valor em texto

**Se ❌, isso é estranho mas não é erro crítico**

---

#### Verificação 3.4: Senha está correta?

**Como verificar:**
1. Acesse o Webmail Hostinger
2. URL: https://webmail.hostinger.com
3. Tente login com:
   - E-mail: controleinterno@transpjardim.com
   - Senha: (a mesma que colocou no secret)

**Status:**
- [ ] ✅ Consegui fazer login no Webmail
- [ ] ❌ Login falhou

**Se ❌, solução:**
→ A senha está incorreta
→ Recupere/redefina a senha correta
→ Delete o secret e crie novamente com a senha certa

---

## 🧪 TESTE FUNCIONAL

### Teste 1: Status da Função

**Como testar:**
1. Abra o navegador
2. Cole esta URL (substitua PROJECT_ID):
   ```
   https://PROJECT_ID.supabase.co/functions/v1/email/status
   ```
3. Adicione o header Authorization com sua ANON_KEY

**Resposta esperada:**
```json
{
  "success": true,
  "configured": true,
  "provider": "Hostinger",
  "host": "smtp.hostinger.com",
  "port": 465
}
```

**Status:**
- [ ] ✅ Recebi resposta com "success": true
- [ ] ❌ Recebi erro

---

### Teste 2: Envio de E-mail

**Como testar:**
1. Abra o TranspJardim
2. Login como admin
3. Configurações → E-mail
4. Digite seu e-mail pessoal
5. Clique "Enviar E-mail de Teste"
6. Aguarde até 2 minutos

**Status:**
- [ ] ✅ Recebi o e-mail de teste
- [ ] ⚠️ Foi para SPAM mas recebi
- [ ] ❌ Não recebi

**Se ⚠️ (foi para SPAM):**
→ Normal no primeiro envio
→ Marque como "Não é spam"
→ Adicione aos contatos

**Se ❌ (não recebeu):**
→ Continue com os testes abaixo

---

### Teste 3: Verificar Logs

**Como verificar:**
1. Supabase → Edge Functions → email
2. Clique na aba "Logs" ou "Invocations"
3. Veja as últimas execuções

**O que procurar:**
- [ ] ✅ Vejo logs de execução
- [ ] ✅ Não há erros em vermelho
- [ ] ❌ Vejo erros em vermelho

**Se ❌, erros comuns:**

**Erro: "SMTP_PASSWORD não configurada"**
→ Volte à Verificação 3.1
→ Configure o secret corretamente

**Erro: "Authentication failed"**
→ Senha incorreta
→ Volte à Verificação 3.4

**Erro: "Function not found"**
→ Nome da função está errado
→ Deve ser exatamente "email"

**Erro: "Invalid credentials"**
→ Senha ou usuário incorretos
→ Verifique SMTP_USER e SMTP_PASSWORD

---

## 🔍 VERIFICAÇÃO AVANÇADA

### Verificação A: Variáveis de Ambiente

**Como verificar:**
1. Edge Functions → email → Settings
2. Veja "Environment Variables" ou "Secrets"

**Deve ter:**
- [ ] ✅ SMTP_PASSWORD (obrigatório)

**Opcional (usa padrão se não tiver):**
- [ ] SMTP_HOST = smtp.hostinger.com
- [ ] SMTP_PORT = 465
- [ ] SMTP_USER = controleinterno@transpjardim.com

**Se falta SMTP_PASSWORD:**
→ Configure conforme Passo 3

---

### Verificação B: CORS e Permissões

**Como verificar:**
1. Veja o código da função
2. Procure por "corsHeaders"

**Deve conter:**
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
};
```

**Status:**
- [ ] ✅ CORS está configurado
- [ ] ❌ Não encontro corsHeaders

**Se ❌:**
→ Código incompleto
→ Copie novamente do arquivo original

---

### Verificação C: Imports

**Como verificar:**
1. Veja as primeiras linhas do código
2. Deve ter:

```javascript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import nodemailer from 'npm:nodemailer@6.9.7';
```

**Status:**
- [ ] ✅ Todos os imports estão presentes
- [ ] ❌ Falta algum import

**Se ❌:**
→ Código incompleto ou modificado
→ Cole novamente sem modificar

---

## 📊 RESULTADO FINAL

### Contabilize seus ✅:

**Verificações Básicas (Passos 1-3):**
- Total de ✅: _____ / 9

**Testes Funcionais:**
- Total de ✅: _____ / 3

**Verificações Avançadas:**
- Total de ✅: _____ / 3

---

### Interpretação:

**15/15 ✅ - PERFEITO! 🎉**
→ Tudo configurado corretamente
→ Sistema pronto para usar
→ Faça testes regulares

**12-14/15 ✅ - QUASE LÁ! 🟡**
→ Maioria está OK
→ Revise os itens com ❌
→ Refaça apenas as partes com problema

**8-11/15 ✅ - PRECISA ATENÇÃO ⚠️**
→ Algumas configurações incorretas
→ Revise cada passo com calma
→ Siga as soluções indicadas

**Menos de 8/15 ✅ - REFAZER 🔴**
→ Muitos problemas encontrados
→ Recomendo refazer desde o início
→ Use o GUIA_VISUAL_CONFIGURACAO_EMAIL.html

---

## 🔧 PLANO DE CORREÇÃO

Se você teve problemas, siga esta ordem:

### 1. Problemas no Passo 1 (Função)
- [ ] Recrie a função "email"
- [ ] Verifique o nome (minúsculas)
- [ ] Aguarde aparecer no painel

### 2. Problemas no Passo 2 (Código)
- [ ] Abra o arquivo original
- [ ] Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
- [ ] Cole no editor (apague o antigo antes)
- [ ] Clique "Deploy"
- [ ] Aguarde confirmação

### 3. Problemas no Passo 3 (Senha)
- [ ] Delete o secret existente (se tiver)
- [ ] Crie novo: Nome = SMTP_PASSWORD
- [ ] Cole a senha correta
- [ ] Salve

### 4. Teste Novamente
- [ ] Envie e-mail de teste
- [ ] Verifique logs
- [ ] Aguarde até 2 minutos

---

## 📝 REGISTRO DE VERIFICAÇÃO

Preencha após verificar:

```
Data: ___/___/______
Hora: ___:___

RESULTADOS:
[ ] Função "email" OK
[ ] Código deployed OK
[ ] SMTP_PASSWORD OK
[ ] Teste de envio OK

OBSERVAÇÕES:
_________________________________
_________________________________
_________________________________

PRÓXIMOS PASSOS:
_________________________________
_________________________________
_________________________________

Verificado por: _________________
```

---

## 🆘 SE NADA FUNCIONAR

### Última tentativa - Reset completo:

1. **Delete tudo:**
   - [ ] Delete a função "email"
   - [ ] Delete o secret "SMTP_PASSWORD"

2. **Aguarde 1 minuto**
   - [ ] Espere o Supabase processar

3. **Refaça do zero:**
   - [ ] Siga `GUIA_VISUAL_CONFIGURACAO_EMAIL.html`
   - [ ] Não pule nenhum passo
   - [ ] Use EXATAMENTE os nomes indicados

4. **Verifique novamente:**
   - [ ] Use este verificador
   - [ ] Todos os itens devem estar ✅

---

## 📚 PRÓXIMOS PASSOS

Se tudo estiver ✅:

1. **Configure alertas automáticos**
   - Veja: `SISTEMA-ALERTAS-AUTOMATICO-IMPLEMENTADO.md`

2. **Configure responsáveis por secretaria**
   - Veja: `FUNCIONALIDADE-RESPONSAVEIS-POR-SECRETARIA.md`

3. **Teste em produção**
   - Crie critérios reais
   - Monitore envios
   - Verifique logs regularmente

4. **Monitore o sistema**
   - Table Editor → email_logs
   - Edge Functions → email → Logs
   - Verifique taxa de sucesso

---

<div align="center">

## ✅ Verificação Concluída!

**Todos ✅?** → Sistema pronto! 🎉  
**Alguns ❌?** → Revise os itens marcados  
**Muitos ❌?** → Refaça desde o início

**Boa sorte! 🚀**

</div>
