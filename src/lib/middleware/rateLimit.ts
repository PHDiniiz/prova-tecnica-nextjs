import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * Configuração de rate limiting
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Janela de tempo em milissegundos
}

/**
 * Entrada de rate limit no banco de dados
 */
export interface RateLimitEntry {
  _id?: string;
  key: string; // IP ou email
  count: number;
  resetAt: Date;
  createdAt: Date;
}

/**
 * Classe para gerenciar rate limiting usando MongoDB
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private collectionName = 'rate_limits';

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Verifica se a requisição está dentro do limite
   */
  async checkLimit(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    try {
      const db = await getDatabase();
      const collection = db.collection<RateLimitEntry>(this.collectionName);

      const now = new Date();
      const resetAt = new Date(now.getTime() + this.config.windowMs);

      // Busca ou cria entrada
      const entry = await collection.findOneAndUpdate(
        {
          key,
          resetAt: { $gt: now }, // Ainda dentro da janela
        },
        {
          $setOnInsert: {
            key,
            count: 0,
            resetAt,
            createdAt: now,
          },
          $inc: { count: 1 },
        },
        {
          upsert: true,
          returnDocument: 'after',
        }
      );

      const count = entry?.count || 0;
      const allowed = count <= this.config.maxRequests;
      const remaining = Math.max(0, this.config.maxRequests - count);

      // Limpa entradas expiradas
      await collection.deleteMany({ resetAt: { $lt: now } });

      return {
        allowed,
        remaining,
        resetAt: entry?.resetAt || resetAt,
      };
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
      // Em caso de erro, permite a requisição (fail open)
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: new Date(),
      };
    }
  }

  /**
   * Middleware para aplicar rate limiting
   */
  async middleware(
    request: NextRequest,
    getKey: (request: NextRequest) => string
  ): Promise<NextResponse | null> {
    const key = getKey(request);
    const { allowed, remaining, resetAt } = await this.checkLimit(key);

    if (!allowed) {
      const resetIn = Math.ceil((resetAt.getTime() - Date.now()) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: `Muitas tentativas. Tente novamente em ${resetIn} segundos.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
            'Retry-After': resetIn.toString(),
          },
        }
      );
    }

    return null; // Permite a requisição
  }
}

/**
 * Instâncias pré-configuradas de rate limiters
 */
export const loginRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
});

export const refreshRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hora
});

