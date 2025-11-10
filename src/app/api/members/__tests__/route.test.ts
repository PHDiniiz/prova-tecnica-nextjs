/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { GET, POST } from '../route';
import { MemberService } from '@/services/MemberService';
import { NextRequest } from 'next/server';

// Mock do MemberService
jest.mock('@/services/MemberService');

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

describe('GET /api/members', () => {
  let mockService: jest.Mocked<MemberService>;
  const adminToken = 'admin-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      buscarTodosMembros: jest.fn(),
      buscarMembrosAtivos: jest.fn(),
    } as any;

    (MemberService as jest.MockedClass<typeof MemberService>).mockImplementation(
      () => mockService
    );
  });

  it('deve listar todos os membros com sucesso', async () => {
    const membros = [
      {
        _id: 'membro-1',
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '+55 11 99999-9999',
        empresa: 'Empresa A',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    mockService.buscarTodosMembros.mockResolvedValueOnce(membros);

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(membros);
    expect(mockService.buscarTodosMembros).toHaveBeenCalled();
  });

  it('deve listar apenas membros ativos quando parâmetro ativos=true', async () => {
    const membrosAtivos = [
      {
        _id: 'membro-1',
        nome: 'João Silva',
        email: 'joao@example.com',
        empresa: 'Empresa A',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    mockService.buscarMembrosAtivos.mockResolvedValueOnce(membrosAtivos);

    const request = new NextRequest('http://localhost:3000/api/members?ativos=true', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(membrosAtivos);
    expect(mockService.buscarMembrosAtivos).toHaveBeenCalled();
  });

  it('deve retornar erro 401 quando token não é fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'GET',
      headers: {},
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autorizado');
    expect(mockService.buscarTodosMembros).not.toHaveBeenCalled();
  });
});

describe('POST /api/members', () => {
  let mockService: jest.Mocked<MemberService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      criarMembro: jest.fn(),
    } as any;

    (MemberService as jest.MockedClass<typeof MemberService>).mockImplementation(
      () => mockService
    );
  });

  it('deve criar membro com sucesso', async () => {
    const membroCriado = {
      _id: 'membro-123',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '+55 11 99999-9999',
      empresa: 'Empresa A',
      linkedin: 'joao-silva',
      areaAtuacao: 'Tecnologia',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    mockService.criarMembro.mockResolvedValueOnce(membroCriado);

    const requestBody = {
      token: 'token-abc123',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '+55 11 99999-9999',
      empresa: 'Empresa A',
      linkedin: 'joao-silva',
      areaAtuacao: 'Tecnologia',
    };

    const request = new NextRequest('http://localhost:3000/api/members', {
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
    expect(data.data).toEqual(membroCriado);
    expect(data.message).toContain('sucesso');
    expect(mockService.criarMembro).toHaveBeenCalledWith(requestBody);
  });

  it('deve retornar erro 400 para dados inválidos', async () => {
    const { ZodError } = await import('zod');
    const error = new ZodError([
      {
        code: 'too_small',
        minimum: 2,
        inclusive: true,
        path: ['nome'],
        message: 'Nome deve ter pelo menos 2 caracteres',
      } as any,
    ]);
    mockService.criarMembro.mockRejectedValueOnce(error);

    const requestBody = {
      token: 'token-abc123',
      nome: 'A', // Muito curto
      email: 'email-invalido',
    };

    const request = new NextRequest('http://localhost:3000/api/members', {
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

  it('deve retornar erro 400 quando token é inválido', async () => {
    const error = new Error('Token de convite inválido ou expirado');
    mockService.criarMembro.mockRejectedValueOnce(error);

    const requestBody = {
      token: 'token-invalido',
      nome: 'João Silva',
      email: 'joao@example.com',
    };

    const request = new NextRequest('http://localhost:3000/api/members', {
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
    expect(data.error).toContain('Token');
  });

  it('deve retornar erro 409 quando email já está cadastrado', async () => {
    const error = new Error('Este email já está cadastrado');
    mockService.criarMembro.mockRejectedValueOnce(error);

    const requestBody = {
      token: 'token-abc123',
      nome: 'João Silva',
      email: 'joao@example.com',
    };

    const request = new NextRequest('http://localhost:3000/api/members', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toContain('cadastrado');
  });

  it('deve retornar erro 500 para erros inesperados', async () => {
    const error = new Error('Erro inesperado');
    mockService.criarMembro.mockRejectedValueOnce(error);

    const requestBody = {
      token: 'token-abc123',
      nome: 'João Silva',
      email: 'joao@example.com',
    };

    const request = new NextRequest('http://localhost:3000/api/members', {
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

