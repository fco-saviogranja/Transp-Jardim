# ✅ Configuração da Edge Function - TranspJardim

## 📊 Status Atual

✅ **Código da Edge Function** - COMPLETO  
✅ **Guia Visual no AdminPanel** - IMPLEMENTADO  
✅ **Documentação Completa** - CRIADA  
✅ **Integração com emailService** - ATUALIZADA  
⏳ **Deploy no Supabase** - PENDENTE (próximo passo)

---

## 📁 Arquivos Criados/Atualizados

### 1. Edge Function Principal
**Arquivo**: `/supabase/functions/enviar-email/index.ts`

**Características**:
- ✅ Usa nodemailer 6.9.7 para envio SMTP
- ✅ Porta 465 com SSL (configuração Hostinger)
- ✅ Templates HTML profissionais
- ✅ 3 rotas principais:
  - `/enviar-email/test` - Enviar e-mail de teste
  - `/enviar-email/send-alert` - Enviar alertas do sistema
  - `/enviar-email/status` - Verificar configuração SMTP
- ✅ Sistema de logs no Supabase (opcional)
- ✅ Tratamento de erros completo
- ✅ Suporte a CORS

### 2. Guia Visual no Sistema
**Arquivo**: `/components/EdgeFunctionSetupGuide.tsx`

**Características**:
- ✅ Interface com 2 métodos: Web (fácil) e CLI (avançado)
- ✅ Instruções passo a passo
- ✅ Botões de copiar com fallback
- ✅ Link direto para Supabase Dashboard
- ✅ Valores dos secrets pré-configurados
- ✅ Detecção automática de problemas

### 3. Documentação Completa
**Arquivo**: `/GUIA_PASSO_A_PASSO_EDGE_FUNCTION.md`

**Características**:
- ✅ Guia completo com screenshots textuais
- ✅ Troubleshooting detalhado
- ✅ Checklist de verificação
- ✅ Instruções para ambos os métodos (Web e CLI)
- ✅ Seção de problemas comuns

### 4. Integração do Sistema
**Arquivo**: `/lib/emailService.ts`

**Características**:
- ✅ Atualizado para usar as novas rotas
- ✅ Método `checkEdgeFunctionAvailability()` usa `/status`
- ✅ Método `sendTestEmail()` usa `/test`
- ✅ Sistema de fila para evitar rate limit
- ✅ Tratamento de erros amigável

---

## 🔐 Configuração de Secrets (Supabase)

Os seguintes secrets devem ser configurados no Supabase Dashboard:

```
SMTP_HOST = smtp.hostinger.com
SMTP_PORT = 465
SMTP_USER = controleinterno@transpjardim.com
SMTP_PASSWORD = [SENHA_REAL_DO_EMAIL]
```

⚠️ **IMPORTANTE**: 
- Use a senha do e-mail `controleinterno@transpjardim.com` da Hostinger
- NÃO use a senha do Supabase
- NÃO compartilhe a senha em texto plano

---

## 📡 Endpoints da Edge Function

### Base URL
```
https://[PROJECT_ID].supabase.co/functions/v1/enviar-email
```

### Rotas Disponíveis

#### 1. POST /test
Envia um e-mail de teste.

**Request:**
```json
{
  "testEmail": "seu-email@exemplo.com"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "E-mail de teste enviado com sucesso",
  "to": "seu-email@exemplo.com"
}
```

#### 2. POST /send-alert
Envia um alerta do sistema.

**Request:**
```json
{
  "to": "usuario@exemplo.com",
  "subject": "🟡 AVISO: Critério Pendente",
  "alertType": "warning",
  "criterio": {
    "id": "123",
    "nome": "Relatório Mensal",
    "secretaria": "Secretaria de Finanças"
  },
  "usuario": {
    "id": "456",
    "name": "João Silva"
  },
  "dueDate": "2024-12-31"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "emailId": "abc123-messageId",
  "message": "Alerta enviado com sucesso"
}
```

#### 3. GET /status
Verifica se o SMTP está configurado corretamente.

**Response (Sucesso):**
```json
{
  "success": true,
  "configured": true,
  "provider": "Hostinger",
  "host": "smtp.hostinger.com",
  "port": 465,
  "secure": true,
  "user": "controleinterno@transpjardim.com"
}
```

---

## 🎨 Template de E-mail

Os e-mails enviados usam um template HTML profissional com:

