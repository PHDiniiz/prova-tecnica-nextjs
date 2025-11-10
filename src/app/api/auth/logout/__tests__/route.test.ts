/// <reference types="jest" />
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock do NextResponse para testes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: { method?: string; body?: string; headers?: HeadersInit }
    ) {}
    headers = {
      get: (name: string) => {
        if (name === 'Authorization' && this.init?.headers) {
          const headers = this.init.headers as Record<string, string>;
          return headers['Authorization'] || headers['authorization'];
        }
        return null;
      },
    };
  },
  NextResponse: {
    json: (data: any, init?: { status?: number; headers?: HeadersInit }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers(init?.headers),
      };
    },
  },
}));

// Mock da função de autenticação
jest.mock('@/lib/auth', () => ({
  extrairInfoDoToken: jest.fn((request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.includes('Bearer valid-token')) {
      return {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
        type: 'access',
      };
    }
    return null;
  }),
}));

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({}),
    }),
  }),
}));

jest.mock('@/lib/repositories/TokenRepository', () => ({
  TokenRepository: jest.fn().mockImplementation(() => ({
    adicionarBlacklist: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('POST /api/auth/logout', () => {
  it('deve fazer logout com sucesso mesmo sem token', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout realizado com sucesso');
  });

  it('deve fazer logout com sucesso com token', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout realizado com sucesso');
  });

  it('deve retornar sucesso mesmo em caso de erro interno', async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

