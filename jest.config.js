const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho para o app do Next.js para carregar next.config.js e arquivos .env
  dir: './',
});

// Configuração customizada do Jest
const customJestConfig = {
  // Ambiente de testes
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup files antes dos testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Cobertura de testes
  collectCoverageFrom: [
    'src/app/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    'src/services/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  
  // Módulos que precisam ser transformados
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Extensões de arquivo que o Jest vai processar
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Transformações
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  // Arquivos de teste
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Ignorar pastas
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],
};

// Cria e exporta a configuração do Jest
module.exports = createJestConfig(customJestConfig);

