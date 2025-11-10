import { NextRequest, NextResponse } from 'next/server';
import { MeetingService } from '@/services/MeetingService';
import { CriarMeetingDTO, MeetingFiltros } from '@/types/meeting';
import { ZodError } from 'zod';
import { BusinessError } from '@/lib/errors/BusinessError';
import { extrairMembroIdDoToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para listar reuniões
 * 
 * @route GET /api/meetings
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {string} [membroId] - Filtrar por membro (opcional, se não fornecido usa do token)
 * @param {string} [dataInicio] - Data de início do filtro (ISO string)
 * @param {string} [dataFim] - Data de fim do filtro (ISO string)
 * 
 * @returns {Promise<NextResponse>} Lista de reuniões
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * 
 * @example
 * GET /api/meetings?membroId=507f1f77bcf86cd799439013
 * Authorization: Bearer {membroId}
 */
export async function GET(request: NextRequest) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const { searchParams } = new URL(request.url);
    const membroIdFiltro = searchParams.get('membroId') || membroId;
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const filtro: MeetingFiltros = {
      membroId: membroIdFiltro,
    };

    if (dataInicio) {
      filtro.dataInicio = new Date(dataInicio);
    }
    if (dataFim) {
      filtro.dataFim = new Date(dataFim);
    }

    const service = new MeetingService();
    const reunioes = await service.listarReunioes(filtro);

    return NextResponse.json(
      {
        success: true,
        data: reunioes,
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

    console.error('Erro ao listar reuniões:', error);
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
 * API Route para criar uma nova reunião
 * 
 * @route POST /api/meetings
 * @access Authenticated (requer Bearer token no header Authorization)
 * 
 * @param {CriarMeetingDTO} body - Dados da reunião
 * @param {string} body.membro1Id - ID do primeiro membro
 * @param {string} body.membro2Id - ID do segundo membro
 * @param {string} body.dataReuniao - Data da reunião (ISO string)
 * @param {string} [body.local] - Local da reunião (opcional)
 * @param {string} [body.observacoes] - Observações (opcional)
 * 
 * @returns {Promise<NextResponse>} Reunião criada com status 201
 * 
 * @throws {401} Se token de autenticação estiver ausente
 * @throws {400} Se dados de validação estiverem inválidos ou membros forem iguais
 * @throws {403} Se algum membro estiver inativo
 * @throws {404} Se algum membro não for encontrado
 * 
 * @example
 * POST /api/meetings
 * Authorization: Bearer {membroId}
 * {
 *   "membro1Id": "507f1f77bcf86cd799439013",
 *   "membro2Id": "507f1f77bcf86cd799439014",
 *   "dataReuniao": "2025-01-15T10:00:00Z",
 *   "local": "Escritório Central"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const membroId = extrairMembroIdDoToken(request);
    
    if (!membroId) {
      return respostaNaoAutorizado();
    }

    const body: CriarMeetingDTO = await request.json();
    
    const service = new MeetingService();
    const reuniao = await service.criarReuniao(body);

    return NextResponse.json(
      {
        success: true,
        data: reuniao,
        message: 'Reunião criada com sucesso!',
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

    console.error('Erro ao criar reunião:', error);
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

