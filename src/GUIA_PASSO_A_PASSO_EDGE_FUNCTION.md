# 📧 Guia Completo: Configurar Edge Function de E-mail no Supabase

## 🎯 Objetivo
Configurar a Edge Function `enviar-email` no Supabase para ativar o envio real de e-mails via SMTP da Hostinger no sistema TranspJardim.

---

## 📋 Pré-requisitos
- ✅ Projeto TranspJardim funcionando localmente
- ✅ Conta Supabase com projeto criado
- ✅ E-mail `controleinterno@transpjardim.com` configurado na Hostinger
- ✅ Senha do e-mail em mãos

---

## 🌐 MÉTODO 1: Via Dashboard do Supabase (RECOMENDADO)

### Passo 1: Acessar o Supabase Dashboard

1. Abra o navegador e acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **TranspJardim**
4. Você verá o menu lateral com várias opções

### Passo 2: Navegar até Edge Functions

1. No menu lateral esquerdo, localize **"Edge Functions"**
2. Clique em **"Edge Functions"**
3. Você verá uma lista de funções (pode estar vazia)
4. Clique no botão verde **"Create a new function"**

### Passo 3: Criar a Função

1. Um modal aparecerá pedindo o nome da função
2. Digite exatamente: `enviar-email` (sem espaços, tudo minúsculo)
3. Clique em **"Create function"**
4. Um editor de código será aberto

### Passo 4: Copiar o Código Completo

1. No seu projeto local, abra o arquivo:
   ```
   /supabase/functions/enviar-email/index.ts
   ```

2. Selecione **TODO** o conteúdo do arquivo (Ctrl+A / Cmd+A)

3. Copie o código (Ctrl+C / Cmd+C)

4. Volte ao Supabase Dashboard

5. No editor da Edge Function, **APAGUE** todo o código de exemplo

6. Cole o código copiado (Ctrl+V / Cmd+V)

7. Clique no botão **"Save"** (disquete) no canto superior direito

### Passo 5: Configurar os Secrets (Variáveis de Ambiente)

1. Na página da Edge Function, clique na aba **"Settings"**

2. Role até a seção **"Secrets"**

3. Clique em **"Add secret"** para cada um dos seguintes:

   **Secret 1:**
   - Nome: `SMTP_HOST`
   - Valor: `smtp.hostinger.com`
   - Clique em **"Add secret"**

   **Secret 2:**
   - Nome: `SMTP_PORT`
   - Valor: `465`
   - Clique em **"Add secret"**

   **Secret 3:**
   - Nome: `SMTP_USER`
   - Valor: `controleinterno@transpjardim.com`
   - Clique em **"Add secret"**

   **Secret 4:**
   - Nome: `SMTP_PASSWORD`
   - Valor: `[COLE_AQUI_A_SENHA_REAL_DO_EMAIL]`
   - ⚠️ **IMPORTANTE**: Use a senha REAL do e-mail, não deixe esse texto de exemplo!
   - Clique em **"Add secret"**

4. Após adicionar todos os 4 secrets, você verá uma lista com:
   ```
   SMTP_HOST = smtp.hostinger.com
   SMTP_PORT = 465
   SMTP_USER = controleinterno@transpjardim.com
   SMTP_PASSWORD = ••••••••••••
   ```

### Passo 6: Fazer o Deploy

1. Volte para a aba **"Code"** da Edge Function

2. Clique no botão **"Deploy"** no canto superior direito

3. Uma janela de confirmação aparecerá

4. Clique em **"Deploy function"**

5. Aguarde o processo de deploy (leva 10-30 segundos)

6. Quando finalizar, você verá um ✅ **"Deployed successfully"**

### Passo 7: Testar a Função

1. Volte ao sistema TranspJardim no navegador

2. Faça login como **Administrador**

3. Vá para o **AdminPanel**

4. Localize o card **"Diagnóstico Completo de E-mail"**

5. Clique no botão **"Executar Diagnóstico"**

6. Aguarde os testes:
   - ✅ Etapa 1: Configuração Local (deve estar verde)
   - ✅ Etapa 2: Conectividade Supabase (deve estar verde)
   - ✅ **Etapa 3: Edge Function** (agora deve ficar **VERDE** 🎉)

7. Se a Etapa 3 estiver verde, clique em **"Enviar E-mail de Teste"**

8. Digite seu e-mail pessoal e clique em **"Enviar"**

9. Verifique sua caixa de entrada (e spam) - você deve receber um e-mail do TranspJardim!

---

## 💻 MÉTODO 2: Via CLI do Supabase (AVANÇADO)

### Pré-requisitos
- Node.js instalado (versão 16 ou superior)
- Terminal/Prompt de Comando

### Passo 1: Instalar Supabase CLI

Abra o terminal e execute:

```bash
npm install -g supabase
```

Aguarde a instalação finalizar.

### Passo 2: Fazer Login no Supabase

Execute:

```bash
supabase login
```

Isso abrirá seu navegador para autorização. Faça login e autorize o CLI.

