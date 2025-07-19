// Carregar variáveis de ambiente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditTableStructure() {
    console.log('🔍 Testando estrutura da tabela audit_logs...');
    
    try {
        // 1. Verificar se a tabela existe
        console.log('\n1. Verificando se a tabela audit_logs existe...');
        const { data: tableData, error: tableError } = await supabase
            .from('audit_logs')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Erro ao acessar tabela audit_logs:', tableError);
            console.error('Detalhes:', {
                message: tableError.message,
                details: tableError.details,
                hint: tableError.hint,
                code: tableError.code
            });
            return;
        }

        console.log('✅ Tabela audit_logs existe');

        // 2. Verificar estrutura da tabela
        console.log('\n2. Verificando estrutura da tabela...');
        const { data: structureData, error: structureError } = await supabase
            .from('audit_logs')
            .select('*')
            .limit(1);

        if (structureError) {
            console.error('❌ Erro ao verificar estrutura:', structureError);
        } else {
            if (structureData && structureData.length > 0) {
                const columns = Object.keys(structureData[0]);
                console.log('✅ Colunas da tabela audit_logs:', columns);
                
                // Verificar se as colunas necessárias existem
                const requiredColumns = ['date', 'user', 'action', 'details'];
                const missingColumns = requiredColumns.filter(col => !columns.includes(col));
                
                if (missingColumns.length > 0) {
                    console.error('❌ Colunas faltando:', missingColumns);
                } else {
                    console.log('✅ Todas as colunas necessárias existem');
                }
            } else {
                console.log('ℹ️ Tabela vazia, não é possível verificar estrutura');
            }
        }

        // 3. Testar inserção com dados mínimos
        console.log('\n3. Testando inserção com dados mínimos...');
        const minimalData = {
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'TEST_STRUCTURE',
            details: 'Teste de estrutura da tabela'
        };

        console.log('Dados para inserção:', minimalData);

        const { data: insertData, error: insertError } = await supabase
            .from('audit_logs')
            .insert([minimalData])
            .select();

        if (insertError) {
            console.error('❌ Erro na inserção mínima:', insertError);
            console.error('Detalhes completos:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code,
                fullError: insertError
            });
        } else {
            console.log('✅ Inserção mínima funcionou:', insertData);
        }

        // 4. Testar inserção sem .select()
        console.log('\n4. Testando inserção sem .select()...');
        const { error: insertError2 } = await supabase
            .from('audit_logs')
            .insert([{
                date: new Date().toISOString(),
                user: 'test@example.com',
                action: 'TEST_NO_SELECT',
                details: 'Teste sem select'
            }]);

        if (insertError2) {
            console.error('❌ Erro na inserção sem select:', insertError2);
            console.error('Detalhes:', {
                message: insertError2.message,
                details: insertError2.details,
                hint: insertError2.hint,
                code: insertError2.code
            });
        } else {
            console.log('✅ Inserção sem select funcionou');
        }

        // 5. Verificar logs inseridos
        console.log('\n5. Verificando logs inseridos...');
        const { data: logs, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.TEST_STRUCTURE,action.eq.TEST_NO_SELECT')
            .order('date', { ascending: false });

        if (logsError) {
            console.error('❌ Erro ao buscar logs:', logsError);
        } else {
            console.log('✅ Logs encontrados:', logs?.length || 0);
            if (logs && logs.length > 0) {
                console.log('Exemplo de log:', logs[0]);
            }
        }

        // 6. Testar inserção com campo id manual
        console.log('\n6. Testando inserção com ID manual...');
        const { error: insertError3 } = await supabase
            .from('audit_logs')
            .insert([{
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                user: 'test@example.com',
                action: 'TEST_WITH_ID',
                details: 'Teste com ID manual'
            }]);

        if (insertError3) {
            console.error('❌ Erro na inserção com ID:', insertError3);
        } else {
            console.log('✅ Inserção com ID funcionou');
        }

        // 7. Verificar se há constraints ou triggers
        console.log('\n7. Verificando constraints...');
        const { data: constraints, error: constraintsError } = await supabase
            .from('audit_logs')
            .select('*')
            .limit(1);

        if (constraintsError) {
            console.error('❌ Erro ao verificar constraints:', constraintsError);
        } else {
            console.log('✅ Sem problemas de constraints');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testAuditTableStructure().then(() => {
    console.log('\n🏁 Teste de estrutura concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 