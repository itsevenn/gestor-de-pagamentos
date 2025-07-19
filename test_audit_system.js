require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('🔧 Configuração:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditSystem() {
  console.log('\n🔍 Testando sistema de auditoria...');
  
  try {
    // 1. Verificar se a tabela audit_logs existe
    console.log('1. Verificando se a tabela audit_logs existe...');
    const { data: auditData, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(5);
    
    if (auditError) {
      console.error('❌ Erro ao acessar audit_logs:', auditError);
      console.log('💡 Execute o script SQL create_audit_logs_table.sql primeiro!');
      return;
    } else {
      console.log('✅ Tabela audit_logs existe e está acessível');
      console.log('Logs encontrados:', auditData?.length || 0);
      if (auditData && auditData.length > 0) {
        console.log('Exemplo de log:', auditData[0]);
      }
    }

    // 2. Testar inserção de log
    console.log('\n2. Testando inserção de log...');
    const testLog = {
      action: 'TEST_ACTION',
      entityType: 'test',
      details: 'Teste do sistema de auditoria',
      entityName: 'Teste',
      userName: 'Sistema de Teste'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert(testLog)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir log:', insertError);
    } else {
      console.log('✅ Log inserido com sucesso:', insertData.id);
    }

    // 3. Testar busca de logs
    console.log('\n3. Testando busca de logs...');
    const { data: searchData, error: searchError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (searchError) {
      console.error('❌ Erro ao buscar logs:', searchError);
    } else {
      console.log('✅ Busca de logs funcionando');
      console.log('Total de logs:', searchData?.length || 0);
    }

    // 4. Testar API route
    console.log('\n4. Testando API route...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('supabase.co', 'supabase.co')}/rest/v1/audit_logs?select=*&limit=5`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API route funcionando');
        console.log('Logs via API:', apiData?.length || 0);
      } else {
        console.log('⚠️ API route retornou status:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ Erro ao testar API route:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testAuditSystem().then(() => {
  console.log('\n🏁 Teste concluído');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute o script SQL create_audit_logs_table.sql no Supabase Dashboard');
  console.log('2. Teste o sistema fazendo algumas alterações no app');
  console.log('3. Verifique se as atividades aparecem no histórico');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 