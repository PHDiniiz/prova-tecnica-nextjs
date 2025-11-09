'use client';

import { useMemo, useState, useCallback } from 'react';
import { Intention, IntentionStatus } from '@/types/intention';
import { IntentionCard } from './IntentionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntentions } from '@/hooks/useIntentions';

interface IntentionListProps {
  adminToken: string;
}

/**
 * Componente para listar intenções com filtros e paginação
 */
export function IntentionList({ adminToken }: IntentionListProps) {
  const [statusFiltro, setStatusFiltro] = useState<IntentionStatus | undefined>(
    undefined
  );
  const [pagina, setPagina] = useState(1);
  const limite = 20;

  const { listarIntencoes, atualizarStatus, isUpdatingStatus } =
    useIntentions();

  const { data, isLoading, error, refetch } = listarIntencoes(
    statusFiltro,
    pagina,
    limite,
    adminToken
  );

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await atualizarStatus({
          id,
          dto: { status: 'approved' },
          adminToken,
        });
        // Refetch após atualização
        refetch();
      } catch (error) {
        console.error('Erro ao aprovar intenção:', error);
        alert(
          error instanceof Error
            ? error.message
            : 'Erro ao aprovar intenção'
        );
      }
    },
    [atualizarStatus, adminToken, refetch]
  );

  const handleReject = useCallback(
    async (id: string) => {
      try {
        await atualizarStatus({
          id,
          dto: { status: 'rejected' },
          adminToken,
        });
        // Refetch após atualização
        refetch();
      } catch (error) {
        console.error('Erro ao recusar intenção:', error);
        alert(
          error instanceof Error ? error.message : 'Erro ao recusar intenção'
        );
      }
    },
    [atualizarStatus, adminToken, refetch]
  );

  const totalPaginas = useMemo(
    () => data?.pagination.totalPages || 0,
    [data?.pagination.totalPages]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Erro ao carregar intenções: {error.message}
        </p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhuma intenção encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            setStatusFiltro(undefined);
            setPagina(1);
          }}
          variant={statusFiltro === undefined ? 'primary' : 'outline'}
        >
          Todas
        </Button>
        <Button
          onClick={() => {
            setStatusFiltro('pending');
            setPagina(1);
          }}
          variant={statusFiltro === 'pending' ? 'primary' : 'outline'}
        >
          Pendentes
        </Button>
        <Button
          onClick={() => {
            setStatusFiltro('approved');
            setPagina(1);
          }}
          variant={statusFiltro === 'approved' ? 'primary' : 'outline'}
        >
          Aprovadas
        </Button>
        <Button
          onClick={() => {
            setStatusFiltro('rejected');
            setPagina(1);
          }}
          variant={statusFiltro === 'rejected' ? 'primary' : 'outline'}
        >
          Recusadas
        </Button>
      </div>

      {/* Lista de intenções */}
      <div className="space-y-4">
        {data.data.map((intencao) => (
          <IntentionCard
            key={intencao._id}
            intencao={intencao}
            onApprove={handleApprove}
            onReject={handleReject}
            isUpdating={isUpdatingStatus}
          />
        ))}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {pagina} de {totalPaginas} ({data.pagination.total} total)
          </span>
          <Button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            variant="outline"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

