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

async function debugAuditTable() {
  console.log('🔍 Debugando tabela audit_logs...');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1. Verificando se a tabela existe...');
    const { data: checkData, error: checkError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Tabela não existe ou não está acessível:', checkError);
      console.error('Detalhes:', {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      });
      return;
    }
    
    console.log('✅ Tabela audit_logs existe');

    // 2. Verificar estrutura da tabela
    console.log('\n2. Verificando estrutura da tabela...');
    const { data: structureData, error: structureError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError);
    } else {
      console.log('✅ Estrutura da tabela:', Object.keys(structureData[0] || {}));
    }

    // 3. Tentar inserção com dados mínimos
    console.log('\n3. Testando inserção mínima...');
    const minimalLog = {
      timestamp: new Date().toISOString(),
      userId: 'test-user',
      userName: 'Teste',
      action: 'TEST_ACTION',
      entityType: 'system',
      details: 'Teste de inserção mínima'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert([minimalLog])
      .select();

    if (insertError) {
      console.error('❌ Erro na inserção mínima:', insertError);
      console.error('Detalhes:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Inserção mínima funcionou:', insertData);
    }

    // 4. Tentar inserção completa
    console.log('\n4. Testando inserção completa...');
    const fullLog = {
      timestamp: new Date().toISOString(),
      userId: 'test-user',
      userName: 'Teste',
      action: 'TEST_ACTION',
      entityType: 'system',
      entityId: 'test-id',
      entityName: 'Teste',
      details: 'Teste de inserção completa',
      changes: JSON.stringify({ test: 'data' }),
      ipAddress: 'N/A',
      userAgent: 'N/A'
    };

    const { data: fullInsertData, error: fullInsertError } = await supabase
      .from('audit_logs')
      .insert([fullLog])
      .select();

    if (fullInsertError) {
      console.error('❌ Erro na inserção completa:', fullInsertError);
      console.error('Detalhes:', {
        message: fullInsertError.message,
        details: fullInsertError.details,
        hint: fullInsertError.hint,
        code: fullInsertError.code
      });
    } else {
      console.log('✅ Inserção completa funcionou:', fullInsertData);
    }

    // 5. Verificar logs existentes
    console.log('\n5. Verificando logs existentes...');
    const { data: allLogs, error: allError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (allError) {
      console.error('❌ Erro ao buscar logs:', allError);
    } else {
      console.log('✅ Total de logs:', allLogs?.length || 0);
      if (allLogs && allLogs.length > 0) {
        console.log('Último log:', allLogs[0]);
      }
    }

    // 6. Verificar políticas RLS
    console.log('\n6. Verificando políticas RLS...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('audit_logs')
        .select('*')
        .limit(1);
      
      if (policiesError) {
        console.error('❌ Erro de política RLS:', policiesError);
      } else {
        console.log('✅ Políticas RLS estão funcionando');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar políticas:', error);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar debug
debugAuditTable().then(() => {
  console.log('\n🏁 Debug concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no debug:', error);
  process.exit(1);
}); 