import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import {
  gerarAccessToken,
  verificarRefreshToken,
} from '@/lib/auth';
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
    const body: RefreshTokenDTO = await request.json();

    // Validação dos dados
    const validatedData = refreshTokenSchema.parse(body);

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
    const db = await getDatabase();
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

    // Gera novo access token
    const accessToken = gerarAccessToken({
      membroId: membro._id,
      email: membro.email,
      isActive: membro.ativo,
    });

    // Opcionalmente gera novo refresh token (rotação de tokens)
    // Por enquanto, retornamos apenas o novo access token
    const response: RefreshTokenResponse = {
      success: true,
      accessToken,
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

