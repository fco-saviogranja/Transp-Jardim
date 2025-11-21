# ❓ FAQ - Perguntas Frequentes

## Configuração de E-mail TranspJardim

---

## 🚀 ANTES DE COMEÇAR

### P: Qual guia devo usar?

**R:** Recomendo começar com o **`GUIA_VISUAL_CONFIGURACAO_EMAIL.html`** (abra no navegador). É interativo, tem checklist e botão para copiar código.

Se preferir texto:
- Rápido: `GUIA_SIMPLIFICADO_3_PASSOS.md`
- Detalhado: `INICIO_RAPIDO_EMAIL.md`
- Organizado: `CHECKLIST_CONFIGURACAO_EMAIL.md`

---

### P: Quanto tempo vai levar?

**R:** Aproximadamente **5 minutos** se você seguir os passos corretamente:
- Passo 1: 2 minutos
- Passo 2: 1 minuto
- Passo 3: 2 minutos

---

### P: Preciso saber programar?

**R:** **NÃO!** Você só precisa:
1. Copiar e colar código (Ctrl+C, Ctrl+V)
2. Clicar em alguns botões
3. Digitar a senha do e-mail

---

### P: O que preciso ter antes de começar?

**R:** Você precisa de:
- ✅ Acesso ao dashboard do Supabase
- ✅ Projeto TranspJardim criado no Supabase
- ✅ Senha do e-mail controleinterno@transpjardim.com
- ✅ Arquivo `supabase-edge-function-email-example.ts`

---

## 🔍 PASSO 1: CRIAR FUNÇÃO

### P: Não encontro "Edge Functions" no menu

**R:** Pode estar com outro nome:
- Procure apenas por **"Functions"**
- Em alguns painéis é **"Serverless Functions"**
- Pode estar dentro de **"Database"** → **"Functions"**

---

### P: Devo usar "Database Functions" ou "Edge Functions"?

**R:** Use **"Edge Functions"** (ou apenas "Functions" se for o único disponível). **NÃO** use "Database Functions" (são funções SQL, diferentes).

---

### P: Qual nome devo dar à função?

**R:** Exatamente **`email`** (tudo minúsculo, sem espaços, sem caracteres especiais).

❌ ERRADO: `Email`, `EMAIL`, `e-mail`, `email_transpjardim`  
✅ CERTO: `email`

---

### P: Posso dar outro nome à função?

**R:** Tecnicamente sim, mas você precisará alterar várias partes do código frontend. Recomendo usar **`email`** para evitar problemas.

---

## 📝 PASSO 2: COLAR CÓDIGO

### P: Onde está o código que devo colar?

**R:** No arquivo **`supabase-edge-function-email-example.ts`** na raiz do seu projeto TranspJardim.

---

### P: Preciso modificar o código antes de colar?

**R:** **NÃO!** Cole o código exatamente como está. Todas as configurações já estão corretas.

---

### P: O código tem mais de 300 linhas, está certo?

**R:** **SIM!** O arquivo tem aproximadamente 345 linhas. Se tiver menos, você não copiou tudo.

---

### P: Preciso clicar em "Deploy"?

**R:** **SIM!** Muito importante! Sem clicar em Deploy, o código não será salvo e não funcionará.

---

### P: Quanto tempo demora o deploy?

**R:** Entre 10 a 30 segundos normalmente. Se demorar mais de 1 minuto, pode haver algum erro.

---

### P: O que fazer se aparecer erro no deploy?

**R:** Verifique:
1. Você colou TODO o código?
2. Não modificou nada?
3. Veja a mensagem de erro específica
4. Tente fazer deploy novamente

Erros comuns:
- Código incompleto → Copie tudo de novo
- Sintaxe errada → Cole novamente sem modificar

---

### P: Devo ver alguma confirmação após o deploy?

**R:** Sim! Você deve ver:
- ✅ "Deployed successfully" ou
- ✅ "Function deployed" ou
- 🟢 Status verde com "Active"

---

## 🔐 PASSO 3: CONFIGURAR SENHA

### P: Onde encontro "Secrets"?

**R:** Navegação completa:
1. Menu lateral → ⚙️ **Settings**
2. Clique em **"Project Settings"**
3. Na lista lateral → **"Edge Functions"**
4. Role a página para baixo → **"Secrets"** (ou "Environment Variables")

---

### P: Não vejo a opção "Secrets"

**R:** Tente:
1. Role a página toda para baixo
2. Pode estar como "Environment Variables"
3. Pode estar em "Configuration"
4. Em alguns painéis: Settings → Functions → Variables

---

### P: Que nome devo usar para o secret?

