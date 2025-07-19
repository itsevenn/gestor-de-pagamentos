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
      console.error('❌ Tabela audit_logs não existe:', checkError);
      return;
    }
    
    console.log('✅ Tabela audit_logs existe');

    // 2. Tentar inserção simples (sem changes)
    console.log('2. Tentando inserção simples...');
    const testLog = {
      id: crypto.randomUUID(), // Gerar UUID
      date: new Date().toISOString(),
      user: 'test@example.com',
      action: 'TEST_SIMPLE',
      details: 'Teste de inserção simples'
    };

    console.log('📝 Dados para inserção:', testLog);

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert([testLog])
      .select();

    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Detalhes:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Inserção funcionou:', insertData);
    }

    // 3. Verificar logs existentes
    console.log('3. Verificando logs existentes...');
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

// Executar o teste
testSimpleAudit().then(() => {
  console.log('\n🏁 Teste concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 