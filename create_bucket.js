const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  console.log('🔍 Tentando criar bucket "avatars"...');
  
  try {
    // Tentar criar o bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('❌ Erro ao criar bucket:', error.message);
      console.log('💡 Este erro é esperado - buckets só podem ser criados com service_role_key');
      console.log('📋 Para resolver:');
      console.log('1. Acesse o dashboard do Supabase');
      console.log('2. Vá em Storage > Create a new bucket');
      console.log('3. Nome: avatars');
      console.log('4. Marque como público');
      console.log('5. Configure as políticas RLS');
      return;
    }

    console.log('✅ Bucket criado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createBucket(); 