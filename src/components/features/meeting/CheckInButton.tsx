'use client';

import { Button } from '@/components/ui/button';
import { useCheckIn } from '@/hooks/useMeetings';
import { useToast } from '@/components/ui/toast';
import { Meeting } from '@/types/meeting';

/**
 * Props do componente CheckInButton
 */
interface CheckInButtonProps {
  meeting: Meeting;
  membroId: string;
  membroToken: string;
  onSuccess?: () => void;
}

/**
 * Componente botão para registrar check-in
 * Implementa UI otimista com feedback imediato
 * 
 * @example
 * ```tsx
 * <CheckInButton
 *   meeting={reuniao}
 *   membroId="membro-123"
 *   membroToken={token}
 *   onSuccess={() => console.log('Check-in registrado!')}
 * />
 * ```
 */
export function CheckInButton({
  meeting,
  membroId,
  membroToken,
  onSuccess,
}: CheckInButtonProps) {
  const { addToast } = useToast();
  const checkIn = useCheckIn();

  // Verifica se o membro já fez check-in
  const checkInExistente = meeting.checkIns?.find((ci) => ci.membroId === membroId);
  const jaFezCheckIn = !!checkInExistente;
  const presente = checkInExistente?.presente ?? false;

  const handleCheckIn = async (presente: boolean) => {
    try {
      await checkIn.mutateAsync({
        meetingId: meeting._id!,
        checkIn: {
          membroId,
          presente,
        },
        membroToken,
      });

      addToast({
        variant: 'success',
        title: 'Sucesso!',
        description: `Check-in registrado: ${presente ? 'Presente' : 'Ausente'}`,
      });

      onSuccess?.();
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível registrar o check-in',
      });
    }
  };

  if (jaFezCheckIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Check-in: {presente ? 'Presente' : 'Ausente'}
        </span>
        <Button
          onClick={() => handleCheckIn(!presente)}
          variant="outline"
          size="sm"
          disabled={checkIn.isPending}
        >
          {checkIn.isPending ? 'Atualizando...' : 'Alterar'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleCheckIn(true)}
        variant="primary"
        size="sm"
        disabled={checkIn.isPending}
      >
        {checkIn.isPending ? 'Registrando...' : 'Presente'}
      </Button>
      <Button
        onClick={() => handleCheckIn(false)}
        variant="outline"
        size="sm"
        disabled={checkIn.isPending}
      >
        {checkIn.isPending ? 'Registrando...' : 'Ausente'}
      </Button>
    </div>
  );
}

