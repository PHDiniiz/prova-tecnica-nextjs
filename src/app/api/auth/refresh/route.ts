import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { TokenRepository } from '@/lib/repositories/TokenRepository';
import {
  gerarAccessToken,
  gerarRefreshToken,
  verificarRefreshToken,
} from '@/lib/auth';
import { refreshRateLimiter } from '@/lib/middleware/rateLimit';
import { RefreshTokenDTO, RefreshTokenResponse } from '@/types/auth';
import { z } from 'zod';
import { ZodError } from 'zod';

/**
 * Schema de validação para refresh token
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

/**
 * API Route para renovar access token usando refresh token
 * POST /api/auth/refresh
 * 
 * @access Public
 * 
 * @body {RefreshTokenDTO} - Refresh token
 * 
 * @returns {RefreshTokenResponse} - Novo access token e opcionalmente novo refresh token
 * 
 * @throws {400} Se refresh token não for fornecido ou inválido
 * @throws {401} Se refresh token for inválido ou expirado
 * @throws {404} Se membro não for encontrado
 * @throws {500} Se ocorrer erro interno
 */
export async function POST(request: NextRequest) {
  try {
    // Aplicar rate limiting por IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const ipLimit = await refreshRateLimiter.middleware(request, () => `refresh:ip:${ip}`);
    if (ipLimit) return ipLimit;

    const body: RefreshTokenDTO = await request.json();

    // Validação dos dados
    const validatedData = refreshTokenSchema.parse(body);

    // Verifica se o refresh token está na blacklist
    const db = await getDatabase();
    const tokenRepository = new TokenRepository(db);

    const estaBlacklisted = await tokenRepository.estaNaBlacklist(validatedData.refreshToken);
    if (estaBlacklisted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido',
          message: 'Refresh token foi revogado',
        },
        { status: 401 }
      );
    }

    // Verifica o refresh token
    const decoded = verificarRefreshToken(validatedData.refreshToken);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido',
          message: 'Refresh token inválido ou expirado',
        },
        { status: 401 }
      );
    }

    // Busca o membro no banco para verificar se ainda está ativo
    const memberRepository = new MemberRepository(db);
    const membro = await memberRepository.buscarPorId(decoded.membroId);

    if (!membro) {
      return NextResponse.json(
        {
          success: false,
          error: 'Membro não encontrado',
          message: 'Membro associado ao token não foi encontrado',
        },
        { status: 404 }
      );
    }

    if (!membro.ativo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conta inativa',
          message: 'Sua conta está inativa. Entre em contato com o administrador.',
        },
        { status: 401 }
      );
    }

    if (!membro._id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erro interno',
          message: 'ID do membro não encontrado',
        },
        { status: 500 }
      );
    }

    // ROTAÇÃO: Invalida o refresh token antigo
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7); // 7 dias (mesmo tempo do refresh token)
    await tokenRepository.adicionarBlacklist(
      validatedData.refreshToken,
      membro._id,
      'refresh',
      expiraEm
    );

    // Gera novos tokens
    const accessToken = gerarAccessToken({
      membroId: membro._id,
      email: membro.email,
      isActive: membro.ativo,
    });

    const refreshToken = gerarRefreshToken({
      membroId: membro._id,
      email: membro.email,
    });

    const response: RefreshTokenResponse = {
      success: true,
      accessToken,
      refreshToken, // Novo refresh token gerado
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Erro de validação Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Erro inesperado
    console.error('Erro ao renovar token:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

