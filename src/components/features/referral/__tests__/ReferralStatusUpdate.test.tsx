/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferralStatusUpdate } from '../ReferralStatusUpdate';
import { Referral, ReferralStatus } from '@/types/referral';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock do hook useToast
const mockAddToast = jest.fn();
jest.mock('@/components/ui/toast', () => ({
  ...jest.requireActual('@/components/ui/toast'),
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, isLoading, ...props }: any) => (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Atualizando...' : children}
    </button>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, maxLength, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      {...props}
    />
  ),
}));

jest.mock('@/components/features/referral/ReferralStatusBadge', () => ({
  ReferralStatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
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

const mockReferral: Referral = {
  _id: 'referral-1',
  membroIndicadorId: 'membro-1',
  membroIndicadoId: 'membro-2',
  empresaContato: 'Empresa Teste',
  descricao: 'Descrição da indicação',
  status: 'nova' as ReferralStatus,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
};

describe('ReferralStatusUpdate', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnUpdate.mockResolvedValue(undefined);
  });

  it('deve renderizar status atual quando membro não é destinatário', () => {
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-1"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText(/Apenas o destinatário pode atualizar/i)).toBeInTheDocument();
  });

  it('deve renderizar mensagem de status final quando status é fechada', () => {
    const referralFechada: Referral = {
      ...mockReferral,
      status: 'fechada' as ReferralStatus,
    };

    render(
      <ReferralStatusUpdate
        referral={referralFechada}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Status final/i)).toBeInTheDocument();
  });

  it('deve renderizar formulário quando membro é destinatário e pode atualizar', () => {
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Status atual:/i)).toBeInTheDocument();
    expect(screen.getByText(/Novo Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Observações/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Atualizar Status/i })).toBeInTheDocument();
  });

  it('deve exibir opções de status disponíveis para transição', () => {
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByRole('combobox') || document.querySelector('select');
    expect(select).toBeInTheDocument();
    
    // Status "nova" pode transicionar para "em-contato" ou "recusada"
    expect(select).toHaveTextContent('Em Contato');
    expect(select).toHaveTextContent('Recusada');
  });

  it('deve atualizar status quando formulário é submetido', async () => {
    const user = userEvent.setup();
    
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByRole('combobox') || document.querySelector('select');
    if (!select) {
      throw new Error('Select não encontrado');
    }
    await user.selectOptions(select as HTMLElement, 'em-contato');

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('referral-1', {
        status: 'em-contato',
        observacoes: undefined,
      });
    });
  });

  it('deve incluir observações quando fornecidas', async () => {
    const user = userEvent.setup();
    
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByRole('combobox') || document.querySelector('select');
    if (!select) {
      throw new Error('Select não encontrado');
    }
    await user.selectOptions(select as HTMLElement, 'em-contato');

    const observacoesInput = screen.getByPlaceholderText(/Adicione observações/i) || document.querySelector('textarea');
    if (!observacoesInput) {
      throw new Error('Textarea não encontrado');
    }
    await user.type(observacoesInput as HTMLElement, 'Observação de teste');

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('referral-1', {
        status: 'em-contato',
        observacoes: 'Observação de teste',
      });
    });
  });

  it('deve desabilitar botão durante atualização', () => {
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
        isUpdating={true}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole('button', { name: /Atualizando|Atualizar Status/i });
    expect(submitButton).toBeDisabled();
  });

  it('deve exibir contador de caracteres nas observações', async () => {
    const user = userEvent.setup();
    
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    const observacoesInput = screen.getByPlaceholderText(/Adicione observações/i) || document.querySelector('textarea');
    if (!observacoesInput) {
      throw new Error('Textarea não encontrado');
    }
    await user.type(observacoesInput as HTMLElement, 'Teste');

    expect(screen.getByText(/5\/500 caracteres/i)).toBeInTheDocument();
  });

  it('deve exibir toast de erro quando atualização falha', async () => {
    const user = userEvent.setup();
    const error = new Error('Erro ao atualizar');
    mockOnUpdate.mockRejectedValueOnce(error);
    
    render(
      <ReferralStatusUpdate
        referral={mockReferral}
        membroId="membro-2"
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByRole('combobox') || document.querySelector('select');
    if (!select) {
      throw new Error('Select não encontrado');
    }
    await user.selectOptions(select as HTMLElement, 'em-contato');

    const submitButton = screen.getByRole('button', { name: /Atualizar Status/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
          title: 'Erro',
          description: 'Erro ao atualizar status. Tente novamente.',
        })
      );
    });
  });
});

