// Importa os matchers customizados do jest-dom
import '@testing-library/jest-dom';

// Configurar variáveis de ambiente para testes
//
// Estas são as variáveis de ambiente padrão usadas durante a execução dos testes.
// O Next.js carrega automaticamente .env.test quando NODE_ENV=test, mas garantimos
// valores padrão aqui para que os testes funcionem mesmo sem o arquivo .env.test.
//
// IMPORTANTE: Estes são valores de TESTE apenas, não usar em produção!
// Para sobrescrever estes valores, crie um arquivo .env.test na raiz do projeto.
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://dbAdmin:NjcyEKTrJRFRWfVG@cluster0.x7lixdk.mongodb.net';
}
if (!process.env.MONGODB_DB_NAME) {
  process.env.MONGODB_DB_NAME = 'app';
}
if (!process.env.ADMIN_TOKEN) {
  process.env.ADMIN_TOKEN = 'd021d22df2dfa077499ca09b19b3ad62c044ef3dcdd2517ea7c6f9f740d91682';
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
}

// Mock do MongoDB para evitar problemas com ESM
jest.mock('mongodb', () => {
  // Mock do ObjectId
  const MockObjectId = jest.fn((id?: string) => {
    const obj = {
      toString: () => id || '507f1f77bcf86cd799439011',
      toHexString: () => id || '507f1f77bcf86cd799439011',
    };
    return obj;
  });

  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn(),
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([]),
          }),
          insertOne: jest.fn(),
          updateOne: jest.fn(),
          deleteOne: jest.fn(),
          findOneAndUpdate: jest.fn(),
          countDocuments: jest.fn(),
        }),
        admin: jest.fn().mockReturnValue({
          ping: jest.fn().mockResolvedValue({}),
        }),
      }),
      close: jest.fn().mockResolvedValue(undefined),
    })),
    ObjectId: MockObjectId,
    Db: jest.fn(),
  };
});

// Mock do @faker-js/faker para evitar problemas com ESM
jest.mock('@faker-js/faker', () => {
  const mockFaker = {
    person: {
      fullName: jest.fn(() => 'João Silva'),
      jobTitle: jest.fn(() => 'Desenvolvedor'),
    },
    internet: {
      email: jest.fn(() => 'joao@example.com'),
      username: jest.fn(() => 'joaosilva'),
    },
    company: {
      name: jest.fn(() => 'Empresa Teste'),
    },
    phone: {
      number: jest.fn(() => '+55 11 99999-9999'),
    },
    lorem: {
      paragraph: jest.fn(() => 'Motivo de participação no grupo de networking'),
    },
    string: {
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    },
    number: {
      int: jest.fn((options?: { min?: number; max?: number }) => {
        if (options?.min && options?.max) {
          return Math.floor((options.min + options.max) / 2);
        }
        return 50000;
      }),
    },
  };
  return {
    faker: mockFaker,
  };
});

// Polyfill para Request/Response (necessário para testes de API Routes)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input: string | Request, init?: RequestInit) {
      // Implementação básica para testes
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body || null;
    }
    url: string;
    method: string;
    headers: Headers;
    body: BodyInit | null;
    async json() {
      if (this.body) {
        return JSON.parse(this.body as string);
      }
      return {};
    }
  } as any;
}

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

