import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/lib/mongodb';
import { TokenRepository } from '@/lib/repositories/TokenRepository';

export interface AccessTokenPayload {
  membroId: string;
  email: string;
  isActive: boolean;
  type?: 'access';
}

export interface RefreshTokenPayload {
  membroId: string;
  email: string;
  type?: 'refresh';
}

export interface DecodedToken {
  membroId: string;
  email: string;
  isActive?: boolean;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export function gerarAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return jwt.sign(
    { ...payload, type: 'access' },
    secret as jwt.Secret,
    { expiresIn }
  );
}

export function gerarRefreshToken(payload: RefreshTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(
    { ...payload, type: 'refresh' },
    secret as jwt.Secret,
    { expiresIn }
  );
}

export function verificarToken(token: string): DecodedToken | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret as string) as DecodedToken;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function verificarRefreshToken(token: string): DecodedToken | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret as string) as DecodedToken;
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function verificarTokenComBlacklist(
  token: string
): Promise<DecodedToken | null> {
  const decoded = verificarToken(token);
  if (!decoded || !decoded.membroId) return null;
  const db = await getDatabase();
  const tokenRepository = new TokenRepository(db);
  const estaNaBlacklist = await tokenRepository.estaNaBlacklist(token);
  if (estaNaBlacklist) return null;
  return decoded;
}

export async function extrairMembroIdDoToken(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  const decoded = await verificarTokenComBlacklist(token);
  return decoded?.membroId || null;
}

export function extrairInfoDoToken(
  request: NextRequest
): DecodedToken | null {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  return verificarToken(token);
}

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
