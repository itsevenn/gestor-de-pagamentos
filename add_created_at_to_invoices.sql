-- =====================================================
-- SCRIPT PARA ADICIONAR CAMPO CREATED_AT À TABELA INVOICES
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Verificar estrutura atual da tabela invoices
SELECT 
    'Estrutura atual da tabela invoices' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- 2. Adicionar coluna created_at se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe!';
    END IF;
END $$;

-- 3. Adicionar coluna updated_at se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna updated_at já existe!';
    END IF;
END $$;

-- 4. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger se não existir
DROP TRIGGER IF EXISTS update_invoices_updated_at_trigger ON invoices;
CREATE TRIGGER update_invoices_updated_at_trigger
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- 6. Atualizar registros existentes com data de criação baseada na issueDate
UPDATE invoices 
SET created_at = CASE 
    WHEN issueDate IS NOT NULL AND issueDate != '' 
    THEN TO_TIMESTAMP(issueDate, 'YYYY-MM-DD')
    ELSE NOW()
END
WHERE created_at IS NULL;

-- 7. Verificar estrutura final
SELECT 
    'Estrutura final da tabela invoices' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- 8. Testar consulta com created_at
SELECT 
    'Teste de consulta com created_at' as status,
    COUNT(*) as total_invoices,
    MIN(created_at) as primeira_fatura,
    MAX(created_at) as ultima_fatura
FROM invoices; 