# Plano de Implementação - Autenticação JWT e Melhorias

**Data de Criação**: 2025-01-27  
**Status**: Planejado  
**Prioridade**: Alta e Média

---

## Fase 1: Alta Prioridade

### 1.1 Implementar Autenticação JWT Completa

**Objetivo**: Substituir o sistema atual de autenticação simples por JWT completo com access token (15min) e refresh token (7d).

**Arquivos a modificar/criar**:
- `src/lib/auth.ts` - Expandir com funções JWT
- `src/app/api/auth/login/route.ts` - Novo endpoint de login
- `src/app/api/auth/refresh/route.ts` - Novo endpoint de refresh token
- `src/app/api/auth/logout/route.ts` - Novo endpoint de logout
- `src/types/auth.ts` - Tipos para autenticação
- Atualizar todas as rotas API que usam `extrairMembroId()` para usar JWT
- `package.json` - Adicionar `jsonwebtoken` e `@types/jsonwebtoken`

**Implementação**:
- Instalar `jsonwebtoken` e tipos
- Criar funções: `gerarAccessToken()`, `gerarRefreshToken()`, `verificarToken()`, `extrairMembroIdDoToken()`
- Criar endpoints de autenticação (login, refresh, logout)
- Atualizar `src/lib/auth.ts` com funções JWT
- Substituir `extrairMembroId()` em todas as rotas API por `extrairMembroIdDoToken()`
- Adicionar middleware de autenticação se necessário
- Variáveis de ambiente: `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`

**Rotas API a atualizar**:
- `src/app/api/meetings/route.ts`
- `src/app/api/obrigados/route.ts`
- `src/app/api/referrals/route.ts`
- `src/app/api/referrals/[id]/status/route.ts`
- Outras rotas que usam `extrairMembroId()`

### 1.2 Criar Testes para Componentes sem Cobertura

**Componentes sem testes identificados**:
- `src/components/features/meeting/MeetingForm.tsx`
- `src/components/features/meeting/MeetingCard.tsx`
- `src/components/features/meeting/MeetingList.tsx`
- `src/components/features/meeting/CheckInButton.tsx`
- `src/components/features/notice/NoticeForm.tsx`
- `src/components/features/notice/NoticeCard.tsx`
- `src/components/features/notice/NoticeList.tsx`
- `src/components/features/notice/NoticeTypeBadge.tsx`
- `src/components/features/referral/ReferralCard.tsx`
- `src/components/features/referral/ReferralForm.tsx`
- `src/components/features/referral/ReferralList.tsx`
- `src/components/features/referral/ReferralStatusUpdate.tsx`
- `src/components/features/referral/ReferralStatusBadge.tsx`
- `src/components/features/member/MemberForm.tsx`
- `src/components/features/intention/IntentionList.tsx`
- `src/components/features/obrigado/ObrigadoForm.tsx`
- `src/components/features/obrigado/ObrigadosFeed.tsx`
- `src/components/features/dashboard/DashboardPage.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/textarea.tsx`
- `src/app/providers.tsx`

**Estrutura de testes**:
- Criar arquivos `__tests__/*.test.tsx` para cada componente
- Usar React Testing Library
- Mockar hooks e serviços quando necessário
- Cobertura mínima: renderização, interações básicas, estados de loading/error

### 1.3 Criar Arquivos de Documentação

**Arquivos a criar**:
- `README.md` (raiz) - Copiar conteúdo de `Docs/README.md` e atualizar
- `Docs/TODO.md` - Checklist de tarefas pendentes
- `Docs/CORRECOES.md` - Registro de correções e melhorias

**Conteúdo**:
- `README.md`: Manter estrutura atual, atualizar com informações de JWT
- `TODO.md`: Listar tarefas pendentes organizadas por prioridade
- `CORRECOES.md`: Template para registro de correções com data/hora

---

## Fase 2: Média Prioridade

### 2.1 Substituir window.location.reload() por Invalidação de Queries

**Arquivos a modificar**:
- `src/app/admin/notices/page.tsx` (linhas 68, 77)

**Implementação**:
- Importar `useQueryClient` do `@tanstack/react-query`
- Substituir `window.location.reload()` por `queryClient.invalidateQueries()`
- Invalidar queries específicas: `['notices']` após criar/atualizar/deletar

### 2.2 Substituir alert() por Sistema de Toast

**Arquivos a modificar**:
- `src/app/admin/notices/page.tsx` (linhas 67, 70)
- `src/app/referrals/page.tsx` (linha 66)
- `src/components/features/referral/ReferralStatusUpdate.tsx` (linha 80)
- `src/components/features/intention/IntentionList.tsx` (linhas 46, 68)
- `src/app/(public)/register/[token]/page.tsx` (linha 106)
- `src/app/(admin)/intents/page.tsx` (linha 31)

**Implementação**:
- Importar `useToast` de `@/components/ui/toast` em cada arquivo
- Substituir `alert()` por `addToast()` com variantes apropriadas:
  - `success` para sucesso
  - `error` para erros
  - `warning` para avisos
  - `info` para informações

### 2.3 Decidir sobre a Pasta layouts/

**Análise**:
- Pasta `src/components/layouts/` existe mas está vazia
- Verificar se há necessidade de layouts reutilizáveis

**Decisão**: Remover pasta vazia se não houver uso planejado, ou criar layout base se necessário.

**Ação**: Remover pasta vazia após confirmar que não há referências no código.

---

## Validação

