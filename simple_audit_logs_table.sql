-- =====================================================
-- SCRIPT SIMPLIFICADO PARA CRIAR TABELA DE AUDITORIA
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Criar a tabela audit_logs (versão simplificada)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- 2. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entityType);

-- 3. Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas simples
-- Permitir inserção por qualquer usuário autenticado
CREATE POLICY "Allow insert for authenticated users" ON audit_logs
FOR INSERT WITH CHECK (true);

-- Permitir leitura por qualquer usuário autenticado
CREATE POLICY "Allow select for authenticated users" ON audit_logs
FOR SELECT USING (true);

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