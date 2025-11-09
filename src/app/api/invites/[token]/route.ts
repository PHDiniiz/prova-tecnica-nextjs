import { NextRequest, NextResponse } from 'next/server';
import { InviteService } from '@/services/InviteService';
import { IntentionService } from '@/services/IntentionService';

/**
 * API Route para validar um token de convite (público)
 * GET /api/invites/[token]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token não fornecido',
        },
        { status: 400 }
      );
    }

    const inviteService = new InviteService();
    const convite = await inviteService.validarConvite({ token });

    if (!convite) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido ou expirado',
        },
        { status: 400 }
      );
    }

    // Busca os dados da intenção associada
    const intentionService = new IntentionService();
    const intencao = await intentionService.buscarIntencaoPorId(
      convite.intencaoId
    );

    if (!intencao) {
      return NextResponse.json(
        {
          success: false,
          error: 'Intenção não encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          token: convite.token,
          valido: true,
          expiraEm: convite.expiraEm,
          intencao: {
            nome: intencao.nome,
            email: intencao.email,
            empresa: intencao.empresa,
            motivo: intencao.motivo,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao validar convite:', error);

    // Erros específicos do serviço
    if (error instanceof Error) {
      if (error.message.includes('já foi usado')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Este convite já foi usado',
          },
          { status: 400 }
        );
      }
      if (error.message.includes('expirado')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Este convite expirou',
          },
          { status: 400 }
        );
      }
    }

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

