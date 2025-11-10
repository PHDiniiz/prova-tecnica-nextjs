/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET, POST } from '../route';
import { MeetingService } from '@/services/MeetingService';
import { NextRequest } from 'next/server';
import { BusinessError } from '@/lib/errors/BusinessError';

// Mock do MeetingService
jest.mock('@/services/MeetingService');

// Mock do auth
jest.mock('@/lib/auth', () => ({
  extrairMembroIdDoToken: jest.fn((request: any) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.replace('Bearer ', '');
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

describe('GET /api/meetings', () => {
  let mockService: jest.Mocked<MeetingService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      listarReunioes: jest.fn(),
    } as any;

    (MeetingService as jest.MockedClass<typeof MeetingService>).mockImplementation(
      () => mockService
    );
  });

  it('deve listar reuniões com sucesso', async () => {
    const reunioes = [
      {
        _id: 'meeting-1',
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        dataReuniao: new Date(),
        local: 'Escritório',
        checkIns: [],
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    mockService.listarReunioes.mockResolvedValueOnce(reunioes);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${membroToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(reunioes);
    expect(mockService.listarReunioes).toHaveBeenCalled();
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'GET',
      headers: {},
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(mockService.listarReunioes).not.toHaveBeenCalled();
  });

  it('deve incluir filtros quando fornecidos', async () => {
    const reunioes: any[] = [];
    mockService.listarReunioes.mockResolvedValueOnce(reunioes);

    const dataInicio = new Date('2024-01-01').toISOString();
    const dataFim = new Date('2024-01-31').toISOString();

    const request = new NextRequest(
      `http://localhost:3000/api/meetings?membroId=membro-123&dataInicio=${dataInicio}&dataFim=${dataFim}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${membroToken}`,
        },
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockService.listarReunioes).toHaveBeenCalledWith(
      expect.objectContaining({
        membroId: 'membro-123',
        dataInicio: expect.any(Date),
        dataFim: expect.any(Date),
      })
    );
  });
});

describe('POST /api/meetings', () => {
  let mockService: jest.Mocked<MeetingService>;
  const membroToken = 'membro-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarReuniao: jest.fn(),
    } as any;

    (MeetingService as jest.MockedClass<typeof MeetingService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar reunião com sucesso', async () => {
    const dataReuniao = new Date();
    const reuniaoCriada = {
      _id: 'meeting-1',
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      dataReuniao: dataReuniao,
      local: 'Escritório',
      checkIns: [],
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.criarReuniao.mockResolvedValueOnce(reuniaoCriada);

    const requestBody = {
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      dataReuniao: dataReuniao.toISOString(),
      local: 'Escritório',
    };

    const request = new NextRequest('http://localhost:3000/api/meetings', {
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
    expect(data.data).toEqual(reuniaoCriada);
    // O service recebe o DTO com dataReuniao (string ISO) que é convertido para Date
    expect(mockService.criarReuniao).toHaveBeenCalledWith(
      expect.objectContaining({
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        local: 'Escritório',
      })
    );
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        membro1Id: 'membro-1',
        membro2Id: 'membro-2',
        data: new Date(),
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
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['membro1Id'],
        message: 'membro1Id é obrigatório',
      } as any,
    ]);
    mockService.criarReuniao.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({}),
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

  it('deve retornar erro BusinessError com status apropriado', async () => {
    const error = new BusinessError(
      'Membros iguais',
      'Não é possível criar reunião com o mesmo membro',
      400
    );
    mockService.criarReuniao.mockRejectedValueOnce(error);

    const request = new NextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        membro1Id: 'membro-1',
        membro2Id: 'membro-1',
        dataReuniao: new Date().toISOString(),
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
    expect(data.error).toBe('Membros iguais');
    expect(data.message).toBe('Não é possível criar reunião com o mesmo membro');
  });
});

