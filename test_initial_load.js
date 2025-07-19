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

// Simular as funções do data.ts
async function getCiclistas() {
    try {
        const { data, error } = await supabase.from('ciclistas').select('*');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar ciclistas:', error);
        return [];
    }
}

async function getInvoices() {
    try {
        const result = await supabase.from('invoices').select('*');
        return result.data || [];
    } catch (error) {
        console.error('Erro ao buscar faturas:', error);
        return [];
    }
}

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

async function getDeletedCiclistas() {
    try {
        const result = await supabase.from('ciclistas_deletados').select('*');
        return result.data || [];
    } catch (error) {
        console.error('Erro ao buscar ciclistas deletados:', error);
        return [];
    }
}

async function testInitialLoad() {
    console.log('🔍 Testando carregamento inicial de dados...');
    
    try {
        // Simular o useEffect do AppProvider
        console.log('\n1. Carregando dados iniciais...');
        const [ciclistasData, invoicesData, auditLogsData, deletedCiclistasData] = await Promise.all([
            getCiclistas(),
            getInvoices(),
            getAuditLogs(),
            getDeletedCiclistas()
        ]);
        
        console.log('✅ Dados carregados com sucesso!');
        console.log('Ciclistas:', ciclistasData?.length || 0);
        console.log('Faturas:', invoicesData?.length || 0);
        console.log('Logs de auditoria:', auditLogsData?.length || 0);
        console.log('Ciclistas deletados:', deletedCiclistasData?.length || 0);
        
        // Verificar se há dados
        if (auditLogsData && auditLogsData.length > 0) {
            console.log('\n2. Exemplo de log de auditoria:');
            console.log(auditLogsData[0]);
        }
        
        // Testar busca específica de logs
        console.log('\n3. Testando busca específica de logs...');
        const { data: specificLogs, error: specificError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('date', { ascending: false })
            .limit(10);
        
        if (specificError) {
            console.error('❌ Erro na busca específica:', specificError);
        } else {
            console.log('✅ Busca específica funcionou');
            console.log('Logs encontrados:', specificLogs?.length || 0);
        }

    } catch (error) {
        console.error('❌ Erro no carregamento inicial:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testInitialLoad().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 