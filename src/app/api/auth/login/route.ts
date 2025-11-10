import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { MemberRepository } from '@/lib/repositories/MemberRepository';
import { gerarAccessToken, gerarRefreshToken } from '@/lib/auth';
import { LoginDTO, LoginResponse } from '@/types/auth';
import { z } from 'zod';
import { ZodError } from 'zod';

/**
 * Schema de validação para login
 */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * API Route para login de membros
 * POST /api/auth/login
 * 
 * @access Public
 * 
 * @body {LoginDTO} - Email do membro
 * 
 * @returns {LoginResponse} - Access token, refresh token e dados do membro
 * 
 * @throws {400} Se email não for fornecido ou inválido
 * @throws {401} Se membro não for encontrado ou estiver inativo
 * @throws {500} Se ocorrer erro interno
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginDTO = await request.json();

    // Validação dos dados
    const validatedData = loginSchema.parse(body);

    // Busca o membro no banco
    const db = await getDatabase();
    const memberRepository = new MemberRepository(db);
    const membro = await memberRepository.buscarPorEmail(validatedData.email);

    if (!membro) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credenciais inválidas',
          message: 'Membro não encontrado',
        },
        { status: 401 }
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

    // Gera os tokens JWT
    const accessToken = gerarAccessToken({
      membroId: membro._id,
      email: membro.email,
      isActive: membro.ativo,
    });

    const refreshToken = gerarRefreshToken({
      membroId: membro._id,
      email: membro.email,
    });

    const response: LoginResponse = {
      success: true,
      accessToken,
      refreshToken,
      membro: {
        id: membro._id,
        nome: membro.nome,
        email: membro.email,
        ativo: membro.ativo,
      },
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
    console.error('Erro ao fazer login:', error);
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
