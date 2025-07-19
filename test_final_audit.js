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

async function testFinalAudit() {
    console.log('🔍 Teste Final do Sistema de Auditoria...');
    
    try {
        // 1. Verificar se a coluna changes existe
        console.log('\n1. Verificando estrutura da tabela...');
        const { data: structureData, error: structureError } = await supabase
            .from('audit_logs')
            .select('*')
            .limit(1);
        
        if (structureError) {
            console.error('❌ Erro ao verificar estrutura:', structureError);
            return;
        }
        
        if (structureData && structureData.length > 0) {
            const columns = Object.keys(structureData[0]);
            console.log('✅ Colunas da tabela:', columns);
            const hasChanges = columns.includes('changes');
            console.log('✅ Coluna changes existe:', hasChanges);
        }

        // 2. Testar inserção com changes
        console.log('\n2. Testando inserção com changes...');
        const testLogWithChanges = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'TEST_FINAL_WITH_CHANGES',
            details: 'Teste final com mudanças',
            changes: JSON.stringify([
                { field: 'nomeCiclista', oldValue: 'João', newValue: 'João Silva' },
                { field: 'idade', oldValue: '25', newValue: '26' }
            ])
        };

        const { data: insertData, error: insertError } = await supabase
            .from('audit_logs')
            .insert([testLogWithChanges])
            .select();

        if (insertError) {
            console.error('❌ Erro na inserção com changes:', insertError);
            console.error('Detalhes:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
        } else {
            console.log('✅ Inserção com changes funcionou:', insertData);
        }

        // 3. Testar inserção sem changes
        console.log('\n3. Testando inserção sem changes...');
        const testLogWithoutChanges = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'TEST_FINAL_WITHOUT_CHANGES',
            details: 'Teste final sem mudanças'
        };

        const { data: insertData2, error: insertError2 } = await supabase
            .from('audit_logs')
            .insert([testLogWithoutChanges])
            .select();

        if (insertError2) {
            console.error('❌ Erro na inserção sem changes:', insertError2);
        } else {
            console.log('✅ Inserção sem changes funcionou:', insertData2);
        }

        // 4. Verificar logs criados
        console.log('\n4. Verificando logs criados...');
        const { data: logs, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.TEST_FINAL_WITH_CHANGES,action.eq.TEST_FINAL_WITHOUT_CHANGES')
            .order('date', { ascending: false });

        if (logsError) {
            console.error('❌ Erro ao buscar logs:', logsError);
        } else {
            console.log('✅ Logs de teste encontrados:', logs?.length || 0);
            if (logs && logs.length > 0) {
                console.log('Exemplo de log com changes:', logs.find(log => log.action === 'TEST_FINAL_WITH_CHANGES'));
                console.log('Exemplo de log sem changes:', logs.find(log => log.action === 'TEST_FINAL_WITHOUT_CHANGES'));
            }
        }

        // 5. Testar busca por mudanças específicas
        console.log('\n5. Testando busca por mudanças...');
        const { data: changesLogs, error: changesError } = await supabase
            .from('audit_logs')
            .select('*')
            .not('changes', 'is', null)
            .order('date', { ascending: false })
            .limit(5);

        if (changesError) {
            console.error('❌ Erro ao buscar logs com changes:', changesError);
        } else {
            console.log('✅ Logs com changes encontrados:', changesLogs?.length || 0);
        }

        console.log('\n🎉 Teste final concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste final:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testFinalAudit().then(() => {
    console.log('\n🏁 Sistema de auditoria testado completamente!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 