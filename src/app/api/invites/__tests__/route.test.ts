/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { POST } from '../route';
import { InviteService } from '@/services/InviteService';
import { NextRequest } from 'next/server';

// Mock do InviteService
jest.mock('@/services/InviteService');

// Mock da função de autenticação
jest.mock('@/lib/auth', () => ({
  verificarAdminToken: jest.fn((request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    return authHeader?.includes('Bearer admin-token-123') ?? false;
  }),
  respostaNaoAutorizado: jest.fn(() => ({
    json: async () => ({
      success: false,
      error: 'Não autorizado',
      message: 'Token de autenticação inválido ou ausente',
    }),
    status: 401,
  })),
}));

// Mock do NextRequest para testes
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
    async json() {
      if (this.init?.body) {
        return JSON.parse(this.init.body);
      }
      return {};
    }
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
      };
    },
  },
}));

describe('POST /api/invites', () => {
  let mockService: jest.Mocked<InviteService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarConvite: jest.fn(),
    } as any;

    (InviteService as jest.MockedClass<typeof InviteService>).mockImplementation(
      () => mockService
    );

    // Mock de variável de ambiente
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('deve criar convite com sucesso', async () => {
    const conviteCriado = {
      _id: 'convite-123',
      token: 'token-abc123',
      intencaoId: 'intencao-456',
      usado: false,
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      criadoEm: new Date(),
    };

    mockService.criarConvite.mockResolvedValueOnce(conviteCriado);

    const requestBody = {
      intencaoId: 'intencao-456',
    };

    const request = new NextRequest('http://localhost:3000/api/invites', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.token).toBe(conviteCriado.token);
    expect(data.url).toContain(conviteCriado.token);
    expect(mockService.criarConvite).toHaveBeenCalledWith(requestBody);
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/invites', {
      method: 'POST',
      body: JSON.stringify({ intencaoId: 'intencao-456' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(mockService.criarConvite).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    new ZodError([
      {
        code: 'too_small',
        minimum: 1,
        inclusive: true,
        path: ['intencaoId'],
        message: 'ID da intenção é obrigatório',
      } as any,
    ]);

    const request = new NextRequest('http://localhost:3000/api/invites', {
      method: 'POST',
      body: JSON.stringify({ intencaoId: '' }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });

  it('deve retornar erro 500 para erros inesperados', async () => {
    const error = new Error('Erro inesperado');
    mockService.criarConvite.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/invites', {
      method: 'POST',
      body: JSON.stringify({ intencaoId: 'intencao-456' }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro ao processar sua solicitação');
  });
});