### Passo 3: Linkar o Projeto

Execute (substitua `SEU_PROJECT_ID` pelo ID do seu projeto):

```bash
supabase link --project-ref SEU_PROJECT_ID
```

**Como encontrar o Project ID:**
1. Vá para o Supabase Dashboard
2. Selecione seu projeto
3. Vá em Settings → General
4. Copie o "Reference ID"

### Passo 4: Criar a Estrutura da Função

Execute:

```bash
supabase functions new enviar-email
```

Isso criará a pasta `supabase/functions/enviar-email/` no seu projeto.

### Passo 5: Copiar o Código

1. Abra o arquivo que foi criado:
   ```
   supabase/functions/enviar-email/index.ts
   ```

2. **APAGUE** todo o conteúdo de exemplo

3. Copie o conteúdo do arquivo do projeto:
   ```
   /supabase/functions/enviar-email/index.ts
   ```

4. Cole no arquivo criado pelo CLI

5. Salve o arquivo

### Passo 6: Configurar os Secrets

Execute os seguintes comandos (substitua `SUA_SENHA_AQUI` pela senha real):

```bash
supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=controleinterno@transpjardim.com
supabase secrets set SMTP_PASSWORD=SUA_SENHA_AQUI
```

### Passo 7: Fazer o Deploy

Execute:

```bash
supabase functions deploy enviar-email
```

Aguarde o upload e deploy finalizar. Você verá:

```
✓ Deployed Function enviar-email
```

### Passo 8: Testar

Siga os mesmos passos do **Passo 7** do Método 1.

---

## 🔍 Verificação e Troubleshooting

### ✅ Checklist de Verificação

- [ ] Edge Function `enviar-email` criada no Supabase
- [ ] Código completo copiado e colado
- [ ] Deploy realizado com sucesso
- [ ] 4 secrets configurados (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
- [ ] Senha do e-mail configurada corretamente (não é a senha do Supabase!)
- [ ] Diagnóstico mostra Etapa 3 em verde
- [ ] E-mail de teste recebido com sucesso

### ❌ Problemas Comuns

**Problema 1: "Função não encontrada" ou Etapa 3 vermelha**

- **Solução**: Verifique se o nome da função está exato: `enviar-email` (sem espaços, tudo minúsculo)
- Certifique-se de que o deploy foi feito com sucesso
- Aguarde 1-2 minutos após o deploy e tente novamente

**Problema 2: "SMTP_PASSWORD não configurada"**

- **Solução**: Verifique se o secret foi criado com o nome exato: `SMTP_PASSWORD` (não `SMTP_PASS`)
- Certifique-se de que não há espaços antes ou depois da senha
- Após adicionar/editar secrets, faça o deploy novamente

**Problema 3: "Erro de autenticação SMTP"**

- **Solução**: A senha está incorreta
- Verifique a senha do e-mail `controleinterno@transpjardim.com` na Hostinger
- Copie a senha novamente e reconfigure o secret `SMTP_PASSWORD`
- Faça o deploy novamente após corrigir

**Problema 4: "E-mail não chega"**

- **Solução**: 
  - Verifique a caixa de spam/lixo eletrônico
  - Aguarde até 5 minutos (alguns provedores têm delay)
  - Teste com outro endereço de e-mail
  - Verifique os logs da Edge Function no Supabase Dashboard

**Problema 5: "Erro 500 ao testar"**

- **Solução**:
  - Abra o Supabase Dashboard
  - Vá em Edge Functions → enviar-email → Logs
  - Veja o erro detalhado nos logs
  - Geralmente é problema de configuração de secrets

### 📊 Como Ver os Logs

1. Supabase Dashboard → Edge Functions
2. Clique em `enviar-email`
3. Clique na aba **"Logs"**
4. Você verá todos os logs de execução da função
5. Use os logs para diagnosticar problemas

---

## 🎉 Sucesso!

Se você chegou até aqui e:
- ✅ A Etapa 3 do diagnóstico está verde
- ✅ Recebeu o e-mail de teste

**PARABÉNS! 🎊** O sistema de e-mail está 100% funcional!

Agora o TranspJardim pode enviar:
- 📧 Alertas automáticos de critérios
- 🔔 Notificações de vencimento
- 📨 E-mails de teste do sistema

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o checklist acima
2. Consulte a seção de troubleshooting
3. Veja os logs da Edge Function
4. Execute o diagnóstico completo
5. Verifique se todos os secrets estão configurados

---

## 📝 Notas Importantes

- A senha do e-mail **NÃO** é a senha do Supabase
- Use a senha do e-mail `controleinterno@transpjardim.com` da Hostinger
- Os secrets são criptografados e seguros no Supabase
- Nunca compartilhe sua senha em texto plano
- Faça o redeploy sempre que mudar os secrets

---

**Última atualização**: 21/11/2024  
**Versão do guia**: 1.0  
**Sistema**: TranspJardim  
**Autor**: Controladoria Municipal de Jardim/CE
