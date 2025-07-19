-- =====================================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DA TABELA AUDIT_LOGS
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Verificar estrutura atual
SELECT 
    'Estrutura atual da tabela audit_logs' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 2. Adicionar coluna changes se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'changes'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN changes TEXT;
        RAISE NOTICE 'Coluna changes adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna changes já existe!';
    END IF;
END $$;

-- 3. Corrigir coluna id para ter valor padrão
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. Corrigir coluna user para permitir NULL
ALTER TABLE audit_logs ALTER COLUMN "user" DROP NOT NULL;

-- 5. Verificar se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- 6. Desabilitar RLS se estiver habilitado
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 7. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow public read access to audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow all insert" ON audit_logs;
DROP POLICY IF EXISTS "Allow all select" ON audit_logs;

-- 8. Testar inserção com estrutura corrigida
INSERT INTO audit_logs (date, "user", action, details, changes)
VALUES (
    NOW(),
    'Admin',
    'TEST_STRUCTURE_FIX',
    'Teste de inserção após correção da estrutura',
    '{"test": "structure_fix"}'
);

-- 9. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção após correção' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'TEST_STRUCTURE_FIX';

-- 10. Mostrar estrutura final
SELECT 
    'Estrutura final da tabela audit_logs' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 11. Mostrar logs de teste
SELECT 
    id,
    date,
    "user",
    action,
    details,
    changes
FROM audit_logs 
WHERE action LIKE '%TEST%'
ORDER BY date DESC; 