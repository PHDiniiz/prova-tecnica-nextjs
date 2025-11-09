'use client';

import { useState, useCallback } from 'react';
import { Referral, ReferralStatus, AtualizarStatusIndicacaoDTO } from '@/types/referral';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReferralStatusBadge } from './ReferralStatusBadge';

interface ReferralStatusUpdateProps {
  referral: Referral;
  membroId: string;
  onUpdate: (id: string, dto: AtualizarStatusIndicacaoDTO) => Promise<void>;
  isUpdating?: boolean;
}

/**
 * Transições válidas de status
 */
const transicoesValidas: Record<ReferralStatus, ReferralStatus[]> = {
  nova: ['em-contato', 'recusada'],
  'em-contato': ['fechada', 'recusada'],
  fechada: [], // Status final
  recusada: [], // Status final
};

/**
 * Labels dos status
 */
const statusLabels: Record<ReferralStatus, string> = {
  nova: 'Nova',
  'em-contato': 'Em Contato',
  fechada: 'Fechada',
  recusada: 'Recusada',
};

/**
 * Componente para atualizar o status de uma indicação
 * Apenas o membro indicado (destinatário) pode atualizar
 */
export function ReferralStatusUpdate({
  referral,
  membroId,
  onUpdate,
  isUpdating = false,
}: ReferralStatusUpdateProps) {
  const [novoStatus, setNovoStatus] = useState<ReferralStatus | ''>('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verifica se o membro é o destinatário
  const isDestinatario = referral.membroIndicadoId === membroId;

  // Verifica se pode atualizar (não está em estado final)
  const podeAtualizar =
    isDestinatario &&
    referral.status !== 'fechada' &&
    referral.status !== 'recusada';

  // Status disponíveis para transição
  const statusDisponiveis = transicoesValidas[referral.status] || [];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!novoStatus || !statusDisponiveis.includes(novoStatus as ReferralStatus)) {
        return;
      }

      try {
        setIsSubmitting(true);
        await onUpdate(referral._id!, {
          status: novoStatus as ReferralStatus,
          observacoes: observacoes.trim() || undefined,
        });
        setNovoStatus('');
        setObservacoes('');
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [novoStatus, observacoes, referral._id, onUpdate, statusDisponiveis]
  );

  if (!podeAtualizar) {
    return (
      <div className="flex items-center gap-2">
        <ReferralStatusBadge status={referral.status} />
        {referral.status === 'fechada' || referral.status === 'recusada' ? (
          <span className="text-sm text-gray-500">Status final</span>
        ) : (
          <span className="text-sm text-gray-500">
            Apenas o destinatário pode atualizar
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status atual:</span>
        <ReferralStatusBadge status={referral.status} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Novo Status
          </label>
          <select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as ReferralStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecione um status</option>
            {statusDisponiveis.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre a atualização do status..."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {observacoes.length}/500 caracteres
          </p>
        </div>

        <Button
          type="submit"
          disabled={!novoStatus || isSubmitting || isUpdating}
          isLoading={isSubmitting || isUpdating}
        >
          Atualizar Status
        </Button>
      </form>
    </div>
  );
}

