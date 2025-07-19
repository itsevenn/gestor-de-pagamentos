# Sistema de Upload de Fotos para Ciclistas

## Visão Geral

O sistema de upload de fotos permite que os usuários carreguem, visualizem e gerenciem fotos de perfil para os ciclistas cadastrados. As imagens são armazenadas no Supabase Storage e referenciadas no banco de dados.

## Funcionalidades

- ✅ Upload de imagens (JPEG, PNG, WebP)
- ✅ Validação de tipo e tamanho de arquivo (máximo 5MB)
- ✅ Preview em tempo real
- ✅ Remoção de fotos
- ✅ Armazenamento seguro no Supabase Storage
- ✅ URLs públicas para exibição
- ✅ Integração com perfil do ciclista

## Configuração

### 1. Bucket de Storage

O bucket `avatars` já está configurado no Supabase com as seguintes configurações:
- **Nome**: `avatars`
- **Público**: Sim
- **Tipos permitidos**: image/jpeg, image/png, image/gif, image/webp
- **Tamanho máximo**: 5MB

### 2. Políticas RLS

Execute o seguinte SQL no SQL Editor do Supabase Dashboard:

```sql
-- Política para permitir leitura pública de avatars
CREATE POLICY "Allow public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir upload de usuários autenticados
CREATE POLICY "Allow authenticated upload to avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política para permitir atualização de usuários autenticados
CREATE POLICY "Allow authenticated update to avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política para permitir exclusão de usuários autenticados
CREATE POLICY "Allow authenticated delete from avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

### 3. Script de Configuração

Execute o script de configuração:

```bash
node scripts/setup-supabase.js
```

## Como Usar

### Adicionando Foto a um Novo Ciclista

1. Acesse a página "Adicionar Novo Ciclista"
2. Na seção "Foto do Ciclista", clique em "Carregar Foto"
3. Selecione uma imagem (JPEG, PNG ou WebP, máximo 5MB)
4. A imagem será exibida em preview
5. Preencha os demais campos obrigatórios
6. Clique em "Adicionar Ciclista"
7. A foto será enviada automaticamente para o Supabase Storage

### Editando Foto de um Ciclista Existente

1. Acesse a página de edição do ciclista
2. Na seção "Foto do Ciclista":
   - Para adicionar nova foto: clique em "Carregar Nova Foto"
   - Para remover foto: clique em "Remover Foto"
3. Clique em "Salvar Alterações"
4. As alterações serão aplicadas automaticamente

## Estrutura de Arquivos

### Funções Utilitárias (`src/lib/avatar-utils.ts`)

```typescript
// Upload de avatar
uploadAvatar(file: File, ciclistaId: string): Promise<string>

// Deletar avatar
deleteAvatar(photoUrl: string): Promise<void>

// Validar arquivo de imagem
validateImageFile(file: File): boolean
```

### Componentes

- **Página de Criação**: `src/app/ciclistas/new/page.tsx`
- **Página de Edição**: `src/app/ciclistas/[id]/edit/page.tsx`

## Fluxo de Upload

1. **Seleção**: Usuário seleciona arquivo via input file
2. **Validação**: Sistema valida tipo e tamanho do arquivo
3. **Preview**: Imagem é exibida em preview usando FileReader
4. **Upload**: Ao salvar, arquivo é enviado para Supabase Storage
5. **URL**: Sistema obtém URL pública da imagem
6. **Banco**: URL é salva no campo `photoUrl` do ciclista

## Estrutura de Dados

### Tabela `ciclistas`

```sql
CREATE TABLE ciclistas (
    id UUID PRIMARY KEY,
    photoUrl TEXT, -- URL da imagem no Supabase Storage
    -- ... outros campos
);
```

### Bucket `avatars`

- **Estrutura**: `{ciclistaId}-{timestamp}.{extensão}`
- **Exemplo**: `123e4567-e89b-12d3-a456-426614174000-1703123456789.jpg`

## Tratamento de Erros

### Validação de Arquivo

- **Tipo**: Apenas JPEG, PNG e WebP são aceitos
- **Tamanho**: Máximo 5MB
- **Feedback**: Toast notifications para erros

### Upload

- **Falha de rede**: Retry automático
- **Erro de storage**: Mensagem de erro clara
- **Timeout**: Indicador de loading

## Segurança

- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Validação de tipo de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ URLs públicas para leitura
- ✅ Políticas RLS configuradas

## Performance

- ✅ Preview local antes do upload
- ✅ Compressão automática pelo navegador
- ✅ URLs públicas para cache
- ✅ Lazy loading de imagens

## Troubleshooting

### Erro: "Falha no upload"

1. Verifique se o bucket `avatars` existe
2. Confirme se as políticas RLS estão configuradas
3. Verifique se o usuário está autenticado
4. Teste com arquivo menor

### Erro: "Tipo de arquivo não suportado"

1. Use apenas JPEG, PNG ou WebP
2. Verifique a extensão do arquivo
3. Tente converter a imagem

### Erro: "Arquivo muito grande"

1. Reduza o tamanho da imagem
2. Use compressão antes do upload
3. Máximo permitido: 5MB

## Próximas Melhorias

- [ ] Compressão automática de imagens
- [ ] Crop/redimensionamento no frontend
- [ ] Múltiplas fotos por ciclista
- [ ] Backup automático de imagens
- [ ] CDN para melhor performance 