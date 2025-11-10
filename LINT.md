# Verificação de Lint - pnpm lint

**Data:** 2025-01-27  
**Comando:** `pnpm lint`

## Resultado

⚠️ **95 problemas encontrados (31 erros, 64 warnings)**

A verificação de lint foi executada e foram encontrados problemas que precisam ser corrigidos.

### Resumo

- **Status:** Falhou
- **Erros:** 31
- **Warnings:** 64
- **Total:** 95 problemas

---

## Erros Críticos (31)

### React Hooks - Rules of Hooks (2 erros)

1. **src/components/features/referral/ReferralList.tsx:101:24**
   - Erro: React Hook "useCallback" is called conditionally
   - Problema: Hook chamado após early return
   - Correção: Mover useCallback antes do early return

2. **src/components/features/referral/ReferralStatusUpdate.tsx:79:24**
   - Erro: React Hook "useCallback" is called conditionally
   - Problema: Hook chamado após early return
   - Correção: Mover useCallback antes do early return

### TypeScript - Unexpected any (29 erros)

#### DashboardRepository.ts (1 erro)
- Linha 557:56 - `Unexpected any. Specify a different type`

#### IntentionRepository.ts (3 erros)
- Linha 84:45 - `Unexpected any. Specify a different type`
- Linha 112:36 - `Unexpected any. Specify a different type`
- Linha 135:38 - `Unexpected any. Specify a different type`

#### InviteRepository.ts (1 erro)
- Linha 49:35 - `Unexpected any. Specify a different type`

#### MeetingRepository.ts (8 erros)
- Linha 24:93 - `Unexpected any. Specify a different type`
- Linha 43:45 - `Unexpected any. Specify a different type`
- Linha 68:56 - `Unexpected any. Specify a different type`
- Linha 99:20 - `Unexpected any. Specify a different type`
- Linha 102:65 - `Unexpected any. Specify a different type`
- Linha 143:26 - `Unexpected any. Specify a different type`
- Linha 154:36 - `Unexpected any. Specify a different type`
- Linha 200:43 - `Unexpected any. Specify a different type`

#### MemberRepository.ts (2 erros)
- Linha 38:45 - `Unexpected any. Specify a different type`
- Linha 108:34 - `Unexpected any. Specify a different type`

#### NoticeRepository.ts (6 erros)
- Linha 24:89 - `Unexpected any. Specify a different type`
- Linha 41:20 - `Unexpected any. Specify a different type`
- Linha 95:45 - `Unexpected any. Specify a different type`
- Linha 114:26 - `Unexpected any. Specify a different type`
- Linha 120:36 - `Unexpected any. Specify a different type`
- Linha 145:34 - `Unexpected any. Specify a different type`

#### ObrigadoRepository.ts (8 erros)
- Linha 18:20 - `Unexpected any. Specify a different type`
- Linha 21:77 - `Unexpected any. Specify a different type`
- Linha 25:75 - `Unexpected any. Specify a different type`
- Linha 64:20 - `Unexpected any. Specify a different type`
- Linha 67:77 - `Unexpected any. Specify a different type`
- Linha 71:75 - `Unexpected any. Specify a different type`
- Linha 112:62 - `Unexpected any. Specify a different type`
- Linha 134:27 - `Unexpected any. Specify a different type`

---

## Warnings (64)

### Variáveis não utilizadas (45 warnings)

