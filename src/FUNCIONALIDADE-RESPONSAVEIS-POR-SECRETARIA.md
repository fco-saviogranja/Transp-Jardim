# Funcionalidade: Seleção de Responsáveis por Secretaria

## ✅ PROBLEMA RESOLVIDO - Correção de Roteamento

### Problema Identificado
O endpoint `/make-server-225e1157/users/by-secretaria/:secretaria` estava retornando erro "Rota não encontrada" porque estava sendo definido **depois** da rota catch-all `app.all('*')` no servidor.

### Solução Aplicada
Reorganizei as rotas no arquivo `/supabase/functions/server/index.tsx`:
1. ✅ Movidas as rotas específicas para **antes** da rota catch-all
2. ✅ Rota catch-all movida para o **final do arquivo** (antes do `Deno.serve`)
3. ✅ Adicionada lista de rotas disponíveis na resposta 404
4. ✅ Logs detalhados no frontend e backend para debug

### Ordem Correta das Rotas
```
1. Rotas de autenticação (/login, /signup)
2. Rotas de usuários (/users, /users/emails, /users/by-secretaria/:secretaria)
3. Rotas de critérios (/criterios)
4. Rotas de e-mail (/email/send, /email/save-api-key, /email/notify-users)
5. 🔴 Rota catch-all (ÚLTIMA) - app.all('*')
```

## Implementação Concluída ✅

### Resumo
Implementei a funcionalidade solicitada onde, ao criar ou editar um critério, o campo de responsável agora exibe apenas os usuários cadastrados que estão vinculados à secretaria selecionada no momento do registro.

### Mudanças Realizadas

#### 1. Backend (`/supabase/functions/server/index.tsx`)

**Novo Endpoint Criado:**
```
GET /make-server-225e1157/users/by-secretaria/:secretaria
```

**Funcionalidades:**
- Busca todos os usuários do sistema usando prefixo `usuario_id:`
- Filtra apenas os usuários vinculados à secretaria especificada
- Retorna os dados sem a senha (segurança)
- Implementa timeout de 5 segundos para evitar travamentos
- Tratamento completo de erros com logs detalhados
- DecodeURIComponent para lidar com caracteres especiais nas secretarias

**Resposta do Endpoint:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "name": "João Silva",
      "username": "joao.silva",
      "email": "joao@email.com",
      "role": "padrão",
      "secretaria": "Secretaria de Educação"
    }
  ],
  "count": 1,
  "secretaria": "Secretaria de Educação",
  "timestamp": "2025-11-15T..."
}
```

#### 2. Frontend (`/components/CriterioForm.tsx`)

**Mudanças Implementadas:**

1. **Novo Estado:**
   - `responsaveisDisponiveis`: Array de usuários da secretaria selecionada
   - `loadingResponsaveis`: Indicador de carregamento

2. **Nova Função:**
   - `buscarResponsaveisPorSecretaria()`: Faz a requisição ao backend para buscar os responsáveis

3. **Campo de Responsável Atualizado:**
   - Mudou de `Input` (texto livre) para `Select` (seleção)
   - Desabilitado até que uma secretaria seja selecionada
   - Exibe mensagens contextuais:
     - "Selecione primeiro a secretaria"
     - "Carregando..."
     - "Nenhum responsável nesta secretaria"
     - "Selecione o responsável"

4. **Lógica Automática:**
   - Quando a secretaria é selecionada, busca automaticamente os responsáveis
   - Quando a secretaria é alterada, limpa o responsável selecionado
   - Ao editar um critério, mantém o responsável original se a secretaria não mudar

5. **Interface Melhorada:**
   - Exibe nome completo e username: "João Silva (joao.silva)"
   - Mensagem de feedback quando não há usuários na secretaria

### Como Funciona

1. **Criar Novo Critério:**
   - Usuário seleciona uma secretaria
   - Sistema busca automaticamente os responsáveis daquela secretaria
   - Campo de responsável é preenchido com os usuários disponíveis
   - Usuário seleciona o responsável desejado

2. **Editar Critério Existente:**
   - Sistema carrega os dados do critério
   - Busca automaticamente os responsáveis da secretaria do critério
   - Mantém o responsável atual selecionado
   - Se a secretaria for alterada, a lista de responsáveis é atualizada

3. **Validações:**
   - Não permite salvar sem selecionar um responsável
   - Exibe mensagens de erro claras
   - Tratamento de erros de rede

### Benefícios

✅ **Integridade de Dados:** Garante que apenas usuários da secretaria correta sejam selecionados
✅ **Usabilidade:** Interface mais intuitiva com seleção ao invés de digitação livre
✅ **Precisão:** Elimina erros de digitação no nome do responsável
✅ **Rastreabilidade:** Mantém vínculo correto entre critérios e usuários
✅ **Performance:** Requisições otimizadas com timeout e tratamento de erros

### Segurança

- Endpoint não retorna senhas dos usuários
- Timeout para evitar travamentos
- Validações no frontend e backend
- Tratamento completo de erros

### Observações

- Se não houver usuários cadastrados em uma secretaria, o sistema exibe uma mensagem informativa
- A funcionalidade é compatível com o sistema de autenticação existente
- Não afeta critérios já criados (retrocompatibilidade)

---

**Data de Implementação:** 15 de Novembro de 2025
**Status:** ✅ Funcional e Testado