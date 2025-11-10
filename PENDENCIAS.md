# 📋 PENDÊNCIAS - Lista Consolidada de Tarefas Pendentes

Este arquivo consolida todas as pendências do projeto identificadas pelos agentes de desenvolvimento e documentadas em diferentes arquivos.

**Última atualização**: 2025-01-27  
**Versão do Projeto**: 0.2.0  
**Status Geral**: ✅ Projeto funcional com pendências documentadas para execução futura

---

## 📊 Resumo Executivo

| Categoria | Quantidade | Prioridade |
|----------|------------|------------|
| 🔴 Alta Prioridade | 0 | - |
| 🟡 Média Prioridade | 5 | Testes, UX, Refatoração |
| 🟢 Baixa Prioridade | 8 | Lint, DevOps, Melhorias Técnicas |

**Total de Pendências**: 13 tarefas

---

## 🔴 Alta Prioridade

*Nenhuma pendência de alta prioridade no momento.*

---

## 🟡 Média Prioridade

### 1. Corrigir Testes Falhando (67 testes)

**Status**: ⏳ Pendente  
**Prioridade**: Média  
**Responsável**: Agente 6 (Testes e Validação)  
**Estimativa**: 4-8 horas

**Descrição**:  
Corrigir 67 testes que estão falhando devido a problemas com mocks e configuração. Estes testes não afetam a funcionalidade do sistema, mas precisam ser corrigidos para garantir cobertura completa.

**Problemas Identificados**:

1. **Autenticação 401** (~30 testes)
   - **Problema**: Mocks de `extrairMembroIdAtivoDoToken` não estão funcionando corretamente
   - **Impacto**: Testes de rotas API retornam 401 em vez do comportamento esperado
   - **Solução**: Ajustar mocks para retornar valores corretos
   - **Arquivos Afetados**: `src/app/api/**/__tests__/route.test.ts`

2. **Mocks de Response.json** (~15 testes)
   - **Problema**: Mocks de `NextResponse.json` não estão retornando objetos corretos
   - **Impacto**: Testes não conseguem verificar respostas corretamente
   - **Solução**: Ajustar mocks para retornar objetos com `json()` assíncrono
   - **Arquivos Afetados**: Testes de API routes

3. **Múltiplos Elementos** (~12 testes)
   - **Problema**: `getByText` encontra múltiplos elementos com mesmo texto
   - **Impacto**: Testes de componentes falham ao encontrar elementos únicos
   - **Solução**: Usar `getAllByText` ou adicionar `testId` para elementos únicos
   - **Arquivos Afetados**: Testes de componentes UI

4. **Falta de ToastProvider** (~10 testes)
   - **Problema**: Componentes que usam `useToast()` precisam de `ToastProvider` wrapper
   - **Impacto**: Testes falham com erro de contexto não encontrado
   - **Solução**: Adicionar `ToastProvider` nos testes que precisam
   - **Arquivos Afetados**: Testes de componentes que usam toast

**Ações Necessárias**:
1. Ajustar mocks de `extrairMembroIdAtivoDoToken` em todos os testes de API
2. Corrigir mocks de `NextResponse.json` para retornar objetos corretos
3. Usar `getAllByText` ou adicionar `testId` em testes de componentes
4. Adicionar `ToastProvider` wrapper nos testes que precisam
5. Executar `pnpm test` para validar correções

**Referências**:
- `Docs/TODO.md` - Seção de Testes
- `.cursor/Agents/Agente6.md` - Análise detalhada dos testes

---

### 2. Aumentar Cobertura de Testes para 99.9%

**Status**: ⏳ Pendente  
**Prioridade**: Média  
**Responsável**: Agente 3 e Agente 6  
**Estimativa**: 8-16 horas

**Descrição**:  
Aumentar a cobertura de testes de 66.39% para 99.9% em todas as métricas (statements, branches, functions, lines).

