-- Políticas RLS para o bucket 'avatars' no Supabase Storage
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- 1. Política para permitir leitura pública de avatars
CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 2. Política para permitir upload de usuários autenticados
CREATE POLICY "Allow authenticated upload to avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Política para permitir atualização de usuários autenticados
CREATE POLICY "Allow authenticated update to avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Política para permitir exclusão de usuários autenticados
CREATE POLICY "Allow authenticated delete from avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'; 