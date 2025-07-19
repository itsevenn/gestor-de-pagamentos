const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Configurada' : 'NÃO CONFIGURADA');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditConnection() {
  try {
    console.log('\n=== TESTE 1: Verificar autenticação ===');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Dados de autenticação:', authData);
    console.log('Erro de autenticação:', authError);

    console.log('\n=== TESTE 2: Verificar se a tabela existe ===');
    const { data: tableData, error: tableError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    console.log('Dados da tabela:', tableData);
    console.log('Erro da tabela:', tableError);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela audit_logs:', tableError);
      return;
    }

    console.log('\n=== TESTE 3: Tentar inserção simples ===');
    const testData = {
      id: crypto.randomUUID(), // Gerar UUID automaticamente
      date: new Date().toISOString(),
      user: 'Teste Script',
      action: 'Teste Conexão',
      details: 'Teste de inserção via script'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('audit_logs')
      .insert([testData])
      .select();

    console.log('Dados inseridos:', insertData);
    console.log('Erro de inserção:', insertError);

    if (insertError) {
      console.error('❌ Erro na inserção:', insertError);
      console.error('Detalhes do erro:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });

      console.log('\n=== TESTE 4: Tentar inserção mínima ===');
      const minimalData = {
        id: crypto.randomUUID(), // Gerar UUID automaticamente
        date: new Date().toISOString(),
        action: 'Teste Mínimo'
      };

      const { data: minimalInsertData, error: minimalError } = await supabase
        .from('audit_logs')
        .insert([minimalData])
        .select();

      console.log('Dados mínimos inseridos:', minimalInsertData);
      console.log('Erro mínimo:', minimalError);

      if (minimalError) {
        console.error('❌ Erro também na inserção mínima:', minimalError);
        
        console.log('\n=== TESTE 5: Tentar apenas date ===');
        const { error: dateOnlyError } = await supabase
          .from('audit_logs')
          .insert([{ 
            id: crypto.randomUUID(), // Gerar UUID automaticamente
            date: new Date().toISOString() 
          }]);

        console.log('Erro apenas date:', dateOnlyError);
      }
    } else {
      console.log('✅ Inserção bem-sucedida!');
    }

    console.log('\n=== TESTE 6: Verificar registros existentes ===');
    const { data: existingData, error: existingError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    console.log('Registros existentes:', existingData);
    console.log('Erro ao buscar existentes:', existingError);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAuditConnection(); 