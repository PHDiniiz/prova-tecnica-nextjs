import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        // Variantes
        variant === 'default' &&
          'bg-secondary text-secondary-foreground border-border',
        variant === 'success' &&
          'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        variant === 'warning' &&
          'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        variant === 'error' &&
          'bg-destructive/10 text-destructive border-destructive/20',
        variant === 'info' &&
          'bg-primary/10 text-primary border-primary/20',
        // Tamanhos
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

