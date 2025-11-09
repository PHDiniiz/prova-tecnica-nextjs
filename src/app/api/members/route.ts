import { NextRequest, NextResponse } from 'next/server';
import { MemberService } from '@/services/MemberService';
import { CriarMembroDTO } from '@/types/member';
import { ZodError } from 'zod';

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
          details: error.errors.map((err) => ({
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

