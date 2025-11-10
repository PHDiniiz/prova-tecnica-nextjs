'use client';

import { Notice } from '@/types/notice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoticeTypeBadge } from './NoticeTypeBadge';
import { cn } from '@/lib/utils';

/**
 * Props do componente NoticeCard
 */
interface NoticeCardProps {
  notice: Notice;
  className?: string;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
  showActions?: boolean;
}

/**
 * Formata data de forma simples
 */
const formatarData = (data: Date | string): string => {
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Componente card para exibir um aviso individual
 * Reutilizável e responsivo
 * 
 * @example
 * ```tsx
 * <NoticeCard 
 *   notice={aviso} 
 *   showActions={true}
 *   onEdit={(n) => handleEdit(n)}
 *   onDelete={(n) => handleDelete(n)}
 * />
 * ```
 */
export function NoticeCard({
  notice,
  className,
  onEdit,
  onDelete,
  showActions = false,
}: NoticeCardProps) {
  return (
    <Card
      variant="outlined"
      className={cn(
        'hover:shadow-md transition-shadow duration-200',
        !notice.ativo && 'opacity-60',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <NoticeTypeBadge tipo={notice.tipo} />
              {!notice.ativo && (
                <Badge variant="default" className="text-xs">
                  Inativo
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg mb-1">{notice.titulo}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-700 whitespace-pre-wrap">{notice.conteudo}</p>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Criado em: {formatarData(notice.criadoEm)}
            </div>
            {showActions && (onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    onClick={() => onEdit(notice)}
                    variant="outline"
                    size="sm"
                  >
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={() => onDelete(notice)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Deletar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

