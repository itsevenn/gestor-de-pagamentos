# Correção do Banco de Dados

## Problema
O erro `column "photourl" of relation "ciclistas" does not exist` indica que a tabela `ciclistas` no banco de dados não tem a estrutura correta.

## Solução

### 1. Execute o Script SQL
Execute o arquivo `fix_database.sql` no seu banco de dados PostgreSQL:

```bash
# Se você tem o psql instalado:
psql -d seu_banco_de_dados -f fix_database.sql

# Ou execute diretamente no seu cliente PostgreSQL (pgAdmin, DBeaver, etc.)
```

### 2. O que o script faz:
- ✅ Verifica se a coluna `photoUrl` existe
- ✅ Adiciona a coluna `photoUrl` se não existir
- ✅ Renomeia `photourl` para `photoUrl` se necessário
- ✅ Cria as tabelas `ciclistas_deletados`, `invoices` e `audit_logs` se não existirem
- ✅ Garante que todas as colunas tenham nomes em camelCase

### 3. Estrutura Correta da Tabela ciclistas:
```sql
CREATE TABLE ciclistas (
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
    "localData" TEXT
);
```

### 4. Verificação
Após executar o script, você pode verificar se a estrutura está correta:

```sql
\d ciclistas;
```

### 5. Debug
O código agora inclui logs de debug que mostrarão no console:
- Os dados que estão sendo atualizados
- A query SQL gerada
- Os valores sendo passados

Isso ajudará a identificar qualquer problema restante.

## Próximos Passos
1. Execute o script SQL
2. Teste a edição de um ciclista
3. Verifique os logs de debug no console
4. Se ainda houver problemas, verifique os logs para identificar a causa 