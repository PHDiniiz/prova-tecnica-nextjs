# 📘 Organização Inicial do Projeto
**Projeto:** Plataforma de Gestão para Grupos de Networking  
**Stack:** Next.js 15 (App Router) + Node.js + MongoDB + TailwindCSS + ShadCN/UI + Jest + React Testing Library + Cypress  
**Arquitetura:** Clean Architecture + Clean Code + UI Otimista + ATOMIC Design + Mobile First  

---

## 🎯 1. Objetivo do Sistema
O objetivo é digitalizar e otimizar a gestão de grupos de networking, eliminando planilhas e controles manuais, através de uma solução integrada, responsiva, em tempo real e altamente performática.

---

## 📊 1.1 Status de Implementação

### ✅ Concluído
- [x] **Feature 1: Setup e Infraestrutura Base**
  - Configuração do Next.js 15 com App Router
  - Conexão MongoDB com connection pooling e transactions
  - TanStack Query configurado com refetch inteligente
  - Jest e React Testing Library configurados
  - Estrutura de pastas organizada (Clean Architecture)
  - Variáveis de ambiente configuradas

- [x] **Feature 2: Componentes UI Base (Parcial)**
  - Button (variantes, tamanhos, loading, animações)
  - Input (label, error, helperText)
  - Textarea
  - Card (variantes, subcomponentes)
  - Badge (variantes de status)
  - Skeleton (loading states)

- [x] **Feature 3: Fluxo de Admissão - Intenções Públicas**
  - API Route: `POST /api/intentions`
  - Página pública: `app/intention/page.tsx`
  - Formulário: `IntentionForm.tsx` com validação React Hook Form + Zod
  - Hook: `useIntentions.ts` com React Query
  - Testes unitários e de integração

- [x] **Estrutura de Dados**
  - Tipos TypeScript: Intention, Member, Invite, Referral
  - DTOs para todas as entidades
  - Validações Zod implementadas

- [x] **Repositórios MongoDB**
  - IntentionRepository
  - MemberRepository
  - InviteRepository
  - ReferralRepository

- [x] **Serviços de Aplicação**
  - IntentionService (validação, criação, busca, atualização)
  - InviteService (geração de token, validação, marcação de uso)
  - MemberService (criação com validação de token)
  - ReferralService (criação, busca, atualização de status)

- [x] **Helpers de Teste**
  - Faker.js configurado (pt_BR)
  - Funções para gerar dados fake
  - Seeders para popular banco de dados

### ✅ Concluído (Atualizado)
- [x] **Feature 4: Fluxo de Admissão - Área Administrativa**
  - Listagem de intenções com paginação e filtros
  - Aprovação/recusa de intenções
  - Geração automática de convite ao aprovar
  - Proteção com ADMIN_TOKEN
  - Página admin `/admin/intents`
  - Componentes: IntentionList, IntentionCard

- [x] **Feature 5: Sistema de Convites (APIs)**
  - API POST /api/invites (gerar convite manualmente)
  - API GET /api/invites/[token] (validar token)
  - Geração automática ao aprovar intenção
  - Validação de token (expirado, usado)

- [x] **Feature 6: Cadastro Completo de Membros**
  - Página pública `/register/[token]`
  - Validação de token antes de exibir formulário
  - Formulário completo (telefone, linkedin, área de atuação)
  - API POST /api/members
  - Marca token como usado após cadastro
  - Componente: MemberForm

### 🚧 Em Progresso
- [ ] Feature 7: Sistema de Indicações

### 📋 Pendente
- [ ] Feature 8: Testes e Qualidade (cobertura ≥ 95%)
- [ ] Feature 9: Documentação adicional
- [ ] Feature 10: Refinamentos e Otimizações

---

## 🧩 2. Funcionalidades Principais

### **2.1 Gestão de Membros**
- Formulário público de **intenção de participação** (nome, e-mail, empresa, cargo, motivo).  
- Painel administrativo com **aprovação/recusa** de intenções.  
- Geração de **token único** de convite para cadastro completo.  
- Formulário de **cadastro completo** com dados adicionais (telefone, rede social, empresa).  

### **2.2 Comunicação e Engajamento**
- Área de **avisos e comunicados internos**.  
- Controle de **presença (check-in)** em reuniões.  

### **2.3 Geração de Negócios**
- Criação e acompanhamento de **indicações de negócios** entre membros.  
- Status: *pendente*, *em andamento*, *concluído*, *cancelado*.  
- Registro de **“obrigados”**, agradecimentos públicos por negócios concluídos.  

### **2.4 Acompanhamento e Performance**
- Registro de **reuniões 1:1** entre membros.  
- **Dashboard de performance** individual e coletivo.  
- Relatórios (semanal, mensal e acumulado).  

### **2.5 Financeiro**
- **Módulo de mensalidades** com geração e controle de status de pagamento.  

---

## 🧩 Módulo Opcional escolhido: Opção A - Sistema de Indicações

### 🎯 Objetivo

Implementar um sistema completo de **indicações de negócios entre membros**, fortalecendo o networking e a geração de oportunidades dentro do grupo.

---

### 🧭 Fluxo de Funcionamento

1. Membro logado acessa o menu "Indicações" no dashboard.  

2. Cria nova indicação informando:

   - Destinatário (membro alvo)

   - Tipo de negócio / serviço

   - Descrição ou observação

   - Valor estimado (opcional)

3. O sistema registra a indicação com `status: "pending"` e notifica o destinatário.  

4. O destinatário pode alterar o status para:

   - in_progress → negociação iniciada  

   - done → negócio fechado com sucesso  

   - canceled → indicação cancelada  

5. Ao marcar como done, o remetente pode registrar um "obrigado público".  

6. Todos os agradecimentos são exibidos em um feed de atividades dentro da comunidade.  

---

## ⚙️ 2.6 Regras de Negócio Detalhadas

Este documento padroniza todas as regras de negócio e o fluxo funcional da aplicação para garantir clareza, consistência e escalabilidade. O sistema segue princípios de **Clean Architecture**, **Atomic Design**, **UI Otimista** e **Realtime Refetch**.

### **2.6.1 Módulo de Gestão de Membros**

#### **Regras de Negócio**
- O e-mail deve ser único no sistema.
- Uma intenção só pode ser aprovada uma vez.
- Tokens expiram após 7 dias.
- Admins podem excluir intenções recusadas após 30 dias.
- Campos obrigatórios devem ser validados com Zod no frontend e backend.
- Após o cadastro completo, é criado um registro em `members` com `isActive: true`.

### **2.6.2 Comunicação e Engajamento**

#### **Regras de Negócio**
- Somente membros ativos podem dar check-in.
- Cada membro pode registrar apenas 1 presença por evento.
- Avisos antigos (>60 dias) são arquivados automaticamente.

### **2.6.3 Módulo de Geração de Negócios**

#### **Regras de Negócio**
- Apenas membros ativos podem criar ou receber indicações.
- O valor da indicação deve ser numérico positivo (mínimo R$ 1.000, máximo R$ 10.000.000).
- Alterações de status geram logs automáticos (`referral_logs`).
- Um "obrigado" só pode ser criado após o status `fechada`.
- Membro não pode indicar para si mesmo.
- Transições de status válidas:
  - `nova` → `em-contato` | `recusada`
  - `em-contato` → `fechada` | `recusada`
  - `fechada` → (final, não pode mudar)
  - `recusada` → (final, não pode mudar)

#### **Sistema de "Obrigados" (Agradecimentos Públicos)**

O sistema de "obrigados" permite que membros agradeçam publicamente por indicações que resultaram em negócios fechados.

**Regras de Negócio:**
- **Quem pode criar:** Apenas o membro que recebeu a indicação (membro indicado)
- **Quando pode criar:** Apenas após a indicação ter status `fechada`
- **Limite:** Um "obrigado" por indicação (relação 1:1 com `referrals`)
- **Visibilidade:** Por padrão, todos os "obrigados" são públicos (`publico: true`)
- **Conteúdo:** Mensagem obrigatória entre 10-500 caracteres

**Fluxo:**
1. Membro A cria indicação para Membro B
2. Membro B atualiza status para `em-contato` → `fechada`
3. Membro B pode criar "obrigado" para Membro A
4. "Obrigado" aparece no feed público de agradecimentos
5. Dashboard atualiza métricas de "obrigados" do mês

**Estrutura de Dados:**
```typescript
{
  _id: ObjectId,
  indicacaoId: ObjectId (unique, ref: 'referrals'),
  membroIndicadorId: ObjectId (ref: 'members'),
  membroIndicadoId: ObjectId (ref: 'members'),
  mensagem: string (10-500 caracteres),
  publico: boolean (default: true),
  createdAt: Date
}
```

**API:**
- `POST /api/obrigados` - Criar agradecimento (requer autenticação, apenas membro indicado)
- `GET /api/obrigados` - Listar agradecimentos públicos (pode filtrar por membro)

### **2.6.4 Acompanhamento e Performance**

#### **Regras de Negócio**
- Dados devem ser agrupados por mês e filtráveis.
- Relatórios devem refletir apenas membros ativos.
- O sistema armazena snapshots mensais de indicadores para histórico.

### **2.6.5 Módulo Financeiro**

#### **Regras de Negócio**
- O valor da mensalidade é fixo por grupo (configurável).
- Geração automática no 1º dia útil do mês.
- Bloqueio automático após 2 atrasos consecutivos.
- Admins podem reativar manualmente um membro inadimplente.
- Se após 15 dias continuar `pending`, status muda para `overdue`.
- Membros com 2 mensalidades vencidas ficam com `isActive: false`.

---

## 🏗️ 3. Arquitetura da Solução

