/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { PATCH } from '../route';
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

describe('PATCH /api/referrals/[id]/status', () => {
  let mockService: jest.Mocked<ReferralService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarIndicacaoPorId: jest.fn(),
      atualizarStatusIndicacao: jest.fn(),
    } as any;

    (ReferralService as jest.MockedClass<typeof ReferralService>).mockImplementation(
      () => mockService
    );
  });

  it('deve atualizar status com sucesso', async () => {
    const indicacao = {
      _id: 'referral-1',
      membroIndicadorId: 'membro-1',
      membroIndicadoId: membroToken,
      empresaContato: 'Empresa ABC',
      descricao: 'Indicação de negócio',
      status: 'nova' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const indicacaoAtualizada = {
      ...indicacao,
      status: 'em-contato' as const,
      atualizadoEm: new Date(),
    };

    mockService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacao as any);
    mockService.atualizarStatusIndicacao.mockResolvedValueOnce(indicacaoAtualizada as any);

    const requestBody = {
      status: 'em-contato' as const,
    };

    const request = new NextRequest(
      'http://localhost:3000/api/referrals/referral-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'referral-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(indicacaoAtualizada);
    expect(mockService.atualizarStatusIndicacao).toHaveBeenCalledWith(
      'referral-1',
      requestBody
    );
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/referrals/referral-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'em-contato' }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const params = Promise.resolve({ id: 'referral-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });

  it('deve retornar erro 404 quando indicação não é encontrada', async () => {
    mockService.buscarIndicacaoPorId.mockResolvedValueOnce(null);

    const request = new NextRequest(
      'http://localhost:3000/api/referrals/referral-inexistente/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'em-contato' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'referral-inexistente' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Recurso não encontrado');
  });

  it('deve retornar erro 403 quando membro não é o destinatário', async () => {
    const indicacao = {
      _id: 'referral-1',
      membroIndicadorId: 'membro-1',
      membroIndicadoId: 'outro-membro',
      empresaContato: 'Empresa ABC',
      descricao: 'Indicação de negócio',
      status: 'nova' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.buscarIndicacaoPorId.mockResolvedValueOnce(indicacao);

    const request = new NextRequest(
      'http://localhost:3000/api/referrals/referral-1/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'em-contato' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const params = Promise.resolve({ id: 'referral-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Sem permissão');
    expect(mockService.atualizarStatusIndicacao).not.toHaveBeenCalled();
  });
});

