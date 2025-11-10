/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET, POST } from '../route';
import { ReferralService } from '@/services/ReferralService';
import { NextRequest } from 'next/server';
import { BusinessError } from '@/lib/errors/BusinessError';

// Mock do ReferralService
jest.mock('@/services/ReferralService');

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
    get searchParams() {
      return new URL(this.url).searchParams;
    }
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

describe('GET /api/referrals', () => {
  let mockService: jest.Mocked<ReferralService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarTodasIndicacoes: jest.fn(),
    } as any;

    (ReferralService as jest.MockedClass<typeof ReferralService>).mockImplementation(
      () => mockService
    );
  });

  it('deve listar indicações com sucesso', async () => {
    const indicacoesFeitas: any[] = [];
    const indicacoesRecebidas: any[] = [];

    mockService.buscarTodasIndicacoes
      .mockResolvedValueOnce(indicacoesFeitas)
      .mockResolvedValueOnce(indicacoesRecebidas);

    const request = new NextRequest('http://localhost:3000/api/referrals', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('feitas');
    expect(data.data).toHaveProperty('recebidas');
    expect(data.pagination).toBeDefined();
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/referrals', {
      method: 'GET',
      headers: {},
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });
});

describe('POST /api/referrals', () => {
  let mockService: jest.Mocked<ReferralService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarIndicacao: jest.fn(),
    } as any;

    (ReferralService as jest.MockedClass<typeof ReferralService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar indicação com sucesso', async () => {
    const indicacaoCriada = {
      _id: 'referral-1',
      membroIndicadorId: membroToken,
      membroIndicadoId: 'membro-2',
      empresaContato: 'Empresa ABC',
      descricao: 'Indicação de negócio',
      status: 'nova' as const,
    };

    mockService.criarIndicacao.mockResolvedValueOnce(indicacaoCriada);

    const requestBody = {
      membroIndicadoId: 'membro-2',
      empresaContato: 'Empresa ABC',
      descricao: 'Indicação de negócio',
      valorEstimado: 50000,
    };

    const request = new NextRequest('http://localhost:3000/api/referrals', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(indicacaoCriada);
    expect(mockService.criarIndicacao).toHaveBeenCalledWith(membroToken, requestBody);
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/referrals', {
      method: 'POST',
      body: JSON.stringify({
        membroIndicadoId: 'membro-2',
        empresaContato: 'Empresa ABC',
        descricao: 'Indicação',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'too_small',
        minimum: 10,
        inclusive: true,
        path: ['descricao'],
        message: 'Descrição deve ter pelo menos 10 caracteres',
      } as any,
    ]);
    mockService.criarIndicacao.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/referrals', {
      method: 'POST',
      body: JSON.stringify({
        membroIndicadoId: 'membro-2',
        empresaContato: 'Empresa ABC',
        descricao: 'Curta',
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });
});

