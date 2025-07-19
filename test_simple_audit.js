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

async function testSimpleAudit() {
  console.log('🔍 Testando inserção simples na tabela audit_logs...');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('1. Verificando se a tabela existe...');
    const { data: checkData, error: checkError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Tabela audit_logs não existe ou não está acessível:', checkError);
      console.log('💡 Execute o script SQL create_audit_logs_table.sql primeiro!');
      return;
    }
    
    console.log('✅ Tabela audit_logs existe');

    // 2. Tentar inserção simples
    console.log('2. Tentando inserção simples...');
    const testLog = {
      timestamp: new Date().toISOString(),
      userId: 'test-user',
      userName: 'Teste',
      action: 'TEST_ACTION',
      entityType: 'system',
      details: 'Teste de inserção simples',
      entityId: null,
      entityName: null,
      changes: null,
      ipAddress: 'N/A',
      userAgent: 'N/A'
    };

    console.log('📝 Dados para inserção:', testLog);

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert([testLog])
      .select();

    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Detalhes do erro:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      
      // Tentar inserção mínima
      console.log('3. Tentando inserção mínima...');
      const minimalLog = {
        timestamp: new Date().toISOString(),
        userId: 'test-user',
        userName: 'Teste',
        action: 'TEST_ACTION',
        entityType: 'system',
        details: 'Teste mínimo'
      };

      const { data: minimalData, error: minimalError } = await supabase
        .from('audit_logs')
        .insert([minimalLog])
        .select();

      if (minimalError) {
        console.error('❌ Erro também na inserção mínima:', minimalError);
      } else {
        console.log('✅ Inserção mínima funcionou:', minimalData);
      }
    } else {
      console.log('✅ Inserção funcionou:', insertData);
    }

    // 4. Verificar logs existentes
    console.log('4. Verificando logs existentes...');
    const { data: allLogs, error: allError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Erro ao buscar logs:', allError);
    } else {
      console.log('✅ Logs encontrados:', allLogs?.length || 0);
      if (allLogs && allLogs.length > 0) {
        console.log('Exemplo de log:', allLogs[0]);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testSimpleAudit().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 