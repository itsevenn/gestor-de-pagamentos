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

async function testOldLogsFix() {
    console.log('🔍 Testando correção para logs antigos...');
    
    try {
        // 1. Buscar ciclistas para teste
        console.log('\n1. Buscando ciclistas para teste...');
        const { data: ciclistas, error: ciclistasError } = await supabase
            .from('ciclistas')
            .select('*')
            .limit(2);

        if (ciclistasError) {
            console.error('❌ Erro ao buscar ciclistas:', ciclistasError);
            return;
        }

        if (!ciclistas || ciclistas.length < 2) {
            console.log('❌ Preciso de pelo menos 2 ciclistas para o teste');
            return;
        }

        const ciclista1 = ciclistas[0];
        const ciclista2 = ciclistas[1];

        console.log('Ciclista 1:', {
            id: ciclista1.id,
            nomeCiclista: ciclista1.nomeCiclista
        });
        console.log('Ciclista 2:', {
            id: ciclista2.id,
            nomeCiclista: ciclista2.nomeCiclista
        });

        // 2. Simular a função getCiclistaAuditLogs para ciclista 1
        console.log('\n2. Testando função para ciclista 1...');
        
        // Buscar nome do ciclista
        const { data: ciclista1Data, error: ciclista1Error } = await supabase
            .from('ciclistas')
            .select('nomeCiclista')
            .eq('id', ciclista1.id)
            .single();
        
        if (ciclista1Error) {
            console.error('❌ Erro ao buscar nome do ciclista 1:', ciclista1Error);
            return;
        }
        
        const ciclista1Name = ciclista1Data?.nomeCiclista;
        console.log('Nome do ciclista 1:', ciclista1Name);
        
        // Buscar logs
        const { data: logs1, error: logs1Error } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .order('date', { ascending: false })
            .limit(100);
        
        if (logs1Error) {
            console.error('❌ Erro ao buscar logs:', logs1Error);
            return;
        }
        
        // Filtrar logs para ciclista 1
        const filteredLogs1 = (logs1 || []).filter(log => {
            // 1. Verificar se o log contém o ID do ciclista nos detalhes (formato novo)
            if (log.details && log.details.includes(ciclista1.id)) {
                return true;
            }
            
            // 2. Verificar se é uma ação relacionada a fotos e contém o ID do ciclista
            if (log.action && (log.action.includes('Foto')) && log.details && log.details.includes(ciclista1.id)) {
                return true;
            }
            
            // 3. Para logs antigos sem ID, verificar se contém o nome do ciclista
            if (log.details && !log.details.includes('ID:') && !log.details.includes('(ID:') && ciclista1Name) {
                // Extrair nome do ciclista dos detalhes (formato: "Dados do ciclista "NOME" foram atualizados")
                const nameMatch = log.details.match(/"([^"]+)"/);
                if (nameMatch) {
                    const logCiclistaName = nameMatch[1];
                    // Verificar se o nome extraído corresponde ao nome do ciclista atual
                    if (logCiclistaName === ciclista1Name) {
                        return true;
                    }
                }
            }
            
            return false;
        });
        
        console.log(`✅ Logs filtrados para ciclista 1: ${filteredLogs1.length}`);
        
        // 3. Simular a função getCiclistaAuditLogs para ciclista 2
        console.log('\n3. Testando função para ciclista 2...');
        
        // Buscar nome do ciclista
        const { data: ciclista2Data, error: ciclista2Error } = await supabase
            .from('ciclistas')
            .select('nomeCiclista')
            .eq('id', ciclista2.id)
            .single();
        
        if (ciclista2Error) {
            console.error('❌ Erro ao buscar nome do ciclista 2:', ciclista2Error);
            return;
        }
        
        const ciclista2Name = ciclista2Data?.nomeCiclista;
        console.log('Nome do ciclista 2:', ciclista2Name);
        
        // Filtrar logs para ciclista 2
        const filteredLogs2 = (logs1 || []).filter(log => {
            // 1. Verificar se o log contém o ID do ciclista nos detalhes (formato novo)
            if (log.details && log.details.includes(ciclista2.id)) {
                return true;
            }
            
            // 2. Verificar se é uma ação relacionada a fotos e contém o ID do ciclista
            if (log.action && (log.action.includes('Foto')) && log.details && log.details.includes(ciclista2.id)) {
                return true;
            }
            
            // 3. Para logs antigos sem ID, verificar se contém o nome do ciclista
            if (log.details && !log.details.includes('ID:') && !log.details.includes('(ID:') && ciclista2Name) {
                // Extrair nome do ciclista dos detalhes (formato: "Dados do ciclista "NOME" foram atualizados")
                const nameMatch = log.details.match(/"([^"]+)"/);
                if (nameMatch) {
                    const logCiclistaName = nameMatch[1];
                    // Verificar se o nome extraído corresponde ao nome do ciclista atual
                    if (logCiclistaName === ciclista2Name) {
                        return true;
                    }
                }
            }
            
            return false;
        });
        
        console.log(`✅ Logs filtrados para ciclista 2: ${filteredLogs2.length}`);
        
        // 4. Mostrar exemplos de logs encontrados
        console.log('\n4. Exemplos de logs encontrados...');
        
        console.log(`\nLogs do ciclista 1 (${ciclista1Name}):`);
        filteredLogs1.slice(0, 3).forEach((log, index) => {
            console.log(`  ${index + 1}. ${log.details}`);
        });
        
        console.log(`\nLogs do ciclista 2 (${ciclista2Name}):`);
        filteredLogs2.slice(0, 3).forEach((log, index) => {
            console.log(`  ${index + 1}. ${log.details}`);
        });
        
        // 5. Verificar isolamento
        console.log('\n5. Verificando isolamento...');
        
        const logs1Ids = filteredLogs1.map(log => log.id);
        const logs2Ids = filteredLogs2.map(log => log.id);
        
        const intersection = logs1Ids.filter(id => logs2Ids.includes(id));
        
        if (intersection.length > 0) {
            console.log(`⚠️ Logs em comum: ${intersection.length}`);
        } else {
            console.log('✅ Logs completamente isolados');
        }
        
        // 6. Resumo
        console.log('\n6. Resumo...');
        console.log(`📊 Ciclista 1 (${ciclista1Name}): ${filteredLogs1.length} logs`);
        console.log(`📊 Ciclista 2 (${ciclista2Name}): ${filteredLogs2.length} logs`);
        console.log(`📊 Total de logs disponíveis: ${logs1?.length || 0}`);
        console.log(`📊 Logs recuperados: ${filteredLogs1.length + filteredLogs2.length}`);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testOldLogsFix().then(() => {
    console.log('\n🏁 Teste de correção para logs antigos concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 