```mermaid
graph TD
    subgraph Frontend [Next.js 15 - App Router]
        A1[Atomic Components<br/>Button, Input, Card, Badge]
        A2[Feature Components<br/>Forms, Tables, Charts]
        A3[Hooks / Context<br/>useIntentions, useReferrals]
        A4[TanStack Query<br/>Realtime Refetch + Cache]
        A5[Server Components<br/>Pages e Layouts]
    end

    subgraph API [API Routes - Next.js]
        B1[Route Handlers<br/>POST, GET, PATCH]
        B2[Server Actions<br/>Mutations Otimistas]
        B3[Middleware<br/>Auth, Validation]
    end

    subgraph Application [Camada de Aplicação]
        C1[Services<br/>IntentionService, MemberService]
        C2[Use Cases<br/>AprovarIntencao, CriarIndicacao]
        C3[Validators<br/>Zod Schemas]
    end

    subgraph Infrastructure [Camada de Infraestrutura]
        D1[Repositories<br/>IntentionRepository, MemberRepository]
        D2[MongoDB Connection<br/>Connection Pooling]
        D3[Email Service<br/>Simulado/Real]
    end

    subgraph Database [MongoDB Atlas]
        E1[Collections<br/>intentions, members, referrals<br/>invites, meetings, payments<br/>notices, obrigados]
    end

    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> B1
    A5 --> B2
    B1 --> B3
    B2 --> B3
    B3 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> E1
    D1 -.-> D3
    A4 -.->|Refetch| B1
```

### **3.1 Padrão de Camadas**
- **Domain:** regras de negócio puras.  
- **Application:** casos de uso e validações.  
- **Infrastructure:** persistência, conexão, providers.  
- **Presentation:** API Routes + UI com Server Actions.  

### **3.2 Boas Práticas**
- Clean Code + Clean Architecture.  
- ESLint + Prettier + Husky.  
- UI otimista e refetch automático inteligente.  
- Testes unitários e e2e reais com cobertura mínima de **95%**.  
- Design ATOMIC para responsividade granular.  

---

## 🧱 4. Modelo de Dados (MongoDB)

### **4.1 Justificativa da Escolha do MongoDB**

O MongoDB foi escolhido como banco de dados por oferecer:
- **Flexibilidade de Schema**: Permite evolução natural do modelo de dados sem migrações complexas
- **Escalabilidade Horizontal**: Suporta crescimento através de sharding
- **Integração Nativa com JavaScript/TypeScript**: Documentos JSON nativos facilitam integração com Next.js
- **Performance em Consultas Complexas**: Índices otimizados para queries de relacionamentos e agregações
- **Suporte a Arrays e Objetos Aninhados**: Ideal para estruturas como histórico de status, tags, etc.
- **MongoDB Atlas**: Solução gerenciada que simplifica deploy e manutenção

### **4.2 Collections e Schemas**

#### **Collection: `intentions`**
Armazena intenções de participação submetidas publicamente.

```typescript
{
  _id: ObjectId,
  nome: string (required, min: 2, max: 100),
  email: string (required, unique, index),
  empresa: string (required, min: 2, max: 100),
  cargo?: string (max: 100),
  motivo: string (required, min: 10, max: 500),
  status: 'pending' | 'approved' | 'rejected' (default: 'pending', index),
  createdAt: Date (default: Date.now, index),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ email: 1 }` - Único para evitar duplicatas
- `{ status: 1, createdAt: -1 }` - Composto para listagem admin
- `{ createdAt: -1 }` - Para ordenação temporal

#### **Collection: `invites`**
Gerencia tokens de convite para cadastro completo após aprovação.

```typescript
{
  _id: ObjectId,
  token: string (required, unique, index),
  intencaoId: ObjectId (required, ref: 'intentions', index),
  usado: boolean (default: false, index),
  expiraEm: Date (required, index),
  createdAt: Date (default: Date.now)
}
```

**Índices:**
- `{ token: 1 }` - Único para busca rápida de validação
- `{ intencaoId: 1 }` - Para relacionamento com intenção
- `{ usado: 1, expiraEm: 1 }` - Composto para limpeza de tokens expirados

#### **Collection: `members`**
Armazena membros ativos do grupo após cadastro completo.

```typescript
{
  _id: ObjectId,
  nome: string (required, min: 2, max: 100),
  email: string (required, unique, index),
  telefone?: string (max: 20),
  empresa: string (required, min: 2, max: 100),
  cargo?: string (max: 100),
  linkedin?: string (max: 200),
  areaAtuacao?: string (max: 100),
  intencaoId?: ObjectId (ref: 'intentions'),
  ativo: boolean (default: true, index),
  createdAt: Date (default: Date.now, index),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ email: 1 }` - Único para login e busca
- `{ ativo: 1, createdAt: -1 }` - Para listagem de membros ativos
- `{ intencaoId: 1 }` - Para rastreamento de origem

#### **Collection: `referrals`**
Sistema de indicações de negócios entre membros.

```typescript
{
  _id: ObjectId,
  membroIndicadorId: ObjectId (required, ref: 'members', index),
  membroIndicadoId: ObjectId (required, ref: 'members', index),
  empresaContato: string (required, min: 2, max: 100),
  descricao: string (required, min: 10, max: 1000),
  status: 'nova' | 'em-contato' | 'fechada' | 'recusada' (default: 'nova', index),
  valorEstimado?: number,
  observacoes?: string (max: 500),
  createdAt: Date (default: Date.now, index),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ membroIndicadorId: 1, status: 1 }` - Para listar indicações feitas
- `{ membroIndicadoId: 1, status: 1 }` - Para listar indicações recebidas
- `{ status: 1, createdAt: -1 }` - Para dashboard e relatórios

#### **Collection: `obrigados`**
Registro de agradecimentos públicos por negócios fechados.

```typescript
{
  _id: ObjectId,
  indicacaoId: ObjectId (required, ref: 'referrals', unique),
  membroIndicadorId: ObjectId (required, ref: 'members', index),
  membroIndicadoId: ObjectId (required, ref: 'members', index),
  mensagem: string (required, min: 10, max: 500),
  publico: boolean (default: true),
  createdAt: Date (default: Date.now, index)
}
```

**Índices:**
- `{ indicacaoId: 1 }` - Único para evitar duplicatas
- `{ membroIndicadorId: 1, createdAt: -1 }` - Para histórico de agradecimentos
- `{ publico: 1, createdAt: -1 }` - Para feed público

#### **Collection: `meetings`**
Controle de reuniões 1:1 entre membros.

```typescript
{
  _id: ObjectId,
  membro1Id: ObjectId (required, ref: 'members', index),
  membro2Id: ObjectId (required, ref: 'members', index),
  data: Date (required, index),
  local?: string (max: 200),
  observacoes?: string (max: 1000),
  checkInRealizado: boolean (default: false),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ membro1Id: 1, data: -1 }` - Para histórico de reuniões
- `{ membro2Id: 1, data: -1 }` - Para histórico de reuniões (bidirecional)
- `{ data: 1 }` - Para consultas por período

#### **Collection: `notices`**
Avisos e comunicados internos para membros.

```typescript
{
  _id: ObjectId,
  titulo: string (required, min: 5, max: 200),
  conteudo: string (required, min: 10, max: 5000),
  autorId: ObjectId (required, ref: 'members'),
  tipo: 'info' | 'warning' | 'success' | 'urgent' (default: 'info'),
  publico: boolean (default: true, index),
  createdAt: Date (default: Date.now, index),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ publico: 1, createdAt: -1 }` - Para listagem de avisos
- `{ tipo: 1, createdAt: -1 }` - Para filtros por tipo

#### **Collection: `payments`**
Controle de mensalidades e pagamentos.

```typescript
{
  _id: ObjectId,
  membroId: ObjectId (required, ref: 'members', index),
  valor: number (required, min: 0),
  mesReferencia: string (required, format: 'YYYY-MM', index),
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' (default: 'pendente', index),
  dataVencimento: Date (required, index),
  dataPagamento?: Date,
  metodoPagamento?: string (max: 50),
  observacoes?: string (max: 500),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Índices:**
- `{ membroId: 1, mesReferencia: 1 }` - Único composto para evitar duplicatas
- `{ status: 1, dataVencimento: 1 }` - Para relatórios financeiros
- `{ mesReferencia: 1, status: 1 }` - Para dashboard financeiro

### **4.3 Relacionamentos**

- `invites.intencaoId` → `intentions._id` (1:1)
- `members.intencaoId` → `intentions._id` (1:1, opcional)
- `referrals.membroIndicadorId` → `members._id` (N:1)
- `referrals.membroIndicadoId` → `members._id` (N:1)
- `obrigados.indicacaoId` → `referrals._id` (1:1)
- `obrigados.membroIndicadorId` → `members._id` (N:1)
- `obrigados.membroIndicadoId` → `members._id` (N:1)
- `meetings.membro1Id` → `members._id` (N:1)
- `meetings.membro2Id` → `members._id` (N:1)
- `notices.autorId` → `members._id` (N:1)
- `payments.membroId` → `members._id` (N:1)

### **4.4 Validações com Zod**

Todos os schemas possuem validações correspondentes em Zod para:
- Validação de entrada nas API Routes
- Type-safety no TypeScript
- Mensagens de erro consistentes
- Sanitização de dados

---

## 🧭 5. Estrutura de Componentes (Next.js 15)

### **5.1 Padrão ATOMIC DESIGN**

A estrutura segue o padrão **ATOMIC DESIGN** para garantir reutilização e manutenibilidade:

**Status de Implementação:**
- ✅ Estrutura base criada
- ✅ Componentes atômicos (ui/) implementados
- ✅ Componentes de features (features/intention/) implementados
- ✅ Repositórios e serviços organizados

```
src/
├── app/                         # Next.js App Router
│   ├── (public)/                # Rotas públicas
│   │   ├── intention/           # Formulário de intenção ✅
│   │   │   └── page.tsx
│   │   └── register/            # Cadastro completo com token
│   │       └── [token]/page.tsx
│   │
│   ├── (admin)/                 # Rotas administrativas
│   │   ├── intents/             # Gestão de intenções
│   │   │   └── page.tsx
│   │   ├── referrals/           # Gestão de indicações
│   │   │   └── page.tsx
│   │   ├── dashboard/           # Dashboard de performance
│   │   │   └── page.tsx
│   │   └── members/             # Lista de membros
│   │       └── page.tsx
│   │
│   ├── api/                     # API Routes
│   │   ├── intentions/
│   │   │   ├── route.ts         # POST ✅
│   │   │   └── [id]/
│   │   │       └── status/route.ts  # PATCH
│   │   ├── invites/
│   │   │   ├── route.ts         # POST
│   │   │   └── [token]/route.ts # GET
│   │   ├── members/
│   │   │   └── route.ts         # POST, GET
│   │   └── referrals/
│   │       ├── route.ts         # GET, POST
│   │       └── [id]/
│   │           └── status/route.ts  # PATCH
│   │
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Homepage
│   └── providers.tsx            # ✅ React Query Provider (refetch configurado)
│
├── components/                  # Componentes React
│   ├── ui/                      # ATOMS - Componentes básicos ✅
│   │   ├── button.tsx           # ✅ Implementado
│   │   ├── input.tsx            # ✅ Implementado
│   │   ├── textarea.tsx         # ✅ Implementado
│   │   ├── card.tsx             # ✅ Implementado
│   │   ├── badge.tsx            # ✅ Implementado
│   │   ├── skeleton.tsx         # ✅ Implementado
│   │   └── ...                  # Modal, Toast, Select pendentes
│   │
│   ├── features/                # MOLECULES & ORGANISMS - Por feature
│   │   ├── intention/
│   │   │   ├── IntentionForm.tsx    # ✅ Implementado com testes
│   │   │   └── IntentionList.tsx    # ⏳ Pendente
│   │   ├── member/
│   │   │   ├── MemberForm.tsx
│   │   │   └── MemberCard.tsx
│   │   ├── referral/
│   │   │   ├── ReferralForm.tsx
│   │   │   ├── ReferralTable.tsx
│   │   │   └── ReferralStatusBadge.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       └── PerformanceChart.tsx
│   │
│   └── layouts/                 # TEMPLATES - Layouts reutilizáveis
│       ├── AdminLayout.tsx
│       ├── PublicLayout.tsx
│       └── DashboardLayout.tsx

