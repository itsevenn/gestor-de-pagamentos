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

async function testApiFilter() {
    console.log('🔍 Testando filtro da API por ciclista específico...');
    
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

        // 2. Simular chamadas da API para cada ciclista
        console.log('\n2. Simulando chamadas da API...');
        
        // Simular busca de logs do ciclista 1
        const { data: logsCiclista1, error: error1 } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .ilike('details', `%${ciclista1.id}%`)
            .order('date', { ascending: false });

        // Simular busca de logs do ciclista 2
        const { data: logsCiclista2, error: error2 } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .ilike('details', `%${ciclista2.id}%`)
            .order('date', { ascending: false });

        // 3. Verificar resultados
        console.log('\n3. Verificando resultados...');
        
        if (error1) {
            console.error('❌ Erro ao buscar logs do ciclista 1:', error1);
        } else {
            console.log(`✅ Logs do ciclista 1 (${ciclista1.nomeCiclista}): ${logsCiclista1?.length || 0}`);
            if (logsCiclista1 && logsCiclista1.length > 0) {
                console.log('   Exemplo:', logsCiclista1[0].details);
            }
        }

        if (error2) {
            console.error('❌ Erro ao buscar logs do ciclista 2:', error2);
        } else {
            console.log(`✅ Logs do ciclista 2 (${ciclista2.nomeCiclista}): ${logsCiclista2?.length || 0}`);
            if (logsCiclista2 && logsCiclista2.length > 0) {
                console.log('   Exemplo:', logsCiclista2[0].details);
            }
        }

        // 4. Verificar isolamento
        console.log('\n4. Verificando isolamento dos dados...');
        
        const logsCiclista1Ids = logsCiclista1?.map(log => log.id) || [];
        const logsCiclista2Ids = logsCiclista2?.map(log => log.id) || [];
        
        const intersection = logsCiclista1Ids.filter(id => logsCiclista2Ids.includes(id));
        
        if (intersection.length > 0) {
            console.error('❌ Logs estão se cruzando entre ciclistas:', intersection.length, 'logs em comum');
        } else {
            console.log('✅ Logs estão completamente isolados por ciclista');
        }

        // 5. Verificar se os logs contêm o ID correto
        console.log('\n5. Verificando IDs nos logs...');
        
        const ciclista1LogsWithId = logsCiclista1?.filter(log => log.details.includes(ciclista1.id)) || [];
        const ciclista2LogsWithId = logsCiclista2?.filter(log => log.details.includes(ciclista2.id)) || [];
        
        console.log(`✅ Logs do ciclista 1 com ID correto: ${ciclista1LogsWithId.length}/${logsCiclista1?.length || 0}`);
        console.log(`✅ Logs do ciclista 2 com ID correto: ${ciclista2LogsWithId.length}/${logsCiclista2?.length || 0}`);

        // 6. Verificar se não há logs de outros ciclistas
        console.log('\n6. Verificando ausência de logs de outros ciclistas...');
        
        const ciclista1LogsFromOthers = logsCiclista1?.filter(log => 
            log.details.includes(ciclista2.id) || 
            (log.details.includes('ID:') && !log.details.includes(ciclista1.id))
        ) || [];
        
        const ciclista2LogsFromOthers = logsCiclista2?.filter(log => 
            log.details.includes(ciclista1.id) || 
            (log.details.includes('ID:') && !log.details.includes(ciclista2.id))
        ) || [];
        
        console.log(`✅ Logs do ciclista 1 sem interferência: ${ciclista1LogsFromOthers.length === 0 ? 'OK' : 'ERRO'}`);
        console.log(`✅ Logs do ciclista 2 sem interferência: ${ciclista2LogsFromOthers.length === 0 ? 'OK' : 'ERRO'}`);

        // 7. Resumo final
        console.log('\n7. Resumo final...');
        console.log(`📊 Ciclista 1 (${ciclista1.nomeCiclista}): ${logsCiclista1?.length || 0} logs específicos`);
        console.log(`📊 Ciclista 2 (${ciclista2.nomeCiclista}): ${logsCiclista2?.length || 0} logs específicos`);
        console.log(`📊 Isolamento: ${intersection.length === 0 ? '✅ Perfeito' : '❌ Com problemas'}`);
        console.log(`📊 IDs corretos: ${ciclista1LogsWithId.length + ciclista2LogsWithId.length}/${(logsCiclista1?.length || 0) + (logsCiclista2?.length || 0)}`);

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testApiFilter().then(() => {
    console.log('\n🏁 Teste de filtro da API concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 