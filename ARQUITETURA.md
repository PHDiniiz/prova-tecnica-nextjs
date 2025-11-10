# 🏗 Arquitetura do Sistema

Este documento descreve a arquitetura completa da Plataforma de Gestão para Grupos de Networking, incluindo os principais componentes, fluxos de comunicação e decisões arquiteturais.

## 📊 Diagrama de Arquitetura Geral

```mermaid
graph TB
    subgraph "Cliente"
        Browser[🌐 Navegador]
        Mobile[📱 Dispositivo Mobile]
    end

    subgraph "Frontend - Next.js 16 App Router"
        AppRouter[App Router]
        Pages[Páginas]
        Components[Componentes React]
        Hooks[Custom Hooks]
        Services[Services Layer]
        Providers[Providers<br/>React Query + Toast]
    end

    subgraph "Backend - Next.js API Routes"
        APIRoutes[API Routes]
        AuthAPI[Auth Endpoints<br/>/api/auth/*]
        BusinessAPI[Business Endpoints<br/>/api/*]
        AuthLib[Auth Library<br/>JWT + Admin Token]
        ErrorHandler[Error Handler]
    end

    subgraph "Application Layer"
        IntentionService[IntentionService]
        MemberService[MemberService]
        ReferralService[ReferralService]
        MeetingService[MeetingService]
        NoticeService[NoticeService]
        ObrigadoService[ObrigadoService]
        DashboardService[DashboardService]
        InviteService[InviteService]
    end

    subgraph "Infrastructure Layer"
        Repositories[Repositories]
        MongoDBConn[MongoDB Connection<br/>Connection Pooling]
        Utils[Utils]
    end

    subgraph "Database - MongoDB"
        MembersCollection[(members)]
        IntentionsCollection[(intentions)]
        InvitesCollection[(invites)]
        ReferralsCollection[(referrals)]
        MeetingsCollection[(meetings)]
        NoticesCollection[(notices)]
        ObrigadosCollection[(obrigados)]
    end

    Browser --> AppRouter
    Mobile --> AppRouter
    AppRouter --> Pages
    Pages --> Components
    Components --> Hooks
    Hooks --> Services
    Components --> Providers
    Providers --> Services
    Services --> APIRoutes
    APIRoutes --> AuthAPI
    APIRoutes --> BusinessAPI
    AuthAPI --> AuthLib
    BusinessAPI --> AuthLib
    BusinessAPI --> ErrorHandler
    BusinessAPI --> IntentionService
    BusinessAPI --> MemberService
    BusinessAPI --> ReferralService
    BusinessAPI --> MeetingService
    BusinessAPI --> NoticeService
    BusinessAPI --> ObrigadoService
    BusinessAPI --> DashboardService
    BusinessAPI --> InviteService
    IntentionService --> Repositories
    MemberService --> Repositories
    ReferralService --> Repositories
    MeetingService --> Repositories
    NoticeService --> Repositories
    ObrigadoService --> Repositories
    DashboardService --> Repositories
    InviteService --> Repositories
    Repositories --> MongoDBConn
    MongoDBConn --> MembersCollection
    MongoDBConn --> IntentionsCollection
    MongoDBConn --> InvitesCollection
    MongoDBConn --> ReferralsCollection
    MongoDBConn --> MeetingsCollection
    MongoDBConn --> NoticesCollection
    MongoDBConn --> ObrigadosCollection

    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style AppRouter fill:#c8e6c9
    style Components fill:#c8e6c9
    style APIRoutes fill:#fff9c4
    style AuthLib fill:#ffccbc
    style MongoDBConn fill:#f3e5f5
    style MembersCollection fill:#e8f5e9
    style IntentionsCollection fill:#e8f5e9
    style ReferralsCollection fill:#e8f5e9
```

