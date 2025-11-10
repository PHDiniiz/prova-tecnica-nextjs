/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeetingList } from '../MeetingList';
import { useMeetings } from '@/hooks/useMeetings';

jest.mock('@/hooks/useMeetings', () => ({
  useMeetings: jest.fn(),
}));

const { useMeetings: mockUseMeetings } = require('@/hooks/useMeetings');

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

describe('MeetingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve mostrar loading quando está carregando', () => {
    mockUseMeetings.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <MeetingList membroId="membro-1" membroToken="token-123" />,
      { wrapper: createWrapper() }
    );

    // Verifica se há skeletons (componente Skeleton)
    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve mostrar mensagem quando não há reuniões', () => {
    mockUseMeetings.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <MeetingList membroId="membro-1" membroToken="token-123" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/nenhuma reunião encontrada/i)).toBeInTheDocument();
  });

  it('deve mostrar erro quando ocorre erro', () => {
    const mockRefetch = jest.fn();
    mockUseMeetings.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Erro ao carregar'),
      refetch: mockRefetch,
    });

    render(
      <MeetingList membroId="membro-1" membroToken="token-123" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/erro ao carregar reuniões/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });
});

