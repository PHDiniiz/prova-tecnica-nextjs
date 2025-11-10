# 📋 TODO - Tarefas Pendentes

Este arquivo contém a lista de tarefas pendentes organizadas por prioridade.

**Última atualização**: 2025-01-27  
**Última verificação TypeScript**: 2025-01-27 (`npx tsc --noEmit -p tsconfig.test.json`)  
**Versão**: 0.2.0  
**Status dos Agentes**: ✅ Todos os agentes concluídos (2025-01-27)
- **Agente 1**: ✅ 4/4 tarefas concluídas (100%) - Lint pendente para execução futura
- **Agente 2**: ✅ 3/3 tarefas concluídas (100%)
- **Agente 3**: ✅ 3/3 tarefas concluídas (100%) - Pendências futuras documentadas

---

## 🔴 Alta Prioridade

### Autenticação e Segurança
- [x] Implementar autenticação JWT completa
- [x] Criar endpoints de login, refresh e logout
- [x] Atualizar todas as rotas API para usar JWT
- [x] Implementar rotação de refresh tokens
- [x] Adicionar blacklist de tokens (para logout seguro)
- [x] Implementar rate limiting para endpoints de autenticação
- [x] Preparar estrutura para validação de senha - Utilitários e testes criados, documentação completa

### Testes
- [x] Criar testes para componentes de meeting
- [x] Criar testes para componentes de notice
- [x] Criar testes para componentes de referral - Testes corrigidos e melhorados
- [x] Criar testes para componentes restantes (MemberForm, IntentionList, etc.) - Testes verificados e corrigidos
- [x] Criar testes para endpoints de autenticação JWT
- [x] Aumentar cobertura de testes para ≥ 40% - Meta atingida (66.39% statements, 70.79% functions)
- [x] Corrigir erro de tipo em ReferralService.test.ts (propriedade `membroIndicadorId` faltando - já estava corrigido)
- [x] Remover Cypress e configurar Jest como única ferramenta de testes
- [x] Corrigir testes de NoticeList e MeetingList (problemas com skeletons)
- [x] Adicionar testes de edge cases em hooks (useReferrals)
- [x] Implementar testes nos arquivos vazios - 6 arquivos implementados (42+ testes novos)
- [ ] Corrigir 67 testes falhando - Pendência futura (autenticação 401, mocks, ToastProvider)
- [ ] Aumentar cobertura de testes para 99.9% - Pendência futura (atual: 66.39% statements)

### Documentação
- [x] Criar README.md na raiz
- [x] Criar TODO.md
- [x] Criar CORRECOES.md
- [x] Criar ARQUITETURA.md com diagramas Mermaid
- [x] Criar MODELO_DADOS.md com documentação completa do banco
- [x] Criar ESTRUTURA_COMPONENTES.md documentando organização React
- [x] Criar API_REFERENCE.md com especificação completa da API
- [x] Atualizar README.md com instruções detalhadas de instalação e execução
- [x] Adicionar troubleshooting e soluções para problemas comuns

---

## 🟡 Média Prioridade

### Melhorias de UX
- [x] Substituir window.location.reload() por invalidação de queries - Verificado: 0 ocorrências no código, React Query configurado corretamente
- [x] Substituir alert() por sistema de toast
- [x] Adicionar loading states consistentes - Implementado em ReferralForm e IntentionList
- [ ] Melhorar feedback visual em operações assíncronas

### Refatoração
- [x] Remover pasta layouts/ vazia (se não for usada - não existe)
- [ ] Consolidar funções duplicadas
- [ ] Melhorar tipagem TypeScript (eliminar 'any')
- [x] Otimizar queries do React Query
- [x] Criar `tsconfig.test.json` separado para configuração de testes Jest

### Funcionalidades
- [ ] Implementar sistema completo de "Obrigados"
- [ ] Melhorar dashboard de performance
- [ ] Adicionar filtros avançados nas listagens
- [x] Implementar busca e paginação - Busca implementada em ReferralList, componente SearchInput criado

---

## 🟢 Baixa Prioridade

### Melhorias Técnicas
- [ ] Adicionar logging estruturado
- [ ] Implementar monitoramento de erros (Sentry)
- [ ] Adicionar métricas de performance
- [ ] Otimizar bundle size
- [x] Implementar cache de queries mais agressivo

### Documentação
- [x] Criar guia de desenvolvimento (ESTRUTURA_COMPONENTES.md)
- [x] Adicionar exemplos de uso da API (API_REFERENCE.md)
- [x] Documentar padrões de código (ESTRUTURA_COMPONENTES.md)
- [x] Criar diagramas de arquitetura (ARQUITETURA.md)

### DevOps
- [ ] Configurar CI/CD completo
- [ ] Adicionar mais testes de integração automatizados
- [ ] Implementar preview deployments
- [ ] Configurar alertas de monitoramento

---

## 📝 Pendências Futuras (Documentadas pelos Agentes)

### ⏳ Execução Futura
- **Lint**: Executar `pnpm lint` e corrigir erros (Agente 1 - pendente conforme solicitado)
- **Testes Falhando**: Corrigir 67 testes falhando (Agente 3 - pendência futura)
  - Principais problemas: autenticação 401, mocks de Response.json, múltiplos elementos, falta de ToastProvider
- **Cobertura de Testes**: Aumentar de 66.39% para 99.9% (Agente 3 - pendência futura)
  - Statements: 66.39% (meta: 99.9%)
  - Branches: 56.51% (meta: 99.9%)
  - Functions: 70.79% (meta: 99.9%)
  - Lines: 65.95% (meta: 99.9%)

## 📝 Notas

- Tarefas marcadas com [x] foram concluídas
- Prioridades podem mudar conforme necessidade do projeto
- Novas tarefas devem ser adicionadas na seção apropriada
- **Agentes concluídos em 2025-01-27**: Todos os agentes foram finalizados e seus arquivos foram removidos após conclusão

---

**Desenvolvido com ❤️ pela equipe Durch Soluções**

