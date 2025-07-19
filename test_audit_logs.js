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

async function testAuditLogs() {
  console.log('\n🔍 Testando conexão com audit_logs...');
  
  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão básica:', testError);
      return;
    } else {
      console.log('✅ Conexão básica funcionando');
    }

    // 2. Verificar se a tabela audit_logs existe
    console.log('2. Verificando se a tabela audit_logs existe...');
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar audit_logs:', error);
      console.log('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      if (error.code === 'PGRST116') {
        console.log('💡 A tabela audit_logs não existe. Execute o script SQL primeiro.');
      }
    } else {
      console.log('✅ Tabela audit_logs existe e está acessível');
      console.log('Dados encontrados:', data);
      console.log('Tipo de dados:', typeof data);
      console.log('É array?', Array.isArray(data));
      console.log('Quantidade:', data ? data.length : 0);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testAuditLogs().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 