**R:** Exatamente **`SMTP_PASSWORD`** (tudo em MAIÚSCULAS).

❌ ERRADO: `smtp_password`, `SmtpPassword`, `senha`, `password`  
✅ CERTO: `SMTP_PASSWORD`

---

### P: Qual senha devo colocar?

**R:** A senha do e-mail **controleinterno@transpjardim.com** no servidor Hostinger.

Se você não tem acesso a essa senha, solicite ao administrador do sistema.

---

### P: Posso ver a senha depois de salvar?

**R:** **NÃO!** Por segurança, a senha fica oculta (•••••••) após salvar. Isso é normal e esperado.

---

### P: Como saber se salvou corretamente?

**R:** Após clicar em "Add" ou "Save", você deve ver:
- Uma linha na tabela com "SMTP_PASSWORD"
- O valor aparecendo como "••••••••" ou "hidden"

---

### P: Posso criar outros secrets?

**R:** Sim, mas **não é necessário** para o sistema funcionar. Apenas `SMTP_PASSWORD` é obrigatório.

Opcionais (já têm valores padrão):
- `SMTP_HOST` (padrão: smtp.hostinger.com)
- `SMTP_PORT` (padrão: 465)
- `SMTP_USER` (padrão: controleinterno@transpjardim.com)

---

## 🧪 TESTANDO

### P: Como testar se funcionou?

**R:** Duas formas:

**Opção 1 - Pelo sistema (recomendado):**
1. Abra o TranspJardim
2. Login como admin
3. Configurações → E-mail
4. Digite seu e-mail
5. Clique "Enviar Teste"

**Opção 2 - Via API:**
Use a ferramenta `reqbin.com` conforme o guia `INICIO_RAPIDO_EMAIL.md`

---

### P: Quanto tempo até receber o e-mail de teste?

**R:** Normalmente **10 segundos a 2 minutos**. Se demorar mais:
- Verifique sua pasta de SPAM
- Verifique se o e-mail está correto
- Veja os logs no Supabase

---

### P: O e-mail foi para SPAM, é normal?

**R:** Pode acontecer no primeiro envio, especialmente em contas Gmail/Outlook novas.

Soluções:
- Marque como "Não é spam"
- Adicione controleinterno@transpjardim.com aos contatos
- Configure SPF/DKIM (avançado - veja `GUIA-CONFIGURACAO-DNS-SPF.md`)

---

### P: Onde vejo os logs de erro?

**R:** No Supabase:
1. Edge Functions (menu lateral)
2. Clique na função "email"
3. Aba "Logs" ou "Invocations"

---

## ❌ PROBLEMAS COMUNS

### P: Erro "SMTP_PASSWORD não configurada"

**R:** A senha não foi configurada ou está com nome errado.

Solução:
1. Vá em Project Settings → Edge Functions → Secrets
2. Verifique se existe "SMTP_PASSWORD" (exatamente assim)
3. Se não existir, crie
4. Se existir com nome diferente, delete e crie de novo

---

### P: Erro "Authentication failed"

**R:** A senha está incorreta.

Solução:
1. Teste fazer login no Webmail Hostinger com a mesma senha
2. Se não conseguir, a senha está errada
3. Recupere/redefina a senha
4. Atualize o secret no Supabase (delete e crie de novo)

---

### P: Erro "Function not found"

**R:** A função não foi criada ou está com nome diferente.

Solução:
1. Vá em Edge Functions
2. Verifique se existe uma função chamada "email"
3. Se não existir, volte ao Passo 1
4. Se existir com outro nome, crie uma nova chamada "email"

---

### P: Erro "Deploy failed"

**R:** O código não foi aceito.

Causas comuns:
- Código incompleto
- Código modificado
- Erro de sintaxe

Solução:
1. Apague tudo do editor
2. Copie NOVAMENTE do arquivo original
3. Cole sem modificar NADA
4. Deploy novamente

---

### P: E-mail não chega de jeito nenhum

**R:** Checklist completo:

1. ✅ A função "email" existe?
2. ✅ O deploy foi bem-sucedido?
3. ✅ A variável SMTP_PASSWORD existe?
4. ✅ A senha está correta?
5. ✅ Verificou SPAM?
6. ✅ Aguardou 2 minutos?
7. ✅ Verificou os logs?

Se todos ✅ e ainda não funciona:
- Veja os logs detalhados
- Teste com outro e-mail
- Consulte `GUIA_PASSO_A_PASSO_SUPABASE.md`

---

## 🔧 AVANÇADO

### P: Posso usar outro servidor SMTP?

**R:** Sim, mas precisa modificar o código. O sistema está otimizado para Hostinger.

