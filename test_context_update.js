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

// Simular as funções do contexto
async function updateCiclistaDb(ciclista) {
  const { id, changeReason, changes, ...ciclistaData } = ciclista;
  const { error } = await supabase.from('ciclistas').update(ciclistaData).eq('id', id);
  if (error) throw error;
}

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

async function logCiclistaUpdated(ciclistaId, ciclistaName, changes, details) {
  try {
    const logData = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      user: 'test@example.com',
      action: 'Ciclista Atualizado',
      details: details
    };

    const { error } = await supabase.from('audit_logs').insert([logData]);
    if (error) {
      console.error('Erro ao inserir log:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

async function getAuditLogs() {
  try {
    const result = await supabase.from('audit_logs').select('*').order('date', { ascending: false });
    return result.data || [];
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return [];
  }
}

// Simular a função updateCiclista do contexto
async function updateCiclista(updatedCiclista) {
  console.log('🔄 Simulando updateCiclista do contexto...');
  
  try {
    // 1. Buscar ciclista original
    const { data: ciclistas, error: ciclistasError } = await supabase
      .from('ciclistas')
      .select('*')
      .eq('id', updatedCiclista.id);

    if (ciclistasError) {
      console.error('❌ Erro ao buscar ciclista original:', ciclistasError);
      return;
    }

    const originalCiclista = ciclistas[0];
    console.log('Ciclista original:', {
      id: originalCiclista.id,
      nomeCiclista: originalCiclista.nomeCiclista,
      idade: originalCiclista.idade,
      endereco: originalCiclista.endereco
    });

    // 2. Atualizar no banco de dados
    console.log('📝 Atualizando no banco de dados...');
    await updateCiclistaDb(updatedCiclista);
    console.log('✅ Atualização no banco realizada');

    // 3. Detectar mudanças
    console.log('🔍 Detectando mudanças...');
    const changes = updatedCiclista.changes || detectChanges(originalCiclista, updatedCiclista);
    
    if (changes) {
      console.log('✅ Mudanças detectadas:', changes.length);
      changes.forEach(change => {
        console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}"`);
      });
    } else {
      console.log('❌ Nenhuma mudança detectada');
    }

    // 4. Registrar no sistema de auditoria
    console.log('📋 Registrando no sistema de auditoria...');
    const reason = updatedCiclista.changeReason ? ` - Motivo: ${updatedCiclista.changeReason}` : '';
    const details = `Dados do ciclista "${updatedCiclista.nomeCiclista}" foram atualizados${reason}`;
    await logCiclistaUpdated(updatedCiclista.id, updatedCiclista.nomeCiclista, changes, details);
    console.log('✅ Log de auditoria registrado');

    // 5. Atualizar logs locais
    console.log('🔄 Atualizando logs locais...');
    const auditLogs = await getAuditLogs();
    console.log('✅ Logs locais atualizados:', auditLogs.length);

    // 6. Verificar se a atualização foi aplicada
    console.log('🔍 Verificando se a atualização foi aplicada...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('ciclistas')
      .select('*')
      .eq('id', updatedCiclista.id)
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

      console.log('✅ Mudanças aplicadas:', mudancasAplicadas);
    }

  } catch (error) {
    console.error('❌ Erro no updateCiclista:', error);
    throw error;
  }
}

async function testContextUpdate() {
    console.log('🔍 Testando simulação do contexto...');
    
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
        console.log('Ciclista para teste:', {
            id: originalCiclista.id,
            nomeCiclista: originalCiclista.nomeCiclista,
            idade: originalCiclista.idade,
            endereco: originalCiclista.endereco
        });

        // 2. Simular dados do formulário
        console.log('\n2. Simulando dados do formulário...');
        const formValues = {
            ...originalCiclista,
            idade: String(parseInt(originalCiclista.idade || '0') + 1),
            endereco: originalCiclista.endereco + ' - CONTEXT TEST',
            observacoes: 'Teste do contexto - ' + new Date().toISOString()
        };

        // 3. Detectar mudanças (como no formulário)
        console.log('\n3. Detectando mudanças (como no formulário)...');
        const changes = [];
        Object.keys(formValues).forEach(key => {
            if (key !== 'photoUrl' && key !== 'changeReason' && formValues[key] !== originalCiclista[key]) {
                changes.push({
                    field: key,
                    oldValue: originalCiclista[key],
                    newValue: formValues[key]
                });
            }
        });

        console.log('Mudanças detectadas no formulário:', changes.length);
        changes.forEach(change => {
            console.log(`  - ${change.field}: "${change.oldValue}" → "${change.newValue}"`);
        });

        // 4. Criar dados para updateCiclista (como no formulário)
        const updateData = {
            id: originalCiclista.id,
            ...formValues,
            changeReason: 'Teste do contexto',
            changes: changes.length > 0 ? changes : undefined
        };

        console.log('Dados para updateCiclista:', {
            id: updateData.id,
            idade: updateData.idade,
            endereco: updateData.endereco,
            observacoes: updateData.observacoes,
            changeReason: updateData.changeReason,
            changesCount: updateData.changes?.length || 0
        });

        // 5. Chamar updateCiclista (simulação do contexto)
        console.log('\n4. Chamando updateCiclista (simulação do contexto)...');
        await updateCiclista(updateData);

        console.log('\n🎉 Simulação do contexto concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste
testContextUpdate().then(() => {
    console.log('\n🏁 Teste do contexto concluído!');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
}); 