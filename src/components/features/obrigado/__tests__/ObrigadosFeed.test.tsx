/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObrigadosFeed } from '../ObrigadosFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock do useObrigados
jest.mock('@/hooks/useObrigados', () => ({
  useObrigados: jest.fn(),
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div className={className} data-testid="skeleton" {...props} />
  ),
}));

const { useObrigados } = require('@/hooks/useObrigados');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('ObrigadosFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir skeleton durante carregamento', () => {
    useObrigados.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve exibir erro quando ocorre falha', () => {
    useObrigados.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Erro ao carregar'),
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    expect(screen.getByText(/Erro ao carregar agradecimentos/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há agradecimentos', () => {
    useObrigados.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    expect(screen.getByText(/Nenhum agradecimento público encontrado/i)).toBeInTheDocument();
  });

  it('deve renderizar lista de agradecimentos', () => {
    const mockData = {
      data: [
        {
          _id: '1',
          mensagem: 'Agradecimento teste',
          publico: true,
          criadoEm: new Date('2024-01-15'),
          indicacaoId: 'ind-1',
          membroId: 'membro-1',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    useObrigados.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    expect(screen.getByText('Agradecimento teste')).toBeInTheDocument();
    expect(screen.getByText(/Agradecimento Público/i)).toBeInTheDocument();
  });

  it('deve filtrar por membroIndicadorId quando fornecido', () => {
    useObrigados.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed membroIndicadorId="membro-123" />, { wrapper: createWrapper() });

    expect(useObrigados).toHaveBeenCalledWith({
      membroIndicadorId: 'membro-123',
      membroIndicadoId: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('deve filtrar por membroIndicadoId quando fornecido', () => {
    useObrigados.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed membroIndicadoId="membro-456" />, { wrapper: createWrapper() });

    expect(useObrigados).toHaveBeenCalledWith({
      membroIndicadorId: undefined,
      membroIndicadoId: 'membro-456',
      page: 1,
      limit: 20,
    });
  });

  it('deve exibir paginação quando há múltiplas páginas', () => {
    const mockData = {
      data: [],
      pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
    };

    useObrigados.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    expect(screen.getByText(/Página 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/50 agradecimentos/i)).toBeInTheDocument();
  });

  it('deve navegar para próxima página', async () => {
    const user = userEvent.setup();
    const mockData = {
      data: [],
      pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
    };

    useObrigados.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    const nextButton = screen.getByText('Próxima');
    await user.click(nextButton);

    await waitFor(() => {
      expect(useObrigados).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('deve desabilitar botão anterior na primeira página', () => {
    const mockData = {
      data: [],
      pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
    };

    useObrigados.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    const prevButton = screen.getByText('Anterior');
    expect(prevButton).toBeDisabled();
  });

  it('deve formatar data corretamente', () => {
    const mockData = {
      data: [
        {
          _id: '1',
          mensagem: 'Teste',
          publico: true,
          criadoEm: new Date('2024-01-15T10:00:00Z'),
          indicacaoId: 'ind-1',
          membroId: 'membro-1',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    useObrigados.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    render(<ObrigadosFeed />, { wrapper: createWrapper() });

    // Verifica se a data formatada está presente (formato pt-BR)
    expect(screen.getByText(/janeiro/i)).toBeInTheDocument();
  });
});

