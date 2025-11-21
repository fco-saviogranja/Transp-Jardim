# Instruções: Criar Tabela de Secretarias no Supabase

## Como executar a migration

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione o projeto TranspJardim

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Cole o SQL da migration:**
   - Copie todo o conteúdo do arquivo `/supabase/migrations/003_create_secretarias_table.sql`
   - Cole no editor SQL

4. **Execute a query:**
   - Clique em "Run" ou pressione Ctrl+Enter
   - Aguarde a confirmação de sucesso

5. **Verifique a criação:**
   - Vá em "Table Editor" no menu lateral
   - Confirme que a tabela "secretarias" foi criada
   - Verifique se as 7 secretarias padrão foram inseridas

### Opção 2: Via Supabase CLI (Avançado)

```bash
# Navegar até a pasta do projeto
cd TranspJardim

# Executar a migration
supabase db push

# Ou aplicar a migration específica
supabase migration up 003_create_secretarias_table.sql
```

## O que a migration faz

✅ **Cria a tabela `secretarias`** com os campos:
- `id` (UUID, chave primária)
- `nome` (texto, obrigatório)
- `sigla` (texto, opcional)
- `descricao` (texto, opcional)
- `data_criacao` (timestamp)
- `updated_at` (timestamp)

✅ **Configura Row Level Security (RLS):**
- Leitura: qualquer usuário autenticado
- Inserção/Edição/Exclusão: apenas administradores

✅ **Insere 7 secretarias padrão:**
1. Secretaria de Educação (SEDUC)
2. Secretaria de Saúde (SESAU)
3. Secretaria de Obras e Infraestrutura (SEOBRAS)
4. Secretaria de Meio Ambiente (SEMAM)
5. Secretaria de Habitação e Desenvolvimento Social (SEHAB)
6. Secretaria de Administração e Finanças (SEADM)
7. Secretaria de Cultura, Esporte e Lazer (SECEL)

## Após executar a migration

1. **Teste o gerenciador de secretarias:**
   - Faça login como administrador
   - Vá em "Critérios de Controle" → "Secretarias"
   - Verifique se as 7 secretarias aparecem na lista

2. **Teste as operações:**
   - Criar nova secretaria ✅
   - Editar secretaria existente ✅
   - Excluir secretaria ✅

## Problemas comuns

### Erro: "relation secretarias already exists"
- A tabela já foi criada
- Solução: Pule a criação da tabela ou use `DROP TABLE secretarias CASCADE;` antes

### Erro: "permission denied"
- Você não tem permissões suficientes
- Solução: Verifique se está usando as credenciais corretas do projeto

### Erro de RLS
- As políticas de segurança não foram aplicadas
- Solução: Execute novamente apenas a parte de RLS da migration

## Integração com o sistema

O sistema agora:
- ✅ Busca secretarias diretamente do Supabase (via `supabaseClient`)
- ✅ Não depende da Edge Function para gerenciar secretarias
- ✅ Administradores podem criar/editar/excluir secretarias
- ✅ Usuários padrão podem visualizar as secretarias
