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

-- 2. Adicionar valor padrão para o campo id (UUID)
DO $$
BEGIN
    -- Verificar se a coluna id já tem um valor padrão
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'id'
        AND column_default IS NOT NULL
    ) THEN
        -- Adicionar valor padrão UUID para o campo id
        ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
        RAISE NOTICE 'Valor padrão UUID adicionado ao campo id!';
    ELSE
        RAISE NOTICE 'Campo id já possui valor padrão!';
    END IF;
END $$;

-- 3. Adicionar coluna changes se não existir
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

-- 4. Verificar estrutura final
SELECT 
    'Estrutura final da tabela audit_logs' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 5. Testar inserção sem especificar id
INSERT INTO audit_logs (date, "user", action, details)
VALUES (
    NOW(),
    'Admin',
    'TEST_DEFAULT_ID',
    'Teste de inserção com ID automático'
);

-- 6. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção com ID automático' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'TEST_DEFAULT_ID';

-- 7. Mostrar exemplo de log com ID automático
SELECT 
    id,
    date,
    "user",
    action,
    details
FROM audit_logs 
WHERE action = 'TEST_DEFAULT_ID'
ORDER BY date DESC
LIMIT 1;

-- 8. Testar inserção com changes
INSERT INTO audit_logs (date, "user", action, details, changes)
VALUES (
    NOW(),
    'Admin',
    'TEST_WITH_CHANGES',
    'Teste de inserção com mudanças',
    '{"field": "test", "oldValue": "old", "newValue": "new"}'
);

-- 9. Verificar inserção com changes
SELECT 
    'Teste de inserção com changes' as status,
    COUNT(*) as total_logs,
    MAX(date) as ultimo_log
FROM audit_logs 
WHERE action = 'TEST_WITH_CHANGES';

-- 10. Mostrar exemplo de log com changes
SELECT 
    id,
    date,
    "user",
    action,
    details,
    changes
FROM audit_logs 
WHERE action = 'TEST_WITH_CHANGES'
ORDER BY date DESC
LIMIT 1; 