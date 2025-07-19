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

// Simular a função getAuditLogs do data.ts
async function getAuditLogs() {
    try {
        const result = await supabase.from('audit_logs').select('*').order('date', { ascending: false });
        if (result.error) {
            console.error('Erro ao buscar logs de auditoria:', result.error);
            return [];
        }
        return result.data;
    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        return [];
    }
}

async function testGetAuditLogs() {
    console.log('🔍 Testando função getAuditLogs...');
    
    try {
        // 1. Testar busca direta
        console.log('\n1. Testando busca direta na tabela...');
        const { data: directData, error: directError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('date', { ascending: false });
        
        if (directError) {
            console.error('❌ Erro na busca direta:', directError);
            console.error('Detalhes:', {
                message: directError.message,
                details: directError.details,
                hint: directError.hint,
                code: directError.code
            });
        } else {
            console.log('✅ Busca direta funcionou');
            console.log('Total de logs:', directData?.length || 0);
            if (directData && directData.length > 0) {
                console.log('Primeiro log:', directData[0]);
            }
        }

        // 2. Testar função getAuditLogs
        console.log('\n2. Testando função getAuditLogs...');
        const auditLogs = await getAuditLogs();
        console.log('✅ Função getAuditLogs funcionou');
        console.log('Total de logs:', auditLogs?.length || 0);
        if (auditLogs && auditLogs.length > 0) {
            console.log('Primeiro log:', auditLogs[0]);
        }

        // 3. Testar busca com limite
        console.log('\n3. Testando busca com limite...');
        const { data: limitedData, error: limitedError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(5);
        
        if (limitedError) {
            console.error('❌ Erro na busca com limite:', limitedError);
        } else {
            console.log('✅ Busca com limite funcionou');
            console.log('Logs encontrados:', limitedData?.length || 0);
        }

        // 4. Testar busca por ação específica
        console.log('\n4. Testando busca por ação...');
        const { data: actionData, error: actionError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('action', 'TEST_SIMPLE')
            .order('date', { ascending: false });
        
        if (actionError) {
            console.error('❌ Erro na busca por ação:', actionError);
        } else {
            console.log('✅ Busca por ação funcionou');
            console.log('Logs TEST_SIMPLE encontrados:', actionData?.length || 0);
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

// Executar o teste
testGetAuditLogs().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 