-- =====================================================
-- SCRIPT MUITO SIMPLES PARA CRIAR TABELA DE AUDITORIA
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Remover tabela se existir (para recriar)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- 2. Criar tabela audit_logs (estrutura mínima)
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    userId TEXT,
    userName TEXT,
    action TEXT NOT NULL,
    entityType TEXT NOT NULL,
    entityId TEXT,
    entityName TEXT,
    details TEXT NOT NULL,
    changes TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices básicos
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entityType);

-- 4. Desabilitar RLS temporariamente para teste
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 5. Inserir log de teste
INSERT INTO audit_logs (action, entityType, details, entityName, userName, userId)
VALUES (
    'SYSTEM_INIT',
    'system',
    'Sistema de auditoria inicializado',
    'Sistema',
    'Sistema',
    'system'
);

-- 6. Verificar se funcionou
SELECT 
    'Tabela audit_logs criada com sucesso!' as status,
    COUNT(*) as total_logs,
    MAX(timestamp) as ultimo_log
FROM audit_logs; 