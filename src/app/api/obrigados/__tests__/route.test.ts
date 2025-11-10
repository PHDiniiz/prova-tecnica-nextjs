/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { POST, GET } from '../route';
import { ObrigadoService } from '@/services/ObrigadoService';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock do ObrigadoService
jest.mock('@/services/ObrigadoService');

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
    json: (data: any, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
      };
    },
  },
}));

describe('POST /api/obrigados', () => {
  let mockService: jest.Mocked<ObrigadoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarObrigado: jest.fn(),
    } as any;

    (ObrigadoService as jest.MockedClass<typeof ObrigadoService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar um obrigado com sucesso', async () => {
    const indicacaoId = new ObjectId().toString();
    const membroId = new ObjectId().toString();
    const obrigadoCriado = {
      _id: new ObjectId().toString(),
      indicacaoId,
      membroIndicadorId: new ObjectId().toString(),
      membroIndicadoId: membroId,
      mensagem: 'Muito obrigado pela indicação! O negócio foi fechado com sucesso.',
      publico: true,
      criadoEm: new Date(),
    };

    mockService.criarObrigado.mockResolvedValueOnce(obrigadoCriado);

    const requestBody = {
      indicacaoId,
      mensagem: obrigadoCriado.mensagem,
      publico: true,
    };

    const request = new NextRequest('http://localhost:3000/api/obrigados', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${membroId}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(obrigadoCriado);
    expect(data.message).toContain('sucesso');
    expect(mockService.criarObrigado).toHaveBeenCalledWith(membroId, requestBody);
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const requestBody = {
      indicacaoId: new ObjectId().toString(),
      mensagem: 'Mensagem de agradecimento',
    };

    const request = new NextRequest('http://localhost:3000/api/obrigados', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(mockService.criarObrigado).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'too_small',
        minimum: 10,
        inclusive: true,
        path: ['mensagem'],
        message: 'Mensagem deve ter pelo menos 10 caracteres',
      } as any,
    ]);
    mockService.criarObrigado.mockRejectedValueOnce(error);

    const requestBody = {
      indicacaoId: new ObjectId().toString(),
      mensagem: 'Curta', // Muito curta
    };

    const request = new NextRequest('http://localhost:3000/api/obrigados', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${new ObjectId().toString()}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });

  it('deve retornar erro 403 quando membro não é o destinatário', async () => {
    const { BusinessError } = await import('@/lib/errors/BusinessError');
    const error = new BusinessError(
      'Sem permissão',
      'Apenas o membro indicado pode criar agradecimento',
      403
    );
    mockService.criarObrigado.mockRejectedValueOnce(error);

    const requestBody = {
      indicacaoId: new ObjectId().toString(),
      mensagem: 'Mensagem de agradecimento válida com mais de 10 caracteres',
    };

    const request = new NextRequest('http://localhost:3000/api/obrigados', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${new ObjectId().toString()}`,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Sem permissão');
  });
});

describe('GET /api/obrigados', () => {
  let mockService: jest.Mocked<ObrigadoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarComPaginacao: jest.fn(),
    } as any;

    (ObrigadoService as jest.MockedClass<typeof ObrigadoService>).mockImplementation(
      () => mockService
    );
  });

  it('deve listar obrigados com sucesso', async () => {
    const obrigados = [
      {
        _id: new ObjectId().toString(),
        indicacaoId: new ObjectId().toString(),
        membroIndicadorId: new ObjectId().toString(),
        membroIndicadoId: new ObjectId().toString(),
        mensagem: 'Agradecimento público 1',
        publico: true,
        criadoEm: new Date(),
      },
      {
        _id: new ObjectId().toString(),
        indicacaoId: new ObjectId().toString(),
        membroIndicadorId: new ObjectId().toString(),
        membroIndicadoId: new ObjectId().toString(),
        mensagem: 'Agradecimento público 2',
        publico: true,
        criadoEm: new Date(),
      },
    ];

    mockService.buscarComPaginacao.mockResolvedValueOnce({
      obrigados,
      pagina: 1,
      limite: 20,
      total: 2,
      totalPaginas: 1,
    });

    const request = new NextRequest('http://localhost:3000/api/obrigados?page=1&limit=20', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(obrigados);
    expect(data.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
    expect(mockService.buscarComPaginacao).toHaveBeenCalledWith({}, 1, 20);
  });

  it('deve filtrar por membroIndicadorId', async () => {
    const membroId = new ObjectId().toString();
    mockService.buscarComPaginacao.mockResolvedValueOnce({
      obrigados: [],
      pagina: 1,
      limite: 20,
      total: 0,
      totalPaginas: 0,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/obrigados?membroIndicadorId=${membroId}`,
      {
        method: 'GET',
      }
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockService.buscarComPaginacao).toHaveBeenCalledWith(
      { membroIndicadorId: membroId },
      1,
      20
    );
  });

  it('deve limitar o limite máximo a 100', async () => {
    mockService.buscarComPaginacao.mockResolvedValueOnce({
      obrigados: [],
      pagina: 1,
      limite: 100,
      total: 0,
      totalPaginas: 0,
    });

    const request = new NextRequest('http://localhost:3000/api/obrigados?limit=200', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockService.buscarComPaginacao).toHaveBeenCalledWith({}, 1, 100);
  });
});

