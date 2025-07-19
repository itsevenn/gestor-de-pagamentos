const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    console.log('1. Testando conexão básica...');
    const { data, error } = await supabase.from('ciclistas').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão básica:', error);
      return;
    }
    
    console.log('✅ Conexão básica OK');
    
    // Testar listagem de buckets
    console.log('2. Testando listagem de buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Verificar se o bucket avatars existe
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    if (!avatarsBucket) {
      console.error('❌ Bucket "avatars" não encontrado!');
      console.log('📋 Buckets disponíveis:', buckets.map(b => b.name));
      return;
    }
    
    console.log('✅ Bucket "avatars" encontrado');
    
    // Testar listagem de arquivos no bucket
    console.log('3. Testando listagem de arquivos no bucket avatars...');
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError);
      return;
    }
    
    console.log('✅ Arquivos no bucket avatars:', files.length);
    
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection(); 