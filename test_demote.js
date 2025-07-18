// Script para testar a funcionalidade de rebaixar usuários
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDemote() {
  console.log('🧪 Testando funcionalidade de rebaixar usuários...\n');

  try {
    // 1. Fazer login como admin
    console.log('1. Fazendo login como admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@gestordociclista.com',
      password: 'password'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login bem-sucedido!');
    console.log('Usuário ID:', loginData.user.id);

    // 2. Obter sessão
    console.log('\n2. Obtendo sessão...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Erro ao obter sessão:', sessionError?.message || 'Nenhuma sessão');
      return;
    }

    console.log('✅ Sessão obtida!');
    console.log('Token de acesso:', session.access_token.substring(0, 20) + '...');

    // 3. Listar usuários atuais
    console.log('\n3. Listando usuários atuais...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role');

    if (profilesError) {
      console.error('❌ Erro ao listar usuários:', profilesError.message);
      return;
    }

    console.log('✅ Usuários encontrados:');
    profiles.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });

    // 4. Encontrar um usuário admin para testar o rebaixamento
    const adminUser = profiles.find(p => p.role === 'admin' && p.id !== loginData.user.id);
    
    if (!adminUser) {
      console.log('\n⚠️  Nenhum outro usuário admin encontrado para testar rebaixamento');
      console.log('💡 Para testar, primeiro promova um usuário a admin');
      return;
    }

    console.log(`\n4. Testando rebaixamento do usuário: ${adminUser.email}`);

    // 5. Testar a API de rebaixamento
    const response = await fetch('http://localhost:3000/api/demote-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: adminUser.id })
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API:', errorData);
    } else {
      const successData = await response.json();
      console.log('✅ Rebaixamento bem-sucedido:', successData);
    }

    // 6. Verificar se o usuário foi rebaixado
    console.log('\n5. Verificando se o usuário foi rebaixado...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', adminUser.id)
      .single();

    if (updateError) {
      console.error('❌ Erro ao verificar perfil atualizado:', updateError.message);
    } else {
      console.log('✅ Perfil atualizado:', updatedProfile);
      if (updatedProfile.role === 'user') {
        console.log('🎉 Usuário foi rebaixado com sucesso!');
      } else {
        console.log('⚠️  Usuário ainda é admin');
      }
    }

    // 7. Testar rebaixamento de si mesmo (deve falhar)
    console.log('\n6. Testando rebaixamento de si mesmo (deve falhar)...');
    const selfResponse = await fetch('http://localhost:3000/api/demote-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId: loginData.user.id })
    });

    console.log('Status da resposta (auto-rebaixamento):', selfResponse.status);
    
    if (!selfResponse.ok) {
      const errorData = await selfResponse.json();
      console.log('✅ Proteção funcionando:', errorData.error);
    } else {
      console.log('⚠️  Proteção não funcionou - usuário conseguiu rebaixar a si mesmo');
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testDemote(); 