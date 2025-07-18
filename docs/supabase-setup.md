# Configuração do Supabase para Upload de Fotos

## Pré-requisitos

1. Acesso ao dashboard do Supabase
2. Service Role Key do projeto

## Passos para Configuração

### 1. Obter a Service Role Key

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **service_role** key (não a anon key)

### 2. Configurar Variável de Ambiente

Configure a variável de ambiente com a service role key:

```bash
# Windows (PowerShell)
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"

# Windows (CMD)
set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Linux/Mac
export SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"
```

### 3. Executar Script de Configuração

```bash
npm run setup-supabase
```

Este script irá:
- Criar o bucket "avatars" se não existir
- Configurar políticas de acesso para upload e leitura
- Permitir que usuários autenticados façam upload de suas fotos
- Permitir leitura pública das imagens

### 4. Verificar Configuração

Após executar o script, você deve ver mensagens como:
- ✅ Bucket "avatars" criado com sucesso!
- ✅ Política de upload configurada
- ✅ Política de leitura pública configurada
- ✅ Política de atualização configurada
- ✅ Política de exclusão configurada

## Estrutura do Bucket

O bucket "avatars" será configurado com:
- **Acesso público**: Sim
- **Tipos de arquivo permitidos**: JPEG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB
- **Políticas de segurança**: Apenas usuários autenticados podem fazer upload

## Testando o Upload

1. Acesse a página de perfil (`/profile`)
2. Clique em "Carregar Nova Foto"
3. Selecione uma imagem
4. Verifique se a foto é exibida corretamente
5. Teste a remoção da foto

## Solução de Problemas

### Erro: "Bucket not found"
- Execute o script de configuração novamente
- Verifique se a service role key está correta

### Erro: "Policy already exists"
- Este é um aviso normal, as políticas já existem
- O sistema continuará funcionando normalmente

### Erro: "Permission denied"
- Verifique se o usuário está autenticado
- Confirme se as políticas foram criadas corretamente

### Foto não aparece após upload
- Verifique se o bucket está público
- Confirme se a política de leitura pública foi criada
- Verifique o console do navegador para erros

## Configuração Manual (Alternativa)

Se preferir configurar manualmente:

1. **Criar Bucket**:
   - Vá em Storage no dashboard do Supabase
   - Clique em "New bucket"
   - Nome: "avatars"
   - Marque "Public bucket"

2. **Configurar Políticas**:
   - Vá em Storage > Policies
   - Adicione políticas para INSERT, SELECT, UPDATE, DELETE
   - Configure para usuários autenticados

3. **Configurar RLS**:
   - Ative Row Level Security no bucket
   - Configure políticas específicas para cada operação 