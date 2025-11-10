import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '@/services/ReferralService';
import { CriarIndicacaoDTO, ReferralStatus } from '@/types/referral';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { extrairMembroIdDoToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para criar uma nova indicação de negócio
 * 
 * @route POST /api/referrals
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {CriarIndicacaoDTO} body - Dados da indicação
 * @param {string} body.membroIndicadoId - ID do membro que receberá a indicação
 * @param {string} body.empresaContato - Nome da empresa/contato (2-100 caracteres)
 * @param {string} body.descricao - Descrição da oportunidade (10-1000 caracteres)
 * @param {number} [body.valorEstimado] - Valor estimado (opcional, min: 1000, max: 10000000)
 * @param {string} [body.observacoes] - Observações adicionais (opcional, max: 500 caracteres)
 * 
 * @returns {Promise<NextResponse>} Indicação criada com status 201
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {400} Se dados de validação estiverem inválidos
 * @throws {403} Se membro estiver inativo
 * @throws {404} Se membro indicado não for encontrado
 * @throws {409} Se tentar auto-indicação
 * 
 * @example
 * POST /api/referrals
 * Authorization: Bearer {membroId}
 * {
 *   "membroIndicadoId": "507f1f77bcf86cd799439013",
 *   "empresaContato": "Empresa ABC",
 *   "descricao": "Indicação de cliente potencial...",
 *   "valorEstimado": 50000
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
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
 * 
 * @route GET /api/referrals
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {string} [tipo] - Tipo de indicações: 'feitas' | 'recebidas' | 'ambas' (default: 'ambas')
 * @param {ReferralStatus} [status] - Filtro por status: 'nova' | 'em-contato' | 'fechada' | 'recusada'
 * @param {number} [page] - Número da página (default: 1)
 * @param {number} [limit] - Itens por página (default: 20, max: 100)
 * 
 * @returns {Promise<NextResponse>} Lista de indicações (feitas e recebidas) com paginação
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * 
 * @example
 * GET /api/referrals?tipo=feitas&status=nova&page=1&limit=20
 * Authorization: Bearer {membroId}
 */
export async function GET(request: NextRequest) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'ambas';
    const status = searchParams.get('status') as ReferralStatus | null;
    const search = searchParams.get('search') || '';
    const pagina = parseInt(searchParams.get('page') || '1', 10);
    const limite = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const service = new ReferralService();
    
    // Busca indicações feitas
    const filtroFeitas: {
      membroIndicadorId: string;
      status?: ReferralStatus;
      search?: string;
    } = { membroIndicadorId: membroId };
    if (status) filtroFeitas.status = status;
    if (search) filtroFeitas.search = search;
    const indicacoesFeitas = tipo === 'recebidas' ? [] : await service.buscarTodasIndicacoes(filtroFeitas);

    // Busca indicações recebidas
    const filtroRecebidas: {
      membroIndicadoId: string;
      status?: ReferralStatus;
      search?: string;
    } = { membroIndicadoId: membroId };
    if (status) filtroRecebidas.status = status;
    if (search) filtroRecebidas.search = search;
    const indicacoesRecebidas = tipo === 'feitas' ? [] : await service.buscarTodasIndicacoes(filtroRecebidas);

    // Aplica paginação
    const todasIndicacoes = [...indicacoesFeitas, ...indicacoesRecebidas];
    const total = todasIndicacoes.length;
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
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

