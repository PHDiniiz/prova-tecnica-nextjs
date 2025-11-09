import { POST } from '../route';
import { IntentionService } from '@/src/services/IntentionService';
import { criarIntencaoFake } from '@/tests/helpers/faker';
import { NextRequest } from 'next/server';

// Mock do IntentionService
jest.mock('@/services/IntentionService');

// Mock do NextRequest para testes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(
      public url: string,
      public init?: { method?: string; body?: string; headers?: HeadersInit }
    ) {}
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

describe('POST /api/intentions', () => {
  let mockService: jest.Mocked<IntentionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarIntencao: jest.fn(),
    } as any;

    (IntentionService as jest.MockedClass<typeof IntentionService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar uma intenção com sucesso', async () => {
    const intencaoFake = criarIntencaoFake();
    const intencaoCriada = {
      _id: '123',
      ...intencaoFake,
    };

    mockService.criarIntencao.mockResolvedValueOnce(intencaoCriada);

    const requestBody = {
      nome: intencaoFake.nome,
      email: intencaoFake.email,
      empresa: intencaoFake.empresa,
      motivo: intencaoFake.motivo,
    };

    const request = new NextRequest('http://localhost:3000/api/intentions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(intencaoCriada);
    expect(data.message).toContain('sucesso');
    expect(mockService.criarIntencao).toHaveBeenCalledWith(requestBody);
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'too_small',
        minimum: 2,
        type: 'string',
        inclusive: true,
        path: ['nome'],
        message: 'Nome deve ter pelo menos 2 caracteres',
      },
    ]);
    mockService.criarIntencao.mockRejectedValueOnce(error);

    const requestBody = {
      nome: 'A', // Muito curto
      email: 'email-invalido',
      empresa: 'Empresa',
      motivo: 'Motivo',
    };

    const request = new NextRequest('http://localhost:3000/api/intentions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
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
    mockService.criarIntencao.mockRejectedValueOnce(error);

    const requestBody = {
      nome: 'João Silva',
      email: 'joao@example.com',
      empresa: 'Empresa Teste',
      motivo: 'Quero participar do grupo',
    };

    const request = new NextRequest('http://localhost:3000/api/intentions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro ao processar sua solicitação');
  });
});

