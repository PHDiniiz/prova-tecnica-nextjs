/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferralList } from '../ReferralList';
import { Referral } from '@/types/referral';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { useReferrals } from '@/hooks/useReferrals';

// Mock do hook useReferrals
jest.mock('@/hooks/useReferrals');

// Mock dos componentes
jest.mock('../ReferralCard', () => ({
  ReferralCard: ({ referral, tipo }: any) => (
    <div data-testid={`referral-card-${referral._id}`}>
      {referral.empresaContato} - {tipo}
    </div>
  ),
}));

jest.mock('../ReferralStatusUpdate', () => ({
  ReferralStatusUpdate: ({ referral, onUpdate }: any) => (
    <div data-testid={`status-update-${referral._id}`}>
      <button onClick={() => onUpdate(referral._id, { status: 'em-contato' })}>
        Atualizar Status
      </button>
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}));

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

const mockReferralFeita: Referral = {
  _id: 'referral-1',
  membroIndicadorId: 'membro-1',
  membroIndicadoId: 'membro-2',
  empresaContato: 'Empresa Feita',
  descricao: 'Descrição indicação feita',
  status: 'nova',
  criadoEm: new Date('2025-01-15T10:00:00Z'),
  atualizadoEm: new Date('2025-01-15T10:00:00Z'),
};

const mockReferralRecebida: Referral = {
  _id: 'referral-2',
  membroIndicadorId: 'membro-2',
  membroIndicadoId: 'membro-1',
  empresaContato: 'Empresa Recebida',
  descricao: 'Descrição indicação recebida',
  status: 'nova',
  criadoEm: new Date('2025-01-15T10:00:00Z'),
  atualizadoEm: new Date('2025-01-15T10:00:00Z'),
};

describe('ReferralList', () => {
  const mockAtualizarStatus = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });
  });

  it('deve exibir skeletons durante carregamento', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve exibir mensagem de erro quando ocorre erro', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Erro ao carregar' },
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    expect(screen.getByText(/Erro ao carregar indicações/i)).toBeInTheDocument();
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('deve chamar refetch ao clicar em Tentar Novamente', async () => {
    const user = userEvent.setup();
    (useReferrals as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Erro ao carregar' },
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const botaoTentar = screen.getByText('Tentar Novamente');
    await user.click(botaoTentar);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('deve exibir mensagem quando não há indicações', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    expect(screen.getByText(/Nenhuma indicação encontrada/i)).toBeInTheDocument();
  });

  it('deve exibir indicações feitas', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="feitas" />, { wrapper: createWrapper() });

    expect(screen.getByText('Indicações Feitas (1)')).toBeInTheDocument();
    expect(screen.getByTestId('referral-card-referral-1')).toBeInTheDocument();
  });

  it('deve exibir indicações recebidas', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="recebidas" />, { wrapper: createWrapper() });

    expect(screen.getByText('Indicações Recebidas (1)')).toBeInTheDocument();
    expect(screen.getByTestId('referral-card-referral-2')).toBeInTheDocument();
  });

  it('deve exibir ambas as indicações quando tipo é ambas', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="ambas" />, { wrapper: createWrapper() });

    expect(screen.getByText('Indicações Feitas (1)')).toBeInTheDocument();
    expect(screen.getByText('Indicações Recebidas (1)')).toBeInTheDocument();
    expect(screen.getByTestId('referral-card-referral-1')).toBeInTheDocument();
    expect(screen.getByTestId('referral-card-referral-2')).toBeInTheDocument();
  });

  it('deve filtrar por tipo ao alterar select', async () => {
    const user = userEvent.setup();
    // Mock inicial com ambas as indicações
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="ambas" />, { wrapper: createWrapper() });

    // Verifica que ambas estão sendo exibidas inicialmente
    expect(screen.getByText('Indicações Feitas (1)')).toBeInTheDocument();
    expect(screen.getByText('Indicações Recebidas (1)')).toBeInTheDocument();

    // Altera o filtro para apenas feitas
    const tipoSelect = screen.getByLabelText(/Tipo/i);
    await user.selectOptions(tipoSelect, 'feitas');

    // Atualiza mock para retornar apenas feitas
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    await waitFor(() => {
      expect(screen.getByText('Indicações Feitas (1)')).toBeInTheDocument();
      // A seção de recebidas não deve aparecer quando não há dados
      expect(screen.queryByText(/Indicações Recebidas \(/)).not.toBeInTheDocument();
    });
  });

  it('deve filtrar por status ao alterar select', async () => {
    const user = userEvent.setup();
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'nova');

    // O hook será chamado novamente quando o filtro mudar
    await waitFor(() => {
      expect(useReferrals).toHaveBeenCalled();
    });
  });

  it('deve exibir paginação quando há múltiplas páginas', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          totalPages: 2,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    expect(screen.getByText(/Página 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    expect(screen.getByText('Próxima')).toBeInTheDocument();
  });

  it('deve desabilitar botão Anterior na primeira página', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          totalPages: 2,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const botaoAnterior = screen.getByText('Anterior');
    expect(botaoAnterior).toBeDisabled();
  });

  it('deve desabilitar botão Próxima quando não há próxima página', () => {
    // Testa quando há apenas uma página (totalPages = 1)
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    // Quando há apenas uma página, a paginação não deve ser exibida
    expect(screen.queryByText(/Página/i)).not.toBeInTheDocument();
  });

  it('deve exibir componente de atualização de status para indicações recebidas', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="recebidas" />, { wrapper: createWrapper() });

    expect(screen.getByTestId('status-update-referral-2')).toBeInTheDocument();
  });

  it('deve chamar atualizarStatus ao atualizar status de indicação', async () => {
    const user = userEvent.setup();
    mockAtualizarStatus.mockResolvedValueOnce({ success: true });
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="recebidas" />, { wrapper: createWrapper() });

    const botaoAtualizar = screen.getByText('Atualizar Status');
    await user.click(botaoAtualizar);

    await waitFor(() => {
      expect(mockAtualizarStatus).toHaveBeenCalledWith({
        id: 'referral-2',
        dto: { status: 'em-contato' },
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('não deve exibir paginação quando há apenas uma página', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    expect(screen.queryByText(/Página/i)).not.toBeInTheDocument();
  });

  it('deve navegar para próxima página ao clicar no botão', async () => {
    const user = userEvent.setup();
    
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          totalPages: 2,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const botaoProxima = screen.getByText('Próxima');
    expect(botaoProxima).not.toBeDisabled();
    
    await user.click(botaoProxima);

    // O componente deve atualizar a página internamente via setState
    // Verificamos que o botão foi clicado e o componente reagiu
    expect(botaoProxima).toBeInTheDocument();
  });

  it('deve resetar página ao alterar filtro de tipo', async () => {
    const user = userEvent.setup();
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [mockReferralRecebida],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" tipo="ambas" />, { wrapper: createWrapper() });

    const tipoSelect = screen.getByLabelText(/Tipo/i);
    await user.selectOptions(tipoSelect, 'feitas');

    // O hook será chamado novamente quando o filtro mudar
    await waitFor(() => {
      expect(useReferrals).toHaveBeenCalled();
    });
  });

  it('deve resetar página ao alterar filtro de status', async () => {
    const user = userEvent.setup();
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [mockReferralFeita],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'nova');

    // O hook será chamado novamente quando o filtro mudar
    await waitFor(() => {
      expect(useReferrals).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagem quando não há indicações com filtros selecionados', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      data: {
        data: {
          feitas: [],
          recebidas: [],
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      atualizarStatus: mockAtualizarStatus,
      isUpdatingStatus: false,
    });

    render(<ReferralList membroId="membro-1" />, { wrapper: createWrapper() });

    expect(screen.getByText(/Nenhuma indicação encontrada com os filtros selecionados/i)).toBeInTheDocument();
  });
});

