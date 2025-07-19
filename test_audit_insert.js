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

async function testAuditInsert() {
  console.log('🔍 Testando inserção na tabela audit_logs...');
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('\n1. Verificando estrutura da tabela...');
    const { data: structureData, error: structureError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
      return;
    }
    
    if (structureData && structureData.length > 0) {
      console.log('✅ Estrutura da tabela:', Object.keys(structureData[0]));
      console.log('Exemplo de dados:', structureData[0]);
    } else {
      console.log('⚠️ Tabela vazia, não é possível verificar estrutura');
    }

    // 2. Tentar inserção exatamente como está na tabela
    console.log('\n2. Tentando inserção com estrutura exata...');
    const testLog = {
      date: new Date().toISOString(),
      user: 'test@example.com',
      action: 'TEST_ACTION',
      details: 'Teste de inserção direta'
    };

    console.log('📝 Dados para inserção:', testLog);

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert([testLog])
      .select();

    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Detalhes completos:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      
      // 3. Tentar inserção com apenas campos obrigatórios
      console.log('\n3. Tentando inserção mínima...');
      const minimalLog = {
        date: new Date().toISOString(),
        action: 'TEST_MINIMAL',
        details: 'Teste mínimo'
      };

      const { data: minimalData, error: minimalError } = await supabase
        .from('audit_logs')
        .insert([minimalLog])
        .select();

      if (minimalError) {
        console.error('❌ Erro também na inserção mínima:', minimalError);
        console.error('Detalhes:', {
          message: minimalError.message,
          details: minimalError.details,
          hint: minimalError.hint,
          code: minimalError.code
        });
      } else {
        console.log('✅ Inserção mínima funcionou:', minimalData);
      }
    } else {
      console.log('✅ Inserção funcionou:', insertData);
    }

    // 4. Verificar logs existentes
    console.log('\n4. Verificando logs existentes...');
    const { data: allLogs, error: allError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Erro ao buscar logs:', allError);
    } else {
      console.log('✅ Total de logs:', allLogs?.length || 0);
      if (allLogs && allLogs.length > 0) {
        console.log('Último log:', allLogs[0]);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testAuditInsert().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 