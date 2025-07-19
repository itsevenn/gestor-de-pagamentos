-- Script para atualizar a estrutura da tabela audit_logs
-- Execute este script no SQL Editor do Supabase

-- 1. Fazer backup da tabela atual (se existir)
CREATE TABLE IF NOT EXISTS audit_logs_backup AS 
SELECT * FROM audit_logs;

-- 2. Dropar a tabela atual
DROP TABLE IF EXISTS audit_logs;

-- 3. Criar nova tabela com estrutura melhorada
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    action TEXT NOT NULL,
    "entityType" TEXT NOT NULL CHECK ("entityType" IN ('ciclista', 'invoice', 'user', 'system')),
    "entityId" TEXT,
    "entityName" TEXT,
    details TEXT NOT NULL,
    changes JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs("entityId");
CREATE INDEX idx_audit_logs_user_id ON audit_logs("userId");
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs("entityType");

-- 5. Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Usuários podem ver logs relacionados a eles
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (
        "userId" = auth.uid()::text
    );

-- Apenas o sistema pode inserir logs
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- 7. Função para limpar logs antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar created_at
CREATE OR REPLACE FUNCTION update_audit_logs_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_logs_created_at_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_logs_created_at();

-- 9. Verificar a estrutura criada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 10. Inserir log inicial do sistema
INSERT INTO audit_logs (
    "userId",
    "userName",
    action,
    "entityType",
    details
) VALUES (
    'system',
    'Sistema',
    'SYSTEM_ACTION',
    'system',
    'Tabela de auditoria criada/atualizada'
);

-- 11. Comentários na tabela
COMMENT ON TABLE audit_logs IS 'Tabela para registro de todas as atividades do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação realizada (CICLISTA_CREATED, INVOICE_UPDATED, etc.)';
COMMENT ON COLUMN audit_logs.changes IS 'JSON com as mudanças realizadas (campo, valor_antigo, valor_novo)';
COMMENT ON COLUMN audit_logs."entityType" IS 'Tipo da entidade afetada (ciclista, invoice, user, system)'; 