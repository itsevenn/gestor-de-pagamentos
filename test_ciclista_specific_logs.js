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

async function testCiclistaSpecificLogs() {
    console.log('🔍 Testando logs específicos por ciclista...');
    
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

        // 2. Criar logs específicos para cada ciclista
        console.log('\n2. Criando logs específicos para cada ciclista...');
        
        // Log para ciclista 1
        const log1 = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'Ciclista Atualizado',
            details: `Dados do ciclista "${ciclista1.nomeCiclista}" (ID: ${ciclista1.id}) foram atualizados`
        };

        // Log para ciclista 2
        const log2 = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'Ciclista Atualizado',
            details: `Dados do ciclista "${ciclista2.nomeCiclista}" (ID: ${ciclista2.id}) foram atualizados`
        };

        // Log genérico (não deve aparecer nos filtros)
        const log3 = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'Ciclista Atualizado',
            details: 'Dados do ciclista foram atualizados'
        };

        // Inserir logs
        const { error: insertError } = await supabase
            .from('audit_logs')
            .insert([log1, log2, log3]);

        if (insertError) {
            console.error('❌ Erro ao inserir logs:', insertError);
            return;
        }

        console.log('✅ Logs inseridos com sucesso');

        // 3. Testar busca de logs do ciclista 1
        console.log('\n3. Testando busca de logs do ciclista 1...');
        const { data: logsCiclista1, error: error1 } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .ilike('details', `%${ciclista1.id}%`)
            .order('date', { ascending: false });

        if (error1) {
            console.error('❌ Erro ao buscar logs do ciclista 1:', error1);
        } else {
            console.log('✅ Logs do ciclista 1 encontrados:', logsCiclista1?.length || 0);
            if (logsCiclista1 && logsCiclista1.length > 0) {
                console.log('Exemplo de log do ciclista 1:', logsCiclista1[0]);
            }
        }

        // 4. Testar busca de logs do ciclista 2
        console.log('\n4. Testando busca de logs do ciclista 2...');
        const { data: logsCiclista2, error: error2 } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .ilike('details', `%${ciclista2.id}%`)
            .order('date', { ascending: false });

        if (error2) {
            console.error('❌ Erro ao buscar logs do ciclista 2:', error2);
        } else {
            console.log('✅ Logs do ciclista 2 encontrados:', logsCiclista2?.length || 0);
            if (logsCiclista2 && logsCiclista2.length > 0) {
                console.log('Exemplo de log do ciclista 2:', logsCiclista2[0]);
            }
        }

        // 5. Verificar se não há cruzamento de logs
        console.log('\n5. Verificando isolamento dos logs...');
        
        const logsCiclista1Ids = logsCiclista1?.map(log => log.id) || [];
        const logsCiclista2Ids = logsCiclista2?.map(log => log.id) || [];
        
        const intersection = logsCiclista1Ids.filter(id => logsCiclista2Ids.includes(id));
        
        if (intersection.length > 0) {
            console.error('❌ Logs estão se cruzando entre ciclistas:', intersection);
        } else {
            console.log('✅ Logs estão isolados corretamente por ciclista');
        }

        // 6. Verificar se os logs contêm o ID correto
        console.log('\n6. Verificando se os logs contêm o ID correto...');
        
        const ciclista1LogsWithId = logsCiclista1?.filter(log => log.details.includes(ciclista1.id)) || [];
        const ciclista2LogsWithId = logsCiclista2?.filter(log => log.details.includes(ciclista2.id)) || [];
        
        console.log(`✅ Logs do ciclista 1 com ID correto: ${ciclista1LogsWithId.length}/${logsCiclista1?.length || 0}`);
        console.log(`✅ Logs do ciclista 2 com ID correto: ${ciclista2LogsWithId.length}/${logsCiclista2?.length || 0}`);

        // 7. Testar busca de todos os logs para comparação
        console.log('\n7. Buscando todos os logs para comparação...');
        const { data: allLogs, error: allError } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Criado,action.eq.Ciclista Atualizado,action.eq.Ciclista Excluído,action.eq.Ciclista Restaurado,action.eq.Foto Carregada,action.eq.Foto Removida')
            .order('date', { ascending: false })
            .limit(50);

        if (allError) {
            console.error('❌ Erro ao buscar todos os logs:', allError);
        } else {
            console.log('✅ Total de logs de ciclistas:', allLogs?.length || 0);
            console.log(`✅ Logs específicos do ciclista 1: ${logsCiclista1?.length || 0}`);
            console.log(`✅ Logs específicos do ciclista 2: ${logsCiclista2?.length || 0}`);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testCiclistaSpecificLogs().then(() => {
    console.log('\n🏁 Teste de logs específicos concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 