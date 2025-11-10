'use client';

import { useState, useCallback } from 'react';
import { useReferrals } from '@/hooks/useReferrals';
import { ReferralStatus, AtualizarStatusIndicacaoDTO } from '@/types/referral';
import { ReferralCard } from './ReferralCard';
import { ReferralStatusUpdate } from './ReferralStatusUpdate';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';

interface ReferralListProps {
  membroId: string;
  tipo?: 'feitas' | 'recebidas' | 'ambas';
  status?: ReferralStatus;
}

/**
 * Componente para listar indicações com filtros e paginação
 */
export function ReferralList({
  membroId,
  tipo = 'ambas',
  status,
}: ReferralListProps) {
  const [filtroStatus, setFiltroStatus] = useState<ReferralStatus | 'todos'>(status || 'todos');
  const [tipoSelecionado, setTipoSelecionado] = useState<'feitas' | 'recebidas' | 'ambas'>(tipo);
  const [pagina, setPagina] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limite = 20;

  const {
    data,
    isLoading,
    error,
    refetch,
    atualizarStatus,
    isUpdatingStatus,
  } = useReferrals(membroId, {
    tipo: tipoSelecionado,
    status: filtroStatus !== 'todos' ? filtroStatus : undefined,
    page: pagina,
    limit: limite,
    search: searchTerm || undefined,
  });

  const indicacoesFeitas = data?.data.feitas || [];
  const indicacoesRecebidas = data?.data.recebidas || [];
  const todasIndicacoes = [...indicacoesFeitas, ...indicacoesRecebidas];

  const handleStatusUpdate = useCallback(
    async (id: string, dto: AtualizarStatusIndicacaoDTO) => {
      await atualizarStatus({ id, dto });
      await refetch();
    },
    [atualizarStatus, refetch]
  );

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPagina(1); // Resetar página ao buscar
  }, []);

  const statusDisponiveis: (ReferralStatus | 'todos')[] = [
    'todos',
    'nova',
    'em-contato',
    'fechada',
    'recusada',
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} variant="outlined">
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Erro ao carregar indicações: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="w-full">
        <SearchInput
          placeholder="Buscar por empresa, descrição..."
          onSearch={handleSearch}
          className="w-full"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            id="filtro-tipo"
            value={tipoSelecionado}
            onChange={(e) => {
              setTipoSelecionado(e.target.value as 'feitas' | 'recebidas' | 'ambas');
              setPagina(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ambas">Todas</option>
            <option value="feitas">Indicações Feitas</option>
            <option value="recebidas">Indicações Recebidas</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="filtro-status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="filtro-status"
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value as ReferralStatus | 'todos');
              setPagina(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusDisponiveis.map((s) => (
              <option key={s} value={s}>
                {s === 'todos'
                  ? 'Todos'
                  : s === 'nova'
                    ? 'Nova'
                    : s === 'em-contato'
                      ? 'Em Contato'
                      : s === 'fechada'
                        ? 'Fechada'
                        : 'Recusada'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de indicações */}
      {todasIndicacoes.length === 0 ? (
        <Card variant="outlined">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhuma indicação encontrada com os filtros selecionados.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Indicações Feitas */}
          {tipoSelecionado !== 'recebidas' && indicacoesFeitas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Indicações Feitas ({indicacoesFeitas.length})
              </h3>
              <div className="space-y-4">
                {indicacoesFeitas.map((referral) => (
                  <ReferralCard
                    key={referral._id}
                    referral={referral}
                    membroId={membroId}
                    tipo="feita"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Indicações Recebidas */}
          {tipoSelecionado !== 'feitas' && indicacoesRecebidas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Indicações Recebidas ({indicacoesRecebidas.length})
              </h3>
              <div className="space-y-4">
                {indicacoesRecebidas.map((referral) => (
                  <div key={referral._id} className="space-y-4">
                    <ReferralCard
                      referral={referral}
                      membroId={membroId}
                      tipo="recebida"
                    />
                    {/* Componente de atualização de status apenas para destinatário */}
                    <Card variant="outlined" className="bg-gray-50">
                      <CardContent className="pt-6">
                        <ReferralStatusUpdate
                          referral={referral}
                          membroId={membroId}
                          onUpdate={handleStatusUpdate}
                          isUpdating={isUpdatingStatus}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paginação */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Página {data.pagination.page} de {data.pagination.totalPages} (
            {data.pagination.total} indicações)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPagina((p) => Math.min(data.pagination.totalPages, p + 1))
              }
              disabled={pagina >= data.pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

