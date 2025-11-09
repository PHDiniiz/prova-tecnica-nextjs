import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';
import { AtualizarStatusIndicacaoDTO } from '@/types/referral';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';

/**
 * Extrai o membroId do header Authorization
 * Por enquanto aceita: Bearer {membroId}
 * TODO: Implementar JWT para autenticação real
 */
function extrairMembroId(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  // Por enquanto, aceita o membroId diretamente
  // TODO: Validar JWT e extrair membroId do payload
  return token || null;
}

/**
 * API Route para atualizar o status de uma indicação
 * PATCH /api/referrals/[id]/status
 * Requer autenticação: Bearer {membroId}
 * 
 * Apenas o membro indicado (destinatário) pode atualizar o status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const membroId = extrairMembroId(request);
    
    if (!membroId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autorizado',
          message: 'Token de autenticação ausente',
        },
        { status: 401 }
      );
    }

    const body: AtualizarStatusIndicacaoDTO = await request.json();
    
    const service = new ReferralService();
    
    // Busca a indicação para verificar se o membro é o destinatário
    const indicacao = await service.buscarIndicacaoPorId(id);
    
    if (!indicacao) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recurso não encontrado',
          message: 'Indicação não encontrada',
        },
        { status: 404 }
      );
    }

    // Verifica se o membro autenticado é o destinatário
    if (indicacao.membroIndicadoId !== membroId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sem permissão',
          message: 'Apenas o membro indicado pode atualizar o status desta indicação',
        },
        { status: 403 }
      );
    }

    // Atualiza o status
    const indicacaoAtualizada = await service.atualizarStatusIndicacao(id, body);

    return NextResponse.json(
      {
        success: true,
        data: indicacaoAtualizada,
        message: 'Status atualizado com sucesso',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          message: 'Erro de validação',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof BusinessError) {
      return NextResponse.json(
        {
          success: false,
          error: error.type,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error('Erro ao atualizar status da indicação:', error);
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

