-- =====================================================
-- SCRIPT PARA ADICIONAR COLUNA CHANGES À TABELA AUDIT_LOGS
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

-- 3. Verificar se a coluna foi adicionada
SELECT 
    'Verificando se a coluna changes foi adicionada' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND column_name = 'changes';

-- 4. Testar inserção com a coluna changes
INSERT INTO audit_logs (date, "user", action, details, changes)
VALUES (
    NOW(),
    'Admin',
    'TEST_CHANGES_COLUMN',
    'Teste de inserção com coluna changes',
    '{"test": "changes_column_added"}'
);

-- 5. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção com changes' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'TEST_CHANGES_COLUMN';

-- 6. Mostrar estrutura final
SELECT 
    'Estrutura final da tabela audit_logs' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 7. Mostrar exemplo de log com changes
SELECT 
    id,
    date,
    "user",
    action,
    details,
    changes
FROM audit_logs 
WHERE action = 'TEST_CHANGES_COLUMN'
ORDER BY date DESC
LIMIT 1; 