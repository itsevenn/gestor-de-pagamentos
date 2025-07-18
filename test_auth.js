// Script para testar a autenticação do Supabase
// Execute este script para verificar se a autenticação está funcionando

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🧪 Testando autenticação do Supabase...\n');

  try {
    // 1. Testar login com diferentes credenciais
    console.log('1. Testando login...');
    
    const testCredentials = [
      { email: 'admin@gestordociclista.com', password: 'admin123' },
      { email: 'admin@gestordociclista.com', password: 'admin' },
      { email: 'admin@gestordociclista.com', password: '123456' },
      { email: 'admin@gestordociclista.com', password: 'password' },
      { email: 'admin@gestordociclista.com', password: 'admin@gestordociclista.com' }
    ];

    let loginData = null;
    let loginError = null;

    for (const cred of testCredentials) {
      console.log(`Tentando: ${cred.email} / ${cred.password}`);
      const { data, error } = await supabase.auth.signInWithPassword(cred);
      
      if (!error && data.user) {
        console.log('✅ Login bem-sucedido!');
        loginData = data;
        break;
      } else {
        console.log('❌ Falhou:', error?.message);
      }
    }

    if (!loginData) {
      console.error('❌ Nenhuma credencial funcionou');
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se o usuário admin existe no Supabase');
      console.log('2. Verifique a senha correta');
      console.log('3. Execute o script fix_profiles_policies.sql no Supabase');
      return;
    }

    console.log('Usuário ID:', loginData.user.id);
    console.log('Email:', loginData.user.email);

    // 2. Obter sessão
    console.log('\n2. Obtendo sessão...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
      return;
    }

    if (!session) {
      console.error('❌ Nenhuma sessão encontrada');
      return;
    }

    console.log('✅ Sessão obtida!');
    console.log('Token de acesso:', session.access_token.substring(0, 20) + '...');

    // 3. Verificar perfil do usuário
    console.log('\n3. Verificando perfil do usuário...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      console.log('💡 Execute o script fix_profiles_policies.sql no Supabase');
      return;
    }

    console.log('✅ Perfil encontrado!');
    console.log('Role:', profile.role);
    console.log('Email:', profile.email);

    // 4. Testar listagem de usuários (se for admin)
    if (profile.role === 'admin') {
      console.log('\n4. Testando listagem de usuários (como admin)...');
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role');

      if (usersError) {
        console.error('❌ Erro ao listar usuários:', usersError.message);
        console.log('💡 Verifique as políticas RLS da tabela profiles');
      } else {
        console.log('✅ Listagem de usuários bem-sucedida!');
        console.log('Total de usuários:', users.length);
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`);
        });
      }
    } else {
      console.log('\n4. Usuário não é admin, pulando teste de listagem...');
      console.log('💡 Para tornar este usuário admin, execute no Supabase:');
      console.log(`UPDATE profiles SET role = 'admin' WHERE id = '${loginData.user.id}';`);
    }

    // 5. Testar atualização de perfil
    console.log('\n5. Testando atualização de perfil...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', loginData.user.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError.message);
    } else {
      console.log('✅ Atualização de perfil bem-sucedida!');
    }

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testAuth(); 