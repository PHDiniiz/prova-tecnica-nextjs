import { NextRequest, NextResponse } from 'next/server';
import { InviteService } from '@/services/InviteService';
import { CriarConviteDTO } from '@/types/invite';
import { ZodError } from 'zod';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';
import { z } from 'zod';

/**
 * Schema de validação para criar convite
 */
const criarConviteSchema = z.object({
  intencaoId: z.string().min(1, 'ID da intenção é obrigatório'),
});

/**
 * API Route para gerar um convite (admin apenas)
 * POST /api/invites
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const body: CriarConviteDTO = await request.json();

    // Valida os dados
    const dadosValidados = criarConviteSchema.parse(body);

    const service = new InviteService();
    const convite = await service.criarConvite(dadosValidados);

    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${convite.token}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: convite._id,
          token: convite.token,
          intencaoId: convite.intencaoId,
          usado: convite.usado,
          expiraEm: convite.expiraEm,
          criadoEm: convite.criadoEm,
        },
        url,
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
    console.error('Erro ao criar convite:', error);
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

