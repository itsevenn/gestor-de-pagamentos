# Configuração do Supabase Storage

## Problema Identificado

O erro "Failed to fetch" está ocorrendo porque o bucket "avatars" não existe no Supabase Storage. Este bucket é necessário para armazenar as fotos dos ciclistas.

## Solução

### 1. Acessar o Dashboard do Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto `gestor-de-pagamentos`

### 2. Criar o Bucket "avatars"

1. No menu lateral, clique em **Storage**
2. Clique em **Create a new bucket**
3. Configure o bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Marque esta opção
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

4. Clique em **Create bucket**

### 3. Configurar Políticas RLS (Row Level Security)

1. Com o bucket criado, clique em **Policies**
2. Clique em **New Policy**
3. Selecione **Create a policy from scratch**
4. Configure as políticas:

#### Política 1: Leitura Pública
- **Policy name**: `Public read access`
- **Target roles**: `public`
- **Using expression**: `true`
- **Operation**: `SELECT`

#### Política 2: Upload Autenticado
- **Policy name**: `Authenticated upload`
- **Target roles**: `authenticated`
- **Using expression**: `auth.role() = 'authenticated'`
- **Operation**: `INSERT`

#### Política 3: Atualização Autenticada
- **Policy name**: `Authenticated update`
- **Target roles**: `authenticated`
- **Using expression**: `auth.role() = 'authenticated'`
- **Operation**: `UPDATE`

#### Política 4: Exclusão Autenticada
- **Policy name**: `Authenticated delete`
- **Target roles**: `authenticated`
- **Using expression**: `auth.role() = 'authenticated'`
- **Operation**: `DELETE`

### 4. Alternativa: Usar SQL

Se preferir, você pode executar este SQL no **SQL Editor** do Supabase:

```sql
-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política de upload autenticado
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política de atualização autenticada
CREATE POLICY "Authenticated update" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política de exclusão autenticada
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### 5. Verificar Configuração

Após configurar, execute o script de teste:

```bash
node test_supabase_connection.js
```

Você deve ver:
```
✅ Bucket "avatars" encontrado
✅ Arquivos no bucket avatars: 0
🎉 Todos os testes passaram!
```

### 6. Testar Upload

1. Acesse a aplicação
2. Vá para a página de criação ou edição de ciclista
3. Tente fazer upload de uma foto
4. Verifique se não há mais erros "Failed to fetch"

## Estrutura de Arquivos

Os arquivos serão salvos com o padrão:
```
avatars/
├── ciclista-id-timestamp.jpg
├── ciclista-id-timestamp.png
└── ...
```

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket foi criado corretamente
- Confirme que o nome é exatamente `avatars` (sem maiúsculas)

### Erro: "Permission denied"
- Verifique se as políticas RLS estão configuradas
- Confirme que o usuário está autenticado

### Erro: "File too large"
- Verifique se o arquivo tem menos de 5MB
- Confirme o limite configurado no bucket

### Erro: "Invalid file type"
- Verifique se o arquivo é JPEG, PNG ou WebP
- Confirme os tipos MIME permitidos no bucket 