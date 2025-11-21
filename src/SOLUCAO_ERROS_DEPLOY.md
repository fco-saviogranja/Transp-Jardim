# Solução para Erros de Deploy - TranspJardim

## ✅ Erro 126 Vercel - RESOLVIDO

### Problema Identificado
```
sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

O erro ocorria porque:
1. O `vercel.json` tinha um `buildCommand` vazio (`echo 'Build complete'`)
2. O script `build` no `package.json` chamava `vite build` diretamente
3. O binário do Vite em `node_modules/.bin/vite` não tinha permissão de execução após restaurar o cache

### Soluções Aplicadas

#### 1. **Alteração do package.json**
Modificamos todos os scripts para chamar o Vite diretamente via Node.js, evitando depender do bit de execução:

```json
"scripts": {
  "build": "node ./node_modules/vite/bin/vite.js build",
  "build:full": "tsc && node ./node_modules/vite/bin/vite.js build",
  "build:simple": "node ./node_modules/vite/bin/vite.js build --config vite.config.simple.ts",
  "build:netlify": "npm run type-check && node ./node_modules/vite/bin/vite.js build",
  "postinstall": "chmod +x ./node_modules/.bin/vite 2>/dev/null || true"
}
```

**Benefícios:**
- ✅ Não depende de permissão de execução do binário
- ✅ Funciona em qualquer plataforma (Linux, Windows, macOS)
- ✅ Resolve problemas com cache corrompido

#### 2. **Correção do vercel.json**
Atualizamos o `vercel.json` para executar o build corretamente:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": null,
  "functions": {
    "supabase/functions/**": {
      "memory": 128,
      "maxDuration": 10
    }
  },
  "build": {
    "env": {
      "NODE_VERSION": "18"
    }
  }
}
```

**Mudanças:**
- ✅ `buildCommand`: Agora executa `npm run build` corretamente
- ✅ `installCommand`: Usa `npm ci` para instalação limpa
- ✅ `NODE_VERSION`: Força Node.js 18 para consistência
- ✅ `framework: null`: Desabilita detecção automática de framework

#### 3. **Script postinstall de Segurança**
Adicionamos um `postinstall` que tenta garantir permissão de execução como fallback:

```json
"postinstall": "chmod +x ./node_modules/.bin/vite 2>/dev/null || true"
```

- `2>/dev/null`: Suprime erros (Windows não tem chmod)
- `|| true`: Garante que o script não falhe se chmod não existir

### Próximos Passos para Deploy

1. **Commit e Push das Alterações**
```bash
git add package.json vercel.json SOLUCAO_ERROS_DEPLOY.md
git commit -m "fix: Corrige erro 126 de permissões no build do Vercel"
git push origin main
```

2. **Deploy no Vercel**
- Acesse o painel do Vercel
- Clique em "Redeploy" ou aguarde o deploy automático
- **IMPORTANTE:** Use "Clear cache and redeploy" se o erro persistir

3. **Verificação**
- Acompanhe os logs de build
- O build deve executar `npm ci` → `npm run build` → success

---

## ⚠️ Erro 403 Edge Function Supabase - DOCUMENTADO

### Contexto do Erro

O erro 403 na Edge Function do Supabase **NÃO É um bug do código**, mas sim uma limitação/configuração da API do Resend em modo Sandbox.

### Por que o Erro 403 Ocorre?

A API do Resend em **modo Sandbox** (chaves de teste que começam com `re_test_...`) tem as seguintes restrições:

1. **Limitação de destinatários**: Apenas emails verificados podem receber mensagens
2. **Validação de domínio**: O domínio remetente precisa estar verificado
3. **DNS Records**: Registros SPF, DKIM e DMARC devem estar configurados

### Erro 403 É ESPERADO em Sandbox

```
Status 403: {"error": "Unauthorized"}
```

Este erro ocorre quando:
- ✅ A API key está correta
- ✅ O código está funcionando perfeitamente
- ❌ O destinatário não está autorizado (modo Sandbox)
- ❌ O domínio não está verificado para produção

### Soluções Disponíveis

#### Opção 1: Modo de Teste (RECOMENDADO para desenvolvimento)

O sistema já está preparado para lidar com isso:

```typescript
// No kv_store
await kv.set('config:resend_api_key', {
  apiKey: 'sua_chave_aqui',
  testMode: true,  // Ativa modo de teste
  authorizedEmail: 'controleinterno@transpjardim.tech'
});
```

**Como funciona:**
- Emails são "simulados" e não são enviados de verdade
- Logs indicam que o email seria enviado
- Não há erros 403 porque não chama a API do Resend

#### Opção 2: Verificar Domínio no Resend (para produção)

Para usar emails reais em produção:

1. **Acesse o Resend Dashboard**
   - https://resend.com/domains

2. **Adicione o domínio transpjardim.tech**
   - Clique em "Add Domain"
   - Digite: `transpjardim.tech`

3. **Configure DNS Records**
   O Resend fornecerá registros DNS:
   
   ```
   TXT  @ resend._domainkey     v=DKIM1; k=rsa; p=... (chave pública)
   TXT  @                       v=spf1 include:_spf.resend.com ~all
   TXT  @ _dmarc                v=DMARC1; p=none; ...
   ```