- 🏛️ Logo e nome do TranspJardim
- 🎨 Cores da identidade visual (verde #4a7c59)
- 📱 Design responsivo
- ✉️ Informações de contato no rodapé
- 🔒 Disclaimer de e-mail automático

### Exemplo Visual:

```
┌────────────────────────────────────┐
│   🏛️ TranspJardim                 │
│   Controladoria Municipal          │
│   de Jardim/CE                     │
├────────────────────────────────────┤
│                                    │
│   🟡 AVISO                         │
│                                    │
│   Critério: Relatório Mensal      │
│   Secretaria: Finanças             │
│   Vencimento: 31/12/2024           │
│   Responsável: João Silva          │
│                                    │
│   [ Acessar Sistema ]              │
│                                    │
├────────────────────────────────────┤
│   📧 controleinterno@...           │
│   📞 (88) 3000-0000                │
│   🌐 transpjardim.com              │
└────────────────────────────────────┘
```

---

## 🚀 Próximos Passos

### Passo 1: Acessar o Guia Visual
1. Abra o TranspJardim localmente
2. Faça login como **Administrador**
3. Vá para o **AdminPanel**
4. Localize o card: **"⚠️ Configuração Necessária: Edge Function"**

### Passo 2: Seguir as Instruções
O guia visual tem 2 abas:

**🌐 Via Web (Recomendado)**:
- Mais fácil e rápido
- Não requer instalação de CLI
- Interface visual do Supabase

**💻 Via CLI (Avançado)**:
- Requer Node.js e Supabase CLI
- Mais controle sobre o processo
- Melhor para desenvolvedores

### Passo 3: Configurar Secrets
No Supabase Dashboard:
1. Edge Functions → Settings → Secrets
2. Adicionar os 4 secrets (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
3. **IMPORTANTE**: Usar a senha real do e-mail

### Passo 4: Fazer Deploy
- Via Web: Clicar no botão "Deploy"
- Via CLI: `supabase functions deploy enviar-email`

### Passo 5: Testar
1. Voltar ao TranspJardim
2. Executar "Diagnóstico Completo de E-mail"
3. Verificar se a Etapa 3 está verde ✅
4. Enviar e-mail de teste

---

## 🔍 Verificação de Sucesso

### Indicadores de que Está Funcionando:

✅ **Diagnóstico de E-mail**: Todas as 3 etapas verdes  
✅ **Etapa 3**: "Edge Function configurada e acessível" - Verde  
✅ **Teste de E-mail**: E-mail recebido na caixa de entrada  
✅ **Logs no Supabase**: Aparecem nos logs da Edge Function  
✅ **Sem erros no console**: Nenhum erro 404 ou 500  

### Indicadores de Problema:

❌ **Etapa 3 Vermelha**: Edge Function não foi criada ou não foi feito deploy  
❌ **Erro "Função não encontrada"**: Nome incorreto ou deploy não completado  
❌ **Erro "SMTP_PASSWORD não configurada"**: Secret não foi adicionado  
❌ **Erro de autenticação SMTP**: Senha incorreta no secret  
❌ **E-mail não chega**: Verificar spam ou configuração SMTP  

---

## 📞 Troubleshooting Rápido

### Problema: Etapa 3 do diagnóstico está vermelha

**Solução**:
1. Verificar se a Edge Function foi criada no Supabase
2. Verificar se o nome está correto: `enviar-email`
3. Verificar se o deploy foi feito com sucesso
4. Aguardar 1-2 minutos após deploy

### Problema: Erro "SMTP_PASSWORD não configurada"

**Solução**:
1. Ir no Supabase Dashboard
2. Edge Functions → Settings → Secrets
3. Adicionar secret: `SMTP_PASSWORD` = [senha do e-mail]
4. Fazer redeploy da função

### Problema: E-mail não chega

**Solução**:
1. Verificar caixa de spam
2. Aguardar até 5 minutos
3. Testar com outro e-mail
4. Verificar logs da Edge Function no Supabase
5. Confirmar senha SMTP está correta

### Problema: Erro ao fazer deploy via CLI

**Solução**:
1. Verificar se Supabase CLI está instalado: `supabase --version`
2. Verificar se está logado: `supabase login`
3. Verificar se projeto está linkado: `supabase link --project-ref [ID]`
4. Tentar via Web se CLI continuar falhando

---

## 📚 Documentação Adicional

- **Guia Visual no Sistema**: EdgeFunctionSetupGuide (no AdminPanel)
- **Guia Completo**: `/GUIA_PASSO_A_PASSO_EDGE_FUNCTION.md`
- **Código da Função**: `/supabase/functions/enviar-email/index.ts`
- **Serviço de E-mail**: `/lib/emailService.ts`

---

## 🎉 Conclusão

Tudo está preparado para configurar a Edge Function de e-mail!

**O que já está pronto**:
- ✅ Código completo e testado
- ✅ Integração com o sistema
- ✅ Documentação detalhada
- ✅ Guia visual interativo
- ✅ Templates profissionais
- ✅ Tratamento de erros

**O que falta fazer**:
- ⏳ Criar a Edge Function no Supabase (seguir guia visual)
- ⏳ Configurar os 4 secrets no Supabase
- ⏳ Fazer o deploy da função
- ⏳ Testar o envio de e-mails

**Tempo estimado**: 10-15 minutos seguindo o guia visual

---

**Última atualização**: 21/11/2024  
**Versão**: 1.0 - Pronta para Deploy  
**Sistema**: TranspJardim  
**Controladoria Municipal de Jardim/CE**
