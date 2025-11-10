import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  DecodedToken,
} from '@/types/auth';
import { getDatabase } from '@/lib/mongodb';
import { TokenRepository } from '@/lib/repositories/TokenRepository';

/**
 * Verifica se o token de autenticação admin é válido
 */
export function verificarAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    console.error('ADMIN_TOKEN não configurado nas variáveis de ambiente');
    return false;
  }

  return token === adminToken;
}

/**
 * Retorna uma resposta de erro de autenticação
 */
export function respostaNaoAutorizado() {
  return NextResponse.json(
    {
      success: false,
      error: 'Não autorizado',
      message: 'Token de autenticação inválido ou ausente',
    },
    { status: 401 }
  );
}

/**
 * Obtém o secret JWT das variáveis de ambiente
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
  }
  return secret;
}

/**
 * Gera um access token JWT (15 minutos)
 */
export function gerarAccessToken(payload: {
  membroId: string;
  email: string;
  isActive: boolean;
}): string {
  try {
    const tokenPayload: AccessTokenPayload = {
      ...payload,
      type: 'access',
    };

    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    const secret = getJwtSecret();

    return jwt.sign(tokenPayload, secret, {
      expiresIn,
    } as SignOptions);
  } catch (error) {
    console.error('Erro ao gerar access token:', error);
    // Preserva mensagem original se for erro de configuração
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      throw error;
    }
    throw new Error('Não foi possível gerar o token de acesso');
  }
}

/**
 * Gera um refresh token JWT (7 dias)
 */
export function gerarRefreshToken(payload: {
  membroId: string;
  email: string;
}): string {
  try {
    const tokenPayload: RefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };

    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    const secret = getJwtSecret();

    return jwt.sign(tokenPayload, secret, {
      expiresIn,
    } as SignOptions);
  } catch (error) {
    console.error('Erro ao gerar refresh token:', error);
    // Preserva mensagem original se for erro de configuração
    if (error instanceof Error && error.message.includes('JWT_SECRET')) {
      throw error;
    }
    throw new Error('Não foi possível gerar o refresh token');
  }
}

/**
 * Verifica e decodifica um token JWT
 */
export function verificarToken(token: string): DecodedToken | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as DecodedToken;

    // Verifica se é um access token
    if (decoded.type !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    // Token inválido ou expirado
    return null;
  }
}

/**
 * Verifica e decodifica um refresh token JWT
 */
export function verificarRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;

    // Verifica se é um refresh token
    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    // Token inválido ou expirado
    return null;
  }
}

/**
 * Verifica um token JWT considerando a blacklist
 */
export async function verificarTokenComBlacklist(
  token: string
): Promise<DecodedToken | null> {
  try {
    // Verifica blacklist primeiro
    const db = await getDatabase();
    const tokenRepository = new TokenRepository(db);

    const estaBlacklisted = await tokenRepository.estaNaBlacklist(token);
    if (estaBlacklisted) {
      return null; // Token está na blacklist
    }

    // Verifica token normalmente
    return verificarToken(token);
  } catch (error) {
    console.error('Erro ao verificar token com blacklist:', error);
    return null;
  }
}

/**
 * Extrai o membroId do token JWT do header Authorization
 */
export function extrairMembroIdDoToken(
  request: NextRequest
): string | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    const decoded = verificarToken(token);
    if (!decoded || !decoded.membroId) {
      return null;
    }

    return decoded.membroId;
  } catch (error) {
    console.error('Erro ao extrair membroId do token:', error);
    return null;
  }
}

/**
 * Extrai informações completas do token JWT do header Authorization
 */
export function extrairInfoDoToken(
  request: NextRequest
): DecodedToken | null {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    return verificarToken(token);
  } catch (error) {
    console.error('Erro ao extrair informações do token:', error);
    return null;
  }
}

