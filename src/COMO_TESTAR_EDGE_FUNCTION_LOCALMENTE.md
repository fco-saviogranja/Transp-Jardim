# 🧪 Como Testar a Edge Function Localmente

## ⚠️ Problema Atual

Você está vendo o erro: `Error: Rota não encontrada: /enviar-email`

Isso acontece porque o servidor local do Supabase está usando uma **versão antiga do código**.

## ✅ Solução: Reiniciar o Servidor Local

### Passo 1: Parar o Servidor Atual

No terminal onde o `supabase functions serve` está rodando:

1. Pressione `Ctrl + C` (duas vezes se necessário)
2. Aguarde o servidor parar completamente

### Passo 2: Reiniciar o Servidor

Execute novamente:

```bash
supabase functions serve enviar-email
```

Ou, se quiser servir todas as funções:

```bash
supabase functions serve
```

### Passo 3: Verificar se Funcionou

Quando o servidor iniciar, você deve ver:

```
Listening on http://localhost:9999/
booted (time: XXms)
```

Agora, faça uma requisição de teste:

```bash
curl http://localhost:54321/functions/v1/enviar-email
```

**Resultado esperado**: JSON com informações da API, sem erro!

---

## 🎯 Alternativa: Deploy no Supabase Cloud

Se o teste local continuar com problemas, **faça o deploy diretamente no Supabase**:

### Via CLI:

```bash
supabase functions deploy enviar-email
```

### Via Dashboard:

1. Acesse: https://supabase.com/dashboard
2. Vá em Edge Functions → enviar-email
3. Cole o código de `/supabase/functions/enviar-email/index.ts`
4. Clique em **"Deploy"**

Após o deploy na cloud, teste via TranspJardim (AdminPanel → Diagnóstico de E-mail).

---

## 🔍 Verificar se o Código Está Correto

Para garantir que o arquivo local tem a correção:

```bash
# Ver últimas linhas do arquivo (onde está a rota padrão)
tail -n 50 supabase/functions/enviar-email/index.ts
```

Você deve ver algo como:

```typescript
// ROTA PADRÃO: Informações da API
return new Response(
  JSON.stringify({
    success: true,
    message: 'TranspJardim Email Service',
    version: '1.0.0',
    ...
```

Se NÃO ver isso, o arquivo pode estar diferente. Nesse caso:

1. Copie o conteúdo completo de `/supabase/functions/enviar-email/index.ts` do projeto
2. Cole no arquivo local em `supabase/functions/enviar-email/index.ts`
3. Salve o arquivo
4. Reinicie o servidor

---

## 🚨 Nota Importante sobre Nodemailer

Se você ver erros relacionados ao **nodemailer** ao rodar localmente, isso é **NORMAL**.

O nodemailer pode ter problemas no ambiente local do Supabase, mas **funciona perfeitamente na cloud**.

**Recomendação**: Faça o deploy na cloud e teste por lá. O teste local é opcional.

---

## 📋 Checklist de Troubleshooting Local

- [ ] Parou o servidor com Ctrl+C
- [ ] Reiniciou o servidor com `supabase functions serve`
- [ ] Verificou que o arquivo tem a rota padrão
- [ ] Testou com curl na URL local

Se ainda tiver problemas localmente:

- ✅ **SOLUÇÃO**: Faça deploy na cloud e teste por lá
- ⚠️ Ambiente local pode ter limitações que não existem na cloud

---

## ✨ Melhor Abordagem

**Para evitar problemas com ambiente local:**

1. ✅ Faça deploy direto no Supabase Cloud
2. ✅ Configure os secrets no dashboard
3. ✅ Teste via TranspJardim (sistema rodando localmente)
4. ✅ A Edge Function roda na cloud, seu app roda local

Isso evita problemas de compatibilidade do ambiente local!

---

**💡 Dica**: O teste local é útil, mas o deploy na cloud é mais confiável para Edge Functions que usam bibliotecas externas como nodemailer.

---

**Data**: 21/11/2024  
**Status**: Código corrigido, pronto para deploy na cloud  
**Recomendação**: Deploy na cloud > Teste local
