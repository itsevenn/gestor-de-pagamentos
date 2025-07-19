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

// Simular a função updateCiclistaDb do arquivo data.ts
async function updateCiclistaDb(ciclista) {
  const { id, ...ciclistaData } = ciclista;
  const { error } = await supabase.from('ciclistas').update(ciclistaData).eq('id', id);
  if (error) throw error;
}

async function testUpdateFunction() {
    console.log('🔍 Testando função updateCiclistaDb...');
    
    try {
        // 1. Buscar um ciclista para teste
        console.log('\n1. Buscando ciclista para teste...');
        const { data: ciclistas, error: ciclistasError } = await supabase
            .from('ciclistas')
            .select('*')
            .limit(1);

        if (ciclistasError) {
            console.error('❌ Erro ao buscar ciclistas:', ciclistasError);
            return;
        }

        if (!ciclistas || ciclistas.length === 0) {
            console.log('❌ Nenhum ciclista encontrado');
            return;
        }

        const originalCiclista = ciclistas[0];
        console.log('Ciclista original:', {
            id: originalCiclista.id,
            nomeCiclista: originalCiclista.nomeCiclista,
            idade: originalCiclista.idade,
            endereco: originalCiclista.endereco
        });

        // 2. Criar dados atualizados
        const updatedCiclista = {
            ...originalCiclista,
            idade: String(parseInt(originalCiclista.idade || '0') + 2),
            endereco: originalCiclista.endereco + ' - FUNÇÃO TESTE',
            observacoes: 'Teste da função updateCiclistaDb - ' + new Date().toISOString()
        };

        console.log('Dados para atualização:', {
            idade: updatedCiclista.idade,
            endereco: updatedCiclista.endereco,
            observacoes: updatedCiclista.observacoes
        });

        // 3. Testar a função updateCiclistaDb
        console.log('\n2. Testando função updateCiclistaDb...');
        try {
            await updateCiclistaDb(updatedCiclista);
            console.log('✅ Função updateCiclistaDb executada com sucesso');
        } catch (error) {
            console.error('❌ Erro na função updateCiclistaDb:', error);
            return;
        }

        // 4. Verificar se a atualização foi aplicada
        console.log('\n3. Verificando se a atualização foi aplicada...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('ciclistas')
            .select('*')
            .eq('id', originalCiclista.id)
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
                verifyData.idade === updatedCiclista.idade &&
                verifyData.endereco === updatedCiclista.endereco &&
                verifyData.observacoes === updatedCiclista.observacoes;

            console.log('✅ Mudanças aplicadas pela função:', mudancasAplicadas);
        }

        // 5. Testar com dados parciais (como seria no contexto)
        console.log('\n4. Testando com dados parciais...');
        const partialUpdate = {
            id: originalCiclista.id,
            idade: String(parseInt(originalCiclista.idade || '0') + 3),
            endereco: originalCiclista.endereco + ' - PARCIAL',
            observacoes: 'Teste parcial - ' + new Date().toISOString()
        };

        try {
            await updateCiclistaDb(partialUpdate);
            console.log('✅ Atualização parcial executada com sucesso');
        } catch (error) {
            console.error('❌ Erro na atualização parcial:', error);
        }

        // 6. Verificar resultado final
        console.log('\n5. Verificando resultado final...');
        const { data: finalData, error: finalError } = await supabase
            .from('ciclistas')
            .select('*')
            .eq('id', originalCiclista.id)
            .single();

        if (finalError) {
            console.error('❌ Erro ao verificar resultado final:', finalError);
        } else {
            console.log('✅ Dados finais:', {
                id: finalData.id,
                nomeCiclista: finalData.nomeCiclista,
                idade: finalData.idade,
                endereco: finalData.endereco,
                observacoes: finalData.observacoes
            });
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testUpdateFunction().then(() => {
    console.log('\n🏁 Teste da função concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 