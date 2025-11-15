# 🔧 Correção: Timeout no Backend - Rota /users

## Data: 15/11/2024

---

## 🐛 **PROBLEMA IDENTIFICADO**

Erro de timeout ao tentar acessar a rota `/users`:

```
Erro na API Supabase: {
  "endpoint": "/users",
  "error": "Timeout na conexão (3s) - servidor indisponível",
  "originalError": {},
  "url": "https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/users",
  "timeout": "5s"
}
```

### Causa Raiz

1. **Timeout muito curto**: O frontend tinha timeout de apenas 3 segundos
2. **Query lenta no banco**: A query `getByPrefix('usuario:')` estava demorando muito
3. **Sem limite de resultados**: A query poderia retornar muitos usuários sem limite
4. **Prefixo ineficiente**: Estava buscando por `usuario:` (que retorna duplicatas) ao invés de `usuario_id:` (único por usuário)

---

## ✅ **CORREÇÕES IMPLEMENTADAS**

### 1. Aumentar Timeout no Frontend

**Arquivo:** `/hooks/useSupabase.ts`

**Antes:**
```typescript
const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s
```

**Depois:**
```typescript
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s
```

**Resultado:**
- ✅ Agora o frontend espera até 10 segundos pela resposta
- ✅ Mensagem de erro atualizada: "Timeout na conexão (10s)"

### 2. Adicionar Timeout no Backend

**Arquivo:** `/supabase/functions/server/index.tsx`

**Antes:**
```typescript
const usuarios = await kv.getByPrefix('usuario:');
// Sem timeout - poderia travar indefinidamente
```

**Depois:**
```typescript
// Timeout de segurança (2 segundos)
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout ao buscar usuários')), 2000)
);

// Usar Promise.race para aplicar timeout
const usuarios = await Promise.race([
  kv.getByPrefix('usuario_id:', 100),
  timeoutPromise
]) as Array<{key: string, value: any}>;
```

**Resultado:**
- ✅ Backend tem timeout de 2 segundos
- ✅ Se a query demorar muito, retorna erro 504 (Gateway Timeout)
- ✅ Resposta específica: "Timeout ao buscar usuários - banco de dados lento"

### 3. Otimizar Query com Limite

**Arquivo:** `/supabase/functions/server/kv_store.tsx`

**Antes:**
```typescript
export async function getByPrefix(prefix: string): Promise<Array<{key: string, value: any}>> {
  const { data, error } = await supabase
    .from(KV_TABLE)
    .select('key, value')
    .like('key', `${prefix}%`);
  // Sem limite - poderia retornar milhares de registros
}
```

**Depois:**
```typescript
export async function getByPrefix(prefix: string, limit?: number): Promise<Array<{key: string, value: any}>> {
  let query = supabase
    .from(KV_TABLE)
    .select('key, value')
    .like('key', `${prefix}%`)
    .order('key', { ascending: true });
  
  // Aplicar limite se fornecido
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  return data || [];
}
```

**Resultado:**
- ✅ Agora aceita parâmetro opcional `limit`
- ✅ Query ordenada por chave
- ✅ Retorna no máximo 100 usuários por vez

### 4. Usar Prefixo Correto

**Arquivo:** `/supabase/functions/server/index.tsx`

**Antes:**
```typescript
const usuarios = await kv.getByPrefix('usuario:');
// Problema: retorna DUAS chaves por usuário:
// - usuario:admin (com username)
// - usuario_id:user_123 (com ID)
```

**Depois:**
```typescript
const usuarios = await kv.getByPrefix('usuario_id:', 100);
// Agora retorna apenas UMA chave por usuário
// - usuario_id:user_123
```

**Resultado:**
- ✅ Evita duplicatas
- ✅ Query mais rápida (menos registros)
- ✅ Limite de 100 usuários aplicado

---

## 🧪 **COMO TESTAR**

### Teste 1: Verificar se o Backend Responde

1. Abra o console do navegador (F12)
2. Execute:
   ```javascript
   fetch('https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/health')
     .then(r => r.json())
     .then(console.log)
   ```
3. ✅ Deve retornar:
   ```json
   {
     "status": "ok",
     "service": "TranspJardim API",
     "timestamp": "2024-11-15T...",
     "version": "1.0.2"
   }
   ```

### Teste 2: Listar Usuários

1. Faça login como `admin` / `admin`
2. Acesse: Painel de Administração → Gerenciamento de Usuários
3. ✅ A página deve carregar em até 10 segundos
4. ✅ Verifique os logs no console:
   ```
   Chamando kv.getByPrefix("usuario_id:") com limite de 100...
   Resultado da busca: 6 usuários
   ✅ 6 usuários processados com sucesso
   ```

