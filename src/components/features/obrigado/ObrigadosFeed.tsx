'use client';

import { useState } from 'react';
import { useObrigados } from '@/hooks/useObrigados';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Obrigado } from '@/types/obrigado';

interface ObrigadosFeedProps {
  membroIndicadorId?: string;
  membroIndicadoId?: string;
}

/**
 * Componente de feed público de agradecimentos (obrigados)
 * 
 * @example
 * ```tsx
 * <ObrigadosFeed />
 * <ObrigadosFeed membroIndicadorId="123" />
 * ```
 */
export function ObrigadosFeed({
  membroIndicadorId,
  membroIndicadoId,
}: ObrigadosFeedProps) {
  const [pagina, setPagina] = useState(1);
  const limite = 20;

  const { data, isLoading, error } = useObrigados({
    membroIndicadorId,
    membroIndicadoId,
    page: pagina,
    limit: limite,
  });

  const obrigados: Obrigado[] = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} variant="outlined">
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
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
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar agradecimentos. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (obrigados.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent className="pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Nenhum agradecimento público encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatarData = (data: Date | string) => {
    const date = typeof data === 'string' ? new Date(data) : data;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {obrigados.map((obrigado) => (
          <Card key={obrigado._id} variant="outlined">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Agradecimento Público
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatarData(obrigado.criadoEm)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {obrigado.mensagem}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total}{' '}
            agradecimentos)
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

