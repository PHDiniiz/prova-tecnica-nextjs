'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props do componente AdminPageHeader
 */
interface AdminPageHeaderProps {
  /** Título da página */
  title: string;
  /** Descrição opcional da página */
  description?: string;
  /** Ação opcional (ex: botão) a ser exibida à direita */
  action?: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente AdminPageHeader
 * 
 * Header padronizado para páginas do painel administrativo.
 * Garante consistência visual e suporte completo a dark mode.
 * 
 * @example
 * ```tsx
 * <AdminPageHeader
 *   title="Dashboard"
 *   description="Visão geral do sistema"
 *   action={<Button>Nova Ação</Button>}
 * />
 * ```
 */
export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
        className
      )}
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

