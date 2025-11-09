import { NextRequest, NextResponse } from 'next/server';
import { IntentionService } from '@/services/IntentionService';
import { CriarIntencaoDTO, IntentionStatus } from '@/types/intention';
import { ZodError } from 'zod';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para listar intenções (admin apenas)
 * GET /api/intentions
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as IntentionStatus | null;
    const pagina = parseInt(searchParams.get('page') || '1', 10);
    const limite = parseInt(searchParams.get('limit') || '20', 10);

    const service = new IntentionService();
    const resultado = await service.buscarIntencoesComPaginacao(
      status ? { status } : undefined,
      pagina,
      limite
    );

    return NextResponse.json(
      {
        success: true,
        data: resultado.intencoes,
        pagination: {
          page: resultado.pagina,
          limit: resultado.limite,
          total: resultado.total,
          totalPages: resultado.totalPaginas,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao listar intenções:', error);
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
          details: error.issues.map((err) => ({
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

