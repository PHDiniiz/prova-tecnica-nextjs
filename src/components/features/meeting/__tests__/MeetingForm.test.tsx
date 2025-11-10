/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeetingForm } from '../MeetingForm';
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeetings';
import { useToast } from '@/components/ui/toast';

jest.mock('@/hooks/useMeetings', () => ({
  useCreateMeeting: jest.fn(),
  useUpdateMeeting: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(),
}));

const { useCreateMeeting: mockUseCreateMeeting, useUpdateMeeting: mockUseUpdateMeeting } =
  require('@/hooks/useMeetings');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('MeetingForm', () => {
  const mockMembros = [
    { _id: 'membro-1', nome: 'João Silva', empresa: 'Empresa A', ativo: true },
    { _id: 'membro-2', nome: 'Maria Santos', empresa: 'Empresa B', ativo: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      addToast: jest.fn(),
    });
    mockUseCreateMeeting.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    mockUseUpdateMeeting.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('deve renderizar formulário de criação', () => {
    render(
      <MeetingForm
        membrosAtivos={mockMembros}
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/membro 1/i)).toBeInTheDocument();
    expect(screen.getByText(/membro 2/i)).toBeInTheDocument();
    expect(screen.getByText(/data e hora da reunião/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar reunião/i })).toBeInTheDocument();
  });

  it('deve renderizar formulário de edição quando meeting é fornecido', () => {
    const meeting = {
      _id: 'meeting-123',
      membro1Id: 'membro-1',
      membro2Id: 'membro-2',
      dataReuniao: new Date('2025-01-15T10:00:00Z'),
      local: 'Escritório',
      observacoes: 'Observações',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    render(
      <MeetingForm
        meeting={meeting}
        membrosAtivos={mockMembros}
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });
});