├── hooks/                      # Custom Hooks
│   ├── useIntentions.ts        # ✅ Implementado (criação) com testes
│   ├── useReferrals.ts         # ⏳ Pendente
│   ├── useMembers.ts           # ⏳ Pendente
│   └── useDashboard.ts         # ⏳ Pendente
│
├── services/                   # Camada de Aplicação
│   ├── IntentionService.ts     # ✅ Implementado
│   ├── InviteService.ts        # ✅ Implementado
│   ├── MemberService.ts        # ✅ Implementado
│   ├── ReferralService.ts      # ✅ Implementado
│   └── DashboardService.ts     # ⏳ Pendente
│
├── lib/                        # Infraestrutura
│   ├── mongodb.ts              # ✅ Conexão MongoDB (pooling, transactions)
│   ├── repositories/           # ✅ Camada de Infraestrutura
│   │   ├── IntentionRepository.ts  # ✅ Implementado
│   │   ├── InviteRepository.ts     # ✅ Implementado
│   │   ├── MemberRepository.ts    # ✅ Implementado
│   │   └── ReferralRepository.ts   # ✅ Implementado
│   └── utils.ts               # ✅ Utilitários (cn function)
│
├── types/                      # ✅ TypeScript Types
│   ├── intention.ts            # ✅ Implementado (com DTOs)
│   ├── invite.ts               # ✅ Implementado (com DTOs)
│   ├── member.ts               # ✅ Implementado (com DTOs)
│   ├── referral.ts             # ✅ Implementado (com DTOs)
│   └── ...                     # Meeting, Notice, Payment pendentes
│
├── context/                    # React Contexts (se necessário)
│   └── AuthContext.tsx
│
└── tests/                      # Helpers de teste
    ├── helpers/                # ✅ Helpers de teste
    │   ├── faker.ts            # ✅ Faker.js configurado (pt_BR)
    │   └── seeders.ts          # ✅ Seeders para popular banco
    ├── unit/                   # ✅ Testes unitários (parcial)
    │   └── ...                 # IntentionForm, useIntentions, API Route
    ├── integration/            # ⏳ Testes de integração
    └── e2e/                    # ⏳ Testes end-to-end (Cypress)
```

### **5.2 Organização por Features**

Cada funcionalidade possui:
- **Componentes específicos** em `src/components/features/[feature]/`
- **Hook customizado** em `src/hooks/use[Feature].ts`
- **Service** em `src/services/[Feature]Service.ts`
- **Repository** em `src/lib/repositories/[Feature]Repository.ts`
- **Types** em `src/types/[feature].ts`
- **API Routes** em `src/app/api/[feature]/`

### **5.3 Server Components vs Client Components**

**Server Components (padrão):**
- Páginas (`src/app/**/page.tsx`)
- Layouts (`src/app/layout.tsx`, `src/components/layouts/`)
- Componentes de apresentação sem interatividade

**Client Components (`'use client'`):**
- Formulários interativos
- Componentes com estado (`useState`, `useEffect`)
- Componentes que usam hooks customizados
- Componentes com eventos de usuário

### **5.4 Hooks Customizados**

Hooks criados para encapsular lógica de negócio e integração com React Query:

- `useIntentions()` - Gerenciamento de intenções
- `useReferrals()` - Gerenciamento de indicações
- `useMembers()` - Gerenciamento de membros
- `useDashboard()` - Dados do dashboard

Cada hook utiliza TanStack Query para:
- Cache automático
- Refetch em intervalos
- Refetch on focus/mount
- Mutations otimistas

---

## 🌐 6. API (REST)

A API utiliza **Next.js API Routes** com padrão RESTful. Todas as rotas retornam JSON e seguem convenções HTTP.

### **6.1 Funcionalidade 1: Gestão de Intenções**

#### **POST /api/intentions**
Cria uma nova intenção de participação (público).

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "empresa": "Empresa XYZ",
  "cargo": "Diretor Comercial",
  "motivo": "Desejo participar do grupo para expandir minha rede de contatos..."
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "empresa": "Empresa XYZ",
    "cargo": "Diretor Comercial",
    "motivo": "Desejo participar...",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Email já cadastrado",
  "details": { "field": "email" }
}
```

#### **GET /api/intentions**
Lista todas as intenções (admin apenas).

**Headers:**
```
Authorization: Bearer {ADMIN_TOKEN}
```

**Query Parameters:**
- `status` (opcional): `pending | approved | rejected`
- `page` (opcional): número da página (default: 1)
- `limit` (opcional): itens por página (default: 20)

**Response 200:**
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
      "createdAt": "2024-01-15T10:30:00.000Z"
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

#### **PATCH /api/intentions/[id]/status**
Aprova ou recusa uma intenção (admin apenas).

**Headers:**
```
Authorization: Bearer {ADMIN_TOKEN}
```

**Request:**
```json
{
  "status": "approved"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "approved",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "invite": {
    "token": "abc123def456",
    "expiraEm": "2024-01-22T11:00:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Intenção não encontrada"
}
```

---

### **6.2 Funcionalidade 2: Sistema de Convites**

#### **POST /api/invites** ✅ **IMPLEMENTADO**
Gera um convite manualmente (admin apenas). Também é gerado automaticamente ao aprovar intenção.

**Headers:**
```
Authorization: Bearer {ADMIN_TOKEN}
```

**Request:**
```json
{
  "intencaoId": "507f1f77bcf86cd799439011"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "token": "abc123def456ghi789",
    "intencaoId": "507f1f77bcf86cd799439011",
    "usado": false,
    "expiraEm": "2024-01-22T11:00:00.000Z",
    "criadoEm": "2024-01-15T11:00:00.000Z"
  },
  "url": "https://app.com/register/abc123def456ghi789"
}
```

#### **GET /api/invites/[token]** ✅ **IMPLEMENTADO**
Valida um token de convite (público).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "abc123def456ghi789",
    "valido": true,
    "expiraEm": "2024-01-22T11:00:00.000Z",
    "intencao": {
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "empresa": "Empresa XYZ",
      "cargo": "Diretor Comercial"
    }
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

#### **POST /api/members** ✅ **IMPLEMENTADO**
Cadastro completo de membro usando token de convite (público).

**Request:**
```json
{
  "token": "abc123def456ghi789",
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "+55 11 99999-9999",
  "empresa": "Empresa XYZ",
  "cargo": "Diretor Comercial",
  "linkedin": "https://linkedin.com/in/joaosilva",
  "areaAtuacao": "Vendas e Marketing"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "empresa": "Empresa XYZ",
    "criadoEm": "2024-01-15T12:00:00.000Z"
  },
  "message": "Cadastro realizado com sucesso!"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Token inválido ou já utilizado"
}
```

---

### **6.3 Funcionalidade 3: Sistema de Indicações**

#### **POST /api/referrals**
Cria uma nova indicação de negócio (membro autenticado).

**Headers:**
```
Authorization: Bearer {MEMBER_TOKEN}
```

**Request:**
```json
{
  "membroIndicadoId": "507f1f77bcf86cd799439013",
  "empresaContato": "Empresa ABC",
  "descricao": "Indicação de cliente potencial para serviços de consultoria...",
  "valorEstimado": 50000
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "membroIndicadorId": "507f1f77bcf86cd799439010",
    "membroIndicadoId": "507f1f77bcf86cd799439013",
    "empresaContato": "Empresa ABC",
    "descricao": "Indicação de cliente potencial...",
    "status": "nova",
    "valorEstimado": 50000,
    "createdAt": "2024-01-15T14:00:00.000Z"
  }
}
```

#### **GET /api/referrals**
Lista indicações do membro autenticado.

**Headers:**
```
Authorization: Bearer {MEMBER_TOKEN}
```

**Query Parameters:**
- `tipo` (opcional): `feitas | recebidas` (default: ambas)
- `status` (opcional): `nova | em-contato | fechada | recusada`
- `page` (opcional): número da página
- `limit` (opcional): itens por página

**Response 200:**
```json
{
  "success": true,
  "data": {
    "feitas": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "membroIndicado": {
          "nome": "Maria Santos",
          "empresa": "Empresa DEF"
        },
        "empresaContato": "Empresa ABC",
        "status": "nova",
        "createdAt": "2024-01-15T14:00:00.000Z"
      }
    ],
    "recebidas": []
  }
}
```

