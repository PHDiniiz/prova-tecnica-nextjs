'use client';

import { Badge } from '@/components/ui/badge';
import { NoticeType } from '@/types/notice';
import { cn } from '@/lib/utils';

/**
 * Props do componente NoticeTypeBadge
 */
interface NoticeTypeBadgeProps {
  tipo: NoticeType;
  className?: string;
}

/**
 * Mapeamento de cores por tipo de aviso
 */
const tipoStyles: Record<NoticeType, { variant: 'default' | 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  info: { variant: 'info', label: 'Informação' },
  success: { variant: 'success', label: 'Sucesso' },
  warning: { variant: 'warning', label: 'Aviso' },
  urgent: { variant: 'error', label: 'Urgente' },
};

/**
 * Componente badge para exibir tipo de aviso
 * Reutilizável e consistente com design system
 * 
 * @example
 * ```tsx
 * <NoticeTypeBadge tipo="urgent" />
 * ```
 */
export function NoticeTypeBadge({ tipo, className }: NoticeTypeBadgeProps) {
  const style = tipoStyles[tipo];

  return (
    <Badge variant={style.variant} className={cn('', className)}>
      {style.label}
    </Badge>
  );
}

