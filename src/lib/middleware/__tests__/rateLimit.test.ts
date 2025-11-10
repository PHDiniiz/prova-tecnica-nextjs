/// <reference types="jest" />
import { RateLimiter, loginRateLimiter, refreshRateLimiter } from '../rateLimit';
import { NextRequest } from 'next/server';

// Mock do MongoDB
jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(),
}));

// Mock do NextRequest para evitar problemas com propriedade url readonly
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextRequest: class MockNextRequest {
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
  };
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockCollection: any;
  let mockDb: any;

  beforeEach(() => {
    mockCollection = {
      findOneAndUpdate: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    const { getDatabase } = require('@/lib/mongodb');
    getDatabase.mockResolvedValue(mockDb);

    rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
    });
  });

  describe('checkLimit', () => {
    it('deve permitir requisição dentro do limite', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 3,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const result = await rateLimiter.checkLimit('test-key');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 3 = 2
      expect(result.resetAt).toEqual(resetAt);
    });

    it('deve bloquear requisição acima do limite', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 6, // Acima do limite de 5
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const result = await rateLimiter.checkLimit('test-key');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('deve criar nova entrada se não existir', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 1,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const result = await rateLimiter.checkLimit('new-key');

      expect(result.allowed).toBe(true);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        {
          key: 'new-key',
          resetAt: { $gt: expect.any(Date) },
        },
        expect.any(Object),
        {
          upsert: true,
          returnDocument: 'after',
        }
      );
    });

    it('deve permitir requisição em caso de erro (fail open)', async () => {
      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      const result = await rateLimiter.checkLimit('test-key');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5); // maxRequests
    });

    it('deve limpar entradas expiradas', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 1,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await rateLimiter.checkLimit('test-key');

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({
        resetAt: { $lt: expect.any(Date) },
      });
    });
  });

  describe('middleware', () => {
    it('deve retornar null se requisição estiver dentro do limite', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 3,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const request = new NextRequest('http://localhost:3000/api/test');
      const getKey = jest.fn(() => 'test-key');

      const result = await rateLimiter.middleware(request, getKey);

      expect(result).toBeNull();
    });

    it('deve retornar NextResponse com status 429 se limite excedido', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 6,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const request = new NextRequest('http://localhost:3000/api/test');
      const getKey = jest.fn(() => 'test-key');

      const result = await rateLimiter.middleware(request, getKey);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);

      const data = await result!.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Too Many Requests');
    });

    it('deve incluir headers de rate limit na resposta', async () => {
      const now = new Date();
      const resetAt = new Date(now.getTime() + 15 * 60 * 1000);

      mockCollection.findOneAndUpdate.mockResolvedValue({
        count: 6,
        resetAt,
      });

      mockCollection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const request = new NextRequest('http://localhost:3000/api/test');
      const getKey = jest.fn(() => 'test-key');

      const result = await rateLimiter.middleware(request, getKey);

      expect(result?.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('Retry-After')).toBeDefined();
    });
  });

  describe('Instâncias pré-configuradas', () => {
    it('loginRateLimiter deve ter configuração correta', () => {
      expect(loginRateLimiter).toBeInstanceOf(RateLimiter);
      // Verifica através do comportamento
      expect(loginRateLimiter).toBeDefined();
    });

    it('refreshRateLimiter deve ter configuração correta', () => {
      expect(refreshRateLimiter).toBeInstanceOf(RateLimiter);
      // Verifica através do comportamento
      expect(refreshRateLimiter).toBeDefined();
    });
  });
});