#### **PATCH /api/referrals/[id]/status**
Atualiza o status de uma indicação (membro autenticado).

**Headers:**
```
Authorization: Bearer {MEMBER_TOKEN}
```

**Request:**
```json
{
  "status": "em-contato",
  "observacoes": "Primeiro contato realizado com sucesso"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "em-contato",
    "observacoes": "Primeiro contato realizado com sucesso",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

### **6.4 Padrões de Resposta**

Todas as respostas seguem o formato:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### **6.5 Status HTTP**

- `200` - Sucesso (GET, PATCH)
- `201` - Criado com sucesso (POST)
- `400` - Erro de validação ou requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

---

## 🔄 7. Fluxos Principais do Sistema

### **7.1 Fluxo de Admissão de Membros**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as API Routes
    participant S as Services
    participant DB as MongoDB

    U->>F: Acessa /intent
    F->>U: Exibe formulário de intenção
    U->>F: Preenche e submete formulário
    F->>API: POST /api/intentions
    API->>S: IntentionService.criar()
    S->>DB: Salva intenção (status: pending)
    DB-->>S: Retorna intenção criada
    S-->>API: Retorna dados
    API-->>F: 201 Created
    F->>U: Mensagem de sucesso

    Note over API,DB: Admin acessa área administrativa
    API->>API: Valida ADMIN_TOKEN
    API->>S: IntentionService.listar()
    S->>DB: Busca intenções pendentes
    DB-->>S: Lista de intenções
    S-->>API: Retorna lista
    API-->>F: Lista de intenções

    U->>F: Aprova intenção
    F->>API: PATCH /api/intentions/[id]/status
    API->>S: IntentionService.aprovar()
    S->>S: InviteService.gerar()
    S->>DB: Atualiza intenção + cria convite
    DB-->>S: Confirmação
    S-->>API: Retorna intenção + convite
    API-->>F: 200 OK com token
    F->>U: Exibe link de cadastro

    U->>F: Acessa /register/[token]
    F->>API: GET /api/invites/[token]
    API->>S: InviteService.validar()
    S->>DB: Busca e valida token
    DB-->>S: Token válido
    S-->>API: Dados da intenção
    API-->>F: 200 OK
    F->>U: Exibe formulário de cadastro completo

    U->>F: Preenche e submete cadastro
    F->>API: POST /api/members
    API->>S: MemberService.criar()
    S->>S: Valida token e marca como usado
    S->>DB: Cria membro + atualiza convite
    DB-->>S: Confirmação
    S-->>API: Membro criado
    API-->>F: 201 Created
    F->>U: Mensagem de sucesso
```

**Etapas:**
1. Usuário submete intenção pública
2. Admin visualiza e aprova/recusa
3. Sistema gera token único de convite (válido por 7 dias)
4. Usuário recebe link de cadastro completo
5. Usuário completa cadastro com dados adicionais
6. Membro é criado e token é marcado como usado

### **7.2 Fluxo de Indicação de Negócios**

```mermaid
sequenceDiagram
    participant M1 as Membro Indicador
    participant F as Frontend
    participant API as API Routes
    participant S as Services
    participant DB as MongoDB
    participant M2 as Membro Indicado

    M1->>F: Acessa área de indicações
    F->>API: GET /api/referrals
    API->>S: ReferralService.listar()
    S->>DB: Busca indicações do membro
    DB-->>S: Lista de indicações
    S-->>API: Retorna dados
    API-->>F: Lista de indicações

    M1->>F: Cria nova indicação
    F->>API: POST /api/referrals
    API->>S: ReferralService.criar()
    S->>DB: Salva indicação (status: nova)
    DB-->>S: Indicação criada
    S-->>API: Retorna dados
    API-->>F: 201 Created
    F->>M1: Indicação criada com sucesso

    M2->>F: Visualiza indicações recebidas
    F->>API: GET /api/referrals?tipo=recebidas
    API->>S: ReferralService.listarRecebidas()
    S->>DB: Busca indicações onde membro é indicado
    DB-->>S: Lista de indicações
    S-->>API: Retorna dados
    API-->>F: Lista de indicações recebidas

    M2->>F: Atualiza status da indicação
    F->>API: PATCH /api/referrals/[id]/status
    API->>S: ReferralService.atualizarStatus()
    S->>DB: Atualiza status e observações
    DB-->>S: Confirmação
    S-->>API: Indicação atualizada
    API-->>F: 200 OK
    F->>M2: Status atualizado

    Note over M2,DB: Quando negócio é fechado
    M2->>F: Registra "obrigado"
    F->>API: POST /api/obrigados
    API->>S: ObrigadoService.criar()
    S->>DB: Cria registro de agradecimento
    DB-->>S: Confirmação
    S-->>API: Obrigado criado
    API-->>F: 201 Created
    F->>M2: Agradecimento registrado
```

**Etapas:**
1. Membro A cria indicação para Membro B
2. Membro B visualiza indicação recebida
3. Membro B atualiza status conforme progresso
4. Quando negócio é fechado, Membro B registra "obrigado"
5. Agradecimento público é exibido no feed

### **7.3 Fluxo de Check-in em Reuniões**

```mermaid
sequenceDiagram
    participant M as Membro
    participant F as Frontend
    participant API as API Routes
    participant S as Services
    participant DB as MongoDB

    M->>F: Acessa área de reuniões
    F->>API: GET /api/meetings
    API->>S: MeetingService.listar()
    S->>DB: Busca reuniões do membro
    DB-->>S: Lista de reuniões
    S-->>API: Retorna dados
    API-->>F: Lista de reuniões

    M->>F: Registra nova reunião 1:1
    F->>API: POST /api/meetings
    API->>S: MeetingService.criar()
    S->>DB: Salva reunião (checkIn: false)
    DB-->>S: Reunião criada
    S-->>API: Retorna dados
    API-->>F: 201 Created

    M->>F: Realiza check-in
    F->>API: PATCH /api/meetings/[id]/checkin
    API->>S: MeetingService.realizarCheckIn()
    S->>DB: Atualiza checkInRealizado: true
    DB-->>S: Confirmação
    S-->>API: Check-in confirmado
    API-->>F: 200 OK
    F->>M: Check-in realizado
```

### **7.4 Fluxo de Intenção de Participação (Detalhado)**

**Passo a passo:**
1. Visitante acessa o formulário público de intenção.
2. Preenche os campos obrigatórios: **nome, e-mail, empresa, cargo, motivo de interesse**.
3. O sistema valida os dados e registra a intenção no banco (`status: pending`).
4. Um e-mail simulado (ou log interno) confirma o recebimento.
5. O administrador visualiza a intenção no painel e pode **aprovar** ou **recusar**.
6. Ao aprovar:
   - O sistema gera um **token único** (UUID).
   - O status muda para `approved`.
   - Um link de convite é criado (`/register?token=xxxx`).
7. O convidado acessa o link e completa seu cadastro.
8. Após o cadastro, é criado um registro em `members` com `isActive: true`.

### **7.5 Fluxo de Avisos e Comunicados**

**Passo a passo:**
1. Administradores criam comunicados com **título e mensagem**.
2. Todos os membros ativos visualizam o comunicado em tempo real via TanStack Query (refetch automático).
3. Os comunicados são ordenados por data de criação (desc).

### **7.6 Fluxo de Presença (Check-in) - Detalhado**

**Passo a passo:**
1. Admin cria uma reunião (data, local, tema).
2. Membros marcam presença clicando em "Check-in".
3. O sistema salva o registro em `meetings` com `present: true`.
4. O admin pode exportar relatório de presença.

### **7.7 Fluxo de Indicações (Detalhado)**

**Passo a passo:**
1. Membro logado cria uma **indicação** para outro membro.
2. Preenche: **para quem**, **tipo de negócio**, **valor estimado**, **descrição**.
3. A indicação é salva com `status: pending`.
4. O destinatário pode alterar o status: `in_progress`, `done`, `canceled`.
5. Ao marcar como `done`, o sistema habilita o campo **"obrigado"** para o remetente.
6. O dashboard reflete automaticamente via refetch otimista.

### **7.8 Fluxo do Dashboard**

**Passo a passo:**
1. Ao acessar o dashboard, o sistema consulta dados agregados:
   - Número de membros ativos
   - Total de indicações (mês)
   - Total de "obrigados" (mês)
   - Taxa de participação em reuniões
2. Os dados são atualizados em tempo real (refetch automático a cada 5s ou após mutation).

### **7.9 Fluxo de Relatórios**

**Passo a passo:**
1. Admin define período (semanal, mensal, acumulado).
2. O sistema compila dados de `referrals`, `meetings`, `payments` e `members`.
3. Gera relatórios exportáveis (PDF e CSV).

### **7.10 Fluxo de Mensalidades**

**Passo a passo:**
1. Sistema gera mensalidades automaticamente todo início de mês.
2. Cada mensalidade tem status `pending` até o pagamento.
3. Após confirmação (manual ou webhook simulado), status muda para `paid`.
4. Se após 15 dias continuar `pending`, status muda para `overdue`.
5. Membros com 2 mensalidades vencidas ficam com `isActive: false`.

### **7.11 Fluxo Resumido Geral**

```mermaid
graph LR
A[Usuário envia intenção] --> B[Admin avalia intenção]
B -->|Aprovado| C[Token e convite gerado]
C --> D[Usuário realiza cadastro completo]
D --> E[Torna-se Membro Ativo]
E --> F[Criar indicações, participar de reuniões]
F --> G[Dashboard e Relatórios em tempo real]
G --> H[Mensalidades e status financeiro]
H --> I[Admin monitora desempenho e engajamento]
```

---

## 🔒 8. Autenticação e Segurança

### **8.1 Proteção de Rotas Administrativas**

As rotas administrativas são protegidas via **variável de ambiente** `ADMIN_TOKEN`:

