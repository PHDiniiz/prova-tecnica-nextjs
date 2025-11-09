'use client';

import { useMemo } from 'react';
import { Intention } from '@/types/intention';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface IntentionCardProps {
  intencao: Intention;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isUpdating?: boolean;
}

/**
 * Componente para exibir uma intenção em formato de card
 */
export function IntentionCard({
  intencao,
  onApprove,
  onReject,
  isUpdating = false,
}: IntentionCardProps) {
  const statusBadge = useMemo(() => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return variants[intencao.status] || variants.pending;
  }, [intencao.status]);

  const statusLabel = useMemo(() => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovada',
      rejected: 'Recusada',
    };
    return labels[intencao.status] || 'Pendente';
  }, [intencao.status]);

  const dataFormatada = useMemo(() => {
    return new Date(intencao.criadoEm).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [intencao.criadoEm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {intencao.nome}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{intencao.email}</p>
            </div>
            <Badge className={statusBadge}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Empresa</p>
              <p className="text-sm text-gray-900">{intencao.empresa}</p>
            </div>
            {intencao.cargo && (
              <div>
                <p className="text-sm font-medium text-gray-700">Cargo</p>
                <p className="text-sm text-gray-900">{intencao.cargo}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">Motivo</p>
              <p className="text-sm text-gray-900">{intencao.motivo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                Criado em: {dataFormatada}
              </p>
            </div>
            {intencao.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onApprove?.(intencao._id!)}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? 'Processando...' : 'Aprovar'}
                </Button>
                <Button
                  onClick={() => onReject?.(intencao._id!)}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  {isUpdating ? 'Processando...' : 'Recusar'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

