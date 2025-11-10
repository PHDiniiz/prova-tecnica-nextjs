'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Props do componente MetricCard
 */
interface MetricCardProps {
  titulo: string;
  valor: string | number;
  variacao?: {
    valor: number;
    tipo: 'positivo' | 'negativo' | 'neutro';
    periodo?: string;
  };
  icone?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

/**
 * Componente reutilizável para exibir métricas do dashboard
 * Implementa UI otimista com animações suaves
 * 
 * @example
 * ```tsx
 * <MetricCard
 *   titulo="Membros Ativos"
 *   valor={150}
 *   variacao={{ valor: 5, tipo: 'positivo', periodo: 'vs mês anterior' }}
 *   variant="primary"
 * />
 * ```
 */
export const MetricCard = memo(function MetricCard({
  titulo,
  valor,
  variacao,
  icone,
  variant = 'default',
  className,
}: MetricCardProps) {
  const valorFormatado = useMemo(() => {
    if (typeof valor === 'number') {
      // Formatar números grandes com separador de milhar
      return new Intl.NumberFormat('pt-BR').format(valor);
    }
    return valor;
  }, [valor]);

  const variacaoFormatada = useMemo(() => {
    if (!variacao) return '';
    const sinal = variacao.tipo === 'positivo' ? '+' : variacao.tipo === 'negativo' ? '-' : '';
    const periodo = variacao.periodo ? ` ${variacao.periodo}` : '';
    return `${sinal}${variacao.valor}%${periodo}`;
  }, [variacao]);

  const variantStyles = useMemo(
    () => ({
      default: 'border-gray-200 bg-white',
      primary: 'border-blue-200 bg-blue-50',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      danger: 'border-red-200 bg-red-50',
    }),
    []
  );

  const variacaoStyles = useMemo(
    () => ({
      positivo: 'text-green-600',
      negativo: 'text-red-600',
      neutro: 'text-gray-600',
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="outlined"
        className={cn(
          'hover:shadow-md transition-shadow duration-200',
          variantStyles[variant],
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{titulo}</CardTitle>
            {icone && <div className="text-gray-400">{icone}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">{valorFormatado}</div>
            {variacao && (
              <div className={cn('text-xs font-medium', variacaoStyles[variacao.tipo])}>
                {variacaoFormatada}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

