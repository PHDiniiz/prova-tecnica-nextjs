'use client';

import { useState, useMemo } from 'react';
import { Notice, NoticeType } from '@/types/notice';
import { NoticeCard } from './NoticeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNotices } from '@/hooks/useNotices';
import { cn } from '@/lib/utils';

/**
 * Props do componente NoticeList
 */
interface NoticeListProps {
  publico?: boolean;
  adminToken?: string;
  showActions?: boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
  filtroTipo?: NoticeType;
}

/**
 * Componente para listar avisos
 * Implementa UI otimista com estados de loading
 * 
 * @example
 * ```tsx
 * // Listagem pública
 * <NoticeList publico={true} />
 * 
 * // Listagem admin
 * <NoticeList 
 *   publico={false}
 *   adminToken={token}
 *   showActions={true}
 *   onEdit={(n) => handleEdit(n)}
 *   onDelete={(n) => handleDelete(n)}
 * />
 * ```
 */
export function NoticeList({
  publico = true,
  adminToken,
  showActions = false,
  onEdit,
  onDelete,
  filtroTipo,
}: NoticeListProps) {
  const [tipoFiltro, setTipoFiltro] = useState<NoticeType | undefined>(filtroTipo);

  const { data, isLoading, error, refetch } = useNotices({
    publico,
    tipo: tipoFiltro,
    adminToken,
    enabled: publico || !!adminToken,
  });

  const avisos = useMemo(() => data?.data || [], [data]);

  const tipos: { value: NoticeType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'info', label: 'Informação' },
    { value: 'success', label: 'Sucesso' },
    { value: 'warning', label: 'Aviso' },
    { value: 'urgent', label: 'Urgente' },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Erro ao carregar avisos'}
        </p>
        <Button onClick={() => refetch()} variant="primary">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      {!publico && (
        <div className="flex gap-2 flex-wrap">
          {tipos.map((tipo) => (
            <Button
              key={tipo.value}
              onClick={() => setTipoFiltro(tipo.value === 'all' ? undefined : tipo.value)}
              variant={tipoFiltro === tipo.value || (tipo.value === 'all' && !tipoFiltro) ? 'primary' : 'outline'}
              size="sm"
            >
              {tipo.label}
            </Button>
          ))}
        </div>
      )}

      {/* Lista de avisos */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : avisos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum aviso encontrado
        </div>
      ) : (
        <div className="space-y-4">
          {avisos.map((notice) => (
            <NoticeCard
              key={notice._id}
              notice={notice}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