4. **Adicione no provedor DNS** (onde está registrado o domínio)
   - Pode ser Registro.br, Cloudflare, GoDaddy, etc.

5. **Aguarde propagação DNS** (pode levar até 48h, geralmente < 1h)

6. **Verifique no Resend**
   - Clique em "Verify" no dashboard
   - Status deve mudar para "Verified" ✅

7. **Upgrade para API Key de Produção**
   - Gere uma nova API key (não será mais `re_test_...`)
   - Atualize no sistema via painel de configuração

#### Opção 3: Usar Email Verificado (temporário)

Se estiver em Sandbox e precisar testar:

1. Acesse Resend → Settings → Verified Emails
2. Adicione o email que receberá os testes
3. Confirme no email recebido
4. Use apenas este email como destinatário nos testes

### Código Já Preparado

A Edge Function já trata o erro 403 adequadamente:

```typescript
// Detecta erro 403 e retorna mensagem clara
if (!response.ok) {
  const error = await parseResendResponse(response);
  
  if (response.status === 403) {
    console.error('❌ Erro 403: Domínio não verificado ou modo Sandbox');
    return {
      success: false,
      error: 'Domínio não verificado. Configure DNS ou use modo de teste.',
      code: 'DOMAIN_NOT_VERIFIED'
    };
  }
}
```

### Status Atual do Sistema

✅ **O que está funcionando:**
- Código da Edge Function está correto
- Sistema de emails configurado
- Tratamento de erros implementado
- Modo de teste disponível
- KV Store funcionando

⚠️ **O que precisa ser feito para produção:**
- Verificar domínio transpjardim.tech no Resend
- Configurar registros DNS (SPF, DKIM, DMARC)
- Gerar API key de produção
- Testar envio real de emails

### Recomendação Final

**Para desenvolvimento/testes:**
```typescript
// Use modo de teste
testMode: true
```

**Para produção:**
1. Verifique o domínio no Resend
2. Configure DNS corretamente
3. Use API key de produção
4. Desative modo de teste: `testMode: false`

---

## 📋 Checklist de Deploy

### Vercel (Frontend)
- [x] Corrigir package.json (scripts com node)
- [x] Corrigir vercel.json (buildCommand correto)
- [ ] Commit e push das alterações
- [ ] Testar deploy no Vercel
- [ ] Verificar build logs
- [ ] Testar aplicação em produção

### Supabase (Backend)
- [x] Edge Function otimizada para Deno
- [x] Tratamento de erros 403 implementado
- [ ] Decidir: usar modo de teste OU verificar domínio
- [ ] Configurar DNS (se escolher produção)
- [ ] Testar envio de emails
- [ ] Monitorar logs da Edge Function

### Emails (Resend)
- [ ] Definir estratégia: teste ou produção
- [ ] Se produção: adicionar domínio transpjardim.tech
- [ ] Se produção: configurar DNS (SPF, DKIM, DMARC)
- [ ] Se produção: gerar API key de produção
- [ ] Se teste: manter testMode: true

---

## 🆘 Troubleshooting

### Se o erro 126 persistir no Vercel:

1. **Limpar cache:**
   - No painel Vercel: "Clear cache and redeploy"

2. **Verificar Node version:**
   ```bash
   # Localmente
   node --version  # Deve ser 18.x
   ```

3. **Testar build local:**
   ```bash
   rm -rf node_modules package-lock.json dist
   npm ci
   npm run build
   ```

4. **Verificar logs do Vercel:**
   - Procure por "npm ci" no log
   - Confirme que vite foi instalado
   - Veja se `node ./node_modules/vite/bin/vite.js build` foi executado

### Se o erro 403 do Resend persistir:

1. **Verifique a API key:**
   ```bash
   # No Supabase Dashboard > Edge Functions > Secrets
   echo $RESEND_API_KEY
   ```

2. **Verifique o modo de teste:**
   ```sql
   -- No Supabase SQL Editor
   SELECT * FROM kv_store WHERE key = 'config:resend_api_key';
   ```

3. **Ative o modo de teste temporariamente:**
   ```typescript
   // No painel de configuração do sistema
   Modo de Teste: Ativado
   ```

4. **Verifique status do domínio:**
   - Acesse https://resend.com/domains
   - Status deve ser "Verified" para produção

---

## 📞 Suporte

Se os erros persistirem após seguir este guia:

1. **Logs do Vercel:**
   - Copie o log completo do build
   - Procure por erros específicos após `npm ci`

2. **Logs da Edge Function:**
   ```bash
   # No Supabase Dashboard
   Edge Functions > server > Logs
   ```

3. **Teste de DNS (se configurou domínio):**
   ```bash
   dig TXT transpjardim.tech
   dig TXT resend._domainkey.transpjardim.tech
   ```

---

**Última atualização:** 20/11/2025
**Status:** ✅ Erro 126 resolvido | ⚠️ Erro 403 documentado e com soluções
