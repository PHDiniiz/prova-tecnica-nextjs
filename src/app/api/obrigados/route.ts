import { NextRequest, NextResponse } from 'next/server';
import { ObrigadoService } from '@/services/ObrigadoService';
import { CriarObrigadoDTO } from '@/types/obrigado';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { extrairMembroIdDoToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para criar um novo agradecimento (obrigado)
 * 
 * @route POST /api/obrigados
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {CriarObrigadoDTO} body - Dados do agradecimento
 * @param {string} body.indicacaoId - ID da indicação que foi fechada
 * @param {string} body.mensagem - Mensagem de agradecimento (10-500 caracteres)
 * @param {boolean} [body.publico] - Se o agradecimento é público (default: true)
 * 
 * @returns {Promise<NextResponse>} Obrigado criado com status 201
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {400} Se dados de validação estiverem inválidos ou indicação não estiver fechada
 * @throws {403} Se membro não for o destinatário da indicação
 * @throws {404} Se indicação não for encontrada
 * @throws {409} Se já existir agradecimento para esta indicação
 * 
 * @example
 * POST /api/obrigados
 * Authorization: Bearer {membroId}
 * {
 *   "indicacaoId": "507f1f77bcf86cd799439013",
 *   "mensagem": "Muito obrigado pela indicação! O negócio foi fechado com sucesso."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const body: CriarObrigadoDTO = await request.json();
    
    const service = new ObrigadoService();
    const obrigado = await service.criarObrigado(membroId, body);

    return NextResponse.json(
      {
        success: true,
        data: obrigado,
        message: 'Agradecimento registrado com sucesso!',
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

    console.error('Erro ao criar obrigado:', error);
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
 * API Route para listar agradecimentos públicos
 * 
 * @route GET /api/obrigados
 * @access Public
 * 
 * @param {string} [membroIndicadorId] - Filtrar por membro que recebeu o agradecimento
 * @param {string} [membroIndicadoId] - Filtrar por membro que fez o agradecimento
 * @param {number} [page] - Número da página (default: 1)
 * @param {number} [limit] - Itens por página (default: 20, max: 100)
 * 
 * @returns {Promise<NextResponse>} Lista de agradecimentos públicos com paginação
 * 
 * @example
 * GET /api/obrigados?page=1&limit=20
 * GET /api/obrigados?membroIndicadorId=507f1f77bcf86cd799439013
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const membroIndicadorId = searchParams.get('membroIndicadorId');
    const membroIndicadoId = searchParams.get('membroIndicadoId');
    const pagina = parseInt(searchParams.get('page') || '1', 10);
    const limite = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const service = new ObrigadoService();
    
    const filtro: {
      membroIndicadorId?: string;
      membroIndicadoId?: string;
    } = {};

    if (membroIndicadorId) filtro.membroIndicadorId = membroIndicadorId;
    if (membroIndicadoId) filtro.membroIndicadoId = membroIndicadoId;

    const resultado = await service.buscarComPaginacao(filtro, pagina, limite);

    return NextResponse.json(
      {
        success: true,
        data: resultado.obrigados,
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

    console.error('Erro ao listar obrigados:', error);
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

