/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckInButton } from '../CheckInButton';
import { Meeting } from '@/types/meeting';
import { useToast } from '@/components/ui/toast';

// Mock do hook
jest.mock('@/hooks/useMeetings', () => ({
  useCheckIn: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(),
}));

const { useCheckIn } = require('@/hooks/useMeetings');

// Helper para criar QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}

// Mock do ToastProvider
function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

describe('CheckInButton', () => {
  const mockMutateAsync = jest.fn();
  const mockAddToast = jest.fn();

  const mockMeeting: Meeting = {
    _id: 'meeting-123',
    membro1Id: 'membro-1',
    membro2Id: 'membro-2',
    dataReuniao: new Date('2025-01-15T10:00:00Z'),
    criadoEm: new Date('2025-01-01T00:00:00Z'),
    atualizadoEm: new Date('2025-01-01T00:00:00Z'),
    checkIns: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });
    useCheckIn.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('deve renderizar botões de check-in quando membro não fez check-in', () => {
    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /presente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ausente/i })).toBeInTheDocument();
  });

  it('deve mostrar status quando membro já fez check-in', () => {
    const meetingComCheckIn: Meeting = {
      ...mockMeeting,
      checkIns: [
        {
          membroId: 'membro-1',
          dataCheckIn: new Date(),
          presente: true,
        },
      ],
    };

    render(
      <CheckInButton
        meeting={meetingComCheckIn}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/check-in: presente/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alterar/i })).toBeInTheDocument();
  });

  it('deve registrar check-in como presente', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({});

    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    const presenteButton = screen.getByRole('button', { name: /presente/i });
    await user.click(presenteButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        meetingId: 'meeting-123',
        checkIn: {
          membroId: 'membro-1',
          presente: true,
        },
        membroToken: 'token-123',
      });
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      variant: 'success',
      title: 'Sucesso!',
      description: 'Check-in registrado: Presente',
    });
  });

  it('deve registrar check-in como ausente', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({});

    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    const ausenteButton = screen.getByRole('button', { name: /ausente/i });
    await user.click(ausenteButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        meetingId: 'meeting-123',
        checkIn: {
          membroId: 'membro-1',
          presente: false,
        },
        membroToken: 'token-123',
      });
    });
  });

  it('deve chamar onSuccess após check-in bem-sucedido', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    mockMutateAsync.mockResolvedValueOnce({});

    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const presenteButton = screen.getByRole('button', { name: /presente/i });
    await user.click(presenteButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve mostrar erro quando check-in falhar', async () => {
    const user = userEvent.setup();
    const error = new Error('Erro ao registrar check-in');
    mockMutateAsync.mockRejectedValueOnce(error);

    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    const presenteButton = screen.getByRole('button', { name: /presente/i });
    await user.click(presenteButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        variant: 'error',
        title: 'Erro',
        description: 'Erro ao registrar check-in',
      });
    });
  });

  it('deve desabilitar botões durante o carregamento', () => {
    useCheckIn.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <CheckInButton
        meeting={mockMeeting}
        membroId="membro-1"
        membroToken="token-123"
      />,
      { wrapper: createWrapper() }
    );

    // Ambos os botões devem estar desabilitados durante o carregamento
    const registrandoButtons = screen.getAllByRole('button', { name: /registrando/i });
    expect(registrandoButtons.length).toBe(2);
    registrandoButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

