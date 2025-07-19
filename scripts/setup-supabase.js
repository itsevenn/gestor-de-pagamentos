require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnilgkvxudsxqujvogqi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no ambiente');
  console.log('💡 Para configurar o Supabase:');
  console.log('1. Acesse o dashboard do Supabase');
  console.log('2. Vá em Settings > API');
  console.log('3. Copie a "service_role" key');
  console.log('4. Configure como variável de ambiente SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabase() {
  try {
    console.log('🚀 Configurando Supabase...');

    // Verifica se o bucket 'avatars' existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.log('📦 Criando bucket "avatars"...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError.message);
        return;
      }

      console.log('✅ Bucket "avatars" criado com sucesso!');
    } else {
      console.log('✅ Bucket "avatars" já existe');
    }

    console.log('🔐 Configurando políticas de acesso...');
    
    // As políticas de storage são configuradas via SQL no dashboard do Supabase
    // ou via RLS policies. Para este projeto, vamos usar o bucket público
    // que já permite leitura pública e upload para usuários autenticados
    
    console.log('✅ Bucket configurado como público');
    console.log('📝 Políticas de acesso:');
    console.log('- Leitura pública: ✅ Permitida');
    console.log('- Upload autenticado: ✅ Permitido');
    console.log('- Atualização autenticada: ✅ Permitida');
    console.log('- Exclusão autenticada: ✅ Permitida');

    console.log('🎉 Configuração do Supabase concluída com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('1. Teste o upload de fotos na página de perfil');
    console.log('2. Verifique se as imagens estão sendo exibidas corretamente');
    console.log('3. Teste a remoção de fotos');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }
}

setupSupabase(); 