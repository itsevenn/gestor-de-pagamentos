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

async function testCiclistaUpdate() {
    console.log('🔍 Testando atualização de ciclista...');
    
    try {
        // 1. Buscar ciclistas existentes
        console.log('\n1. Buscando ciclistas existentes...');
        const { data: ciclistas, error: ciclistasError } = await supabase
            .from('ciclistas')
            .select('*')
            .limit(5);

        if (ciclistasError) {
            console.error('❌ Erro ao buscar ciclistas:', ciclistasError);
            return;
        }

        console.log('✅ Ciclistas encontrados:', ciclistas?.length || 0);
        
        if (!ciclistas || ciclistas.length === 0) {
            console.log('❌ Nenhum ciclista encontrado para teste');
            return;
        }

        const testCiclista = ciclistas[0];
        console.log('Ciclista para teste:', {
            id: testCiclista.id,
            nomeCiclista: testCiclista.nomeCiclista,
            idade: testCiclista.idade,
            endereco: testCiclista.endereco
        });

        // 2. Fazer uma atualização de teste
        console.log('\n2. Fazendo atualização de teste...');
        const updatedData = {
            ...testCiclista,
            idade: String(parseInt(testCiclista.idade || '0') + 1),
            endereco: testCiclista.endereco + ' - TESTE',
            observacoes: 'Teste de atualização via script - ' + new Date().toISOString()
        };

        console.log('Dados para atualização:', {
            idade: updatedData.idade,
            endereco: updatedData.endereco,
            observacoes: updatedData.observacoes
        });

        const { data: updateResult, error: updateError } = await supabase
            .from('ciclistas')
            .update({
                idade: updatedData.idade,
                endereco: updatedData.endereco,
                observacoes: updatedData.observacoes
            })
            .eq('id', testCiclista.id)
            .select();

        if (updateError) {
            console.error('❌ Erro na atualização:', updateError);
            console.error('Detalhes:', {
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint,
                code: updateError.code
            });
        } else {
            console.log('✅ Atualização realizada com sucesso:', updateResult);
        }

        // 3. Verificar se a atualização foi salva
        console.log('\n3. Verificando se a atualização foi salva...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('ciclistas')
            .select('*')
            .eq('id', testCiclista.id)
            .single();

        if (verifyError) {
            console.error('❌ Erro ao verificar atualização:', verifyError);
        } else {
            console.log('✅ Dados após atualização:', {
                id: verifyData.id,
                nomeCiclista: verifyData.nomeCiclista,
                idade: verifyData.idade,
                endereco: verifyData.endereco,
                observacoes: verifyData.observacoes
            });

            // Verificar se as mudanças foram aplicadas
            const mudancasAplicadas = 
                verifyData.idade === updatedData.idade &&
                verifyData.endereco === updatedData.endereco &&
                verifyData.observacoes === updatedData.observacoes;

            console.log('✅ Mudanças aplicadas:', mudancasAplicadas);
        }

        // 4. Verificar logs de auditoria
        console.log('\n4. Verificando logs de auditoria...');
        const { data: auditLogs, error: auditError } = await supabase
            .from('audit_logs')
            .select('*')
            .or('action.eq.Ciclista Atualizado,action.eq.Ciclista Criado')
            .order('date', { ascending: false })
            .limit(10);

        if (auditError) {
            console.error('❌ Erro ao buscar logs de auditoria:', auditError);
        } else {
            console.log('✅ Logs de auditoria encontrados:', auditLogs?.length || 0);
            if (auditLogs && auditLogs.length > 0) {
                console.log('Último log de ciclista:', auditLogs[0]);
            }
        }

        // 5. Testar inserção de log de auditoria
        console.log('\n5. Testando inserção de log de auditoria...');
        const testLog = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            user: 'test@example.com',
            action: 'Ciclista Atualizado',
            details: `Ciclista "${testCiclista.nomeCiclista}" foi atualizado via teste`
        };

        const { data: logResult, error: logError } = await supabase
            .from('audit_logs')
            .insert([testLog])
            .select();

        if (logError) {
            console.error('❌ Erro ao inserir log:', logError);
        } else {
            console.log('✅ Log inserido com sucesso:', logResult);
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testCiclistaUpdate().then(() => {
    console.log('\n🏁 Teste de atualização concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 