```typescript
// Middleware de autenticação admin
const authHeader = request.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

if (token !== process.env.ADMIN_TOKEN) {
  return NextResponse.json(
    { success: false, error: 'Não autorizado' },
    { status: 401 }
  );
}
```

**Rotas Protegidas:**
- `GET /api/intentions` - Listar intenções
- `PATCH /api/intentions/[id]/status` - Aprovar/Recusar
- `POST /api/invites` - Gerar convite
- `GET /api/members` - Listar membros
- `GET /api/dashboard` - Dashboard administrativo

### **8.2 Validação de Tokens de Convite**

Tokens de convite são validados antes de permitir cadastro completo:

```typescript
// Validação de token
const invite = await InviteRepository.buscarPorToken(token);

if (!invite || invite.usado || invite.expiraEm < new Date()) {
  throw new Error('Token inválido ou expirado');
}
```

**Características:**
- Token único gerado com crypto aleatório
- Validade de 7 dias
- Uso único (marcado como `usado: true` após cadastro)
- Índice único no banco para busca rápida

### **8.3 Headers de Segurança**

Headers de segurança devem ser configurados no Next.js:

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

**Status:** Headers de segurança precisam ser implementados no `next.config.ts`.

### **8.4 Rate Limiting**

Rate limiting básico implementado para prevenir abuso:

- **Formulário de intenção**: Máximo 3 submissões por IP/hora
- **API Routes**: Máximo 100 requisições por IP/minuto
- **Validação de token**: Máximo 10 tentativas por token/hora

### **8.5 Validação de Dados**

Todas as entradas são validadas com **Zod schemas**:

```typescript
// Exemplo: Schema de intenção
const CriarIntencaoSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  empresa: z.string().min(2).max(100),
  cargo: z.string().max(100).optional(),
  motivo: z.string().min(10).max(500)
});
```

**Benefícios:**
- Type-safety em tempo de compilação
- Validação em runtime
- Mensagens de erro consistentes
- Sanitização automática

### **8.5.1 Validações Específicas Detalhadas**

#### **Campos de Texto**

| Campo | Regras | Exemplo |
|-------|--------|---------|
| **Nome** | 2-100 caracteres, apenas letras, espaços e acentos | "João Silva" |
| **Email** | Formato email válido, único no sistema | "joao@empresa.comz" |
| **Empresa** | 2-100 caracteres | "Empresa XYZ Ltda" |
| **Cargo** | Máximo 100 caracteres (opcional) | "Diretor Comercial" |
| **Motivo/Descrição** | 10-500 caracteres para intenções, 10-1000 para indicações | Mínimo 10 caracteres |

#### **Campos de Contato**

| Campo | Regras | Exemplo |
|-------|--------|---------|
| **Telefone** | Formato brasileiro: `+55 (XX) XXXXX-XXXX` ou `(XX) XXXXX-XXXX`, máximo 20 caracteres | "+55 11 99999-9999" |
| **LinkedIn** | URL completa válida ou username (sem @), máximo 200 caracteres | "https://linkedin.com/in/joaosilva" ou "joaosilva" |

#### **Campos Numéricos**

| Campo | Regras | Exemplo |
|-------|--------|---------|
| **Valor Estimado (Indicação)** | Número positivo, mínimo R$ 1.000, máximo R$ 10.000.000 | 50000 |
| **Valor Mensalidade** | Número positivo, configurável por grupo | 500 |

#### **Validações de Negócio**

- **Email único:** Verificado no banco antes de criar intenção/membro
- **Token de convite:** Válido por 7 dias (horário UTC), uso único
- **Status de indicação:** Apenas transições válidas:
  - `nova` → `em-contato` | `recusada`
  - `em-contato` → `fechada` | `recusada`
  - `fechada` → (final, não pode mudar)
  - `recusada` → (final, não pode mudar)
- **Auto-indicação:** Membro não pode indicar para si mesmo
- **Membro ativo:** Apenas membros com `isActive: true` podem criar/receber indicações

### **8.6 Proteção contra SQL Injection**

MongoDB com driver oficial previne SQL Injection naturalmente através de:
- Queries parametrizadas
- Validação de ObjectIds
- Sanitização de strings

### **8.7 Variáveis de Ambiente**

Todas as configurações sensíveis em `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=networking_group

# Autenticação Admin
ADMIN_TOKEN=seu_token_secreto_aqui

# Autenticação Membros (JWT)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=30d

# Aplicação
NEXT_PUBLIC_APP_URL=https://app.com
```

**Boas Práticas:**
- Nunca commitar `.env.local` no Git
- ✅ Usar `.env.example` como template (já existe)
- Rotacionar tokens periodicamente
- Usar diferentes tokens para dev/prod
- JWT_SECRET deve ter mínimo 32 caracteres

**Status:** ✅ Arquivo `.env.example` existe e contém todas as variáveis necessárias.

### **8.7.1 Padrão de Tratamento de Erros**

O sistema segue um padrão consistente para tratamento e resposta de erros em todas as API Routes.

#### **Formato Padrão de Resposta de Erro**

```typescript
{
  success: false,
  error: string,        // Tipo/categoria do erro
  message: string,      // Mensagem amigável para o usuário
  details?: any         // Detalhes adicionais (validações, stack em dev)
}
```

#### **Códigos HTTP e Tipos de Erro**

| Código | Tipo | Quando Usar | Exemplo |
|--------|------|-------------|---------|
| **400** | Bad Request | Dados inválidos, validação falhou | Email já cadastrado, campos obrigatórios faltando |
| **401** | Unauthorized | Token ausente ou inválido | Token expirado, não autenticado |
| **403** | Forbidden | Sem permissão para a ação | Membro tentando acessar área admin |
| **404** | Not Found | Recurso não encontrado | Intenção/Membro/Indicação não existe |
| **409** | Conflict | Conflito de estado | Token já usado, status inválido para transição |
| **500** | Internal Server Error | Erro interno do servidor | Erro de conexão com banco, exceção não tratada |

#### **Exemplos de Respostas de Erro**

**Validação (400):**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    { "path": "email", "message": "Email inválido" },
    { "path": "nome", "message": "Nome deve ter pelo menos 2 caracteres" }
  ]
}
```

**Não Autorizado (401):**
```json
{
  "success": false,
  "error": "Não autorizado",
  "message": "Token de autenticação inválido ou ausente"
}
```

**Recurso Não Encontrado (404):**
```json
{
  "success": false,
  "error": "Recurso não encontrado",
  "message": "Intenção não encontrada"
}
```

**Conflito (409):**
```json
{
  "success": false,
  "error": "Conflito",
  "message": "Token de convite já foi utilizado"
}
```

#### **Tratamento de Erros no Código**

```typescript
// Padrão de tratamento em API Routes
export async function POST(request: NextRequest) {
  try {
    // Lógica da rota
    const result = await service.criar(data);
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    // Erro de validação Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Erro de negócio conhecido
    if (error instanceof BusinessError) {
      return NextResponse.json(
        {
          success: false,
          error: error.type,
          message: error.message
        },
        { status: error.statusCode }
      );
    }
    
    // Erro inesperado
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      },
      { status: 500 }
    );
  }
}
```

#### **Logging de Erros**

- **Desenvolvimento:** Log completo com stack trace
- **Produção:** Log apenas tipo e mensagem (sem dados sensíveis)
- **Erros críticos:** Notificar administradores (futuro: integração com Sentry)

### **8.8 Autenticação de Membros**

Após o cadastro completo, os membros precisam de autenticação para acessar funcionalidades protegidas. O sistema utiliza **JWT (JSON Web Tokens)** para autenticação de membros.

#### **Fluxo de Autenticação**

1. **Após Cadastro Completo:**
   - Membro completa cadastro via `/register/[token]`
   - Sistema gera token JWT contendo: `{ membroId, email, isActive }`
   - Token é retornado na resposta do cadastro
   - Frontend armazena token em `localStorage` ou `httpOnly cookie`

2. **Uso do Token:**
   - Token é enviado no header `Authorization: Bearer {token}` em todas as requisições protegidas
   - Validade padrão: **30 dias** (renovável)
   - Token é validado em middleware antes de acessar rotas protegidas

3. **Renovação de Token:**
   - Token pode ser renovado via endpoint `POST /api/auth/refresh`
   - Novo token é gerado se o token atual estiver válido e não expirado

#### **Implementação Técnica**

```typescript
// Geração de token JWT
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { 
    membroId: member._id, 
    email: member.email,
    isActive: member.ativo 
  },
  process.env.JWT_SECRET!,
  { expiresIn: '30d' }
);