### Teste 3: Performance

1. Monitore o tempo de resposta no Network tab (F12)
2. A rota `/users` deve responder em:
   - ⚡ **< 1 segundo**: Excelente
   - ✅ **1-3 segundos**: Bom
   - ⚠️ **3-10 segundos**: Aceitável (mas precisa otimizar)
   - ❌ **> 10 segundos**: Timeout

---

## 📊 **MELHORIAS DE PERFORMANCE**

### Antes
- ⏱️ Timeout: 3 segundos no frontend
- 🐌 Query sem limite: potencialmente lenta
- 📦 Retornava duplicatas: `usuario:` + `usuario_id:`
- ❌ Sem timeout no backend

### Depois
- ⏱️ Timeout: 10 segundos no frontend
- ⚡ Query com limite: máximo 100 usuários
- 📦 Sem duplicatas: apenas `usuario_id:`
- ✅ Timeout de 2s no backend
- 🎯 Código de erro específico: 504 Gateway Timeout

---

## 🔍 **DEBUGGING**

### Se o erro persistir:

#### 1. Verificar se o banco está acessível
```bash
# No console do Supabase
SELECT COUNT(*) FROM kv_store_225e1157 WHERE key LIKE 'usuario_id:%';
```

#### 2. Verificar logs do Edge Function
```bash
# No terminal local ou Supabase Dashboard
supabase functions logs server --tail
```

Procure por:
```
=== INICIANDO LISTAGEM DE USUÁRIOS ===
Chamando kv.getByPrefix("usuario_id:") com limite de 100...
Resultado da busca: X usuários
```

#### 3. Testar diretamente com cURL
```bash
curl -X GET \
  'https://dpnvtorphsxrncqtojvp.supabase.co/functions/v1/make-server-225e1157/users' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

#### 4. Verificar se há índice na tabela
```sql
-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_225e1157 (key text_pattern_ops);
```

---

## 🚀 **PRÓXIMAS OTIMIZAÇÕES (SE NECESSÁRIO)**

Se ainda houver problemas de performance:

### 1. Implementar Cache
```typescript
// Cache em memória no servidor
const userCache = {
  data: null,
  timestamp: 0,
  ttl: 60000 // 1 minuto
};

app.get('/make-server-225e1157/users', async (c) => {
  const now = Date.now();
  
  // Retornar cache se ainda válido
  if (userCache.data && (now - userCache.timestamp) < userCache.ttl) {
    return c.json(userCache.data);
  }
  
  // Buscar do banco...
  const result = await kv.getByPrefix('usuario_id:', 100);
  
  // Atualizar cache
  userCache.data = result;
  userCache.timestamp = now;
  
  return c.json(result);
});
```

### 2. Paginação
```typescript
app.get('/make-server-225e1157/users', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Implementar offset/limit na query
});
```

### 3. Lazy Loading no Frontend
```typescript
// Carregar usuários sob demanda
const [visibleUsers, setVisibleUsers] = useState(users.slice(0, 20));
// Carregar mais ao rolar
```

---

## 📝 **RESUMO DAS MUDANÇAS**

### Arquivos Modificados

1. **`/hooks/useSupabase.ts`**
   - Linha 26: Timeout aumentado de 3s para 10s
   - Linha 52: Mensagem de erro atualizada

2. **`/supabase/functions/server/index.tsx`**
   - Linha ~1082-1139: Rota `/users` otimizada
   - Adicionado timeout de 2s no backend
   - Mudança de prefixo: `usuario:` → `usuario_id:`
   - Limite de 100 usuários

3. **`/supabase/functions/server/kv_store.tsx`**
   - Linha 135: Parâmetro `limit` opcional adicionado
   - Query com ordenação e limite

---

## ✅ **STATUS**

**Antes:**
- ❌ Timeout após 3 segundos
- ❌ Query lenta sem limite
- ❌ Duplicatas de usuários
- ❌ Sem tratamento de timeout no backend

**Depois:**
- ✅ Timeout de 10 segundos no frontend
- ✅ Timeout de 2 segundos no backend
- ✅ Query com limite de 100 usuários
- ✅ Sem duplicatas (prefixo correto)
- ✅ Tratamento de erros melhorado
- ✅ Logs detalhados para debugging

---

**Status:** ✅ CORRIGIDO  
**Performance esperada:** < 3 segundos  
**Desenvolvido para:** Controladoria Municipal de Jardim/CE  
**Sistema:** TranspJardim  
**Data:** 15/11/2024
