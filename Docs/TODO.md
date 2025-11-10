# 📋 TODO - Tarefas Pendentes

Este arquivo contém a lista de tarefas pendentes organizadas por prioridade.

**Última atualização**: 2025-01-27

---

## 🔴 Alta Prioridade

### Autenticação e Segurança
- [x] Implementar autenticação JWT completa
- [x] Criar endpoints de login, refresh e logout
- [x] Atualizar todas as rotas API para usar JWT
- [ ] Implementar rotação de refresh tokens
- [ ] Adicionar blacklist de tokens (para logout seguro)
- [ ] Implementar rate limiting para endpoints de autenticação
- [ ] Adicionar validação de senha (quando implementado sistema de senhas)

### Testes
- [x] Criar testes para componentes de meeting
- [x] Criar testes para componentes de notice
- [ ] Criar testes para componentes de referral
- [ ] Criar testes para componentes restantes (MemberForm, IntentionList, etc.)
- [ ] Criar testes para endpoints de autenticação JWT
- [ ] Aumentar cobertura de testes para ≥ 99.9%

### Documentação
- [x] Criar README.md na raiz
- [x] Criar TODO.md
- [x] Criar CORRECOES.md
- [ ] Atualizar documentação técnica com detalhes de JWT
- [ ] Criar guia de uso da API de autenticação

---

## 🟡 Média Prioridade

### Melhorias de UX
- [ ] Substituir window.location.reload() por invalidação de queries
- [x] Substituir alert() por sistema de toast
- [ ] Adicionar loading states consistentes
- [ ] Melhorar feedback visual em operações assíncronas

### Refatoração
- [ ] Remover pasta layouts/ vazia (se não for usada)
- [ ] Consolidar funções duplicadas
- [ ] Melhorar tipagem TypeScript (eliminar 'any')
- [ ] Otimizar queries do React Query

### Funcionalidades
- [ ] Implementar sistema completo de "Obrigados"
- [ ] Melhorar dashboard de performance
- [ ] Adicionar filtros avançados nas listagens
- [ ] Implementar busca e paginação

---

## 🟢 Baixa Prioridade

### Melhorias Técnicas
- [ ] Adicionar logging estruturado
- [ ] Implementar monitoramento de erros (Sentry)
- [ ] Adicionar métricas de performance
- [ ] Otimizar bundle size
- [ ] Implementar cache de queries mais agressivo

### Documentação
- [ ] Criar guia de desenvolvimento
- [ ] Adicionar exemplos de uso da API
- [ ] Documentar padrões de código
- [ ] Criar diagramas de arquitetura

### DevOps
- [ ] Configurar CI/CD completo
- [ ] Adicionar testes E2E automatizados
- [ ] Implementar preview deployments
- [ ] Configurar alertas de monitoramento

---

## 📝 Notas

- Tarefas marcadas com [x] foram concluídas
- Prioridades podem mudar conforme necessidade do projeto
- Novas tarefas devem ser adicionadas na seção apropriada

---

**Desenvolvido com ❤️ pela equipe Durch Soluções**

