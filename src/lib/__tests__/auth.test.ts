/// <reference types="jest" />
import {
  gerarAccessToken,
  gerarRefreshToken,
  verificarToken,
  verificarRefreshToken,
  verificarTokenComBlacklist,
  extrairMembroIdDoToken,
  extrairInfoDoToken,
  verificarAdminToken,
  respostaNaoAutorizado,
} from '../auth';
import { TokenRepository } from '../repositories/TokenRepository';

// Mock do NextRequest e NextResponse
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    url: string;
    private _headers: Headers;

    constructor(url: string, init?: { headers?: HeadersInit }) {
      this.url = url;
      this._headers = new Headers(init?.headers);
    }

    get headers(): Headers {
      return this._headers;
    }
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status || 200,
        headers: new Headers(),
      };
    },
  },
}));

// Mock do MongoDB
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

// Mock do TokenRepository - será configurado nos testes específicos
jest.mock('@/lib/repositories/TokenRepository');

describe('auth.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Não resetar módulos para manter os mocks configurados
    // jest.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key-for-jwt-tokens',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      ADMIN_TOKEN: 'admin-test-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('gerarAccessToken', () => {
    it('deve gerar um access token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const token = gerarAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tem 3 partes
    });

    it('deve lançar erro se JWT_SECRET não estiver configurado', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Recarrega o módulo para forçar a leitura da nova variável de ambiente
      jest.resetModules();
      const { gerarAccessToken: gerarAccessTokenReloaded } = require('../auth');

      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      expect(() => gerarAccessTokenReloaded(payload)).toThrow('JWT_SECRET não configurado');
      
      // Restaura o valor original
      process.env.JWT_SECRET = originalSecret;
      jest.resetModules();
    });
  });

  describe('gerarRefreshToken', () => {
    it('deve gerar um refresh token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
      };

      const token = gerarRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('deve lançar erro se JWT_SECRET não estiver configurado', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Recarrega o módulo para forçar a leitura da nova variável de ambiente
      jest.resetModules();
      const { gerarRefreshToken: gerarRefreshTokenReloaded } = require('../auth');

      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
      };

      expect(() => gerarRefreshTokenReloaded(payload)).toThrow('JWT_SECRET não configurado');
      
      // Restaura o valor original
      process.env.JWT_SECRET = originalSecret;
      jest.resetModules();
    });
  });

  describe('verificarToken', () => {
    it('deve verificar e decodificar um access token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const token = gerarAccessToken(payload);
      const decoded = verificarToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.membroId).toBe('membro-123');
      expect(decoded?.email).toBe('test@test.com');
      expect(decoded?.isActive).toBe(true);
      expect(decoded?.type).toBe('access');
    });

    it('deve retornar null para token inválido', () => {
      const decoded = verificarToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('deve retornar null para refresh token (não access token)', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
      };

      const refreshToken = gerarRefreshToken(payload);
      const decoded = verificarToken(refreshToken);

      expect(decoded).toBeNull(); // Não deve aceitar refresh token
    });
  });

  describe('verificarRefreshToken', () => {
    it('deve verificar e decodificar um refresh token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
      };

      const token = gerarRefreshToken(payload);
      const decoded = verificarRefreshToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.membroId).toBe('membro-123');
      expect(decoded?.email).toBe('test@test.com');
      expect(decoded?.type).toBe('refresh');
    });

    it('deve retornar null para token inválido', () => {
      const decoded = verificarRefreshToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('deve retornar null para access token (não refresh token)', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const accessToken = gerarAccessToken(payload);
      const decoded = verificarRefreshToken(accessToken);

      expect(decoded).toBeNull(); // Não deve aceitar access token
    });
  });

  describe('verificarTokenComBlacklist', () => {
    beforeEach(() => {
      // Garante que os mocks estão configurados antes de cada teste
      jest.clearAllMocks();
    });

    it('deve verificar token normalmente se não estiver na blacklist', async () => {
      // Importa os módulos necessários dentro do teste para garantir que os mocks estão aplicados
      const { getDatabase } = require('@/lib/mongodb');
      const { TokenRepository } = require('@/lib/repositories/TokenRepository');
      
      // Cria mock da função estaNaBlacklist
      const mockEstaNaBlacklist = jest.fn().mockResolvedValue(false);
      const mockDb = {} as any;
      
      // Configura o mock do getDatabase
      (getDatabase as jest.Mock).mockResolvedValue(mockDb);
      
      // Cria instância mockada do TokenRepository
      const mockTokenRepository = {
        estaNaBlacklist: mockEstaNaBlacklist,
      } as any;
      
      // Configura o mock do TokenRepository para retornar instância mockada
      (TokenRepository as jest.MockedClass<typeof TokenRepository>).mockImplementation(() => mockTokenRepository);

      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const token = gerarAccessToken(payload);
      const decoded = await verificarTokenComBlacklist(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.membroId).toBe('membro-123');
      expect(mockEstaNaBlacklist).toHaveBeenCalledWith(token);
    });

    it('deve retornar null se token estiver na blacklist', async () => {
      // Importa os módulos necessários dentro do teste para garantir que os mocks estão aplicados
      const { getDatabase } = require('@/lib/mongodb');
      const { TokenRepository } = require('@/lib/repositories/TokenRepository');
      
      // Cria mock da função estaNaBlacklist
      const mockEstaNaBlacklist = jest.fn().mockResolvedValue(true);
      const mockDb = {} as any;
      
      // Configura o mock do getDatabase
      (getDatabase as jest.Mock).mockResolvedValue(mockDb);
      
      // Cria instância mockada do TokenRepository
      const mockTokenRepository = {
        estaNaBlacklist: mockEstaNaBlacklist,
      } as any;
      
      // Configura o mock do TokenRepository para retornar instância mockada
      (TokenRepository as jest.MockedClass<typeof TokenRepository>).mockImplementation(() => mockTokenRepository);

      const token = gerarAccessToken({
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      });

      const decoded = await verificarTokenComBlacklist(token);

      expect(decoded).toBeNull();
      expect(mockEstaNaBlacklist).toHaveBeenCalledWith(token);
    });
  });

  describe('extrairMembroIdDoToken', () => {
    it('deve extrair membroId de um token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const token = gerarAccessToken(payload);
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const membroId = extrairMembroIdDoToken(request);

      expect(membroId).toBe('membro-123');
    });

    it('deve retornar null se não houver header Authorization', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test');

      const membroId = extrairMembroIdDoToken(request);

      expect(membroId).toBeNull();
    });

    it('deve retornar null se token for inválido', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const membroId = extrairMembroIdDoToken(request);

      expect(membroId).toBeNull();
    });
  });

  describe('extrairInfoDoToken', () => {
    it('deve extrair informações completas de um token válido', () => {
      const payload = {
        membroId: 'membro-123',
        email: 'test@test.com',
        isActive: true,
      };

      const token = gerarAccessToken(payload);
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const info = extrairInfoDoToken(request);

      expect(info).not.toBeNull();
      expect(info?.membroId).toBe('membro-123');
      expect(info?.email).toBe('test@test.com');
      expect(info?.isActive).toBe(true);
    });

    it('deve retornar null se não houver header Authorization', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test');

      const info = extrairInfoDoToken(request);

      expect(info).toBeNull();
    });

    it('deve retornar null se token for inválido', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      const info = extrairInfoDoToken(request);

      expect(info).toBeNull();
    });
  });

  describe('verificarAdminToken', () => {
    it('deve retornar true para token admin válido', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer admin-test-token',
        },
      });

      const isValid = verificarAdminToken(request);

      expect(isValid).toBe(true);
    });

    it('deve retornar false para token admin inválido', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer wrong-token',
        },
      });

      const isValid = verificarAdminToken(request);

      expect(isValid).toBe(false);
    });

    it('deve retornar false se ADMIN_TOKEN não estiver configurado', () => {
      delete process.env.ADMIN_TOKEN;

      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer admin-test-token',
        },
      });

      const isValid = verificarAdminToken(request);

      expect(isValid).toBe(false);
    });

    it('deve retornar false se não houver header Authorization', () => {
      const { NextRequest } = require('next/server');
      const request = new NextRequest('http://localhost:3000/api/test');

      const isValid = verificarAdminToken(request);

      expect(isValid).toBe(false);
    });
  });

  describe('respostaNaoAutorizado', () => {
    it('deve retornar uma resposta NextResponse com status 401', async () => {
      const response = respostaNaoAutorizado();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Não autorizado');
      expect(data.message).toBe('Token de autenticação inválido ou ausente');
    });
  });
});