**Cobertura Atual**:
- **Statements**: 66.39% (meta: 99.9%) - **Faltam 33.61%**
- **Branches**: 56.51% (meta: 99.9%) - **Faltam 43.49%**
- **Functions**: 70.79% (meta: 99.9%) - **Faltam 29.21%**
- **Lines**: 65.95% (meta: 99.9%) - **Faltam 34.05%**

**Ações Necessárias**:
1. Adicionar testes para edge cases em todos os services
2. Testar cenários de erro em todas as rotas API
3. Aumentar cobertura de branches (if/else, switch, ternários)
4. Adicionar testes de integração para fluxos complexos
5. Testar casos de limite e validações de entrada
6. Adicionar testes para hooks customizados
7. Testar componentes com diferentes props e estados

**Camadas com Menor Cobertura**:
- API Routes: ~65% (meta: 99.9%)
- Hooks: ~70% (meta: 99.9%)
- Branches: 56.51% (meta: 99.9%)

**Referências**:
- `Docs/TODO.md` - Seção de Testes
- `.cursor/Agents/Agente3.md` - Validação de testes
- `.cursor/Agents/Agente6.md` - Análise de cobertura

---

### 3. Melhorar Feedback Visual em Operações Assíncronas

**Status**: ⏳ Pendente  
**Prioridade**: Média  
**Estimativa**: 2-4 horas

**Descrição**:  
Melhorar o feedback visual durante operações assíncronas para melhorar a experiência do usuário.

**Ações Necessárias**:
1. Adicionar indicadores de progresso em operações longas
2. Melhorar mensagens de loading em formulários
3. Adicionar animações de transição suaves
4. Implementar skeleton loaders mais detalhados
5. Adicionar feedback visual em operações de drag-and-drop (se aplicável)

**Referências**:
- `Docs/TODO.md` - Seção de Melhorias de UX

---

### 4. Consolidar Funções Duplicadas

**Status**: ⏳ Pendente  
**Prioridade**: Média  
**Estimativa**: 4-6 horas

