import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/DashboardService';
import { PeriodoFiltro, DashboardFiltros } from '@/types/dashboard';
import { BusinessError } from '@/lib/errors/BusinessError';
import { verificarAdminToken, respostaNaoAutorizado } from '@/lib/auth';

/**
 * API Route para obter métricas do dashboard
 * 
 * @route GET /api/dashboard
 * @access Admin (requer ADMIN_TOKEN no header Authorization)
 * 
 * @param {string} periodo - Período de filtro: 'semanal' | 'mensal' | 'acumulado' (default: 'mensal')
 * @param {string} [membroId] - ID do membro para performance individual (opcional)
 * 
 * @returns {Promise<NextResponse>} Métricas do dashboard
 * 
 * @throws {401} Se token de autenticação admin estiver ausente ou inválido
 * @throws {400} Se período fornecido for inválido
 * @throws {404} Se membroId fornecido não for encontrado
 * 
 * @example
 * GET /api/dashboard?periodo=mensal
 * Authorization: Bearer {ADMIN_TOKEN}
 * 
 * @example
 * GET /api/dashboard?periodo=mensal&membroId=507f1f77bcf86cd799439013
 * Authorization: Bearer {ADMIN_TOKEN}
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação admin
    if (!verificarAdminToken(request)) {
      return respostaNaoAutorizado();
    }

    const { searchParams } = new URL(request.url);
    const periodoParam = searchParams.get('periodo') || 'mensal';
    const membroId = searchParams.get('membroId') || undefined;

    // Valida período
    const periodoValido: PeriodoFiltro[] = ['semanal', 'mensal', 'acumulado'];
    const periodo = periodoValido.includes(periodoParam as PeriodoFiltro)
      ? (periodoParam as PeriodoFiltro)
      : 'mensal';

    const filtros: DashboardFiltros = {
      periodo,
      membroId,
    };

    const service = new DashboardService();
    const dados = await service.obterDashboard(filtros);

    return NextResponse.json(
      {
        success: true,
        data: dados,
        periodo,
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

    console.error('Erro ao obter dashboard:', error);
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