#### Arquivos de Produção
- `src/app/api/auth/logout/route.ts:1:10` - 'NextRequest' não usado
- `src/app/meetings/page.tsx:8:10-47` - Dialog, DialogContent, DialogHeader, DialogTitle não usados
- `src/components/features/dashboard/DashboardPage.tsx:8:10,12:10` - TrendChart, cn não usados
- `src/components/features/dashboard/TrendChart.tsx:137:13,138:11` - largura, primeiro não usados
- `src/components/features/meeting/CheckInButton.tsx:3:10` - useState não usado
- `src/components/features/meeting/MeetingCard.tsx:59:3` - membroNome não usado
- `src/components/features/meeting/MeetingList.tsx:4:10,38:19` - Meeting, setFiltros não usados
- `src/components/features/member/MemberForm.tsx:10:10` - Textarea não usado
- `src/components/features/notice/NoticeForm.tsx:12:54` - NoticeType não usado
- `src/components/features/notice/NoticeList.tsx:9:10` - cn não usado
- `src/components/features/referral/ReferralCard.tsx:4:20,43:9` - ReferralStatus, podeAtualizarStatus não usados
- `src/components/ui/toast.tsx:6:10` - Button não usado
- `src/hooks/useObrigados.ts:4:10` - Obrigado não usado
- `src/lib/auth.ts:126:12,146:12` - error não usado (2 ocorrências)
- `src/lib/middleware/rateLimit.ts:101:22` - remaining não usado
- `src/lib/mongodb.ts:23:14` - error não usado
- `src/lib/repositories/InviteRepository.ts:1:14` - ObjectId não usado
- `src/services/MeetingService.ts:8:3` - CheckInDTO não usado

#### Arquivos de Teste
- Vários arquivos de teste com imports/variáveis não utilizados (BusinessError, data, error, etc.)

### React Hooks - Exhaustive Deps (4 warnings)

- `src/app/(public)/register/[token]/page.tsx:117:5` - useCallback faltando 'addToast' nas dependências
- `src/app/meetings/page.tsx:33:6` - useEffect faltando 'carregarMembrosAtivos' nas dependências
- `src/app/referrals/page.tsx:34:6` - useEffect faltando 'carregarMembrosAtivos' nas dependências
- `src/components/features/referral/ReferralStatusUpdate.tsx:62:9` - statusDisponiveis deveria estar em useMemo
- `src/components/ui/toast.tsx:53:19` - timeoutsRef.current deveria ser copiado para variável no cleanup

### React Hooks - Incompatible Library (1 warning)

- `src/components/features/referral/ReferralForm.tsx:93:25` - React Hook Form's `watch()` não pode ser memoizado com segurança

---

## Prioridades de Correção

### 🔴 Alta Prioridade (Erros Críticos)
1. Corrigir React Hooks chamados condicionalmente (2 erros)
2. Substituir todos os `any` por tipos específicos nos repositories (29 erros)

### 🟡 Média Prioridade (Warnings Importantes)
1. Remover imports/variáveis não utilizados em arquivos de produção
2. Corrigir dependências faltando em hooks React
3. Corrigir uso de React Hook Form watch()

### 🟢 Baixa Prioridade (Warnings em Testes)
1. Limpar imports não utilizados em arquivos de teste
2. Remover variáveis não utilizadas em testes

---

## Estratégia de Correção

### 1. Erros de React Hooks
- Mover todos os hooks (useCallback, useMemo, etc.) para antes de qualquer early return
- Garantir que hooks sejam sempre chamados na mesma ordem

### 2. Erros de TypeScript `any`
- Criar tipos específicos para queries MongoDB usando `Filter<T>`
- Criar interfaces para objetos de agregação
- Usar tipos genéricos quando apropriado

### 3. Warnings de Variáveis Não Utilizadas
- Remover imports não utilizados
- Remover variáveis declaradas mas não usadas
- Comentar código que será usado futuramente se necessário

### 4. Warnings de React Hooks
- Adicionar todas as dependências necessárias nos arrays de dependência
- Usar useMemo para valores calculados que são dependências
- Copiar refs para variáveis locais em cleanup functions

---

## Comandos Úteis

```bash
# Executar lint
pnpm lint

# Executar lint com auto-fix (quando possível)
pnpm lint --fix

# Verificar apenas erros (sem warnings)
pnpm lint --quiet

# Verificar arquivo específico
pnpm lint src/components/features/referral/ReferralList.tsx
```

---

## Notas

- Muitos warnings em arquivos de teste são aceitáveis conforme configuração do ESLint
- Focar primeiro nos erros críticos que bloqueiam o build
- Warnings de variáveis não utilizadas em testes podem ser ignorados se forem necessários para documentação

---

*Este arquivo foi atualizado automaticamente pela verificação de lint do ESLint.*  
*Última atualização: 2025-01-27*
