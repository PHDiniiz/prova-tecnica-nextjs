'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberPerformance } from '@/types/dashboard';
import { cn } from '@/lib/utils';

/**
 * Props do componente PerformanceChart
 */
interface PerformanceChartProps {
  dados: MemberPerformance[];
  titulo?: string;
  maxItems?: number;
  className?: string;
}

/**
 * Componente para visualizar performance de membros
 * Implementa visualização simples com barras (sem dependência externa)
 * 
 * @example
 * ```tsx
 * <PerformanceChart
 *   dados={performanceMembros}
 *   titulo="Top 10 Membros"
 *   maxItems={10}
 * />
 * ```
 */
export const PerformanceChart = memo(function PerformanceChart({
  dados,
  titulo = 'Performance dos Membros',
  maxItems = 10,
  className,
}: PerformanceChartProps) {
  // Ordenar por total de indicações recebidas e limitar
  const dadosOrdenados = useMemo(
    () =>
      [...dados]
        .sort((a, b) => b.totalIndicacoesRecebidas - a.totalIndicacoesRecebidas)
        .slice(0, maxItems),
    [dados, maxItems]
  );

  // Calcular valor máximo para normalizar as barras
  const maxIndicacoes = useMemo(
    () =>
      Math.max(
        ...dadosOrdenados.map((d) => d.totalIndicacoesRecebidas),
        1
      ),
    [dadosOrdenados]
  );

  return (
    <Card variant="outlined" className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dadosOrdenados.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            dadosOrdenados.map((membro, index) => {
              const porcentagem = (membro.totalIndicacoesRecebidas / maxIndicacoes) * 100;

              return (
                <div key={membro.membroId || index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {membro.membroNome}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {membro.totalIndicacoesRecebidas} indicações
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{membro.membroEmpresa}</span>
                    <span>Taxa: {membro.taxaFechamento}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
});

