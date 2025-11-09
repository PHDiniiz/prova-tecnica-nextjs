import { Badge } from '@/components/ui/badge';
import { ReferralStatus } from '@/types/referral';

interface ReferralStatusBadgeProps {
  status: ReferralStatus;
  size?: 'sm' | 'md';
}

/**
 * Mapeamento de status para variantes do Badge
 */
const statusVariantMap: Record<ReferralStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  nova: 'info',
  'em-contato': 'warning',
  fechada: 'success',
  recusada: 'error',
};

/**
 * Mapeamento de status para labels
 */
const statusLabelMap: Record<ReferralStatus, string> = {
  nova: 'Nova',
  'em-contato': 'Em Contato',
  fechada: 'Fechada',
  recusada: 'Recusada',
};

/**
 * Componente Badge para exibir o status de uma indicação
 */
export function ReferralStatusBadge({ status, size = 'md' }: ReferralStatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]} size={size}>
      {statusLabelMap[status]}
    </Badge>
  );
}

