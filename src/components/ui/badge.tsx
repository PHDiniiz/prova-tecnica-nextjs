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
        'inline-flex items-center font-medium rounded-full',
        // Variantes
        variant === 'default' &&
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        variant === 'success' &&
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        variant === 'warning' &&
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        variant === 'error' &&
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        variant === 'info' &&
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
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

