/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { PATCH } from '../route';
import { IntentionService } from '@/services/IntentionService';
import { InviteService } from '@/services/InviteService';
import { NextRequest } from 'next/server';

// Mock dos Services
jest.mock('@/services/IntentionService');
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

describe('PATCH /api/intentions/[id]/status', () => {
  let mockIntentionService: jest.Mocked<IntentionService>;
  let mockInviteService: jest.Mocked<InviteService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockIntentionService = {
      atualizarStatusIntencao: jest.fn(),
    } as any;

    mockInviteService = {
      criarConvite: jest.fn(),
    } as any;

    (IntentionService as jest.MockedClass<typeof IntentionService>).mockImplementation(
      () => mockIntentionService
    );

    (InviteService as jest.MockedClass<typeof InviteService>).mockImplementation(
      () => mockInviteService
    );

    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('deve atualizar status para approved e criar convite', async () => {
    const intencaoAtualizada = {
      _id: 'intention-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
      status: 'approved' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const convite = {
      _id: 'invite-1',
      token: 'token-abc123',
      intencaoId: 'intention-1',
      usado: false,
      expiraEm: new Date(),
      criadoEm: new Date(),
    };

    mockIntentionService.atualizarStatusIntencao.mockResolvedValueOnce(intencaoAtualizada);
    mockInviteService.criarConvite.mockResolvedValueOnce(convite);

    const requestBody = {
      status: 'approved' as const,
    };

    const request = new NextRequest(
      'http://localhost:3000/api/intentions/intention-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'intention-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(intencaoAtualizada);
    expect(data.invite).toBeDefined();
    expect(data.invite.token).toBe(convite.token);
    expect(mockInviteService.criarConvite).toHaveBeenCalledWith({
      intencaoId: 'intention-1',
    });
  });

  it('deve atualizar status para rejected sem criar convite', async () => {
    const intencaoAtualizada = {
      _id: 'intention-1',
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
      status: 'rejected' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockIntentionService.atualizarStatusIntencao.mockResolvedValueOnce(intencaoAtualizada);

    const requestBody = {
      status: 'rejected' as const,
    };

    const request = new NextRequest(
      'http://localhost:3000/api/intentions/intention-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'intention-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(intencaoAtualizada);
    expect(data.invite).toBeUndefined();
    expect(mockInviteService.criarConvite).not.toHaveBeenCalled();
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/intentions/intention-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const params = Promise.resolve({ id: 'intention-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar erro 400 para status inválido', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/intentions/intention-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'invalid-status' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'intention-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });

  it('deve retornar erro 404 quando intenção não é encontrada', async () => {
    mockIntentionService.atualizarStatusIntencao.mockResolvedValueOnce(null);

    const request = new NextRequest(
      'http://localhost:3000/api/intentions/intention-inexistente/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'intention-inexistente' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Intenção não encontrada');
  });
});

