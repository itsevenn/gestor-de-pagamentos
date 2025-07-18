# Gestor de Pagamentos - Sistema para Ciclistas

Sistema completo de gestão de pagamentos desenvolvido especificamente para ciclistas, com funcionalidades de autenticação, gestão de clientes, faturas, relatórios e perfil de usuário.

## 🚀 Funcionalidades

- **Autenticação Segura**: Sistema de login/logout com Supabase Auth
- **Gestão de Clientes**: Cadastro, edição e histórico de clientes
- **Faturas**: Criação e gerenciamento de faturas
- **Relatórios**: Análises e relatórios de pagamentos
- **Perfil de Usuário**: Upload e gestão de foto de perfil
- **Interface Responsiva**: Design moderno e acessível
- **Modo Escuro/Claro**: Suporte a temas

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage (para fotos de perfil)
- **Formulários**: React Hook Form + Zod
- **Notificações**: Toast notifications

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd gestor-de-pagamentos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Copie o arquivo de exemplo
cp env.example .env.local

# Edite o arquivo .env.local com suas configurações
```

4. **Configure o Supabase**
```bash
# Configure a variável de ambiente com sua service role key
$env:SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key_aqui"

# Execute o script de configuração
npm run setup-supabase
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🔧 Configuração do Supabase

### Pré-requisitos
- Conta no Supabase
- Projeto criado no Supabase

### Passos
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Settings** > **API**
3. Copie a **service_role** key
4. Configure como variável de ambiente: `SUPABASE_SERVICE_ROLE_KEY`
5. Execute: `npm run setup-supabase`

Para mais detalhes, consulte: [docs/supabase-setup.md](docs/supabase-setup.md)

## 📱 Como Usar

### Autenticação
1. Acesse a página de login
2. Use suas credenciais do Supabase
3. O sistema redirecionará para o dashboard

### Upload de Foto de Perfil
1. Acesse **Perfil** no menu
2. Clique em **"Carregar Nova Foto"**
3. Selecione uma imagem (máx. 5MB)
4. A foto será salva automaticamente

### Gestão de Clientes
1. Acesse **Clientes** no menu
2. Clique em **"Novo Cliente"** para adicionar
3. Use os botões de ação para editar/excluir

### Faturas
1. Acesse **Faturas** no menu
2. Clique em **"Nova Fatura"** para criar
3. Preencha os dados do cliente e valores
4. Gere PDF ou envie por email

## 🎨 Personalização

### Temas
- O sistema suporta modo claro e escuro
- Acesse **Configurações** para alterar

### Cores
- As cores podem ser personalizadas no arquivo `tailwind.config.ts`
- Use as variáveis CSS para consistência

## 🔒 Segurança

- Autenticação via Supabase Auth
- Tokens JWT seguros
- Validação de formulários com Zod
- Sanitização de dados
- HTTPS obrigatório em produção

## 📊 Relatórios

- Dashboard com métricas principais
- Relatórios de pagamentos por período
- Exportação de dados
- Gráficos interativos

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Netlify
- Railway
- Heroku

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Verifique os logs do console

## 🔄 Changelog

### v1.0.0
- Sistema inicial de gestão de pagamentos
- Autenticação com Supabase
- Upload de fotos de perfil
- Interface responsiva e acessível
- Relatórios e dashboard