## 🔄 Fluxo de Autenticação JWT

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant Frontend as Frontend
    participant AuthAPI as /api/auth/login
    participant AuthLib as Auth Library
    participant MemberRepo as Member Repository
    participant MongoDB as MongoDB

    Client->>Frontend: 1. Submete credenciais
    Frontend->>AuthAPI: 2. POST /api/auth/login
    AuthAPI->>MemberRepo: 3. Busca membro por email
    MemberRepo->>MongoDB: 4. Query members collection
    MongoDB-->>MemberRepo: 5. Retorna membro
    MemberRepo-->>AuthAPI: 6. Dados do membro
    AuthAPI->>AuthLib: 7. Gera Access Token (15min)
    AuthAPI->>AuthLib: 8. Gera Refresh Token (7d)
    AuthLib-->>AuthAPI: 9. Tokens JWT
    AuthAPI-->>Frontend: 10. { accessToken, refreshToken }
    Frontend->>Client: 11. Armazena tokens

    Note over Client,MongoDB: Tokens são enviados em<br/>cada requisição via<br/>Authorization: Bearer {token}

    Client->>Frontend: 12. Requisição autenticada
    Frontend->>AuthAPI: 13. GET /api/referrals<br/>Authorization: Bearer {token}
    AuthAPI->>AuthLib: 14. Verifica token
    AuthLib-->>AuthAPI: 15. Token válido + membroId
    AuthAPI->>MemberRepo: 16. Busca dados do membro
    AuthAPI-->>Frontend: 17. Dados protegidos
```

## 🏛 Camadas da Aplicação (Clean Architecture)

```mermaid
graph LR
    subgraph "Presentation Layer"
        UI[UI Components]
        Pages[Pages/App Router]
        API[API Routes]
    end

    subgraph "Application Layer"
        Services[Services]
        Hooks[Custom Hooks]
        DTOs[DTOs]
    end

    subgraph "Domain Layer"
        Types[Types/Interfaces]
        BusinessRules[Business Rules]
        Entities[Entities]
    end

    subgraph "Infrastructure Layer"
        Repos[Repositories]
        MongoDB[MongoDB Connection]
        Utils[Utils]
        Auth[Auth Library]
    end

    UI --> Pages
    Pages --> API
    API --> Services
    Services --> Hooks
    Services --> DTOs
    Services --> Types
    Services --> BusinessRules
    Services --> Repos
    Repos --> MongoDB
    API --> Auth
    Auth --> Utils

    style UI fill:#c8e6c9
    style Services fill:#fff9c4
    style Types fill:#e1bee7
    style Repos fill:#ffccbc
```

## 🔐 Fluxo de Autorização

```mermaid
graph TD
    Request[Requisição HTTP]
    Request --> CheckAuth{Verifica<br/>Autenticação}
    CheckAuth -->|Sem Token| Unauthorized[401 Unauthorized]
    CheckAuth -->|Com Token| VerifyToken{Verifica<br/>Token JWT}
    VerifyToken -->|Token Inválido| Unauthorized
    VerifyToken -->|Token Válido| CheckRole{Verifica<br/>Role/Admin}
    CheckRole -->|Admin Required| CheckAdminToken{Verifica<br/>ADMIN_TOKEN}
    CheckAdminToken -->|Token Inválido| Forbidden[403 Forbidden]
    CheckAdminToken -->|Token Válido| ProcessRequest[Processa Requisição]
    CheckRole -->|Member Access| ExtractMemberId[Extrai membroId]
    ExtractMemberId --> ProcessRequest
    ProcessRequest --> Service[Service Layer]
    Service --> Repository[Repository]
    Repository --> MongoDB[(MongoDB)]
    MongoDB --> Response[Resposta JSON]

    style Unauthorized fill:#ffcdd2
    style Forbidden fill:#ffccbc
    style ProcessRequest fill:#c8e6c9
    style Response fill:#e1f5ff
