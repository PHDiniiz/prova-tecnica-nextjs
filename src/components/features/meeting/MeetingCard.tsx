'use client';

import { Meeting } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckInButton } from './CheckInButton';
import { cn } from '@/lib/utils';

/**
 * Props do componente MeetingCard
 */
interface MeetingCardProps {
  meeting: Meeting;
  membroId: string;
  membroToken: string;
  membroNome?: string; // Nome do outro membro (para exibição)
  className?: string;
  onCheckInSuccess?: () => void;
}

/**
 * Formata data de forma simples
 */
const formatarData = (data: Date | string): string => {
  try {
    const date = typeof data === 'string' ? new Date(data) : data;
    if (isNaN(date.getTime())) return 'Data inválida';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Componente card para exibir uma reunião individual
 * Reutilizável e responsivo
 * 
 * @example
 * ```tsx
 * <MeetingCard
 *   meeting={reuniao}
 *   membroId="membro-123"
 *   membroToken={token}
 *   membroNome="João Silva"
 * />
 * ```
 */
export function MeetingCard({
  meeting,
  membroId,
  membroToken,
  membroNome,
  className,
  onCheckInSuccess,
}: MeetingCardProps) {
  const isParticipante = meeting.membro1Id === membroId || meeting.membro2Id === membroId;
  const podeFazerCheckIn = isParticipante;

  // Verifica status dos check-ins
  const checkIn1 = meeting.checkIns?.find((ci) => ci.membroId === meeting.membro1Id);
  const checkIn2 = meeting.checkIns?.find((ci) => ci.membroId === meeting.membro2Id);
  const todosFizeramCheckIn = checkIn1 && checkIn2;

  return (
    <Card
      variant="outlined"
      className={cn('hover:shadow-md transition-shadow duration-200', className)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">Reunião 1:1</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {todosFizeramCheckIn && (
                <Badge variant="success" size="sm">
                  Check-in completo
                </Badge>
              )}
              {!todosFizeramCheckIn && (
                <Badge variant="warning" size="sm">
                  Check-in pendente
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Data e Hora:</p>
            <p className="text-gray-900 font-medium">{formatarData(meeting.dataReuniao)}</p>
          </div>

          {meeting.local && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Local:</p>
              <p className="text-gray-900">{meeting.local}</p>
            </div>
          )}

          {meeting.observacoes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Observações:</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{meeting.observacoes}</p>
            </div>
          )}

          {/* Status dos check-ins */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Check-ins:</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Membro 1:</span>
                {checkIn1 ? (
                  <Badge variant={checkIn1.presente ? 'success' : 'error'} size="sm">
                    {checkIn1.presente ? 'Presente' : 'Ausente'}
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">Pendente</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Membro 2:</span>
                {checkIn2 ? (
                  <Badge variant={checkIn2.presente ? 'success' : 'error'} size="sm">
                    {checkIn2.presente ? 'Presente' : 'Ausente'}
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">Pendente</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Botão de check-in */}
          {podeFazerCheckIn && (
            <div className="pt-3 border-t border-gray-200">
              <CheckInButton
                meeting={meeting}
                membroId={membroId}
                membroToken={membroToken}
                onSuccess={onCheckInSuccess}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Criada em: {formatarData(meeting.criadoEm)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

