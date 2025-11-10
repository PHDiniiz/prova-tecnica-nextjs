'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressProps {
  /**
   * Valor do progresso (0-100)
   * Se não fornecido, mostra progresso indeterminado
   */
  value?: number;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Altura da barra de progresso
   */
  height?: string | number;
  /**
   * Mostrar porcentagem
   */
  showLabel?: boolean;
  /**
   * Cor da barra de progresso
   */
  variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Componente de barra de progresso animada
 * Suporta progresso determinado (com valor) e indeterminado
 */
export const Progress = ({
  value,
  className,
  height = '0.5rem',
  showLabel = false,
  variant = 'default',
}: ProgressProps) => {
  const isIndeterminate = value === undefined;

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-destructive',
  };

  const heightStyle =
    typeof height === 'number' ? `${height}px` : height;

  if (isIndeterminate) {
    return (
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-muted',
          className
        )}
        style={{ height: heightStyle }}
      >
        <motion.div
          className={cn('h-full', variantClasses[variant])}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ width: '50%' }}
        />
      </div>
    );
  }

  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        className
      )}
      style={{ height: heightStyle }}
    >
      <motion.div
        className={cn('h-full', variantClasses[variant])}
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
          {clampedValue}%
        </div>
      )}
    </div>
  );
};