Após cada fase:
1. Executar `npx tsc --noEmit` em loop até não haver erros
2. Executar `pnpm test` para garantir que testes passam
3. Executar `pnpm lint` para verificar qualidade de código
4. Atualizar documentação com mudanças realizadas

---

## Ordem de Execução

### Fase 1 (Alta Prioridade):
1. Instalar dependências JWT
2. Implementar funções JWT em `src/lib/auth.ts`
3. Criar endpoints de autenticação
4. Atualizar rotas API para usar JWT
5. Criar testes para componentes sem cobertura
6. Criar arquivos de documentação
7. Validar com `tsc --noEmit`

### Fase 2 (Média Prioridade):
1. Substituir `window.location.reload()` por invalidação de queries
2. Substituir `alert()` por toast
3. Remover pasta `layouts/` vazia
4. Validar com `tsc --noEmit`

---

## Checklist de Tarefas

### Fase 1 - Alta Prioridade

#### Autenticação JWT
- [ ] Instalar `jsonwebtoken` e `@types/jsonwebtoken`
- [ ] Criar `src/types/auth.ts` com tipos JWT
- [ ] Implementar funções JWT em `src/lib/auth.ts`
  - [ ] `gerarAccessToken()`
  - [ ] `gerarRefreshToken()`
  - [ ] `verificarToken()`
  - [ ] `extrairMembroIdDoToken()`
- [ ] Criar endpoint `/api/auth/login`
- [ ] Criar endpoint `/api/auth/refresh`
- [ ] Criar endpoint `/api/auth/logout`
- [ ] Atualizar `src/app/api/meetings/route.ts`
- [ ] Atualizar `src/app/api/obrigados/route.ts`
- [ ] Atualizar `src/app/api/referrals/route.ts`
- [ ] Atualizar `src/app/api/referrals/[id]/status/route.ts`
- [ ] Atualizar outras rotas que usam `extrairMembroId()`

#### Testes de Componentes
- [ ] Testes para componentes de meeting
  - [ ] `MeetingForm.test.tsx`
  - [ ] `MeetingCard.test.tsx`
  - [ ] `MeetingList.test.tsx`
  - [ ] `CheckInButton.test.tsx`
- [ ] Testes para componentes de notice
  - [ ] `NoticeForm.test.tsx`
  - [ ] `NoticeCard.test.tsx`
  - [ ] `NoticeList.test.tsx`
  - [ ] `NoticeTypeBadge.test.tsx`
- [ ] Testes para componentes de referral
  - [ ] `ReferralCard.test.tsx`
  - [ ] `ReferralForm.test.tsx`
  - [ ] `ReferralList.test.tsx`
  - [ ] `ReferralStatusUpdate.test.tsx`
  - [ ] `ReferralStatusBadge.test.tsx`
- [ ] Testes para componentes restantes
  - [ ] `MemberForm.test.tsx`
  - [ ] `IntentionList.test.tsx`
  - [ ] `ObrigadoForm.test.tsx`
  - [ ] `ObrigadosFeed.test.tsx`
  - [ ] `DashboardPage.test.tsx`
  - [ ] `skeleton.test.tsx`
  - [ ] `textarea.test.tsx`
  - [ ] `providers.test.tsx`

#### Documentação
- [ ] Criar `README.md` na raiz
- [ ] Criar `Docs/TODO.md`
- [ ] Criar `Docs/CORRECOES.md`

#### Validação Fase 1
- [ ] Executar `npx tsc --noEmit` sem erros
- [ ] Executar `pnpm test` - todos os testes passando
- [ ] Executar `pnpm lint` - sem erros

### Fase 2 - Média Prioridade

#### Substituições
- [ ] Substituir `window.location.reload()` em `src/app/admin/notices/page.tsx`
- [ ] Substituir `alert()` em `src/app/admin/notices/page.tsx`
- [ ] Substituir `alert()` em `src/app/referrals/page.tsx`
- [ ] Substituir `alert()` em `src/components/features/referral/ReferralStatusUpdate.tsx`
- [ ] Substituir `alert()` em `src/components/features/intention/IntentionList.tsx`
- [ ] Substituir `alert()` em `src/app/(public)/register/[token]/page.tsx`
- [ ] Substituir `alert()` em `src/app/(admin)/intents/page.tsx`

#### Limpeza
- [ ] Remover pasta `src/components/layouts/` vazia

#### Validação Fase 2
- [ ] Executar `npx tsc --noEmit` sem erros
- [ ] Executar `pnpm test` - todos os testes passando
- [ ] Executar `pnpm lint` - sem erros

---

## Notas de Implementação

### JWT
- Access token: 15 minutos de validade
- Refresh token: 7 dias de validade
- Secret deve ser configurado via variável de ambiente `JWT_SECRET`
- Tokens devem ser armazenados de forma segura (httpOnly cookies recomendado para produção)

### Testes
- Usar React Testing Library para testes de componentes
- Mockar dependências externas (hooks, serviços, APIs)
- Garantir cobertura mínima de renderização e interações básicas
- Testar estados de loading, error e success

### Toast
- Sistema de toast já existe em `src/components/ui/toast.tsx`
- Usar hook `useToast()` para adicionar notificações
- Variantes disponíveis: `success`, `error`, `warning`, `info`

### React Query
- Usar `queryClient.invalidateQueries()` para atualizar dados
- Invalidar queries específicas após mutações
- Evitar `window.location.reload()` para melhor UX

---

**Desenvolvido com ❤️ pela equipe Durch Soluções**

