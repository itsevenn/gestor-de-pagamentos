# 🚀 Configuração do Sistema de Auditoria

## ❌ Problema Atual
O sistema de auditoria não está funcionando porque a tabela `audit_logs` não foi criada no banco de dados.

## ✅ Solução Passo a Passo

### 1. 📋 Acessar o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto `gestor-de-pagamentos`

### 2. 🗄️ Executar Script SQL

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole todo o conteúdo do arquivo `create_audit_logs_table.sql`
4. Clique em **Run** para executar o script

### 3. ✅ Verificar se Funcionou

Após executar o script, você deve ver uma mensagem como:
```
status: "Tabela audit_logs criada com sucesso!"
total_logs: 1
```

### 4. 🧪 Testar o Sistema

1. **Faça login** no seu aplicativo
2. **Vá para um ciclista** e tente:
   - Upload de foto
   - Editar dados
3. **Vá para seu perfil** e tente:
   - Mudar foto
   - Atualizar dados
4. **Vá para faturas** e tente:
   - Criar nova fatura
   - Editar fatura existente

### 5. 📊 Verificar Histórico

1. Vá para a página de um ciclista
2. Clique na aba **"Histórico"**
3. Você deve ver as atividades registradas

## 🔧 Estrutura Criada

O script criará:

### 📋 Tabela `audit_logs`
- **id**: Identificador único
- **timestamp**: Data/hora da ação
- **userId**: ID do usuário que fez a ação
- **userName**: Nome do usuário
- **action**: Tipo de ação (ex: PHOTO_UPLOADED, PROFILE_UPDATED)
- **entityType**: Tipo de entidade (ex: ciclista, user, invoice)
- **entityId**: ID da entidade afetada
- **entityName**: Nome da entidade
- **details**: Descrição detalhada da ação
- **changes**: Mudanças específicas (JSON)

### 🔍 Índices de Performance
- Índice por timestamp (mais recentes primeiro)
- Índice por usuário
- Índice por entidade
- Índice por ação

### 🛡️ Políticas de Segurança (RLS)
- Usuários autenticados podem inserir logs
- Usuários autenticados podem ler logs
- Acesso público para leitura (quando necessário)

## 🎯 Ações que Serão Registradas

### 📸 Fotos de Ciclistas
- ✅ Upload de foto
- ✅ Remoção de foto
- ✅ Atualização de foto

### 👤 Perfil do Usuário
- ✅ Mudança de nome/email
- ✅ Upload de foto de perfil
- ✅ Remoção de foto de perfil

### 🧾 Faturas
- ✅ Criação de fatura
- ✅ Atualização de fatura
- ✅ Mudança de status

### 🚴 Ciclistas
- ✅ Criação de ciclista
- ✅ Atualização de dados
- ✅ Exclusão de ciclista
- ✅ Restauração de ciclista

## 🚨 Solução de Problemas

### Erro: "Tabela não existe"
- Execute o script SQL novamente
- Verifique se está no projeto correto

### Erro: "Permissão negada"
- Verifique se as políticas RLS foram criadas
- Execute o script completo

### Nenhuma atividade aparece
- Faça algumas alterações no sistema
- Aguarde alguns segundos
- Recarregue a página

## 📞 Suporte

Se ainda não funcionar após seguir estes passos:

1. Execute o script de teste: `node test_audit_system.js`
2. Verifique os logs no console do navegador
3. Confirme que a tabela foi criada no Supabase Dashboard

---

**🎉 Após seguir estes passos, todas as modificações serão automaticamente registradas no histórico de atividades!** 