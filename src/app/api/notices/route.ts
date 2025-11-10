import { NextRequest, NextResponse } from 'next/server';
import { NoticeService } from '@/services/NoticeService';
import { CriarNoticeDTO, NoticeType } from '@/types/notice';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para listar avisos
 * 
 * @route GET /api/notices
 * @access Public (avisos públicos) ou Admin (todos os avisos)
 * 
 * @param {string} [tipo] - Filtrar por tipo: 'info' | 'warning' | 'success' | 'urgent'
 * @param {boolean} [publico=true] - Se true, retorna apenas avisos ativos (público)
 * 
 * @returns {Promise<NextResponse>} Lista de avisos
 * 
 * @example
 * GET /api/notices?publico=true
 * GET /api/notices?tipo=urgent (requer admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as NoticeType | null;
    const publico = searchParams.get('publico') !== 'false'; // Default true

    const service = new NoticeService();

    let avisos;

    if (publico) {
      // Listagem pública - apenas avisos ativos
      avisos = await service.listarAvisosPublicos();
    } else {
      // Listagem admin - requer autenticação
      if (!verificarAdminToken(request)) {
        return respostaNaoAutorizado();
      }

      const filtro: { tipo?: NoticeType; ativo?: boolean } = {};
      if (tipo) filtro.tipo = tipo;

      avisos = await service.listarAvisos(filtro);
    }

    return NextResponse.json(
      {
        success: true,
        data: avisos,
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

    console.error('Erro ao listar avisos:', error);
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
 * API Route para criar um novo aviso
 * 
 * @route POST /api/notices
 * @access Admin (requer ADMIN_TOKEN no header Authorization)
 * 
 * @param {CriarNoticeDTO} body - Dados do aviso
 * @param {string} body.titulo - Título do aviso (3-200 caracteres)
 * @param {string} body.conteudo - Conteúdo do aviso (10-2000 caracteres)
 * @param {NoticeType} body.tipo - Tipo do aviso: 'info' | 'warning' | 'success' | 'urgent'
 * @param {boolean} [body.ativo=true] - Se o aviso está ativo
 * 
 * @returns {Promise<NextResponse>} Aviso criado com status 201
 * 
 * @throws {401} Se token de autenticação admin estiver ausente ou inválido
 * @throws {400} Se dados de validação estiverem inválidos
 * 
 * @example
 * POST /api/notices
 * Authorization: Bearer {ADMIN_TOKEN}
 * {
 *   "titulo": "Manutenção Programada",
 *   "conteudo": "O sistema estará em manutenção no dia 15/01...",
 *   "tipo": "warning",
 *   "ativo": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const body: CriarNoticeDTO = await request.json();

    const service = new NoticeService();
    const aviso = await service.criarAviso(body);

    return NextResponse.json(
      {
        success: true,
        data: aviso,
        message: 'Aviso criado com sucesso!',
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

    console.error('Erro ao criar aviso:', error);
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

