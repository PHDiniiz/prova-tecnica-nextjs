'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import React, { forwardRef, ReactNode } from 'react';

/**
 * Props do componente Button
 */
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onDrag' | 'children'> {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Exibe spinner de loading e desabilita o botão */
  isLoading?: boolean;
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Conteúdo do botão */
  children?: ReactNode;
}

/**
 * Componente Button
 * 
 * Botão reutilizável com variantes, tamanhos e estados de loading.
 * Inclui animações com Framer Motion.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Clique aqui
 * </Button>
 * 
 * <Button variant="primary" isLoading={isSubmitting}>
 *   Enviando...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      isLoading = false,
      size = 'md',
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Variantes
          variant === 'primary' &&
            'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
          variant === 'secondary' &&
            'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
          variant === 'outline' &&
            'border-2 border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
          variant === 'ghost' &&
            'text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
          // Tamanhos
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

