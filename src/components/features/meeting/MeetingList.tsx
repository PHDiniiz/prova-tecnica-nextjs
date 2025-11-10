'use client';

import { useState, useMemo } from 'react';
import { MeetingCard } from './MeetingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMeetings } from '@/hooks/useMeetings';
import { MeetingFiltros } from '@/types/meeting';

/**
 * Props do componente MeetingList
 */
interface MeetingListProps {
  membroId: string;
  membroToken: string;
  onCheckInSuccess?: () => void;
}

/**
 * Componente para listar reuniões
 * Implementa UI otimista com estados de loading
 * 
 * @example
 * ```tsx
 * <MeetingList
 *   membroId="membro-123"
 *   membroToken={token}
 *   onCheckInSuccess={() => refetch()}
 * />
 * ```
 */
export function MeetingList({
  membroId,
  membroToken,
  onCheckInSuccess,
}: MeetingListProps) {
  const [filtros] = useState<MeetingFiltros>({
    membroId,
  });

  const { data, isLoading, error, refetch } = useMeetings({
    membroId,
    filtros,
    membroToken,
    enabled: !!membroToken,
  });

  const reunioes = useMemo(() => data?.data || [], [data]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {error instanceof Error ? error.message : 'Erro ao carregar reuniões'}
        </p>
        <Button onClick={() => refetch()} variant="primary">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : reunioes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma reunião encontrada
        </div>
      ) : (
        <div className="space-y-4">
          {reunioes.map((meeting) => (
            <MeetingCard
              key={meeting._id}
              meeting={meeting}
              membroId={membroId}
              membroToken={membroToken}
              onCheckInSuccess={() => {
                refetch();
                onCheckInSuccess?.();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

