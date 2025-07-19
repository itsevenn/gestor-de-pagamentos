const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaWxna3Z4dWRzeHF1anZvZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzQ2MzYsImV4cCI6MjA2ODM1MDYzNn0.kygdAX7EqZtTztrzyJsiiriDu2gh9zYsR_0jHsEFNpg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAvatarsBucket() {
  console.log('🔍 Testando bucket "avatars" especificamente...');
  
  try {
    // Tentar listar arquivos no bucket avatars diretamente
    console.log('1. Tentando listar arquivos no bucket avatars...');
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (filesError) {
      console.error('❌ Erro ao listar arquivos:', filesError.message);
      console.log('💡 Possíveis causas:');
      console.log('- Políticas RLS não configuradas');
      console.log('- Bucket não está público');
      console.log('- Problema de permissões');
      return;
    }
    
    console.log('✅ Arquivos no bucket avatars:', files.length);
    if (files.length > 0) {
      console.log('📁 Arquivos encontrados:');
      files.forEach(file => console.log(`  - ${file.name}`));
    }
    
    // Tentar obter URL pública de um arquivo existente
    if (files.length > 0) {
      console.log('2. Testando URL pública...');
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(files[0].name);
      
      console.log('✅ URL pública gerada:', urlData.publicUrl);
    }
    
    // Testar upload de um arquivo pequeno
    console.log('3. Testando upload...');
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`test-${Date.now()}.txt`, testFile);
    
    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message);
      console.log('💡 Upload falhou - verifique as políticas de INSERT');
    } else {
      console.log('✅ Upload realizado com sucesso!');
      
      // Deletar arquivo de teste
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([uploadData.path]);
      
      if (deleteError) {
        console.log('⚠️ Não foi possível deletar arquivo de teste:', deleteError.message);
      } else {
        console.log('✅ Arquivo de teste deletado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAvatarsBucket(); 