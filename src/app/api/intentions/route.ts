import { NextRequest, NextResponse } from 'next/server';
import { IntentionService } from '@/src/services/IntentionService';
import { CriarIntencaoDTO } from '@/src/types/intention';
import { ZodError } from 'zod';

/**
 * API Route para criar uma nova intenção
 * POST /api/intentions
 */
export async function POST(request: NextRequest) {
  try {
    const body: CriarIntencaoDTO = await request.json();

    const service = new IntentionService();
    const intencao = await service.criarIntencao(body);

    return NextResponse.json(
      {
        success: true,
        data: intencao,
        message: 'Intenção criada com sucesso! Aguarde a análise do administrador.',
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

    // Outros erros
    console.error('Erro ao criar intenção:', error);
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