**Descrição**:  
Identificar e consolidar funções duplicadas no código para seguir o princípio DRY (Don't Repeat Yourself).

**Ações Necessárias**:
1. Analisar código para identificar funções duplicadas
2. Criar funções utilitárias reutilizáveis
3. Refatorar código duplicado para usar funções compartilhadas
4. Adicionar testes para funções consolidadas
5. Documentar funções utilitárias criadas

**Referências**:
- `Docs/TODO.md` - Seção de Refatoração

---

### 5. Melhorar Tipagem TypeScript (Eliminar 'any')

**Status**: ⏳ Pendente  
**Prioridade**: Média  
**Estimativa**: 6-10 horas

**Descrição**:  
Melhorar a tipagem TypeScript eliminando o uso de `any` e criando tipos específicos.

**Ações Necessárias**:
1. Identificar todos os usos de `any` no código
2. Criar tipos específicos para cada caso
3. Substituir `any` por tipos adequados
4. Adicionar tipos genéricos onde apropriado
5. Validar que não há erros TypeScript após mudanças

**Referências**:
- `Docs/TODO.md` - Seção de Refatoração

---

## 🟢 Baixa Prioridade

### 6. Executar Lint e Corrigir Erros

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Responsável**: Agente 5 (Verificações Estáticas)  
**Estimativa**: 2-4 horas

**Descrição**:  
Executar `pnpm lint` e corrigir erros de qualidade de código encontrados. Esta tarefa foi adiada conforme solicitado pelo usuário e não bloqueia o desenvolvimento.

**Comando a Executar**:
```bash
pnpm lint
```

**Ações Necessárias**:
1. Executar `pnpm lint` para identificar problemas
2. Corrigir erros automaticamente quando possível (`pnpm lint --fix`)
3. Revisar erros que não podem ser corrigidos automaticamente
4. Ajustar configuração do ESLint se necessário
5. Documentar correções em `Docs/FIXES.md`

**Configuração ESLint**:
- ✅ `eslint.config.mjs` presente
- ✅ Next.js core web vitals configurado
- ✅ TypeScript strict configurado
- ✅ Regras relaxadas para testes

**Referências**:
- `.cursor/Agents/Agente5.md` - Verificação de Lint
- `Docs/TODO.md` - Seção de Pendências Futuras

---

### 7. Implementar Sistema Completo de "Obrigados"

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 8-12 horas

**Descrição**:  
Implementar funcionalidades adicionais no sistema de "Obrigados" (agradecimentos).

**Ações Necessárias**:
1. Definir requisitos completos do sistema
2. Implementar funcionalidades faltantes
3. Adicionar testes para novas funcionalidades
4. Documentar API de "Obrigados"

**Referências**:
- `Docs/TODO.md` - Seção de Funcionalidades

---

### 8. Melhorar Dashboard de Performance

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 6-10 horas

**Descrição**:  
Melhorar o dashboard de performance com métricas adicionais e visualizações mais detalhadas.

**Ações Necessárias**:
1. Adicionar métricas de performance
2. Implementar gráficos mais detalhados
3. Adicionar filtros avançados
4. Melhorar visualização de dados
5. Adicionar exportação de relatórios

**Referências**:
- `Docs/TODO.md` - Seção de Funcionalidades

---

### 9. Adicionar Filtros Avançados nas Listagens

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 4-6 horas

**Descrição**:  
Adicionar filtros avançados nas listagens para melhorar a experiência de busca e filtragem.

**Ações Necessárias**:
1. Identificar listagens que precisam de filtros avançados
2. Implementar filtros por múltiplos critérios
3. Adicionar filtros de data/período
4. Implementar filtros combinados
5. Adicionar testes para filtros

**Referências**:
- `Docs/TODO.md` - Seção de Funcionalidades

---

### 10. Adicionar Logging Estruturado

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 4-6 horas

**Descrição**:  
Implementar sistema de logging estruturado para facilitar debugging e monitoramento.

**Ações Necessárias**:
1. Escolher biblioteca de logging (ex: Winston, Pino)
2. Configurar logging estruturado
3. Adicionar logs em pontos críticos
4. Implementar níveis de log (debug, info, warn, error)
5. Configurar formato de saída (JSON, texto)

**Referências**:
- `Docs/TODO.md` - Seção de Melhorias Técnicas

---

### 11. Implementar Monitoramento de Erros (Sentry)

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 2-4 horas

**Descrição**:  
Integrar Sentry ou similar para monitoramento de erros em produção.

**Ações Necessárias**:
1. Criar conta no Sentry (ou similar)
2. Instalar e configurar SDK
3. Adicionar error boundaries no React
4. Configurar alertas de erro
5. Documentar integração

**Referências**:
- `Docs/TODO.md` - Seção de Melhorias Técnicas

---

### 12. Adicionar Métricas de Performance

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 4-6 horas

**Descrição**:  
Implementar coleta de métricas de performance (Core Web Vitals, tempo de resposta, etc.).

**Ações Necessárias**:
1. Implementar coleta de Core Web Vitals
2. Adicionar métricas de tempo de resposta de API
3. Implementar dashboard de métricas
4. Configurar alertas de performance
5. Documentar métricas coletadas

**Referências**:
- `Docs/TODO.md` - Seção de Melhorias Técnicas

---

### 13. Otimizar Bundle Size

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 4-8 horas

**Descrição**:  
Otimizar o tamanho do bundle JavaScript para melhorar performance de carregamento.

**Ações Necessárias**:
1. Analisar bundle size atual
2. Identificar dependências grandes
3. Implementar code splitting
4. Otimizar imports (tree shaking)
5. Remover dependências não utilizadas
6. Validar redução de bundle size

**Referências**:
- `Docs/TODO.md` - Seção de Melhorias Técnicas

---

## 🔧 DevOps e Infraestrutura

### 14. Configurar CI/CD Completo

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 8-12 horas

**Descrição**:  
Configurar pipeline CI/CD completo com testes automatizados, build e deploy.

**Ações Necessárias**:
1. Configurar GitHub Actions (ou similar)
2. Adicionar etapa de testes (`pnpm test`)
3. Adicionar etapa de lint (`pnpm lint`)
4. Adicionar etapa de typecheck (`npx tsc --noEmit`)
5. Adicionar etapa de build (`pnpm build`)
6. Configurar deploy automático
7. Adicionar bloqueio de merge se testes falharem

**Referências**:
- `Docs/TODO.md` - Seção de DevOps

---

### 15. Adicionar Mais Testes de Integração Automatizados

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 6-10 horas

**Descrição**:  
Adicionar mais testes de integração automatizados para cobrir fluxos complexos.

**Ações Necessárias**:
1. Identificar fluxos que precisam de testes de integração
2. Criar testes de integração para cada fluxo
3. Configurar ambiente de testes de integração
4. Adicionar testes ao pipeline CI/CD
5. Documentar testes de integração

**Referências**:
- `Docs/TODO.md` - Seção de DevOps

---

### 16. Implementar Preview Deployments

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 4-6 horas

**Descrição**:  
Configurar preview deployments para cada pull request.

**Ações Necessárias**:
1. Configurar plataforma de preview (Vercel, Netlify, etc.)
2. Integrar com GitHub/GitLab
3. Configurar variáveis de ambiente para preview
4. Adicionar comentários automáticos em PRs
5. Documentar processo de preview

**Referências**:
- `Docs/TODO.md` - Seção de DevOps

---

### 17. Configurar Alertas de Monitoramento

**Status**: ⏳ Pendente  
**Prioridade**: Baixa  
**Estimativa**: 2-4 horas

**Descrição**:  
Configurar alertas de monitoramento para erros, performance e disponibilidade.

**Ações Necessárias**:
1. Escolher plataforma de monitoramento
2. Configurar alertas de erro
3. Configurar alertas de performance
4. Configurar alertas de disponibilidade
5. Configurar notificações (email, Slack, etc.)

**Referências**:
- `Docs/TODO.md` - Seção de DevOps

---

## 📊 Estatísticas de Pendências

### Por Agente

| Agente | Pendências | Prioridade |
|--------|------------|------------|
| Agente 3 | 2 | Média |
| Agente 5 | 1 | Baixa |
| Agente 6 | 2 | Média |
| Geral | 12 | Variada |

### Por Categoria

| Categoria | Quantidade | % |
|-----------|------------|---|
| Testes | 2 | 15.4% |
| Qualidade de Código | 3 | 23.1% |
| UX | 1 | 7.7% |
| Funcionalidades | 3 | 23.1% |
| DevOps | 4 | 30.8% |

### Por Prioridade

| Prioridade | Quantidade | % |
|------------|------------|---|
| Alta | 0 | 0% |
| Média | 5 | 38.5% |
| Baixa | 8 | 61.5% |

---

## 📝 Notas Importantes

1. **Pendências não bloqueiam desenvolvimento**: Todas as pendências documentadas são melhorias futuras e não impedem o funcionamento do sistema.

2. **Prioridades podem mudar**: As prioridades podem ser ajustadas conforme necessidade do projeto ou feedback dos stakeholders.

3. **Testes falhando**: Os 67 testes falhando não afetam a funcionalidade do sistema, mas devem ser corrigidos para garantir qualidade.

4. **Cobertura de testes**: A cobertura atual (66.39%) já supera a meta mínima (≥40%), mas a meta final é 99.9%.

5. **Lint pendente**: A execução do lint foi adiada conforme solicitado pelo usuário e pode ser executada quando oportuno.

---

## 🔗 Referências

- `Docs/TODO.md` - Lista completa de tarefas
- `Docs/FIXES.md` - Registro de correções realizadas
- `.cursor/Agents/Agente3.md` - Validação de indicações
- `.cursor/Agents/Agente4.md` - Validação final
- `.cursor/Agents/Agente5.md` - Verificações estáticas
- `.cursor/Agents/Agente6.md` - Testes e validação

---

**Desenvolvido com ❤️ pela equipe Durch Soluções**

**Última atualização**: 2025-01-27  
**Versão**: 0.2.0  
**Próxima Revisão**: Quando pendências forem concluídas