Para mudar, altere em `supabase-edge-function-email-example.ts`:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- Configuração de SSL/TLS

---

### P: Como adicionar mais variáveis de ambiente?

**R:** Mesmo processo:
1. Project Settings → Edge Functions → Secrets
2. + Add secret
3. Name: `SUA_VARIAVEL`
4. Value: `seu_valor`

No código, acesse com: `Deno.env.get('SUA_VARIAVEL')`

---

### P: Posso ver quantos e-mails foram enviados?

**R:** Sim! O sistema salva logs na tabela `email_logs` do Supabase.

Acesse:
1. Table Editor (menu lateral)
2. Tabela: `email_logs`
3. Veja todos os e-mails enviados

---

### P: Como funciona o respeito a dias úteis?

**R:** O sistema verifica se é fim de semana/feriado antes de enviar.
- Se for sábado/domingo → adia para segunda
- Se for feriado → adia para próximo dia útil

Isso está implementado no frontend (`utils/businessDays.ts`).

---

### P: Posso personalizar o template do e-mail?

**R:** Sim! No arquivo `supabase-edge-function-email-example.ts`:

Função `getEmailTemplate()` → Estrutura HTML
Função `getAlertEmailContent()` → Conteúdo dos alertas

Modifique conforme necessário e faça deploy novamente.

---

## 📚 DOCUMENTAÇÃO

### P: Onde encontro mais informações?

**R:** Arquivos disponíveis:

**Guias de configuração:**
- `COMECE_AQUI_EMAIL.md` → Índice principal
- `GUIA_VISUAL_CONFIGURACAO_EMAIL.html` → Interativo
- `GUIA_SIMPLIFICADO_3_PASSOS.md` → Rápido
- `CHECKLIST_CONFIGURACAO_EMAIL.md` → Checklist

**Suporte técnico:**
- `MAPA_VISUAL_SUPABASE.md` → Onde clicar
- `FAQ_CONFIGURACAO_EMAIL.md` → Este arquivo
- `INICIO_RAPIDO_EMAIL.md` → Original

**Documentação completa:**
- `CONFIGURACAO_HOSTINGER_EMAIL.md` → Técnico completo
- `GUIA_VISUAL_SUPABASE.md` → Com imagens
- `GUIA_PASSO_A_PASSO_SUPABASE.md` → Detalhado

---

## 🆘 AINDA COM PROBLEMAS?

### P: Segui tudo e não funciona!

**R:** Passo a passo de troubleshooting completo:

1. **Verifique os logs:**
   - Edge Functions → email → Logs
   - Procure por erros em vermelho
   - Copie a mensagem de erro exata

2. **Teste a conexão SMTP:**
   - Tente fazer login no Webmail Hostinger
   - Use: controleinterno@transpjardim.com
   - Com a mesma senha do secret

3. **Verifique a função:**
   - Edge Functions → email
   - Status deve ser "Active" ou "Deployed"
   - Clique em "Invocations" para ver chamadas

4. **Teste via API diretamente:**
   - Use `reqbin.com`
   - POST para: `https://SEU_PROJECT.supabase.co/functions/v1/email/test`
   - Veja resposta detalhada

5. **Recrie tudo do zero:**
   - Delete a função "email"
   - Delete o secret "SMTP_PASSWORD"
   - Siga o guia do início

---

### P: Onde pedir ajuda?

**R:** Antes de pedir ajuda, tenha em mãos:

1. Mensagem de erro completa (dos logs)
2. Print da tela de Edge Functions
3. Print da tela de Secrets
4. Confirmação de que seguiu todos os passos

Consulte:
- Documentação técnica completa
- Logs do Supabase
- Guias de troubleshooting

---

## 📊 RESUMO RÁPIDO

```
❓ Problema              → 📖 Consulte
─────────────────────────────────────────────
Não sei qual guia usar   → COMECE_AQUI_EMAIL.md
Não encontro botões      → MAPA_VISUAL_SUPABASE.md
Dúvidas gerais           → FAQ_CONFIGURACAO_EMAIL.md (este)
Preciso de checklist     → CHECKLIST_CONFIGURACAO_EMAIL.md
Erro específico          → GUIA_PASSO_A_PASSO_SUPABASE.md
Detalhes técnicos        → CONFIGURACAO_HOSTINGER_EMAIL.md
Configuração DNS/SPF     → GUIA-CONFIGURACAO-DNS-SPF.md
```

---

<div align="center">

## 💬 Sua dúvida não está aqui?

Consulte os outros guias disponíveis!

Todos estão na raiz do projeto TranspJardim.

**Boa configuração! 🚀**

</div>
