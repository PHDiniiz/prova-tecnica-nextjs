# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para este projeto! Este documento fornece diretrizes e padrões para contribuições.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commits](#padrões-de-commits)
- [Testes](#testes)
- [Pull Requests](#pull-requests)
- [Estrutura de Branches](#estrutura-de-branches)

## 📜 Código de Conduta

- Seja respeitoso e profissional
- Aceite críticas construtivas
- Foque no que é melhor para o projeto
- Mostre empatia com outros membros da comunidade

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Faça fork do repositório
# Clone seu fork
git clone https://github.com/seu-usuario/prova-tecnica-nextjs.git
cd prova-tecnica-nextjs
```

### 2. Configure o Ambiente

```bash
# Instale dependências
yarn install

# Configure variáveis de ambiente
cp .env.example .env.local
```

### 3. Crie uma Branch

```bash
# Para features
git checkout -b feature/nome-da-feature

# Para correções
git checkout -b fix/nome-da-correcao

# Para documentação
git checkout -b docs/nome-da-doc
```

### 4. Faça suas Alterações

- Siga os padrões de código
- Adicione testes
- Atualize documentação se necessário

### 5. Teste suas Alterações

```bash
# Execute testes
yarn test

# Verifique tipos
yarn typecheck

# Execute linter
yarn lint

# Verifique gerenciador de pacotes
yarn verify-package-manager
```

### 6. Commit suas Mudanças

Use commits semânticos (veja [Padrões de Commits](#padrões-de-commits)).

### 7. Push e Pull Request

```bash
git push origin feature/nome-da-feature
```

Depois, abra um Pull Request no GitHub.

## 💻 Padrões de Código

### TypeScript

- Use **TypeScript strict mode**
- Evite `any` - prefira tipos específicos ou genéricos
- Use interfaces para objetos, types para unions
- Documente tipos complexos com JSDoc

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Evitar
const user: any = { ... };
```

### React

- Use componentes funcionais
- Prefira Server Components quando possível
- Use `'use client'` apenas quando necessário
- Use hooks customizados para lógica reutilizável

```typescript
// ✅ Bom
export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ Evitar
export class UserCard extends React.Component { ... }
```

### Nomenclatura

- **Componentes**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useUsers.ts`)
- **Services**: PascalCase com sufixo `Service` (`UserService.ts`)
- **Repositories**: PascalCase com sufixo `Repository` (`UserRepository.ts`)
- **Types**: camelCase (`user.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/              # Componentes atômicos
│   └── features/        # Componentes de features
├── hooks/               # Custom hooks
├── services/            # Camada de aplicação
├── lib/
│   └── repositories/    # Camada de infraestrutura
└── types/               # Tipos TypeScript
```

### Clean Code

- Funções pequenas e focadas (Single Responsibility)
- Nomes descritivos e claros
- Evite código duplicado (DRY)
- Comente apenas o necessário (código autoexplicativo)

```typescript
// ✅ Bom
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ❌ Evitar
function calc(items: any[]): number {
  let t = 0;
  for (let i = 0; i < items.length; i++) {
    t += items[i].p * items[i].q;
  }
  return t;
}
```

## 📝 Padrões de Commits

Use **Conventional Commits** em português brasileiro (particípio passado):

### Formato

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de manutenção

### Exemplos

```bash
# Feature
git commit -m "feat(referrals): adicionado sistema de obrigados"

# Fix
git commit -m "fix(auth): corrigido validação de token expirado"

# Docs
git commit -m "docs(readme): atualizado guia de instalação"

# Refactor
git commit -m "refactor(services): extraído lógica de validação para helper"

# Test
git commit -m "test(referrals): adicionados testes de integração"

# Chore
git commit -m "chore(deps): atualizado Next.js para 16.0.1"
```

### Regras

- Use **particípio passado** em português
- Primeira linha com máximo 72 caracteres
- Use o corpo para explicar o "porquê", não o "o quê"
- Referencie issues: `Closes #123`

## 🧪 Testes

### Cobertura Mínima

- **Global**: ≥ 95%
- **Componentes**: ≥ 95%
- **Services**: ≥ 95%
- **Repositories**: ≥ 90%

### Estrutura de Testes

```typescript
describe('ComponentName', () => {
  it('deve renderizar corretamente', () => {
    // Arrange
    // Act
    // Assert
  });

  it('deve lidar com erro quando X acontece', () => {
    // Teste de erro
  });
});
```

### Executar Testes

```bash
# Todos os testes
yarn test

# Com cobertura
yarn test:coverage

# Apenas arquivo específico
yarn test src/components/Button.test.tsx
```

### Boas Práticas

- Teste comportamento, não implementação
- Use nomes descritivos: `deve fazer X quando Y acontece`
- Isole testes (não dependa de ordem)
- Mock dependências externas
- Teste casos de sucesso e erro

## 🔀 Pull Requests

### Checklist

Antes de abrir um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (`yarn test`)
- [ ] Cobertura de testes mantida ou aumentada
- [ ] TypeScript sem erros (`yarn typecheck`)
- [ ] ESLint sem erros (`yarn lint`)
- [ ] Yarn está sendo usado (verificado por `yarn verify-package-manager`)
- [ ] Documentação atualizada (se necessário)
- [ ] Commits seguem padrão semântico

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
Passos para testar as mudanças.

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Código segue padrões do projeto
```

### Processo de Review

1. Mantenedores revisarão o PR
2. Pode haver solicitações de mudanças
3. Após aprovação, o PR será mergeado
4. Mantenha o PR atualizado com a branch principal

## 🌿 Estrutura de Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações

### Nomenclatura

```
feature/nome-da-feature
fix/nome-do-bug
docs/nome-da-doc
refactor/nome-do-refactor
```

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Abra uma issue no GitHub
2. Consulte a documentação técnica em `Documentacao.md`
3. Entre em contato com os mantenedores

---

**Obrigado por contribuir! 🎉**