```

## 📦 Fluxo de Dados - Criação de Indicação

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Component as ReferralForm
    participant Hook as useReferrals
    participant Service as ReferralService
    participant Repo as ReferralRepository
    participant MongoDB as MongoDB

    User->>Component: 1. Preenche formulário
    Component->>Hook: 2. createReferral(mutation)
    Hook->>Service: 3. criarIndicacao(membroId, dados)
    Service->>Service: 4. Valida regras de negócio
    Service->>Repo: 5. criarIndicacao(dados)
    Repo->>MongoDB: 6. insertOne(referral)
    MongoDB-->>Repo: 7. Confirma inserção
    Repo-->>Service: 8. Referral criada
    Service-->>Hook: 9. Retorna referral
    Hook->>Hook: 10. Invalida queries relacionadas
    Hook-->>Component: 11. Success callback
    Component->>User: 12. Toast de sucesso + UI otimista
```

## 🔄 Fluxo de Estado Global (React Query)

```mermaid
graph TB
    subgraph "React Query State Management"
        QueryClient[QueryClient<br/>Configuração Global]
        Queries[Queries<br/>GET Requests]
        Mutations[Mutations<br/>POST/PATCH/DELETE]
        Cache[Cache Layer]
    end

    subgraph "Custom Hooks"
        useIntentions[useIntentions]
        useReferrals[useReferrals]
        useMeetings[useMeetings]
        useNotices[useNotices]
        useObrigados[useObrigados]
        useDashboard[useDashboard]
    end

    subgraph "Refetch Strategies"
        OnFocus[Refetch on Window Focus]
        OnMount[Refetch on Mount]
        OnInterval[Refetch on Interval]
        Manual[Manual Invalidation]
    end

    QueryClient --> Queries
    QueryClient --> Mutations
    Queries --> Cache
    Mutations --> Cache
    useIntentions --> Queries
    useReferrals --> Queries
    useMeetings --> Queries
    useNotices --> Queries
    useObrigados --> Queries
    useDashboard --> Queries
    Queries --> OnFocus
    Queries --> OnMount
    Mutations --> Manual

    style QueryClient fill:#fff9c4
    style Cache fill:#e1f5ff
    style OnFocus fill:#c8e6c9
```

## 🗄 Estrutura de Dados e Relacionamentos

```mermaid
erDiagram
    INTENTION ||--o| INVITE : "gera"
    INTENTION ||--o| MEMBER : "aprovada cria"
    INVITE ||--|| MEMBER : "usado para criar"
    MEMBER ||--o{ REFERRAL : "faz indicações"
    MEMBER ||--o{ REFERRAL : "recebe indicações"
    REFERRAL ||--o| OBRIGADO : "gera agradecimento"
    MEMBER ||--o{ MEETING : "participa"
    MEMBER ||--o{ MEETING : "participa"
    
    INTENTION {
        string _id PK
        string nome
        string email
        string empresa
        string motivo
        enum status
        date criadoEm
        date atualizadoEm
    }
    
    INVITE {
        string _id PK
        string token UK
        string intencaoId FK
        boolean usado
        date expiraEm
        date criadoEm
    }
    
    MEMBER {
        string _id PK
        string nome
        string email UK
        string empresa
        string intencaoId FK
        boolean ativo
        date criadoEm
        date atualizadoEm
    }
    
    REFERRAL {
        string _id PK
        string membroIndicadorId FK
        string membroIndicadoId FK
        string empresaContato
        string descricao
        enum status
        number valorEstimado
        date criadoEm
        date atualizadoEm
    }
    
    MEETING {
        string _id PK
        string membro1Id FK
        string membro2Id FK
        date dataReuniao
        array checkIns
        date criadoEm
        date atualizadoEm
    }
    
    NOTICE {
        string _id PK
        string titulo
        string conteudo
        enum tipo
        boolean ativo
        date criadoEm
        date atualizadoEm
    }
    
    OBRIGADO {
        string _id PK
        string indicacaoId FK
        string membroIndicadorId FK
        string membroIndicadoId FK
        string mensagem
        boolean publico
        date criadoEm
    }
```

