/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET, POST } from '../route';
import { NoticeService } from '@/services/NoticeService';
import { NextRequest } from 'next/server';

// Mock do NoticeService
jest.mock('@/services/NoticeService');

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

describe('GET /api/notices', () => {
  let mockService: jest.Mocked<NoticeService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      listarAvisosPublicos: jest.fn(),
      listarAvisos: jest.fn(),
    } as any;

    (NoticeService as jest.MockedClass<typeof NoticeService>).mockImplementation(
      () => mockService
    );
  });

  it('deve listar avisos públicos com sucesso', async () => {
    const avisos = [
      {
        _id: 'notice-1',
        titulo: 'Aviso Importante',
        conteudo: 'Conteúdo do aviso',
        tipo: 'info' as const,
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    mockService.listarAvisosPublicos.mockResolvedValueOnce(avisos);

    const request = new NextRequest('http://localhost:3000/api/notices?publico=true', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(avisos);
    expect(mockService.listarAvisosPublicos).toHaveBeenCalled();
  });

  it('deve listar avisos admin quando publico=false e token válido', async () => {
    const avisos: any[] = [];
    mockService.listarAvisos.mockResolvedValueOnce(avisos);

    const request = new NextRequest('http://localhost:3000/api/notices?publico=false', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer admin-token-123',
      },
    });

    const response = await GET(request);
    await response.json();

    expect(response.status).toBe(200);
    expect(mockService.listarAvisos).toHaveBeenCalled();
  });

  it('deve retornar erro 401 quando publico=false e token inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/notices?publico=false', {
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

describe('POST /api/notices', () => {
  let mockService: jest.Mocked<NoticeService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarAviso: jest.fn(),
    } as any;

    (NoticeService as jest.MockedClass<typeof NoticeService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar aviso com sucesso', async () => {
    const avisoCriado = {
      _id: 'notice-1',
      titulo: 'Novo Aviso',
      conteudo: 'Conteúdo do aviso',
      tipo: 'info' as const,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.criarAviso.mockResolvedValueOnce(avisoCriado);

    const requestBody = {
      titulo: 'Novo Aviso',
      conteudo: 'Conteúdo do aviso',
      tipo: 'info' as const,
      ativo: true,
    };

    const request = new NextRequest('http://localhost:3000/api/notices', {
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
    expect(data.data).toEqual(avisoCriado);
    expect(mockService.criarAviso).toHaveBeenCalledWith(requestBody);
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/notices', {
      method: 'POST',
      body: JSON.stringify({
        titulo: 'Novo Aviso',
        conteudo: 'Conteúdo',
        tipo: 'info',
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
});

