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

1. **Clone o repositório**
```bash
git clone <repository-url>
cd prova-tecnica-nextjs
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGODB_DB_NAME=networking_group
ADMIN_TOKEN=seu_token_secreto_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Execute o servidor de desenvolvimento**
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `MONGODB_URI` | URI de conexão do MongoDB | Sim |
| `MONGODB_DB_NAME` | Nome do banco de dados | Sim |
| `ADMIN_TOKEN` | Token secreto para acesso administrativo | Sim |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação | Sim |
| `JWT_SECRET` | Secret para tokens JWT (futuro) | Não |
| `JWT_EXPIRES_IN` | Tempo de expiração do JWT (futuro) | Não |

### MongoDB

O projeto utiliza MongoDB como banco de dados. Você pode usar:
- **MongoDB Atlas** (recomendado para produção)
- **MongoDB local** (para desenvolvimento)

Certifique-se de que a string de conexão está correta no `.env.local`.

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento
pnpm build            # Cria build de produção
pnpm start            # Inicia servidor de produção

# Testes
pnpm test             # Executa todos os testes
pnpm test:watch       # Executa testes em modo watch
pnpm test:coverage    # Executa testes com cobertura
pnpm test:unit        # Executa apenas testes unitários
pnpm test:e2e         # Executa testes E2E (Cypress)

# Qualidade
pnpm lint             # Executa ESLint
pnpm typecheck        # Verifica tipos TypeScript
pnpm ci:checks        # Executa todas as verificações (typecheck + lint + test)
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

## 📚 Documentação Adicional

- **[Documentacao.md](./Documentacao.md)** - Documentação técnica completa
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
