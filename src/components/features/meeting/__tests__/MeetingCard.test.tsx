/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { MeetingCard } from '../MeetingCard';
import { Meeting } from '@/types/meeting';

describe('MeetingCard', () => {
  const mockMeeting: Meeting = {
    _id: 'meeting-123',
    membro1Id: 'membro-1',
    membro2Id: 'membro-2',
    dataReuniao: new Date('2025-01-15T10:00:00Z'),
    criadoEm: new Date('2025-01-01T00:00:00Z'),
    atualizadoEm: new Date('2025-01-01T00:00:00Z'),
    local: 'Escritório Central',
    observacoes: 'Reunião importante',
    checkIns: [],
  };

  it('deve renderizar informações da reunião', () => {
    render(
      <MeetingCard
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />
    );

    expect(screen.getByText(/reunião 1:1/i)).toBeInTheDocument();
    expect(screen.getByText(/escritório central/i)).toBeInTheDocument();
    expect(screen.getByText(/reunião importante/i)).toBeInTheDocument();
  });

  it('deve mostrar badge de check-in pendente quando não há check-ins', () => {
    render(
      <MeetingCard
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />
    );

    expect(screen.getByText(/check-in pendente/i)).toBeInTheDocument();
  });

  it('deve mostrar badge de check-in completo quando todos fizeram check-in', () => {
    const meetingCompleto: Meeting = {
      ...mockMeeting,
      checkIns: [
        { membroId: 'membro-1', dataCheckIn: new Date(), presente: true },
        { membroId: 'membro-2', dataCheckIn: new Date(), presente: true },
      ],
    };

    render(
      <MeetingCard
        meeting={meetingCompleto}
        membroId="membro-1"
        membroToken="token-123"
      />
    );

    expect(screen.getByText(/check-in completo/i)).toBeInTheDocument();
  });

  it('deve mostrar status dos check-ins', () => {
    const meetingComCheckIns: Meeting = {
      ...mockMeeting,
      checkIns: [
        { membroId: 'membro-1', dataCheckIn: new Date(), presente: true },
        { membroId: 'membro-2', dataCheckIn: new Date(), presente: false },
      ],
    };

    render(
      <MeetingCard
        meeting={meetingComCheckIns}
        membroId="membro-1"
        membroToken="token-123"
      />
    );

    expect(screen.getByText(/presente/i)).toBeInTheDocument();
    expect(screen.getByText(/ausente/i)).toBeInTheDocument();
  });
});

