// Carregar variáveis de ambiente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditFix() {
  console.log('🔍 Testando correção do sistema de auditoria...');
  console.log('URL do Supabase:', supabaseUrl);
  
  try {
    // 1. Verificar se a tabela existe
    console.log('\n1. Verificando se a tabela audit_logs existe...');
    const { data: checkData, error: checkError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Tabela audit_logs não existe ou não está acessível:', checkError);
      console.error('Detalhes do erro:', {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      });
      console.log('💡 Execute o script SQL check_audit_table.sql primeiro!');
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
      if (structureData && structureData.length > 0) {
        console.log('Exemplo de dados:', structureData[0]);
      }
    }

    // 3. Testar inserção com estrutura correta
    console.log('\n3. Testando inserção com estrutura correta...');
    const testLog = {
      date: new Date().toISOString(),
      user: 'test@example.com',
      action: 'TEST_ACTION',
      details: 'Teste de inserção após correção',
      changes: JSON.stringify({ test: 'data' })
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
      console.log('\n4. Tentando inserção mínima...');
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

    // 5. Verificar logs existentes
    console.log('\n5. Verificando logs existentes...');
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

    // 6. Testar busca por ação
    console.log('\n6. Testando busca por ação...');
    const { data: actionLogs, error: actionError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'TEST_ACTION')
      .order('date', { ascending: false });

    if (actionError) {
      console.error('❌ Erro ao buscar por ação:', actionError);
    } else {
      console.log('✅ Logs encontrados para TEST_ACTION:', actionLogs?.length || 0);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testAuditFix().then(() => {
  console.log('\n🏁 Teste concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 