## 🚀 Fluxo Completo: Intenção → Membro

```mermaid
flowchart TD
    Start[Usuário acessa<br/>Formulário de Intenção]
    Start --> Submit[Submete Intenção]
    Submit --> CreateIntention[POST /api/intentions]
    CreateIntention --> SaveIntention[(Salva em<br/>intentions)]
    SaveIntention --> AdminReview[Admin revisa<br/>no painel]
    AdminReview --> Approve{Admin<br/>aprova?}
    Approve -->|Não| Reject[Status: rejected]
    Approve -->|Sim| CreateInvite[POST /api/invites]
    CreateInvite --> SaveInvite[(Salva em<br/>invites)]
    SaveInvite --> SendToken[Gera token único]
    SendToken --> UserRegister["Usuário acessa<br/>/register/[token]"]
    UserRegister --> ValidateToken["GET /api/invites/[token]"]
    ValidateToken --> Valid{Token<br/>válido?}
    Valid -->|Não| InvalidToken[Token inválido<br/>ou expirado]
    Valid -->|Sim| ShowForm[Exibe formulário<br/>de cadastro]
    ShowForm --> SubmitMember[POST /api/members]
    SubmitMember --> SaveMember[(Salva em<br/>members)]
    SaveMember --> MarkInviteUsed[Marca invite<br/>como usado]
    MarkInviteUsed --> Success[Membro criado<br/>com sucesso]

    style Start fill:#e1f5ff
    style SaveIntention fill:#c8e6c9
    style SaveInvite fill:#c8e6c9
    style SaveMember fill:#c8e6c9
    style Success fill:#4caf50
    style InvalidToken fill:#ffcdd2
    style Reject fill:#ffccbc
```

## 📱 Responsividade e Mobile First

```mermaid
graph TB
    subgraph "Design Strategy"
        MobileFirst[Mobile First Approach]
        Responsive[Responsive Design]
        TailwindCSS[TailwindCSS Utilities]
        ShadCN[ShadCN/UI Components]
    end

    subgraph "Breakpoints"
        SM[sm: 640px]
        MD[md: 768px]
        LG[lg: 1024px]
        XL[xl: 1280px]
    end

    subgraph "Componentes Adaptativos"
        Button[Button<br/>Tamanhos: sm, md, lg]
        Card[Card<br/>Padding responsivo]
        Table[Table<br/>Scroll horizontal]
        Form[Form<br/>Layout adaptativo]
    end

    MobileFirst --> Responsive
    Responsive --> TailwindCSS
    TailwindCSS --> ShadCN
    ShadCN --> Button
    ShadCN --> Card
    ShadCN --> Table
    ShadCN --> Form
    Button --> SM
    Card --> MD
    Table --> LG
    Form --> XL

    style MobileFirst fill:#c8e6c9
    style TailwindCSS fill:#fff9c4
    style ShadCN fill:#e1f5ff
```

## 📡 Definição da API

A API REST foi projetada seguindo os princípios RESTful, com endpoints claros, métodos HTTP apropriados e respostas padronizadas. Abaixo estão os principais endpoints implementados:

### Autenticação

A API utiliza dois tipos de autenticação:
- **JWT (JSON Web Token)**: Para membros autenticados (access token válido por 15 minutos, refresh token por 7 dias)
- **Admin Token**: Para operações administrativas (token configurado via variável de ambiente `ADMIN_TOKEN`)

### Formato de Resposta Padrão

Todas as respostas seguem o formato:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}
```

### Principais Endpoints

#### 1. POST /api/intentions

Cria uma nova intenção de participação no grupo (endpoint público).

**Autenticação**: Não requerida (público)

**Request Body**:
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "empresa": "Empresa XYZ",
  "cargo": "Diretor Comercial",
  "motivo": "Desejo participar do grupo para expandir minha rede de contatos..."
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "empresa": "Empresa XYZ",
    "cargo": "Diretor Comercial",
    "motivo": "Desejo participar do grupo...",
    "status": "pending",
    "criadoEm": "2025-01-27T10:00:00.000Z"
  },
  "message": "Intenção criada com sucesso! Aguarde a análise do administrador."
}
```

