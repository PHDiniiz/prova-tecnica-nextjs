/// <reference types="jest" />
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { gerarAccessToken, gerarRefreshToken } from '@/lib/auth';

jest.mock('@/lib/mongodb');
jest.mock('@/lib/repositories/MemberRepository');
jest.mock('@/lib/auth', () => ({
  gerarAccessToken: jest.fn(),
  gerarRefreshToken: jest.fn(),
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
    json: (data: any, init?: { status?: number; headers?: HeadersInit }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers(init?.headers),
      };
    },
  },
}));

describe('POST /api/auth/login', () => {
  let mockDb: any;
  let mockMemberRepository: jest.Mocked<MemberRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMemberRepository = {
      buscarPorEmail: jest.fn(),
    } as any;

    mockDb = {};
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockMemberRepository
    );
  });

  it('deve fazer login com email válido e membro ativo', async () => {
    const membroAtivo = {
      _id: 'membro-123',
      nome: 'João Silva',
      email: 'joao@test.com',
      ativo: true,
    };

    mockMemberRepository.buscarPorEmail.mockResolvedValueOnce(membroAtivo as any);
    (gerarAccessToken as jest.Mock).mockReturnValueOnce('access-token-123');
    (gerarRefreshToken as jest.Mock).mockReturnValueOnce('refresh-token-123');

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'joao@test.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.accessToken).toBe('access-token-123');
    expect(data.refreshToken).toBe('refresh-token-123');
    expect(data.membro.email).toBe('joao@test.com');
    expect(data.membro.id).toBe('membro-123');
    expect(mockMemberRepository.buscarPorEmail).toHaveBeenCalledWith('joao@test.com');
    expect(gerarAccessToken).toHaveBeenCalledWith({
      membroId: 'membro-123',
      email: 'joao@test.com',
      isActive: true,
    });
    expect(gerarRefreshToken).toHaveBeenCalledWith({
      membroId: 'membro-123',
      email: 'joao@test.com',
    });
  });

  it('deve retornar erro 401 para membro inativo', async () => {
    const membroInativo = {
      _id: 'membro-123',
      nome: 'João Silva',
      email: 'joao@test.com',
      ativo: false,
    };

    mockMemberRepository.buscarPorEmail.mockResolvedValueOnce(membroInativo as any);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'joao@test.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Conta inativa');
    expect(mockMemberRepository.buscarPorEmail).toHaveBeenCalledWith('joao@test.com');
    expect(gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve retornar erro 400 para email inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'email-invalido' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
    expect(mockMemberRepository.buscarPorEmail).not.toHaveBeenCalled();
  });

  it('deve retornar erro 401 para membro não encontrado', async () => {
    mockMemberRepository.buscarPorEmail.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'naoexiste@test.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Credenciais inválidas');
    expect(mockMemberRepository.buscarPorEmail).toHaveBeenCalledWith('naoexiste@test.com');
  });

  it('deve retornar erro 500 se membro não tiver _id', async () => {
    const membroSemId = {
      nome: 'João Silva',
      email: 'joao@test.com',
      ativo: true,
    };

    mockMemberRepository.buscarPorEmail.mockResolvedValueOnce(membroSemId as any);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'joao@test.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro interno');
  });

  it('deve retornar erro 400 para body vazio', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
  });
});

