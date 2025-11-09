import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '@/services/MemberService';
import { CriarMembroDTO } from '@/types/member';
import { ZodError } from 'zod';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para listar membros (admin apenas)
 * GET /api/members
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get('ativos') === 'true';

    const service = new MemberService();
    const membros = apenasAtivos
      ? await service.buscarMembrosAtivos()
      : await service.buscarTodosMembros();

    return NextResponse.json(
      {
        success: true,
        data: membros,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar sua solicitação',
        message:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

/**
 * API Route para criar um novo membro usando token de convite
 * POST /api/members
 */
export async function POST(request: NextRequest) {
  try {
    const body: CriarMembroDTO = await request.json();

    const service = new MemberService();
    const membro = await service.criarMembro(body);

    return NextResponse.json(
      {
        success: true,
        data: membro,
        message: 'Cadastro realizado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error) {
    // Erro de validação do Zod
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

    // Erros específicos do serviço
    if (error instanceof Error) {
      if (
        error.message.includes('Token') ||
        error.message.includes('convite')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
      if (error.message.includes('já está cadastrado')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      }
    }

    // Outros erros
    console.error('Erro ao criar membro:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar sua solicitação',
        message:
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