**Validações**:
- `nome`: 2-100 caracteres
- `email`: Email válido e único
- `empresa`: 2-100 caracteres
- `motivo`: 10-500 caracteres

**Erros**:
- `400`: Dados inválidos (validação Zod)
- `409`: Email já cadastrado
- `500`: Erro interno do servidor

---

#### 2. GET /api/intentions

Lista todas as intenções submetidas (apenas para administradores).

**Autenticação**: Admin Token (requer `ADMIN_TOKEN` no header)

**Query Parameters**:
- `status` (opcional): Filtro por status (`pending` | `approved` | `rejected`)
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Itens por página (default: 20)

**Headers**:
```
Authorization: Bearer {ADMIN_TOKEN}
```

**Request Example**:
```
GET /api/intentions?status=pending&page=1&limit=20
Authorization: Bearer {ADMIN_TOKEN}
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "empresa": "Empresa XYZ",
      "status": "pending",
      "criadoEm": "2025-01-27T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Erros**:
- `401`: Token de autenticação ausente ou inválido
- `500`: Erro interno do servidor

---

#### 3. POST /api/referrals

Cria uma nova indicação de negócio entre membros (requer autenticação JWT).

**Autenticação**: JWT (requer access token no header)

**Request Body**:
```json
{
  "membroIndicadoId": "507f1f77bcf86cd799439013",
  "empresaContato": "Empresa ABC",
  "descricao": "Indicação de cliente potencial interessado em serviços de consultoria...",
  "valorEstimado": 50000,
  "observacoes": "Cliente está em fase de decisão, contato preferencial via email"
}
```

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "membroIndicadorId": "507f1f77bcf86cd799439012",
    "membroIndicadoId": "507f1f77bcf86cd799439013",
    "empresaContato": "Empresa ABC",
    "descricao": "Indicação de cliente potencial...",
    "valorEstimado": 50000,
    "status": "nova",
    "criadoEm": "2025-01-27T10:00:00.000Z"
  },
  "message": "Indicação criada com sucesso"
}
```

**Validações**:
- `membroIndicadoId`: ID válido de membro ativo
- `empresaContato`: 2-100 caracteres
- `descricao`: 10-1000 caracteres
- `valorEstimado`: Opcional, entre 1000 e 10000000

**Regras de Negócio**:
- Não permite auto-indicação (membro não pode indicar a si mesmo)
- Membro indicador e indicado devem estar ativos
- Membro indicado deve existir no sistema

**Erros**:
- `401`: Token de autenticação ausente ou inválido
- `400`: Dados inválidos (validação Zod)
- `403`: Membro inativo
- `404`: Membro indicado não encontrado
- `409`: Tentativa de auto-indicação
- `500`: Erro interno do servidor

---

#### 4. GET /api/referrals

Lista indicações do membro autenticado (feitas e recebidas).

**Autenticação**: JWT (requer access token no header)

**Query Parameters**:
- `tipo` (opcional): Tipo de indicações (`feitas` | `recebidas` | `ambas`, default: `ambas`)
- `status` (opcional): Filtro por status (`nova` | `em-contato` | `fechada` | `recusada`)
- `page` (opcional): Número da página (default: 1)
- `limit` (opcional): Itens por página (default: 20, max: 100)

**Response 200**: Lista paginada de indicações (feitas e recebidas)

---

#### 5. PATCH /api/referrals/[id]/status

Atualiza o status de uma indicação (apenas o membro indicado pode atualizar).

**Autenticação**: JWT (requer access token no header)

**Request Body**:
```json
{
  "status": "em-contato"
}
```

