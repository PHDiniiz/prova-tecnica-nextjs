/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET, PATCH, DELETE } from '../route';
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

describe('GET /api/notices/[id]', () => {
  let mockService: jest.Mocked<NoticeService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarAvisoPorId: jest.fn(),
    } as any;

    (NoticeService as jest.MockedClass<typeof NoticeService>).mockImplementation(
      () => mockService
    );
  });

  it('deve buscar aviso por ID com sucesso', async () => {
    const aviso = {
      _id: 'notice-1',
      titulo: 'Aviso Importante',
      conteudo: 'Conteúdo do aviso',
      tipo: 'info' as const,
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.buscarAvisoPorId.mockResolvedValueOnce(aviso);

    const request = new NextRequest('http://localhost:3000/api/notices/notice-1', {
      method: 'GET',
    });

    const params = Promise.resolve({ id: 'notice-1' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(aviso);
  });

  it('deve retornar erro 404 quando aviso não é encontrado', async () => {
    mockService.buscarAvisoPorId.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/notices/notice-inexistente', {
      method: 'GET',
    });

    const params = Promise.resolve({ id: 'notice-inexistente' });
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Aviso não encontrado');
  });
});

describe('PATCH /api/notices/[id]', () => {
  let mockService: jest.Mocked<NoticeService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      atualizarAviso: jest.fn(),
    } as any;

    (NoticeService as jest.MockedClass<typeof NoticeService>).mockImplementation(
      () => mockService
    );
  });

  it('deve atualizar aviso com sucesso', async () => {
    const avisoAtualizado = {
      _id: 'notice-1',
      titulo: 'Aviso Atualizado',
      conteudo: 'Conteúdo atualizado',
      tipo: 'warning' as const,
      ativo: false,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.atualizarAviso.mockResolvedValueOnce(avisoAtualizado);

    const requestBody = {
      ativo: false,
    };

    const request = new NextRequest('http://localhost:3000/api/notices/notice-1', {
      method: 'PATCH',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const params = Promise.resolve({ id: 'notice-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(avisoAtualizado);
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/notices/notice-1', {
      method: 'PATCH',
      body: JSON.stringify({ ativo: false }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const params = Promise.resolve({ id: 'notice-1' });
    const response = await PATCH(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });
});

describe('DELETE /api/notices/[id]', () => {
  let mockService: jest.Mocked<NoticeService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      deletarAviso: jest.fn(),
    } as any;

    (NoticeService as jest.MockedClass<typeof NoticeService>).mockImplementation(
      () => mockService
    );
  });

  it('deve deletar aviso com sucesso', async () => {
    mockService.deletarAviso.mockResolvedValueOnce(undefined);

    const request = new NextRequest('http://localhost:3000/api/notices/notice-1', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const params = Promise.resolve({ id: 'notice-1' });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockService.deletarAviso).toHaveBeenCalledWith('notice-1');
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/notices/notice-1', {
      method: 'DELETE',
      headers: {},
    });

    const params = Promise.resolve({ id: 'notice-1' });
    const response = await DELETE(request, { params });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
  });
});

