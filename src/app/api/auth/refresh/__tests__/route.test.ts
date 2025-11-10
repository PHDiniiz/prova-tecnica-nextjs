/// <reference types="jest" />
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { gerarAccessToken, verificarRefreshToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';

jest.mock('@/lib/auth', () => ({
  gerarAccessToken: jest.fn(),
  verificarRefreshToken: jest.fn(),
}));

jest.mock('@/lib/mongodb');
jest.mock('@/lib/repositories/MemberRepository');

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

describe('POST /api/auth/refresh', () => {
  let mockDb: any;
  let mockMemberRepository: jest.Mocked<MemberRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMemberRepository = {
      buscarPorId: jest.fn(),
    } as any;

    mockDb = {};
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
    (MemberRepository as jest.MockedClass<typeof MemberRepository>).mockImplementation(
      () => mockMemberRepository
    );
  });

  it('deve renovar access token com refresh token válido', async () => {
    const membroAtivo = {
      _id: 'membro-123',
      email: 'joao@test.com',
      ativo: true,
    };

    const refreshToken = 'valid-refresh-token';

    (verificarRefreshToken as jest.Mock).mockReturnValueOnce({
      membroId: 'membro-123',
      email: 'joao@test.com',
      type: 'refresh',
    });

    mockMemberRepository.buscarPorId.mockResolvedValueOnce(membroAtivo as any);
    (gerarAccessToken as jest.Mock).mockReturnValueOnce('new-access-token-123');

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.accessToken).toBe('new-access-token-123');
    expect(verificarRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockMemberRepository.buscarPorId).toHaveBeenCalledWith('membro-123');
    expect(gerarAccessToken).toHaveBeenCalledWith({
      membroId: 'membro-123',
      email: 'joao@test.com',
      isActive: true,
    });
  });

  it('deve retornar erro 401 para refresh token inválido', async () => {
    (verificarRefreshToken as jest.Mock).mockReturnValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'token-invalido' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Token inválido');
    expect(mockMemberRepository.buscarPorId).not.toHaveBeenCalled();
    expect(gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve retornar erro 404 para membro não encontrado', async () => {
    (verificarRefreshToken as jest.Mock).mockReturnValueOnce({
      membroId: 'membro-inexistente',
      email: 'inexistente@test.com',
      type: 'refresh',
    });

    mockMemberRepository.buscarPorId.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-token' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Membro não encontrado');
    expect(gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve retornar erro 401 para membro inativo', async () => {
    const membroInativo = {
      _id: 'membro-123',
      email: 'joao@test.com',
      ativo: false,
    };

    (verificarRefreshToken as jest.Mock).mockReturnValueOnce({
      membroId: 'membro-123',
      email: 'joao@test.com',
      type: 'refresh',
    });

    mockMemberRepository.buscarPorId.mockResolvedValueOnce(membroInativo as any);

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-token' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Conta inativa');
    expect(gerarAccessToken).not.toHaveBeenCalled();
  });

  it('deve retornar erro 500 se membro não tiver _id', async () => {
    const membroSemId = {
      email: 'joao@test.com',
      ativo: true,
    };

    (verificarRefreshToken as jest.Mock).mockReturnValueOnce({
      membroId: 'membro-123',
      email: 'joao@test.com',
      type: 'refresh',
    });

    mockMemberRepository.buscarPorId.mockResolvedValueOnce(membroSemId as any);

    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'valid-token' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Erro interno');
  });

  it('deve retornar erro 400 para refresh token não fornecido', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
    expect(verificarRefreshToken).not.toHaveBeenCalled();
  });
});

