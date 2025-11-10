/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntentionList } from '../IntentionList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock do useIntentions
jest.mock('@/hooks/useIntentions', () => ({
  useIntentions: jest.fn(),
}));

// Mock do useToast
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
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
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div className={className} data-testid="skeleton" {...props} />
  ),
}));

jest.mock('../IntentionCard', () => ({
  IntentionCard: ({ intencao, onApprove, onReject }: any) => (
    <div data-testid={`intention-card-${intencao._id}`}>
      <div>{intencao.nome}</div>
      <button onClick={() => onApprove(intencao._id)}>Aprovar</button>
      <button onClick={() => onReject(intencao._id)}>Recusar</button>
    </div>
  ),
}));

const { useIntentions } = require('@/hooks/useIntentions');

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

describe('IntentionList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir skeleton durante carregamento', () => {
    useIntentions.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve exibir erro quando ocorre falha', () => {
    useIntentions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Erro ao carregar'),
      refetch: jest.fn(),
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Erro ao carregar intenções/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há intenções', () => {
    useIntentions.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Nenhuma intenção encontrada/i)).toBeInTheDocument();
  });

  it('deve renderizar lista de intenções', () => {
    const mockData = {
      data: [
        {
          _id: '1',
          nome: 'João Silva',
          email: 'joao@test.com',
          empresa: 'Empresa Teste',
          motivo: 'Motivo teste',
          status: 'pending' as const,
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };

    useIntentions.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId('intention-card-1')).toBeInTheDocument();
  });

  it('deve filtrar por status quando botão é clicado', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();

    useIntentions.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    const pendentesButton = screen.getByText('Pendentes');
    await user.click(pendentesButton);

    await waitFor(() => {
      expect(useIntentions).toHaveBeenCalledWith('pending', 1, 20, 'admin-token');
    });
  });

  it('deve exibir paginação quando há múltiplas páginas', () => {
    const mockData = {
      data: [],
      pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
    };

    useIntentions.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      atualizarStatus: jest.fn(),
      isUpdatingStatus: false,
    });

    render(<IntentionList adminToken="admin-token" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Página 1 de 3/i)).toBeInTheDocument();
  });
});

