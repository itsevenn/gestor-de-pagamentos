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

// Simular a função detectChanges do audit-logger.ts
function detectChanges(oldData, newData) {
  const changes = [];
  
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes.push({
        field: key,
        oldValue: oldData[key],
        newValue: newData[key]
      });
    }
  }
  
  return changes.length > 0 ? changes : undefined;
}

async function testDetectChanges() {
    console.log('🔍 Testando função detectChanges...');
    
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
            endereco: originalCiclista.endereco,
            observacoes: originalCiclista.observacoes
        });

        // 2. Criar dados simulando uma atualização
        const updatedCiclista = {
            ...originalCiclista,
            idade: String(parseInt(originalCiclista.idade || '0') + 1),
            endereco: originalCiclista.endereco + ' - DETECT TEST',
            observacoes: 'Teste de detecção de mudanças - ' + new Date().toISOString()
        };

        console.log('Dados atualizados:', {
            idade: updatedCiclista.idade,
            endereco: updatedCiclista.endereco,
            observacoes: updatedCiclista.observacoes
        });

        // 3. Testar detecção de mudanças
        console.log('\n2. Testando detecção de mudanças...');
        const changes = detectChanges(originalCiclista, updatedCiclista);
        
        if (changes) {
            console.log('✅ Mudanças detectadas:', changes.length);
            changes.forEach(change => {
                console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}"`);
            });
        } else {
            console.log('❌ Nenhuma mudança detectada');
        }

        // 4. Testar com dados parciais (como seria no formulário)
        console.log('\n3. Testando com dados parciais...');
        const partialUpdate = {
            id: originalCiclista.id,
            idade: String(parseInt(originalCiclista.idade || '0') + 2),
            endereco: originalCiclista.endereco + ' - PARCIAL DETECT',
            observacoes: 'Teste parcial de detecção - ' + new Date().toISOString()
        };

        const partialChanges = detectChanges(originalCiclista, partialUpdate);
        
        if (partialChanges) {
            console.log('✅ Mudanças parciais detectadas:', partialChanges.length);
            partialChanges.forEach(change => {
                console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}"`);
            });
        } else {
            console.log('❌ Nenhuma mudança parcial detectada');
        }

        // 5. Testar sem mudanças
        console.log('\n4. Testando sem mudanças...');
        const noChanges = detectChanges(originalCiclista, originalCiclista);
        
        if (noChanges) {
            console.log('❌ Mudanças detectadas quando não deveriam existir:', noChanges);
        } else {
            console.log('✅ Nenhuma mudança detectada (correto)');
        }

        // 6. Testar com valores nulos/undefined
        console.log('\n5. Testando com valores nulos...');
        const nullTest = {
            ...originalCiclista,
            observacoes: null,
            telefoneResidencial: undefined
        };

        const nullChanges = detectChanges(originalCiclista, nullTest);
        
        if (nullChanges) {
            console.log('✅ Mudanças com valores nulos detectadas:', nullChanges.length);
            nullChanges.forEach(change => {
                console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}"`);
            });
        } else {
            console.log('❌ Mudanças com valores nulos não detectadas');
        }

        // 7. Simular o fluxo completo de atualização
        console.log('\n6. Simulando fluxo completo...');
        
        // Simular dados do formulário
        const formValues = {
            ...originalCiclista,
            idade: String(parseInt(originalCiclista.idade || '0') + 3),
            endereco: originalCiclista.endereco + ' - FLUXO COMPLETO',
            observacoes: 'Teste de fluxo completo - ' + new Date().toISOString()
        };

        // Detectar mudanças
        const detectedChanges = detectChanges(originalCiclista, formValues);
        
        if (detectedChanges) {
            console.log('✅ Mudanças detectadas no fluxo completo:', detectedChanges.length);
            
            // Simular chamada para updateCiclista
            const updateData = {
                id: originalCiclista.id,
                ...formValues,
                changes: detectedChanges
            };

            console.log('Dados para atualização:', {
                id: updateData.id,
                idade: updateData.idade,
                endereco: updateData.endereco,
                observacoes: updateData.observacoes,
                changesCount: updateData.changes?.length || 0
            });

            // Fazer a atualização real
            const { data: updateResult, error: updateError } = await supabase
                .from('ciclistas')
                .update({
                    idade: updateData.idade,
                    endereco: updateData.endereco,
                    observacoes: updateData.observacoes
                })
                .eq('id', updateData.id)
                .select();

            if (updateError) {
                console.error('❌ Erro na atualização:', updateError);
            } else {
                console.log('✅ Atualização realizada com sucesso');
                
                // Verificar se as mudanças foram aplicadas
                const { data: verifyData } = await supabase
                    .from('ciclistas')
                    .select('*')
                    .eq('id', originalCiclista.id)
                    .single();

                console.log('Dados após atualização:', {
                    idade: verifyData.idade,
                    endereco: verifyData.endereco,
                    observacoes: verifyData.observacoes
                });
            }
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testDetectChanges().then(() => {
    console.log('\n🏁 Teste de detecção concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 