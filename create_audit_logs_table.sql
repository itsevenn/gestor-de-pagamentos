-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE AUDITORIA COMPLETA
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- 1. Criar a tabela audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    userId UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    userName TEXT,
    action TEXT NOT NULL,
    entityType TEXT NOT NULL,
    entityId TEXT,
    entityName TEXT,
    details TEXT NOT NULL,
    changes JSONB,
    ipAddress INET,
    userAgent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(userId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entityId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entityType);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
-- Política para permitir inserção por usuários autenticados
CREATE POLICY "Allow authenticated users to insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir leitura por usuários autenticados
CREATE POLICY "Allow authenticated users to read audit logs" ON audit_logs
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir leitura pública (para casos específicos)
CREATE POLICY "Allow public read access to audit logs" ON audit_logs
FOR SELECT USING (true);

-- 5. Criar função para obter logs de ciclista
CREATE OR REPLACE FUNCTION get_ciclista_audit_logs(ciclista_id TEXT)
RETURNS TABLE (
    id UUID,
    timestamp TIMESTAMP WITH TIME ZONE,
    userId UUID,
    userName TEXT,
    action TEXT,
    entityType TEXT,
    entityId TEXT,
    entityName TEXT,
    details TEXT,
    changes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.timestamp,
        al.userId,
        al.userName,
        al.action,
        al.entityType,
        al.entityId,
        al.entityName,
        al.details,
        al.changes
    FROM audit_logs al
    WHERE al.entityId = ciclista_id
    ORDER BY al.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para obter logs de usuário
CREATE OR REPLACE FUNCTION get_user_audit_logs(user_id TEXT)
RETURNS TABLE (
    id UUID,
    timestamp TIMESTAMP WITH TIME ZONE,
    userId UUID,
    userName TEXT,
    action TEXT,
    entityType TEXT,
    entityId TEXT,
    entityName TEXT,
    details TEXT,
    changes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.timestamp,
        al.userId,
        al.userName,
        al.action,
        al.entityType,
        al.entityId,
        al.entityName,
        al.details,
        al.changes
    FROM audit_logs al
    WHERE al.userId::TEXT = user_id
    ORDER BY al.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para obter todos os logs
CREATE OR REPLACE FUNCTION get_all_audit_logs(limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    timestamp TIMESTAMP WITH TIME ZONE,
    userId UUID,
    userName TEXT,
    action TEXT,
    entityType TEXT,
    entityId TEXT,
    entityName TEXT,
    details TEXT,
    changes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.timestamp,
        al.userId,
        al.userName,
        al.action,
        al.entityType,
        al.entityId,
        al.entityName,
        al.details,
        al.changes
    FROM audit_logs al
    ORDER BY al.timestamp DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Inserir log inicial do sistema
INSERT INTO audit_logs (action, entityType, details, entityName, userName)
VALUES (
    'SYSTEM_INIT',
    'system',
    'Sistema de auditoria inicializado com sucesso',
    'Sistema',
    'Sistema'
);

-- 9. Verificar se a tabela foi criada corretamente
SELECT 
    'Tabela audit_logs criada com sucesso!' as status,
    COUNT(*) as total_logs
FROM audit_logs; 