// Validação de token em middleware
export function verificarMembroToken(request: NextRequest): DecodedToken | null {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
  } catch {
    return null;
  }
}
```

#### **Rotas Protegidas para Membros**

- `POST /api/referrals` - Criar indicação
- `GET /api/referrals` - Listar indicações (feitas/recebidas)
- `PATCH /api/referrals/[id]/status` - Atualizar status
- `POST /api/obrigados` - Criar agradecimento
- `GET /api/meetings` - Listar reuniões
- `POST /api/meetings` - Criar reunião
- `PATCH /api/meetings/[id]/checkin` - Realizar check-in
- `GET /api/members/me` - Obter dados do próprio perfil
- `PATCH /api/members/me` - Atualizar próprio perfil

#### **Variáveis de Ambiente**

```env
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=30d
```

**Boas Práticas:**
- JWT_SECRET deve ser uma string aleatória longa (mínimo 32 caracteres)
- Usar diferentes secrets para dev/prod
- Rotacionar secret periodicamente
- Armazenar token em httpOnly cookie em produção (mais seguro que localStorage)

---

## 🔐 8.9 Acesso e Permissões

O sistema define três níveis de acesso com permissões específicas para cada função:

| Função | Permissões |
|--------|-------------|
| **Admin** | Acesso total a todos os módulos e relatórios |
| **Membro** | Pode criar indicações, visualizar comunicados e registrar presença |
| **Convidado** | Pode apenas preencher intenção de participação |

### **Permissões Detalhadas por Módulo**

#### **Módulo de Gestão de Membros**
- **Admin:** Aprovar/recusar intenções, gerar convites, listar membros, reativar membros inadimplentes
- **Membro:** Visualizar próprio perfil, atualizar dados pessoais
- **Convidado:** Submeter intenção de participação

#### **Módulo de Comunicação e Engajamento**
- **Admin:** Criar avisos e comunicados, criar reuniões, exportar relatórios de presença
- **Membro:** Visualizar avisos, realizar check-in em reuniões
- **Convidado:** Sem acesso

#### **Módulo de Geração de Negócios**
- **Admin:** Visualizar todas as indicações, gerar relatórios
- **Membro:** Criar indicações, receber indicações, atualizar status de indicações recebidas, criar "obrigados"
- **Convidado:** Sem acesso

#### **Módulo de Acompanhamento e Performance**
- **Admin:** Acesso completo ao dashboard, visualizar todos os relatórios, exportar dados
- **Membro:** Visualizar dashboard pessoal, visualizar próprias métricas
- **Convidado:** Sem acesso

#### **Módulo Financeiro**
- **Admin:** Visualizar todos os pagamentos, atualizar status de pagamento, gerar relatórios financeiros
- **Membro:** Visualizar próprias mensalidades e histórico de pagamentos
- **Convidado:** Sem acesso

---

## 💡 9. Requisitos Técnicos

### Dependências Principais
- ✅ Next.js 16.0.1 (App Router, Server Actions)
- ✅ TypeScript 5.x
- ✅ MongoDB 7.0.0 (driver oficial)
- ✅ TanStack Query 5.90.7 (realtime refetch)
- ✅ TailwindCSS 4.x + ShadCN/UI
- ✅ Zod 4.1.12 + React Hook Form 7.66.0
- ✅ Jest 30.2.0 + React Testing Library 16.3.0
- ✅ Framer Motion 12.23.24
- ✅ @faker-js/faker 10.1.0 (pt_BR)
- ⏳ Cypress (e2e) - pendente
- ⏳ CI/CD (GitHub Actions) - pendente
- ⏳ Coverage mínima: **95% global** - em progresso  

---

## 📱 10. UI/UX

### Implementado
- ✅ Mobile First + Atomic Responsivity (componentes base)
- ✅ Skeletons implementados (text, circular, rectangular)
- ✅ Optimistic UI (parcial - IntentionForm)
- ✅ Refetch inteligente configurado (onFocus, onMount, staleTime: 5min)
- ✅ Animações com Framer Motion (Button)

### Pendente
- ⏳ Loaders adicionais
- ⏳ Acessibilidade (WCAG 2.1)
- ⏳ Feedbacks via Toasts, modais e banners sutis
- ⏳ Refetch em intervalos (5s)  

---

## 🔄 10.1 Realtime e Reatividade

O sistema implementa atualizações em tempo real e reatividade através de estratégias específicas:

### **10.1.1 Refetch Automático em Mutações**
- Todas as mutações (POST, PATCH, DELETE) disparam refetch via TanStack Query
- Garante que a UI sempre reflita o estado mais recente do servidor
- Implementado através de `invalidateQueries` após operações bem-sucedidas

### **10.1.2 Cache e TTL**
- Dados críticos (intents, referrals, payments) têm cache TTL de 5 segundos
- Balanceia performance e atualização em tempo real
- Configurado via `staleTime` no TanStack Query

### **10.1.3 UI Otimista**
- Garante resposta instantânea antes da confirmação do backend
- Melhora a percepção de performance pelo usuário
- Implementado através de `optimisticUpdate` no TanStack Query
- Em caso de erro, a UI reverte automaticamente para o estado anterior

### **10.1.4 Refetch Inteligente**
- **onFocus:** Refetch automático quando a janela recebe foco
- **onMount:** Refetch ao montar componentes
- **onInterval:** Refetch periódico a cada 5 segundos para dados críticos
- Configurado globalmente no `QueryClient` do TanStack Query

### **10.1.5 WebSocket (Futuro)**
- WebSocket opcional para futuras atualizações instantâneas de avisos
- Permite notificações em tempo real sem polling
- Planejado para implementação futura quando necessário

---

## 🔍 11. Testes

### **11.1 Regras de Testes**

O sistema segue regras rigorosas de testes para garantir qualidade e confiabilidade:

- **Cobertura mínima global:** 95%  
- **Unit Tests:** regras de negócio, validações e componentes atômicos  
- **Integration Tests:** APIs (intents, members, referrals, payments)  
- **E2E Tests:** fluxo completo (Cypress)  
- **Mocks:** MSW + Mongo Memory Server  
- **CI/CD:** bloqueia merge se cobertura <95%

### **11.2 Estratégia de Testes**

#### **Testes Unitários**
Focam em testar componentes isolados e lógica de negócio:
- **Componentes:** Testes de renderização, interações do usuário, validações de formulários
- **Hooks:** Testes de lógica de estado, chamadas de API, cache
- **Services:** Testes de regras de negócio, validações, transformações de dados
- **Repositories:** Testes de queries, operações CRUD, validações de dados
- **Utilitários:** Testes de funções puras, formatação, cálculos

#### **Testes de Integração**
Validam o funcionamento completo de fluxos:
- Fluxo completo de admissão (intenção → aprovação → cadastro)
- Fluxo de criação de indicação
- Fluxo de aprovação de intenção
- API Routes principais com validação end-to-end

#### **Testes E2E (Cypress)**
Cobrem os fluxos críticos do sistema:
- Fluxo completo de admissão (intenção → aprovação → cadastro)
- Fluxo de indicação de negócios
- Dashboard administrativo
- Cobertura mínima de 80% dos fluxos críticos

### **11.3 Ferramentas e Mocks**

- **MSW (Mock Service Worker):** Para mockar chamadas de API em testes
- **Mongo Memory Server:** Para testes de integração com banco de dados isolado
- **Faker.js (pt_BR):** Para geração de dados de teste realistas
- **Jest + React Testing Library:** Para testes unitários e de componentes

### **11.4 Estratégia de Testes Detalhada**

#### **Configuração de Ambiente de Teste**

**MongoDB Memory Server:**
- Banco de dados isolado para cada suite de testes
- Limpeza automática entre testes
- Configuração em `jest.setup.js`:

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await mongoServer.stop();
});

afterEach(async () => {
  // Limpar collections entre testes
  const db = await getDatabase();
  await db.collection('intentions').deleteMany({});
  await db.collection('members').deleteMany({});
  // ... outras collections
});
```

**MSW (Mock Service Worker):**
- Intercepta requisições HTTP em testes
- Permite testar componentes sem servidor real
- Configuração em `src/tests/mocks/handlers.ts`:

```typescript
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/intentions', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ success: true, data: {...} }));
  }),
  // ... outros handlers
];
```

#### **Estrutura de Testes**

```
tests/
├── unit/                    # Testes unitários
│   ├── components/          # Componentes isolados
│   ├── hooks/              # Custom hooks
│   ├── services/           # Services (lógica de negócio)
│   ├── repositories/       # Repositories (acesso a dados)
│   └── utils/              # Funções utilitárias
│
├── integration/            # Testes de integração
│   ├── api/                # API Routes completas
│   ├── flows/              # Fluxos completos
│   │   ├── admission.test.ts      # Intenção → Aprovação → Cadastro
│   │   ├── referral.test.ts        # Criação → Atualização → Obrigado
│   │   └── meeting.test.ts         # Criação → Check-in
│   └── database/           # Testes de persistência
│
└── e2e/                     # Testes end-to-end (Cypress)
    ├── admission.cy.ts      # Fluxo completo de admissão
    ├── referral.cy.ts       # Fluxo de indicações
    └── dashboard.cy.ts      # Dashboard administrativo
```

#### **Cobertura de Testes por Camada**

| Camada | Cobertura Mínima | Foco |
|--------|-------------------|------|
| **Components** | 95% | Renderização, interações, validações de formulário |
| **Hooks** | 95% | Lógica de estado, chamadas de API, cache |
| **Services** | 95% | Regras de negócio, validações, transformações |
| **Repositories** | 90% | Queries, CRUD, validações de dados |
| **API Routes** | 95% | End-to-end: request → service → response |
| **Utils** | 95% | Funções puras, formatação, cálculos |

#### **Comandos de Teste**

```bash
# Executar todos os testes
pnpm test

# Executar com cobertura
pnpm test:coverage

# Executar apenas testes unitários
pnpm test:unit

# Executar apenas testes de integração
pnpm test:integration

# Executar testes E2E (Cypress)
pnpm test:e2e

# Executar testes em modo watch
pnpm test:watch
```

#### **Exemplo de Teste de Integração**

```typescript
describe('Fluxo Completo de Admissão', () => {
  it('deve criar intenção, aprovar, gerar convite e cadastrar membro', async () => {
    // 1. Criar intenção
    const intencao = await criarIntencao(dadosFake);
    expect(intencao.status).toBe('pending');
    
    // 2. Aprovar intenção (admin)
    const aprovacao = await aprovarIntencao(intencao._id, ADMIN_TOKEN);
    expect(aprovacao.status).toBe('approved');
    expect(aprovacao.invite.token).toBeDefined();
    
    // 3. Validar token
    const validacao = await validarToken(aprovacao.invite.token);
    expect(validacao.valido).toBe(true);
    
    // 4. Cadastrar membro completo
    const membro = await cadastrarMembro({
      ...dadosFake,
      token: aprovacao.invite.token
    });
    expect(membro._id).toBeDefined();
    expect(membro.ativo).toBe(true);
    
    // 5. Verificar token marcado como usado
    const inviteUsado = await buscarInvite(aprovacao.invite.token);
    expect(inviteUsado.usado).toBe(true);
  });
});
```

### Implementado
- ✅ **Testes Unitários:**
  - ✅ Componentes: IntentionForm, Button, Input
  - ✅ Hooks: useIntentions
  - ✅ API Routes: POST /api/intentions
- ✅ **Helpers de Teste:**
  - ✅ Faker.js configurado (pt_BR)
  - ✅ Seeders para popular banco de dados
  - ✅ Funções auxiliares para testes

