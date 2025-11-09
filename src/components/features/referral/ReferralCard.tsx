'use client';

import { Referral, ReferralStatus } from '@/types/referral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReferralStatusBadge } from './ReferralStatusBadge';
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
  const isDestinatario = referral.membroIndicadoId === membroId;
  const podeAtualizarStatus = isDestinatario && tipo === 'recebida';

  const formatarData = formatarDataSimples;

  const formatarValor = (valor?: number) => {
    if (!valor) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
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
        </div>
      </CardContent>
    </Card>
  );
}

