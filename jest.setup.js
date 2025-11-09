// Importa os matchers customizados do jest-dom
import '@testing-library/jest-dom';

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

