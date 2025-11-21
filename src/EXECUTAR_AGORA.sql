-- ============================================
-- COPIE E COLE ESTE SQL NO SUPABASE
-- ============================================
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione o projeto TranspJardim
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Clique em "New Query"
-- 5. Cole TODO este código abaixo
-- 6. Clique em "Run" (ou Ctrl+Enter)
-- ============================================

-- Criar tabela de secretarias
CREATE TABLE IF NOT EXISTS secretarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_secretarias_nome ON secretarias(nome);

-- Habilitar RLS (Row Level Security)
ALTER TABLE secretarias ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura de secretarias para usuários autenticados"
  ON secretarias
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserção apenas para administradores
CREATE POLICY "Permitir inserção de secretarias para administradores"
  ON secretarias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Política para permitir atualização apenas para administradores
CREATE POLICY "Permitir atualização de secretarias para administradores"
  ON secretarias
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Política para permitir exclusão apenas para administradores
CREATE POLICY "Permitir exclusão de secretarias para administradores"
  ON secretarias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Inserir secretarias padrão
INSERT INTO secretarias (nome, sigla, descricao) VALUES
  ('Secretaria de Educação', 'SEDUC', 'Responsável pela educação municipal'),
  ('Secretaria de Saúde', 'SESAU', 'Responsável pela saúde pública'),
  ('Secretaria de Obras e Infraestrutura', 'SEOBRAS', 'Responsável por obras públicas'),
  ('Secretaria de Meio Ambiente', 'SEMAM', 'Responsável pelo meio ambiente'),
  ('Secretaria de Habitação e Desenvolvimento Social', 'SEHAB', 'Responsável por habitação'),
  ('Secretaria de Administração e Finanças', 'SEADM', 'Responsável pela administração'),
  ('Secretaria de Cultura, Esporte e Lazer', 'SECEL', 'Responsável por cultura e esporte')
ON CONFLICT DO NOTHING;

-- Verificar criação
SELECT 'Tabela secretarias criada com sucesso!' as mensagem;
SELECT COUNT(*) as total_secretarias FROM secretarias;
