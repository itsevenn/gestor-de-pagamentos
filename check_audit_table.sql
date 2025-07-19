-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR TABELA AUDIT_LOGS
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
    'Verificando tabela audit_logs' as status,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
    ) as tabela_existe;

-- 2. Se a tabela não existir, criar uma nova
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
    ) THEN
        -- Criar tabela audit_logs com estrutura correta
        CREATE TABLE audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "user" TEXT,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            changes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_audit_logs_date ON audit_logs(date DESC);
        CREATE INDEX idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX idx_audit_logs_user ON audit_logs("user");
        
        -- Desabilitar RLS temporariamente
        ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela audit_logs criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela audit_logs já existe!';
    END IF;
END $$;

-- 3. Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- 5. Desabilitar RLS se estiver habilitado
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 6. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow public read access to audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow all insert" ON audit_logs;
DROP POLICY IF EXISTS "Allow all select" ON audit_logs;

-- 7. Testar inserção
INSERT INTO audit_logs (date, "user", action, details)
VALUES (
    NOW(),
    'Admin',
    'TEST_ACTION',
    'Teste de inserção após correção da tabela'
);

-- 8. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'TEST_ACTION';

-- 9. Mostrar todos os logs existentes
SELECT 
    id,
    date,
    "user",
    action,
    details,
    created_at
FROM audit_logs 
ORDER BY date DESC 
LIMIT 10; 