# 🚀 Plataforma de Gestão para Grupos de Networking

Sistema completo para digitalizar e otimizar a gestão de grupos de networking, eliminando planilhas e controles manuais, através de uma solução integrada, responsiva, em tempo real e altamente performática.

## 📋 Índice

- [Características](#-características)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Documentação Adicional](#-documentação-adicional)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## ✨ Características

- ✅ **Gestão de Membros**: Fluxo completo de admissão (intenção → aprovação → cadastro)
- ✅ **Sistema de Indicações**: Criação e acompanhamento de indicações de negócios entre membros
- ✅ **UI Otimista**: Feedback instantâneo para melhor experiência do usuário
- ✅ **Realtime Refetch**: Atualizações automáticas em tempo real
- ✅ **Mobile First**: Design responsivo e otimizado para todos os dispositivos
- ✅ **Clean Architecture**: Código organizado em camadas bem definidas
- ✅ **Testes Automatizados**: Cobertura de testes unitários e de integração
- ✅ **TypeScript Strict**: Tipagem forte para maior segurança e produtividade

## 🛠 Stack Tecnológica

### Frontend
- **Next.js 16.0.1** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **TailwindCSS 4** - Estilização utilitária
- **ShadCN/UI** - Componentes UI reutilizáveis
- **Framer Motion 12.23.24** - Animações
- **TanStack Query 5.90.7** - Gerenciamento de estado assíncrono
- **React Hook Form 7.66.0** - Gerenciamento de formulários
- **Zod 4.1.12** - Validação de schemas

### Backend
- **Next.js API Routes** - API REST integrada
- **MongoDB 7.0.0** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB

### Testes
- **Jest 30.2.0** - Framework de testes
- **React Testing Library 16.3.0** - Testes de componentes
- **@faker-js/faker 10.1.0** - Geração de dados fake (pt_BR)

### Ferramentas
- **Husky 9.1.7** - Git hooks
- **ESLint** - Linter
- **Prettier** - Formatador de código

## 📦 Pré-requisitos

- **Node.js** >= 22.x (LTS recomendado)
- **pnpm** >= 10.19.0 (obrigatório)
- **MongoDB** (local ou MongoDB Atlas)
- **Git**

## 🚀 Instalação

### Passo 1: Clone o Repositório

```bash
git clone <repository-url>
cd prova-tecnica-nextjs
```

### Passo 2: Instale o pnpm (se ainda não tiver)

O projeto utiliza `pnpm` como gerenciador de pacotes. Se você ainda não tem o pnpm instalado:

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Verifique a instalação:
```bash
pnpm --version
# Deve retornar >= 10.19.0
```

### Passo 3: Instale as Dependências

```bash
pnpm install
```

Este comando irá:
- Instalar todas as dependências listadas no `package.json`
- Criar o arquivo `pnpm-lock.yaml` com as versões exatas
- Configurar os hooks do Husky (se aplicável)

**Nota**: Se encontrar erros de permissão no Windows, execute o terminal como Administrador.

### Passo 4: Configure as Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# No Linux/macOS
cp .env.example .env.local

# No Windows (PowerShell)
Copy-Item .env.example .env.local
```

**Importante**: Se o arquivo `.env.example` não existir, crie o `.env.local` manualmente com o seguinte conteúdo:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/ag-sistemas
# OU para MongoDB local:
# MONGODB_URI=mongodb://localhost:27017/ag-sistemas

# Database Name (opcional, pode estar na URI)
MONGODB_DB_NAME=ag-sistemas

# Admin Authentication
ADMIN_TOKEN=seu_token_secreto_super_seguro_aqui

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Configuration (Obrigatório para autenticação)
JWT_SECRET=seu_jwt_secret_super_seguro_minimo_32_caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**⚠️ Segurança**: 
- Nunca commite o arquivo `.env.local` no Git
- Use valores seguros e únicos para `ADMIN_TOKEN` e `JWT_SECRET`
- Em produção, use variáveis de ambiente do servidor/hosting

### Passo 5: Configure o MongoDB

#### Opção A: MongoDB Atlas (Recomendado para desenvolvimento e produção)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita (se não tiver)
3. Crie um novo cluster (Free tier disponível)
4. Configure um usuário de banco de dados
5. Configure a Network Access (adicione `0.0.0.0/0` para desenvolvimento ou IP específico para produção)
6. Obtenha a connection string no botão "Connect"
7. Cole a connection string no `.env.local` como `MONGODB_URI`

#### Opção B: MongoDB Local

1. Instale o MongoDB localmente:
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Baixe do [site oficial](https://www.mongodb.com/try/download/community)
   - **Linux**: `sudo apt-get install mongodb`

2. Inicie o MongoDB:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # OU
   mongod --config /usr/local/etc/mongod.conf
   
   # Windows
   # Inicie o serviço MongoDB via Services
   ```

3. Use a connection string local no `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ag-sistemas
   ```

### Passo 6: Execute o Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor irá:
- Compilar o projeto Next.js
- Iniciar na porta 3000 (ou próxima disponível)
- Conectar ao MongoDB
- Habilitar hot-reload para desenvolvimento

**Saída esperada**:
```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 1.2s
✓ Compiled /api/intentions in 0.8s
✓ Compiled /api/members in 0.6s
```

### Passo 7: Acesse a Aplicação

Abra seu navegador e acesse:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/api/members](http://localhost:3000/api/members) (requer autenticação)

## 🏃 Execução

### Modo Desenvolvimento

```bash
pnpm dev
```

Características:
- Hot-reload automático
- Source maps para debugging
- Erros detalhados no console
- Fast Refresh do React

### Modo Produção (Local)

```bash
# 1. Build do projeto
pnpm build

# 2. Inicie o servidor de produção
pnpm start
```

**Nota**: O build de produção é otimizado e minificado. Use apenas para testar antes do deploy.

### Verificação de Saúde do Sistema

Após iniciar o servidor, verifique se tudo está funcionando:

1. **Conexão MongoDB**: Verifique os logs do servidor por "Conectado ao MongoDB com sucesso!"
2. **API Routes**: Acesse `http://localhost:3000/api/members` (deve retornar JSON, mesmo que vazio)
3. **Frontend**: Acesse `http://localhost:3000` (deve carregar a página inicial)

## ⚙️ Configuração Detalhada

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório | Exemplo |
|----------|-----------|-------------|---------|
| `MONGODB_URI` | URI completa de conexão do MongoDB (inclui credenciais e database) | ✅ Sim | `mongodb+srv://user:pass@cluster.mongodb.net/ag-sistemas` |
| `MONGODB_DB_NAME` | Nome do banco de dados (opcional se estiver na URI) | ⚠️ Opcional | `ag-sistemas` |
| `ADMIN_TOKEN` | Token secreto para autenticação administrativa (use um valor seguro) | ✅ Sim | `admin_secret_token_123456` |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação (usado para links e redirecionamentos) | ✅ Sim | `http://localhost:3000` |
| `JWT_SECRET` | Secret para assinatura de tokens JWT (mínimo 32 caracteres) | ✅ Sim | `meu_jwt_secret_super_seguro_123456789` |
| `JWT_ACCESS_EXPIRES_IN` | Tempo de expiração do access token (padrão: 15m) | ⚠️ Opcional | `15m`, `1h`, `30m` |
| `JWT_REFRESH_EXPIRES_IN` | Tempo de expiração do refresh token (padrão: 7d) | ⚠️ Opcional | `7d`, `30d`, `14d` |

### Geração de Tokens Seguros

Para gerar tokens seguros, você pode usar:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Online (use apenas para desenvolvimento)
# https://randomkeygen.com/
```

### Configuração do MongoDB

#### MongoDB Atlas (Recomendado)

1. **Criar Cluster**:
   - Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crie um cluster gratuito (M0)
   - Escolha a região mais próxima

2. **Configurar Acesso**:
   - **Database Access**: Crie um usuário com senha forte
   - **Network Access**: Adicione `0.0.0.0/0` para desenvolvimento ou IP específico para produção

3. **Obter Connection String**:
   - Clique em "Connect" no cluster
   - Escolha "Connect your application"
   - Copie a connection string
   - Substitua `<password>` pela senha do usuário criado
   - Adicione o nome do banco: `mongodb+srv://user:pass@cluster.mongodb.net/ag-sistemas`

#### MongoDB Local

Para desenvolvimento local:

```bash
# Instalar MongoDB
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Iniciar MongoDB
brew services start mongodb-community

# Verificar status
brew services list
```

Connection string local:
```env
MONGODB_URI=mongodb://localhost:27017/ag-sistemas
```

### Estrutura do Banco de Dados

O sistema cria automaticamente as seguintes coleções:

- `members` - Membros do grupo
- `intentions` - Intenções de participação
- `invites` - Convites de cadastro
- `referrals` - Indicações de negócios
- `meetings` - Reuniões 1:1
- `notices` - Avisos e comunicados
- `obrigados` - Agradecimentos públicos

**Nota**: As coleções são criadas automaticamente na primeira inserção de dados.

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento com hot-reload
pnpm dev

# Cria build de produção (otimizado e minificado)
pnpm build

# Inicia servidor de produção (após build)
pnpm start
```

### Testes

```bash
# Executa todos os testes uma vez
pnpm test

# Executa testes em modo watch (re-executa ao salvar arquivos)
pnpm test:watch

# Executa testes com relatório de cobertura
pnpm test:coverage

# Executa apenas testes unitários
pnpm test:unit

# Executa testes de integração
pnpm test:integration
```

### Qualidade de Código

```bash
# Verifica erros de linting
pnpm lint

# Corrige automaticamente erros de linting (quando possível)
pnpm lint --fix

# Verifica tipos TypeScript sem compilar
pnpm typecheck

# Executa todas as verificações (typecheck + lint + test)
# Útil para CI/CD
pnpm ci:checks
```

### Utilitários

```bash
# Limpa cache e arquivos de build
rm -rf .next node_modules

# Reinstala dependências (útil após problemas)
rm -rf node_modules pnpm-lock.yaml && pnpm install
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rotas públicas
│   │   ├── intention/     # Formulário de intenção
│   │   └── register/       # Cadastro completo
│   ├── (admin)/           # Rotas administrativas
│   │   ├── intents/       # Gestão de intenções
│   │   └── referrals/   # Gestão de indicações
│   ├── api/               # API Routes
│   │   ├── intentions/    # Endpoints de intenções
│   │   ├── invites/       # Endpoints de convites
│   │   ├── members/       # Endpoints de membros
│   │   └── referrals/     # Endpoints de indicações
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Homepage
│   └── providers.tsx       # Providers (React Query, Toast)
│
├── components/            # Componentes React
│   ├── ui/                # Componentes atômicos (Button, Input, Dialog, etc.)
│   ├── features/          # Componentes de features (IntentionForm, ReferralList, etc.)
│   └── layouts/           # Layouts reutilizáveis
│
├── hooks/                 # Custom Hooks
│   ├── useIntentions.ts   # Hook para intenções
│   └── useReferrals.ts    # Hook para indicações
│
├── services/              # Camada de Aplicação
│   ├── IntentionService.ts
│   ├── InviteService.ts
│   ├── MemberService.ts
│   └── ReferralService.ts
│
├── lib/                   # Infraestrutura
│   ├── mongodb.ts         # Conexão MongoDB
│   ├── repositories/      # Repositórios de dados
│   └── utils.ts           # Utilitários
│
├── types/                 # Tipos TypeScript
│   ├── intention.ts
│   ├── member.ts
│   ├── invite.ts
│   └── referral.ts
│
└── tests/                 # Helpers de teste
    ├── helpers/           # Faker, seeders
    ├── unit/              # Testes unitários
    └── integration/       # Testes de integração
```

## 🏗 Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Clean Code**:

### Camadas

1. **Presentation** (`app/`, `components/`)
   - UI e rotas
   - Componentes React
   - API Routes

2. **Application** (`services/`, `hooks/`)
   - Casos de uso
   - Lógica de negócio
   - Hooks customizados

3. **Domain** (`types/`)
   - Entidades e tipos
   - Regras de negócio puras

4. **Infrastructure** (`lib/`)
   - Repositórios
   - Conexão com banco de dados
   - Utilitários

### Padrões Utilizados

- **Atomic Design**: Componentes organizados em átomos, moléculas e organismos
- **UI Otimista**: Feedback instantâneo antes da confirmação do servidor
- **Realtime Refetch**: Atualizações automáticas via TanStack Query
- **Mobile First**: Design responsivo priorizando mobile

## 🎯 Funcionalidades

### ✅ Implementadas

- **Gestão de Membros**
  - Formulário público de intenção de participação
  - Painel administrativo para aprovação/recusa
  - Sistema de convites com tokens únicos
  - Cadastro completo de membros

- **Sistema de Indicações**
  - Criação de indicações de negócios
  - Acompanhamento de status (nova, em-contato, fechada, recusada)
  - Listagem de indicações feitas e recebidas
  - Validações de negócio (auto-indicação, membros ativos)

- **Componentes UI**
  - Button, Input, Textarea, Card, Badge, Skeleton
  - Dialog/Modal, Toast/Notification, Table, Form
  - Todos com variantes e responsividade

### 🚧 Em Desenvolvimento

- Sistema de "Obrigados" (agradecimentos públicos)
- Dashboard de performance
- Sistema de avisos e comunicados
- Check-in em reuniões
- Módulo financeiro (mensalidades)

## 🧪 Testes

O projeto possui uma estratégia completa de testes:

### Cobertura Atual
- **Componentes UI**: Testes unitários completos
- **Hooks**: Testes de lógica e integração
- **API Routes**: Testes de integração

### Executar Testes

```bash
# Todos os testes
pnpm test

# Com cobertura
pnpm test:coverage

# Modo watch
pnpm test:watch
```

### Meta de Cobertura
- **Global**: ≥ 95%
- **Componentes**: ≥ 95%
- **Services**: ≥ 95%
- **Repositories**: ≥ 90%

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente no Vercel

Configure todas as variáveis do `.env.local` no painel do Vercel.

### MongoDB Atlas

Para produção, use MongoDB Atlas:
1. Crie um cluster no MongoDB Atlas
2. Configure IP whitelist
3. Obtenha a connection string
4. Configure no Vercel

Veja mais detalhes em [DEPLOY.md](./Docs/Documentation/DEPLOY.md).

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro: "MONGODB_URI não está definida"

**Solução**:
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Confirme que a variável `MONGODB_URI` está definida
- Reinicie o servidor após criar/modificar o `.env.local`

#### 2. Erro: "Cannot connect to MongoDB"

**Soluções**:
- Verifique se o MongoDB está rodando (local) ou se a connection string está correta (Atlas)
- Confirme que as credenciais estão corretas
- Verifique se o IP está na whitelist do MongoDB Atlas
- Teste a connection string no MongoDB Compass

#### 3. Erro: "JWT_SECRET não configurado"

**Solução**:
- Adicione `JWT_SECRET` no `.env.local` com pelo menos 32 caracteres
- Gere um secret seguro usando: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### 4. Erro: "Port 3000 is already in use"

**Soluções**:
```bash
# Encontre o processo usando a porta
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# OU use outra porta
PORT=3001 pnpm dev
```

#### 5. Erro: "Module not found" ou dependências faltando

**Solução**:
```bash
# Limpe e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 6. Erro de TypeScript: "Cannot find module"

**Soluções**:
- Verifique se o caminho do import está correto
- Execute `pnpm typecheck` para ver todos os erros
- Verifique se o `tsconfig.json` está configurado corretamente

#### 7. Build falha em produção

**Soluções**:
- Verifique se todas as variáveis de ambiente estão configuradas
- Execute `pnpm typecheck` e corrija erros de tipo
- Execute `pnpm lint` e corrija erros de linting
- Verifique os logs de build para erros específicos

#### 8. Testes falhando

**Soluções**:
- Execute `pnpm test:watch` para ver erros em tempo real
- Verifique se o MongoDB está acessível (alguns testes podem precisar)
- Limpe o cache do Jest: `rm -rf .jest-cache`

### Logs e Debugging

Para ver logs detalhados:

```bash
# Desenvolvimento com logs
DEBUG=* pnpm dev

# Apenas logs do MongoDB
DEBUG=mongodb:* pnpm dev
```

### Verificação de Saúde

Execute este checklist após a instalação:

- [ ] Node.js >= 22.x instalado
- [ ] pnpm >= 10.19.0 instalado
- [ ] MongoDB conectado e acessível
- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] `pnpm install` executado com sucesso
- [ ] `pnpm dev` inicia sem erros
- [ ] Página inicial carrega em `http://localhost:3000`
- [ ] API retorna resposta em `/api/members` (mesmo que vazia)

## 📚 Documentação Adicional

- **[ARQUITETURA.md](./ARQUITETURA.md)** - Diagrama de arquitetura e decisões técnicas
- **[MODELO_DADOS.md](./Docs/Documentation/MODELO_DADOS.md)** - Esquema completo do banco de dados
- **[ESTRUTURA_COMPONENTES.md](./Docs/Documentation/ESTRUTURA_COMPONENTES.md)** - Organização dos componentes React
- **[API_REFERENCE.md](./Docs/Documentation/API_REFERENCE.md)** - Referência completa da API REST
- **[CONTRIBUTING.md](./Docs/Documentation/CONTRIBUTING.md)** - Guia de contribuição
- **[DEPLOY.md](./Docs/Documentation/DEPLOY.md)** - Guia de deploy

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Importante**: 
- Siga os padrões de código do projeto
- Adicione testes para novas funcionalidades
- Mantenha a cobertura de testes ≥ 95%
- Use commits semânticos (feat, fix, docs, etc.)

Veja mais detalhes em [CONTRIBUTING.md](./Docs/Documentation/CONTRIBUTING.md).

## 📝 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ pela equipe Durch Soluções**
