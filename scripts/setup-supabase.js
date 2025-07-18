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

    // Configura política de acesso público para o bucket
    console.log('🔐 Configurando políticas de acesso...');
    
    // Política para permitir upload de usuários autenticados
    const { error: uploadPolicyError } = await supabase.storage.from('avatars').createPolicy('allow_authenticated_upload', {
      name: 'allow_authenticated_upload',
      definition: {
        role: 'authenticated',
        operation: 'INSERT'
      }
    });

    if (uploadPolicyError && !uploadPolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de upload:', uploadPolicyError.message);
    } else {
      console.log('✅ Política de upload configurada');
    }

    // Política para permitir leitura pública
    const { error: readPolicyError } = await supabase.storage.from('avatars').createPolicy('allow_public_read', {
      name: 'allow_public_read',
      definition: {
        role: 'anon',
        operation: 'SELECT'
      }
    });

    if (readPolicyError && !readPolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de leitura:', readPolicyError.message);
    } else {
      console.log('✅ Política de leitura pública configurada');
    }

    // Política para permitir que usuários atualizem suas próprias fotos
    const { error: updatePolicyError } = await supabase.storage.from('avatars').createPolicy('allow_own_update', {
      name: 'allow_own_update',
      definition: {
        role: 'authenticated',
        operation: 'UPDATE'
      }
    });

    if (updatePolicyError && !updatePolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de atualização:', updatePolicyError.message);
    } else {
      console.log('✅ Política de atualização configurada');
    }

    // Política para permitir que usuários deletem suas próprias fotos
    const { error: deletePolicyError } = await supabase.storage.from('avatars').createPolicy('allow_own_delete', {
      name: 'allow_own_delete',
      definition: {
        role: 'authenticated',
        operation: 'DELETE'
      }
    });

    if (deletePolicyError && !deletePolicyError.message.includes('already exists')) {
      console.error('❌ Erro ao criar política de exclusão:', deletePolicyError.message);
    } else {
      console.log('✅ Política de exclusão configurada');
    }

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