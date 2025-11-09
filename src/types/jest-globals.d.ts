/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Exclui tipos do Cypress para arquivos de teste do Jest
// Isso força o TypeScript a usar os tipos do Jest em vez dos tipos do Chai (Cypress)
declare global {
  // Remove tipos do Cypress do escopo global para testes do Jest
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Chainable {}
  }
}

// Garante que os tipos do Jest sejam usados
export {};