### Pendente
- ⏳ **Testes Unitários:** Services, Repositories, Utilitários
- ⏳ **Testes de Integração:** Fluxos completos
- ⏳ **E2E (Cypress):** Fluxo completo de admissão e dashboard
- ⏳ **Mock:** MSW (Mock Service Worker)
- ⏳ **Cobertura mínima:** **95% global** (em progresso)  

---

## ⚙️ 12. Performance e Otimizações

### **12.1 Paginação e Limites**

Todas as listagens implementam paginação para garantir performance:

| Endpoint | Limite Padrão | Limite Máximo | Ordenação |
|----------|---------------|---------------|-----------|
| `GET /api/intentions` | 20 | 100 | `createdAt: -1` |
| `GET /api/referrals` | 20 | 100 | `createdAt: -1` |
| `GET /api/members` | 20 | 100 | `createdAt: -1` |
| `GET /api/obrigados` | 20 | 100 | `createdAt: -1` |
| `GET /api/meetings` | 20 | 100 | `data: -1` |

**Parâmetros de Paginação:**
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 20, max: 100)

**Resposta com Paginação:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### **12.2 Cache e TTL**

O sistema utiliza TanStack Query para cache inteligente:

| Tipo de Dado | staleTime | gcTime | Refetch |
|--------------|-----------|--------|---------|
| **Dados Críticos** (intenções, indicações) | 5s | 10min | onFocus, onMount, onInterval (5s) |
| **Dados Estáticos** (membros, configurações) | 5min | 30min | onFocus, onMount |
| **Dados Públicos** (avisos) | 1min | 5min | onFocus, onMount |

**Configuração Global:**
```typescript
// src/app/providers.tsx
staleTime: 1000 * 60 * 5,  // 5 minutos padrão
gcTime: 1000 * 60 * 10,    // 10 minutos no cache
refetchOnWindowFocus: true,
refetchOnMount: true,
```

### **12.3 Índices MongoDB**

Índices otimizados para queries frequentes:

**Collection: `intentions`:**
- `{ email: 1 }` - Único (evita duplicatas)
- `{ status: 1, createdAt: -1 }` - Composto (listagem admin)
- `{ createdAt: -1 }` - Ordenação temporal

**Collection: `referrals`:**
- `{ membroIndicadorId: 1, status: 1 }` - Indicações feitas
- `{ membroIndicadoId: 1, status: 1 }` - Indicações recebidas
- `{ status: 1, createdAt: -1 }` - Dashboard e relatórios

**Collection: `members`:**
- `{ email: 1 }` - Único (login e busca)
- `{ ativo: 1, createdAt: -1 }` - Listagem de membros ativos

### **12.4 Rate Limiting**

Proteção contra abuso e sobrecarga:

| Endpoint | Limite | Janela | Ação |
|----------|--------|--------|------|
| `POST /api/intentions` | 3 req | 1 hora | Bloqueia IP temporariamente |
| `POST /api/members` | 5 req | 1 hora | Bloqueia IP temporariamente |
| `POST /api/referrals` | 20 req | 1 minuto | Retorna 429 (Too Many Requests) |
| `GET /api/*` | 100 req | 1 minuto | Retorna 429 |

**Implementação Futura:**
- Usar `@upstash/ratelimit` ou similar
- Armazenar contadores em Redis
- Headers de resposta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### **12.5 Otimizações de Queries**

**Agregações MongoDB:**
- Usar `$lookup` para joins quando necessário
- `$project` para retornar apenas campos necessários
- `$limit` e `$skip` para paginação eficiente

**Exemplo de Query Otimizada:**
```typescript
// Buscar indicações com dados do membro indicado
db.referrals.aggregate([
  { $match: { membroIndicadorId: memberId } },
  { $lookup: {
      from: 'members',
      localField: 'membroIndicadoId',
      foreignField: '_id',
      as: 'membroIndicado'
    }
  },
  { $unwind: '$membroIndicado' },
  { $project: {
      empresaContato: 1,
      descricao: 1,
      status: 1,
      'membroIndicado.nome': 1,
      'membroIndicado.empresa': 1
    }
  },
  { $sort: { createdAt: -1 } },
  { $limit: 20 }
]);
```

### **12.6 Lazy Loading e Code Splitting**

- **Componentes:** Lazy load de componentes pesados (gráficos, tabelas grandes)
- **Rotas:** Code splitting automático pelo Next.js App Router
- **Imagens:** Next.js Image component com otimização automática

### **12.7 Monitoramento de Performance**

**Métricas a Monitorar:**
- Tempo de resposta de APIs (p95, p99)
- Taxa de erro por endpoint
- Uso de memória e CPU
- Conexões ativas no MongoDB
- Tamanho das collections

**Ferramentas Futuras:**
- Vercel Analytics (frontend)
- MongoDB Atlas Performance Advisor
- Sentry (erros e performance)

---

## 🚀 13. Deploy
- **Frontend:** Vercel  
- **Backend/API:** rotas integradas (Next.js)  
- **Banco:** MongoDB Atlas  
- **Variáveis (.env.local):**
  ```env
  MONGODB_URI=
  ADMIN_TOKEN=
  JWT_SECRET=
  NEXT_PUBLIC_APP_URL=
  ```

---

## 📊 14. Critérios de Avaliação (Ajustados)

| Critério | Peso | Requisito |
|-----------|-------|-----------|
| Componentização e Qualidade | 90% | Componentes atômicos, reutilizáveis e performáticos |
| Testes (Unit + E2E) | 95% | Cobertura mínima global 95% |
| Integração Fullstack | 100% | Comunicação e sincronização em tempo real |
| Boas práticas | 75% | Clean Code, Commits claros, Documentação e UI/UX |

---

## ✅ 15. Conclusão
Este documento define uma base sólida para a implementação de um sistema moderno, escalável e responsivo, aplicando os princípios de **Clean Code**, **Clean Architecture**, **Atomic Design**, **UI Otimista** e **Realtime Refetch**.  

### **15.1 Benefícios das Regras e Fluxos Definidos**

As regras e fluxos definidos asseguram:
- **Clareza nas responsabilidades e etapas:** Cada módulo possui regras de negócio claras e fluxos bem documentados, facilitando a manutenção e evolução do sistema.
- **Atualizações em tempo real e UX otimista:** O sistema garante que os usuários sempre vejam dados atualizados através de refetch automático e UI otimista, proporcionando uma experiência fluida e responsiva.
- **Validações consistentes e controle administrativo robusto:** Todas as entradas são validadas com Zod no frontend e backend, garantindo integridade dos dados e segurança.
- **Base sólida para evolução futura:** A arquitetura permite fácil adição de funcionalidades como notificações, gamificação e planos pagos sem necessidade de refatoração significativa.

### **15.2 Progresso Atual**
O projeto está em desenvolvimento ativo com a base sólida já implementada:
- ✅ Infraestrutura completa (MongoDB, React Query, Jest)
- ✅ Componentes UI base (Button, Input, Textarea, Card, Badge, Skeleton)
- ✅ Fluxo de intenções públicas funcional
- ✅ Camadas de arquitetura (Repositories, Services, Types)
- ✅ Helpers de teste configurados

### **15.3 Correções de Configuração Concluídas**
Todas as correções de configuração identificadas na seção 16 foram concluídas:
1. ✅ Corrigidos caminhos no `jest.config.js` para estrutura `src/`
2. ✅ Criado arquivo `.env.example` com todas as variáveis necessárias
3. ✅ Adicionados headers de segurança no `next.config.ts`
4. ✅ Padronizados imports TypeScript (ajustados paths e revisados imports)

### Próximos Passos
- ✅ **CONCLUÍDO:** Correções de configuração (seção 15)
- ✅ **CONCLUÍDO:** Área administrativa para gestão de intenções
- ✅ **CONCLUÍDO:** Sistema completo de convites e cadastro de membros
- 🚧 Sistema de indicações de negócios
- 📋 Testes com cobertura ≥ 95% (em progresso)
- 📋 Refinamentos e otimizações

Com cobertura de testes de **95%+** (meta), o sistema garantirá confiabilidade e alto padrão de qualidade.

---

## ⚠️ 16. Problemas de Configuração Identificados

Antes de iniciar a implementação das features pendentes, os seguintes problemas de configuração precisam ser corrigidos:

### **16.1 Configuração do Jest (jest.config.js)** ✅ **CONCLUÍDO**

**Problema:** Os caminhos de cobertura estavam incorretos - estava procurando em `app/**`, `components/**`, mas o projeto usa `src/app/**`, `src/components/**`.

**Correção realizada:**
- ✅ Ajustado `collectCoverageFrom` para usar `src/app/**`, `src/components/**`, `src/hooks/**`, `src/services/**`, `src/lib/**`
- ✅ Ajustado `moduleNameMapper` para mapear `@/*` para `<rootDir>/src/*`

### **16.2 Arquivo .env.example** ✅ **CONCLUÍDO**

**Problema:** Arquivo não existia, mas é necessário conforme boas práticas.

