'use client';

import { useState, useMemo } from 'react';
import { PeriodoFiltro } from '@/types/dashboard';
import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from './MetricCard';
import { PerformanceChart } from './PerformanceChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Props do componente DashboardPage
 */
interface DashboardPageProps {
  adminToken: string;
}

/**
 * Componente principal do dashboard
 * Implementa UI otimista com estados de loading e error
 * 
 * @example
 * ```tsx
 * <DashboardPage adminToken={adminToken} />
 * ```
 */
export function DashboardPage({ adminToken }: DashboardPageProps) {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mensal');

  const { data, isLoading, error, refetch } = useDashboard({
    periodo,
    adminToken,
    enabled: !!adminToken,
  });

  // Calcular variações (simulado - em produção viria do backend)
  const metricas = useMemo(() => {
    if (!data?.data?.metricasGerais) return null;

    const m = data.data.metricasGerais;
    return {
      membrosAtivos: {
        valor: m.membrosAtivos,
        variacao: { valor: 2, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
      indicacoesMes: {
        valor: m.indicacoesMes,
        variacao: { valor: 10, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
      obrigadosMes: {
        valor: m.obrigadosMes,
        variacao: { valor: 5, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
      taxaConversao: {
        valor: `${m.taxaConversaoIntencoes.toFixed(1)}%`,
        variacao: { valor: 2.5, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
      taxaFechamento: {
        valor: `${m.taxaFechamentoIndicacoes.toFixed(1)}%`,
        variacao: { valor: 3.2, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
      valorTotal: {
        valor: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(m.valorTotalEstimado),
        variacao: { valor: 15, tipo: 'positivo' as const, periodo: 'vs mês anterior' },
      },
    };
  }, [data]);

  const periodos: { value: PeriodoFiltro; label: string }[] = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'acumulado', label: 'Acumulado' },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card variant="outlined" className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Erro ao carregar dashboard
                </h3>
                <p className="text-red-700 mb-4">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
                <Button onClick={() => refetch()} variant="primary">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Performance</h1>
            <p className="text-gray-600 mt-1">Visão geral das métricas e performance do grupo</p>
          </div>

          {/* Filtros de período */}
          <div className="flex gap-2">
            {periodos.map((p) => (
              <Button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                variant={periodo === p.value ? 'primary' : 'outline'}
                size="sm"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Métricas principais */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : metricas ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              titulo="Membros Ativos"
              valor={metricas.membrosAtivos.valor}
              variacao={metricas.membrosAtivos.variacao}
              variant="primary"
            />
            <MetricCard
              titulo="Indicações no Período"
              valor={metricas.indicacoesMes.valor}
              variacao={metricas.indicacoesMes.variacao}
              variant="success"
            />
            <MetricCard
              titulo="Agradecimentos no Período"
              valor={metricas.obrigadosMes.valor}
              variacao={metricas.obrigadosMes.variacao}
              variant="success"
            />
            <MetricCard
              titulo="Taxa de Conversão"
              valor={metricas.taxaConversao.valor}
              variacao={metricas.taxaConversao.variacao}
              variant="default"
            />
            <MetricCard
              titulo="Taxa de Fechamento"
              valor={metricas.taxaFechamento.valor}
              variacao={metricas.taxaFechamento.variacao}
              variant="default"
            />
            <MetricCard
              titulo="Valor Total Estimado"
              valor={metricas.valorTotal.valor}
              variacao={metricas.valorTotal.variacao}
              variant="warning"
            />
          </div>
        ) : null}

        {/* Gráfico de performance */}
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : data?.data?.performanceMembros && data.data.performanceMembros.length > 0 ? (
          <PerformanceChart
            dados={data.data.performanceMembros}
            titulo="Top 10 Membros por Indicações Recebidas"
            maxItems={10}
          />
        ) : (
          <Card variant="outlined">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500 py-8">
                Nenhum dado de performance disponível para o período selecionado
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

