import { NextRequest, NextResponse } from 'next/server';
import { IntentionService } from '@/services/IntentionService';
import { AtualizarStatusIntencaoDTO, IntentionStatus } from '@/types/intention';
import { ZodError } from 'zod';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';
import { InviteService } from '@/services/InviteService';

/**
 * Schema de validação para atualizar status
 */
const atualizarStatusSchema = {
  status: (value: string): IntentionStatus => {
    if (!['pending', 'approved', 'rejected'].includes(value)) {
      throw new Error('Status inválido. Deve ser: pending, approved ou rejected');
    }
    return value as IntentionStatus;
  },
};

/**
 * API Route para atualizar o status de uma intenção (admin apenas)
 * PATCH /api/intentions/[id]/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { id } = params;
    const body: AtualizarStatusIntencaoDTO = await request.json();

    // Valida o status
    let status: IntentionStatus;
    try {
      status = atualizarStatusSchema.status(body.status);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          message: error instanceof Error ? error.message : 'Status inválido',
        },
        { status: 400 }
      );
    }

    const service = new IntentionService();
    const intencao = await service.atualizarStatusIntencao(id, { status });

    if (!intencao) {
      return NextResponse.json(
        {
          success: false,
          error: 'Intenção não encontrada',
        },
        { status: 404 }
      );
    }

    // Se a intenção foi aprovada, gera um convite automaticamente
    let invite = null;
    if (status === 'approved') {
      try {
        const inviteService = new InviteService();
        invite = await inviteService.criarConvite({ intencaoId: intencao._id! });
      } catch (error) {
        console.error('Erro ao gerar convite:', error);
        // Não falha a requisição se o convite não puder ser gerado
        // O admin pode gerar manualmente depois
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: intencao,
        ...(invite && {
          invite: {
            token: invite.token,
            expiraEm: invite.expiraEm,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${invite.token}`,
          },
        }),
      },
      { status: 200 }
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
    console.error('Erro ao atualizar status da intenção:', error);
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

