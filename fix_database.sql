-- Script para corrigir a estrutura da tabela ciclistas
-- Execute este script no seu banco de dados PostgreSQL

-- Verificar se a coluna photoUrl existe
DO $$
BEGIN
    -- Adicionar coluna photoUrl se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ciclistas' AND column_name = 'photoUrl'
    ) THEN
        ALTER TABLE ciclistas ADD COLUMN "photoUrl" TEXT;
    END IF;
    
    -- Renomear coluna photourl para photoUrl se existir (minúscula para camelCase)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ciclistas' AND column_name = 'photourl'
    ) THEN
        ALTER TABLE ciclistas RENAME COLUMN photourl TO "photoUrl";
    END IF;
END $$;

-- Verificar se a tabela ciclistas_deletados existe, se não, criar
CREATE TABLE IF NOT EXISTS ciclistas_deletados (
    id UUID PRIMARY KEY,
    "photoUrl" TEXT,
    matricula TEXT,
    dataAdvento TEXT,
    "nomeCiclista" TEXT,
    "tipoSanguineo" TEXT,
    "dataNascimento" TEXT,
    idade TEXT,
    nacionalidade TEXT,
    naturalidade TEXT,
    uf TEXT,
    rg TEXT,
    cpf TEXT,
    pai TEXT,
    mae TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT,
    cep TEXT,
    estado TEXT,
    celular TEXT,
    "telefoneResidencial" TEXT,
    "outrosContatos" TEXT,
    referencia TEXT,
    cnpj TEXT,
    "notaFiscal" TEXT,
    "marcaModelo" TEXT,
    "numeroSerie" TEXT,
    "dataAquisicao" TEXT,
    observacoes TEXT,
    "nomeConselheiro" TEXT,
    "localData" TEXT,
    "deletionReason" TEXT,
    "deletionDate" TEXT
);

-- Verificar se a tabela invoices existe, se não, criar
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY,
    "ciclistaId" UUID REFERENCES ciclistas(id),
    "originalAmount" DECIMAL(10,2),
    "currentAmount" DECIMAL(10,2),
    "dueDate" TEXT,
    "issueDate" TEXT,
    "paymentDate" TEXT,
    "paymentMethod" TEXT,
    status TEXT,
    "paymentHistory" TEXT,
    observations TEXT
);

-- Verificar se a tabela audit_logs existe, se não, criar
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    date TEXT,
    "user" TEXT,
    action TEXT,
    details TEXT
);

-- Mostrar a estrutura atual da tabela ciclistas
\d ciclistas; 