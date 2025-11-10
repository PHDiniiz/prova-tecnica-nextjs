import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'form' | 'list';
  width?: string | number;
  height?: string | number;
}

/**
 * Componente Skeleton otimizado com React.memo para reduzir re-renders
 */
export const Skeleton = memo(function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  ...props
}: SkeletonProps) {
  const style = useMemo<React.CSSProperties>(
    () => ({
      width: width || '100%',
      height: height || '1rem',
    }),
    [width, height]
  );

  const variantClass = useMemo(() => {
    if (variant === 'circular') return 'rounded-full';
    if (variant === 'rectangular') return 'rounded-md';
    return 'rounded';
  }, [variant]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'animate-pulse bg-gray-300 dark:bg-gray-700',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'rounded',
        variant === 'form' && 'rounded-md',
        variant === 'list' && 'rounded-md',
        className
      )}
      style={style}
      {...props}
    />
  );
});

/**
 * Skeleton específico para formulários
 */
export const FormSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton variant="form" height="2.5rem" />
      <Skeleton variant="form" height="2.5rem" />
      <Skeleton variant="form" height="2.5rem" />
      <Skeleton variant="form" height="8rem" />
      <Skeleton variant="form" height="3rem" width="40%" />
    </div>
  );
};

/**
 * Skeleton específico para listagens detalhadas
 */
export const ListSkeleton = ({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="list" height="1.5rem" width="60%" />
          <Skeleton variant="list" height="1rem" width="40%" />
          <Skeleton variant="list" height="1rem" width="100%" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton específico para cards
 */
export const CardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3',
        className
      )}
    >
      <Skeleton variant="rectangular" height="1.5rem" width="70%" />
      <Skeleton variant="rectangular" height="1rem" width="100%" />
      <Skeleton variant="rectangular" height="1rem" width="80%" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rectangular" height="2rem" width="5rem" />
        <Skeleton variant="rectangular" height="2rem" width="5rem" />
      </div>
    </div>
  );
};

