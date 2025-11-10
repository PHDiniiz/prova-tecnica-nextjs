'use client';

import { useState } from 'react';
import { Referral } from '@/types/referral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReferralStatusBadge } from './ReferralStatusBadge';
import { ObrigadoForm } from '@/components/features/obrigado/ObrigadoForm';

// Função simples de formatação de data (sem dependência externa)
const formatarDataSimples = (data: Date | string): string => {
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

interface ReferralCardProps {
  referral: Referral;
  membroId: string;
  tipo: 'feita' | 'recebida';
}

/**
 * Componente Card para exibir uma indicação individual
 */
export function ReferralCard({
  referral,
  membroId,
  tipo,
}: ReferralCardProps) {
  const [showObrigadoForm, setShowObrigadoForm] = useState(false);
  const isDestinatario = referral.membroIndicadoId === membroId;
  const podeCriarObrigado = isDestinatario && tipo === 'recebida' && referral.status === 'fechada';

  const formatarData = formatarDataSimples;

  const formatarValor = (valor?: number) => {
    if (!valor) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const handleObrigadoSuccess = () => {
    setShowObrigadoForm(false);
  };

  return (
    <Card variant="outlined" className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{referral.empresaContato}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <ReferralStatusBadge status={referral.status} />
              <span className="text-sm text-gray-500">
                {tipo === 'feita' ? 'Indicação feita' : 'Indicação recebida'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Descrição:</p>
            <p className="text-gray-900">{referral.descricao}</p>
          </div>

          {referral.valorEstimado && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Estimado:</p>
              <p className="text-gray-900 font-semibold">
                {formatarValor(referral.valorEstimado)}
              </p>
            </div>
          )}

          {referral.observacoes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Observações:</p>
              <p className="text-gray-700 text-sm">{referral.observacoes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Criada em: {formatarData(referral.criadoEm)}
            </div>
            {referral.atualizadoEm && referral.atualizadoEm !== referral.criadoEm && (
              <div className="text-xs text-gray-500">
                Atualizada em: {formatarData(referral.atualizadoEm)}
              </div>
            )}
          </div>

          {podeCriarObrigado && (
            <div className="pt-3 border-t border-gray-200 mt-3">
              <Button
                onClick={() => setShowObrigadoForm(true)}
                variant="primary"
                className="w-full"
              >
                Agradecer pela Indicação
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog para criar obrigado */}
      <Dialog open={showObrigadoForm} onOpenChange={setShowObrigadoForm}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Agradecer pela Indicação</DialogTitle>
          </DialogHeader>
          <ObrigadoForm
            indicacaoId={referral._id || ''}
            membroId={membroId}
            onSuccess={handleObrigadoSuccess}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