**Transições Válidas**:
- `nova` → `em-contato` ou `recusada`
- `em-contato` → `fechada` ou `recusada`
- `fechada` → (status final, não pode ser alterado)
- `recusada` → (status final, não pode ser alterado)

**Response 200**: Indicação atualizada

---

#### 6. POST /api/members

Cria um novo membro usando token de convite válido.

**Autenticação**: Não requerida (mas requer token de convite válido no body)

**Request Body**:
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "empresa": "Empresa XYZ",
  "token": "uuid-do-convite"
}
```

**Response 201**: Membro criado

---

#### 7. GET /api/members

Lista todos os membros (apenas para administradores).

**Autenticação**: Admin Token (requer `ADMIN_TOKEN` no header)

**Query Parameters**:
- `ativos` (opcional, boolean): Se `true`, retorna apenas membros ativos

**Response 200**: Lista de membros

---

### Outros Endpoints

- **POST /api/invites**: Cria convite para cadastro (apenas admin)
- **GET /api/invites/[token]**: Valida token de convite
- **POST /api/auth/login**: Autentica membro e retorna tokens JWT
- **POST /api/auth/refresh**: Renova access token usando refresh token
- **POST /api/auth/logout**: Invalida access token (logout seguro)

Para documentação completa de todos os endpoints, consulte [API_REFERENCE.md](./Docs/Documentation/API_REFERENCE.md).

## 🔧 Tecnologias e Ferramentas

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
- **Mongoose** - ODM para MongoDB (não utilizado diretamente, apenas MongoDB driver nativo)

### Autenticação
- **JWT (jsonwebtoken)** - Tokens de acesso e refresh
- **Admin Token** - Autenticação administrativa simples

### Testes
- **Jest 30.2.0** - Framework de testes
- **React Testing Library 16.3.0** - Testes de componentes
- **@faker-js/faker 10.1.0** - Geração de dados fake

## 🎯 Decisões Arquiteturais

### 1. Next.js App Router
- **Justificativa**: App Router do Next.js 16 oferece Server Components, melhor performance e SEO
- **Benefícios**: Renderização no servidor, code splitting automático, rotas aninhadas

### 2. MongoDB (NoSQL)
- **Justificativa**: Flexibilidade para evoluir o schema, escalabilidade horizontal, suporte a documentos aninhados
- **Benefícios**: Schema flexível, queries eficientes com agregações, suporte nativo a arrays e objetos

### 3. Clean Architecture
- **Justificativa**: Separação de responsabilidades, testabilidade, manutenibilidade
- **Camadas**: Presentation → Application → Domain → Infrastructure

### 4. React Query (TanStack Query)
- **Justificativa**: Gerenciamento eficiente de estado assíncrono, cache inteligente, refetch automático
- **Benefícios**: Menos código boilerplate, sincronização automática, UI otimista

### 5. TypeScript Strict
- **Justificativa**: Segurança de tipos, melhor DX, menos bugs em produção
- **Benefícios**: Autocomplete, refatoração segura, documentação implícita

## 📈 Escalabilidade

O sistema foi projetado para escalar horizontalmente:

1. **Connection Pooling**: MongoDB connection pool configurado (min: 2, max: 10)
2. **Stateless API**: API Routes são stateless, permitindo múltiplas instâncias
3. **Cache Strategy**: React Query gerencia cache no cliente, reduzindo carga no servidor
4. **Database Indexes**: Índices criados em campos frequentemente consultados

## 🔒 Segurança

1. **JWT Tokens**: Access tokens (15min) e refresh tokens (7d)
2. **Admin Token**: Autenticação separada para operações administrativas
3. **Validação de Input**: Zod schemas em todos os endpoints
4. **Error Handling**: Erros não expõem informações sensíveis
5. **HTTPS**: Obrigatório em produção

---

**Última atualização**: 2025-01-27  
**Versão da Arquitetura**: 1.0.0

**Desenvolvido com ❤️ pela equipe Durch Soluções**

