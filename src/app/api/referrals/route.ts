import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';
import { CriarIndicacaoDTO, ReferralStatus } from '@/types/referral';
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
 * API Route para criar uma nova indicação
 * POST /api/referrals
 * Requer autenticação: Bearer {membroId}
 */
export async function POST(request: NextRequest) {
  try {
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

    const body: CriarIndicacaoDTO = await request.json();
    
    const service = new ReferralService();
    const indicacao = await service.criarIndicacao(membroId, body);

    return NextResponse.json(
      {
        success: true,
        data: indicacao,
        message: 'Indicação criada com sucesso',
      },
      { status: 201 }
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

    console.error('Erro ao criar indicação:', error);
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

/**
 * API Route para listar indicações do membro autenticado
 * GET /api/referrals
 * Requer autenticação: Bearer {membroId}
 * 
 * Query Parameters:
 * - tipo: 'feitas' | 'recebidas' | 'ambas' (default: 'ambas')
 * - status: 'nova' | 'em-contato' | 'fechada' | 'recusada' (opcional)
 * - page: número da página (default: 1)
 * - limit: itens por página (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'ambas';
    const status = searchParams.get('status') as ReferralStatus | null;
    const pagina = parseInt(searchParams.get('page') || '1', 10);
    const limite = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const service = new ReferralService();
    
    // Busca indicações feitas
    const filtroFeitas: any = { membroIndicadorId: membroId };
    if (status) filtroFeitas.status = status;
    const indicacoesFeitas = tipo === 'recebidas' ? [] : await service.buscarTodasIndicacoes(filtroFeitas);

    // Busca indicações recebidas
    const filtroRecebidas: any = { membroIndicadoId: membroId };
    if (status) filtroRecebidas.status = status;
    const indicacoesRecebidas = tipo === 'feitas' ? [] : await service.buscarTodasIndicacoes(filtroRecebidas);

    // Aplica paginação
    const todasIndicacoes = [...indicacoesFeitas, ...indicacoesRecebidas];
    const total = todasIndicacoes.length;
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const indicacoesPaginadas = todasIndicacoes.slice(inicio, fim);
    const totalPaginas = Math.ceil(total / limite);

    return NextResponse.json(
      {
        success: true,
        data: {
          feitas: tipo === 'recebidas' ? [] : indicacoesFeitas.slice(inicio, fim),
          recebidas: tipo === 'feitas' ? [] : indicacoesRecebidas.slice(inicio, fim),
        },
        pagination: {
          page: pagina,
          limit: limite,
          total,
          totalPages: totalPaginas,
        },
      },
      { status: 200 }
    );
  } catch (error) {
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

    console.error('Erro ao listar indicações:', error);
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

