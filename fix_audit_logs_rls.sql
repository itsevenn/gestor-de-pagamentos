-- =====================================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DA TABELA AUDIT_LOGS
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
    'Tabela audit_logs existe' as status,
    COUNT(*) as total_logs
FROM audit_logs;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow public read access to audit logs" ON audit_logs;

-- 3. Desabilitar RLS temporariamente
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- 5. Testar inserção direta
INSERT INTO audit_logs (date, user, action, details)
VALUES (
    NOW(),
    'Admin',
    'Teste RLS',
    'Teste de inserção após desabilitar RLS'
);

-- 6. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'Teste RLS';

-- 7. Reabilitar RLS com políticas simples
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Criar política para permitir inserção por qualquer usuário
CREATE POLICY "Allow all insert" ON audit_logs
FOR INSERT WITH CHECK (true);

-- 9. Criar política para permitir leitura por qualquer usuário
CREATE POLICY "Allow all select" ON audit_logs
FOR SELECT USING (true);

-- 10. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- 11. Testar inserção com RLS habilitado
INSERT INTO audit_logs (date, user, action, details)
VALUES (
    NOW(),
    'Admin',
    'Teste RLS Habilitado',
    'Teste de inserção com RLS habilitado'
);

-- 12. Verificar resultado final
SELECT 
    'Configuração final' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs; 