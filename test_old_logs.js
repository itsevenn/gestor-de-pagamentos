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

async function testOldLogs() {
    console.log('🔍 Verificando logs antigos que podem estar causando problemas...');
    
    try {
        // 1. Buscar todos os logs de ciclistas
        console.log('\n1. Buscando todos os logs de ciclistas...');
        const { data: allLogs, error: allError } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .order('date', { ascending: false });

        if (allError) {
            console.error('❌ Erro ao buscar logs:', allError);
            return;
        }

        console.log(`✅ Total de logs de ciclistas: ${allLogs?.length || 0}`);

        // 2. Verificar logs que não têm ID no formato novo
        console.log('\n2. Verificando logs sem ID no formato novo...');
        
        const logsWithoutId = allLogs?.filter(log => {
            // Verificar se não tem o padrão "(ID: ...)" nos detalhes
            return !log.details.includes('(ID:') && !log.details.includes('ID:');
        }) || [];

        console.log(`⚠️ Logs sem ID no formato novo: ${logsWithoutId.length}`);
        
        if (logsWithoutId.length > 0) {
            console.log('Exemplos de logs sem ID:');
            logsWithoutId.slice(0, 5).forEach((log, index) => {
                console.log(`  ${index + 1}. ${log.details}`);
            });
        }

        // 3. Verificar logs que têm ID mas não no formato correto
        console.log('\n3. Verificando logs com ID em formato antigo...');
        
        const logsWithOldId = allLogs?.filter(log => {
            // Verificar se tem ID mas não no formato "(ID: ...)"
            return log.details.includes('ID:') && !log.details.includes('(ID:');
        }) || [];

        console.log(`⚠️ Logs com ID em formato antigo: ${logsWithOldId.length}`);
        
        if (logsWithOldId.length > 0) {
            console.log('Exemplos de logs com ID antigo:');
            logsWithOldId.slice(0, 5).forEach((log, index) => {
                console.log(`  ${index + 1}. ${log.details}`);
            });
        }

        // 4. Verificar logs que não têm nenhum ID
        console.log('\n4. Verificando logs sem nenhum ID...');
        
        const logsWithoutAnyId = allLogs?.filter(log => {
            // Verificar se não tem nenhum padrão de ID
            return !log.details.includes('ID:') && !log.details.includes('(ID:');
        }) || [];

        console.log(`❌ Logs sem nenhum ID: ${logsWithoutAnyId.length}`);
        
        if (logsWithoutAnyId.length > 0) {
            console.log('Exemplos de logs sem nenhum ID:');
            logsWithoutAnyId.slice(0, 5).forEach((log, index) => {
                console.log(`  ${index + 1}. ${log.details}`);
            });
        }

        // 5. Verificar logs com formato correto
        console.log('\n5. Verificando logs com formato correto...');
        
        const logsWithCorrectId = allLogs?.filter(log => {
            // Verificar se tem o formato "(ID: ...)"
            return log.details.includes('(ID:');
        }) || [];

        console.log(`✅ Logs com formato correto: ${logsWithCorrectId.length}`);
        
        if (logsWithCorrectId.length > 0) {
            console.log('Exemplos de logs com formato correto:');
            logsWithCorrectId.slice(0, 5).forEach((log, index) => {
                console.log(`  ${index + 1}. ${log.details}`);
            });
        }

        // 6. Resumo
        console.log('\n6. Resumo...');
        console.log(`📊 Total de logs: ${allLogs?.length || 0}`);
        console.log(`✅ Com formato correto: ${logsWithCorrectId.length}`);
        console.log(`⚠️ Sem ID no formato novo: ${logsWithoutId.length}`);
        console.log(`⚠️ Com ID em formato antigo: ${logsWithOldId.length}`);
        console.log(`❌ Sem nenhum ID: ${logsWithoutAnyId.length}`);

        // 7. Verificar se há logs que podem estar sendo perdidos
        console.log('\n7. Verificando se há logs sendo perdidos...');
        
        const totalProblematic = logsWithoutId.length + logsWithoutAnyId.length;
        const percentageProblematic = allLogs?.length > 0 ? (totalProblematic / allLogs.length * 100).toFixed(1) : 0;
        
        console.log(`📊 Logs problemáticos: ${totalProblematic}/${allLogs?.length || 0} (${percentageProblematic}%)`);
        
        if (percentageProblematic > 50) {
            console.log('⚠️ Muitos logs podem estar sendo perdidos!');
        } else if (percentageProblematic > 20) {
            console.log('⚠️ Alguns logs podem estar sendo perdidos.');
        } else {
            console.log('✅ A maioria dos logs está no formato correto.');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testOldLogs().then(() => {
    console.log('\n🏁 Teste de logs antigos concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 