**Correção realizada:**
- ✅ Criado `.env.example` na raiz do projeto com todas as variáveis de ambiente necessárias:
  ```env
  MONGODB_URI=mongodb+srv://...
  MONGODB_DB_NAME=networking_group
  ADMIN_TOKEN=seu_token_secreto_aqui
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### **16.3 Headers de Segurança (next.config.ts)** ✅ **CONCLUÍDO**

**Problema:** Headers de segurança não estavam configurados conforme documentação.

**Correção realizada:**
- ✅ Adicionada função `headers()` no `next.config.ts` com os headers de segurança:
  - X-DNS-Prefetch-Control
  - Strict-Transport-Security
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection

### **16.4 Inconsistência nos Imports TypeScript** ✅ **CONCLUÍDO**

**Problema:** Alguns arquivos usavam `@/src/...` e outros `@/lib/...`. O `tsconfig.json` definia `@/*` como `./*`, então havia inconsistência.

**Correção realizada:**
- ✅ Ajustado `tsconfig.json` para que `@/*` aponte para `./src/*`
- ✅ Padronizados todos os imports para usar `@/...` (sem `src/`):
  - `@/src/types/...` → `@/types/...`
  - `@/src/services/...` → `@/services/...`
  - `@/src/hooks/...` → `@/hooks/...`
- ✅ Revisados e corrigidos todos os imports no projeto (15 arquivos atualizados)

### **16.5 Estrutura de Pastas**

**Observação:** O projeto utiliza a estrutura `src/` para organização do código. Todos os caminhos de configuração devem considerar essa estrutura.

**Estrutura atual:**
```
src/
├── app/          # Next.js App Router
├── components/   # Componentes React
├── hooks/        # Custom Hooks
├── services/     # Camada de Aplicação
├── lib/          # Infraestrutura (MongoDB, Repositories, Utils)
├── types/        # TypeScript Types
└── tests/        # Helpers de teste
```

---

## 📋 17. Checklist de Implementação

### **Infraestrutura e Configuração**
- [x] Configuração do projeto Next.js 15 com App Router
- [x] Configuração do MongoDB (conexão, pooling, transactions)
- [x] Configuração do TanStack Query (providers, cache, refetch)
- [x] Configuração do Jest e React Testing Library
- [ ] Configuração do ESLint e Prettier
- [x] Configuração do TailwindCSS e ShadCN/UI
- [x] **Setup de variáveis de ambiente (.env.example)** - ✅ **CONCLUÍDO**
- [x] **Configuração de headers de segurança** - ✅ **CONCLUÍDO**
- [x] **Correção de caminhos no jest.config.js** - ✅ **CONCLUÍDO**
- [x] **Padronização de imports TypeScript** - ✅ **CONCLUÍDO**

### **Componentes UI Base (ATOMIC)**
- [x] Button (variantes, tamanhos, loading, animações)
- [x] Input (label, error, helperText)
- [x] Textarea
- [x] Card (header, content, footer)
- [x] Badge (variantes de status)
- [x] Skeleton (loading states)
- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Table (componentes de tabela)
- [ ] Form (wrapper com validação)

### **Gestão de Membros - Fluxo de Admissão**
- [x] **Página de Intenção Pública**
  - [x] Formulário de intenção (`/intention`)
  - [x] Validação com Zod e React Hook Form
  - [x] Integração com API POST /api/intentions
  - [x] Feedback visual (sucesso/erro)
  - [x] Testes unitários do formulário
  - [x] Testes de integração da API

- [x] **Área Administrativa - Gestão de Intenções**
  - [x] Listagem de intenções (`/admin/intents`)
  - [x] Filtros por status (pending, approved, rejected)
  - [x] Paginação
  - [x] Ações de aprovar/recusar
  - [x] Proteção com ADMIN_TOKEN
  - [x] Componentes: IntentionList, IntentionCard
  - [x] Hook useIntentions atualizado
  - [x] API GET /api/intentions (admin)
  - [x] API PATCH /api/intentions/[id]/status
  - [ ] Testes de integração

- [x] **Sistema de Convites**
  - [x] Geração automática de token ao aprovar
  - [x] Repository de convites
  - [x] Service de convites
  - [x] API POST /api/invites
  - [x] API GET /api/invites/[token]
  - [x] Validação de token (expirado, usado)
  - [ ] Testes unitários e integração

- [x] **Cadastro Completo de Membros**
  - [x] Página de cadastro com token (`/register/[token]`)
  - [x] Validação de token antes de exibir formulário
  - [x] Formulário completo (telefone, linkedin, área de atuação)
  - [x] Componente: MemberForm
  - [x] API POST /api/members
  - [x] Marcar token como usado após cadastro
  - [ ] Testes E2E do fluxo completo

### **Sistema de Indicações (Opção A)**
- [ ] **Criação de Indicações**
  - [ ] Formulário de indicação
  - [ ] Seleção de membro indicado
  - [ ] Campos: empresa, descrição, valor estimado
  - [ ] API POST /api/referrals
  - [ ] Testes unitários

- [ ] **Gestão de Indicações**
  - [ ] Página de indicações (`/admin/referrals` ou `/referrals`)
  - [ ] Listagem de indicações feitas
  - [ ] Listagem de indicações recebidas
  - [ ] Filtros por status
  - [ ] API GET /api/referrals
  - [ ] Testes de integração

- [ ] **Atualização de Status**
  - [ ] Componente de atualização de status
  - [ ] API PATCH /api/referrals/[id]/status
  - [ ] Histórico de mudanças
  - [ ] Testes unitários

- [ ] **Sistema de "Obrigados"**
  - [ ] Formulário de agradecimento
  - [ ] API POST /api/obrigados
  - [ ] Feed público de agradecimentos
  - [ ] Testes de integração

### **Dashboard de Performance (Opção B)**
- [ ] **Dashboard Administrativo**
  - [ ] Página de dashboard (`/admin/dashboard`)
  - [ ] Cards de estatísticas (membros ativos, indicações, obrigados)
  - [ ] Gráficos de performance
  - [ ] Filtros por período (semanal, mensal, acumulado)
  - [ ] API GET /api/dashboard
  - [ ] Testes de integração

- [ ] **Métricas e Relatórios**
  - [ ] Total de membros ativos
  - [ ] Total de indicações no mês
  - [ ] Total de "obrigados" no mês
  - [ ] Taxa de conversão de intenções
  - [ ] Performance individual de membros
  - [ ] Testes unitários dos cálculos

### **Comunicação e Engajamento**
- [ ] **Sistema de Avisos**
  - [ ] CRUD de avisos (admin)
  - [ ] Listagem pública de avisos
  - [ ] Tipos de aviso (info, warning, success, urgent)
  - [ ] API de avisos
  - [ ] Testes de integração

- [ ] **Check-in em Reuniões**
  - [ ] Formulário de registro de reunião 1:1
  - [ ] Listagem de reuniões
  - [ ] Funcionalidade de check-in
  - [ ] API de reuniões
  - [ ] Testes de integração

### **Módulo Financeiro**
- [ ] **Controle de Mensalidades**
  - [ ] Geração de mensalidades (automática ou manual)
  - [ ] Listagem de pagamentos
  - [ ] Atualização de status de pagamento
  - [ ] Relatórios financeiros
  - [ ] API de pagamentos
  - [ ] Testes de integração

### **Hooks Customizados**
- [x] `useIntentions()` - Gerenciamento de intenções (criação implementada)
- [ ] `useReferrals()` - Gerenciamento de indicações
- [ ] `useMembers()` - Gerenciamento de membros
- [ ] `useDashboard()` - Dados do dashboard
- [x] Testes unitários do hook `useIntentions`

### **Services (Camada de Aplicação)**
- [x] `IntentionService` - Lógica de negócio de intenções
- [x] `InviteService` - Lógica de negócio de convites
- [x] `MemberService` - Lógica de negócio de membros
- [x] `ReferralService` - Lógica de negócio de indicações
- [ ] `DashboardService` - Lógica de negócio do dashboard
- [ ] Testes unitários de cada service

### **Repositories (Camada de Infraestrutura)**
- [x] `IntentionRepository` - Acesso a dados de intenções
- [x] `InviteRepository` - Acesso a dados de convites
- [x] `MemberRepository` - Acesso a dados de membros
- [x] `ReferralRepository` - Acesso a dados de indicações
- [ ] `MeetingRepository` - Acesso a dados de reuniões
- [ ] `NoticeRepository` - Acesso a dados de avisos
- [ ] `PaymentRepository` - Acesso a dados de pagamentos
- [ ] Testes unitários de cada repository

### **Validações e Schemas**
- [x] Schemas Zod para todas as entidades principais (Intention, Member, Invite, Referral)
- [x] Validação na API Route POST /api/intentions
- [x] Mensagens de erro consistentes
- [x] Testes de validação (parcial)

### **Testes**
- [ ] **Testes Unitários**
  - [x] Componentes UI (parcial - IntentionForm, Button, Input)
  - [x] Hooks customizados (parcial - useIntentions)
  - [ ] Services (cobertura mínima 95%)
  - [ ] Repositories (cobertura mínima 90%)
  - [ ] Utilitários (cobertura mínima 95%)

- [ ] **Testes de Integração**
  - [x] API Route POST /api/intentions
  - [ ] Fluxo completo de admissão
  - [ ] Fluxo de criação de indicação
  - [ ] Fluxo de aprovação de intenção
  - [ ] API Routes principais

- [ ] **Testes E2E (Cypress)**
  - [ ] Fluxo completo de admissão (intenção → aprovação → cadastro)
  - [ ] Fluxo de indicação de negócios
  - [ ] Dashboard administrativo
  - [ ] Cobertura mínima de 80% dos fluxos críticos

- [ ] **Cobertura Global**
  - [ ] Cobertura mínima de 95% global
  - [ ] Relatório de cobertura gerado
  - [ ] CI/CD com verificação de cobertura

### **UI/UX e Performance**
- [x] Design Mobile First implementado (parcial)
- [x] Componentes responsivos (mobile, tablet, desktop) - componentes base
- [x] Estados de loading (Skeletons implementados)
- [x] UI Otimista em mutations (parcial - IntentionForm)
- [x] Refetch automático (onFocus, onMount configurados no React Query)
- [ ] Feedback visual (Toasts, Modals) - pendente componentes
- [ ] Acessibilidade (WCAG 2.1 básico)
- [x] Animações com Framer Motion (Button implementado)

### **Documentação**
- [ ] README.md completo com instruções de instalação
- [ ] Documentação de API (comentários nos endpoints)
- [ ] Documentação de componentes (JSDoc)
- [ ] Guia de contribuição
- [ ] Documentação de deploy

### **Deploy e CI/CD**
- [ ] Configuração do Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] MongoDB Atlas configurado
- [ ] GitHub Actions para CI/CD
- [ ] Testes automatizados no CI
- [ ] Deploy automático em produção

### **Boas Práticas**
- [ ] Commits claros e descritivos
- [ ] Código limpo e bem organizado
- [ ] Sem código duplicado
- [ ] Reutilização de componentes e funções
- [ ] TypeScript sem `any` desnecessário
- [ ] Tratamento de erros consistente
- [ ] Logs apropriados