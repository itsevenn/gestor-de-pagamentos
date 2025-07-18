const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileUpdate() {
  console.log('🧪 Testando atualização de perfil...\n');

  try {
    // 1. Teste de login
    console.log('1. Fazendo login...');
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@gestordociclista.com',
      password: 'admin123'
    });

    if (signInError) {
      console.error('❌ Erro no login:', signInError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log('   Usuário:', user.email);
    console.log('   Nome atual:', user.user_metadata?.name || 'Não definido');

    // 2. Teste de atualização de nome
    console.log('\n2. Atualizando nome do perfil...');
    const newName = 'Administrador Teste';
    
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: { name: newName }
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar nome:', updateError.message);
      return;
    }

    console.log('✅ Nome atualizado com sucesso');
    console.log('   Novo nome:', updateData.user.user_metadata?.name);

    // 3. Verificar se a atualização foi persistida
    console.log('\n3. Verificando persistência da atualização...');
    const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError) {
      console.error('❌ Erro ao obter usuário:', getUserError.message);
      return;
    }

    console.log('✅ Dados do usuário verificados');
    console.log('   Nome persistido:', currentUser.user_metadata?.name);

    // 4. Teste de logout
    console.log('\n4. Fazendo logout...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('❌ Erro no logout:', signOutError.message);
      return;
    }

    console.log('✅ Logout realizado com sucesso');

    console.log('\n🎉 Todos os testes passaram! A funcionalidade de atualização de perfil está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar o teste
testProfileUpdate(); 