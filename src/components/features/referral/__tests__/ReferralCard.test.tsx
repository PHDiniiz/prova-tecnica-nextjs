/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferralCard } from '../ReferralCard';
import { Referral } from '@/types/referral';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock dos componentes UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div data-testid="dialog-header" {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 data-testid="dialog-title" {...props}>{children}</h2>,
}));

jest.mock('@/components/features/referral/ReferralStatusBadge', () => ({
  ReferralStatusBadge: ({ status }: any) => <span data-testid="status-badge">{status}</span>,
}));

jest.mock('@/components/features/obrigado/ObrigadoForm', () => ({
  ObrigadoForm: ({ onSuccess }: any) => (
    <div data-testid="obrigado-form">
      <button onClick={onSuccess}>Salvar Obrigado</button>
    </div>
  ),
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
  descricao: 'Descrição da indicação de teste',
  status: 'nova',
  valorEstimado: 50000,
  observacoes: 'Observações importantes',
  criadoEm: new Date('2025-01-15T10:00:00Z'),
  atualizadoEm: new Date('2025-01-15T10:00:00Z'),
};

describe('ReferralCard', () => {
  it('deve renderizar informações da indicação', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição da indicação de teste')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*50\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('Observações importantes')).toBeInTheDocument();
  });

  it('deve exibir badge de status', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('nova')).toBeInTheDocument();
  });

  it('deve exibir tipo de indicação (feita ou recebida)', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Indicação feita')).toBeInTheDocument();
  });

  it('deve exibir "Indicação recebida" quando tipo é recebida', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-2" tipo="recebida" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Indicação recebida')).toBeInTheDocument();
  });

  it('deve formatar data corretamente', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Criada em:/)).toBeInTheDocument();
  });

  it('deve exibir data de atualização quando diferente da criação', () => {
    const referralAtualizado: Referral = {
      ...mockReferral,
      atualizadoEm: new Date('2025-01-20T10:00:00Z'),
    };

    render(
      <ReferralCard referral={referralAtualizado} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Atualizada em:/)).toBeInTheDocument();
  });

  it('não deve exibir valor estimado quando não fornecido', () => {
    const referralSemValor: Referral = {
      ...mockReferral,
      valorEstimado: undefined,
    };

    render(
      <ReferralCard referral={referralSemValor} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/Valor Estimado:/)).not.toBeInTheDocument();
  });

  it('não deve exibir observações quando não fornecidas', () => {
    const referralSemObservacoes: Referral = {
      ...mockReferral,
      observacoes: undefined,
    };

    render(
      <ReferralCard referral={referralSemObservacoes} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/Observações:/)).not.toBeInTheDocument();
  });

  it('deve exibir botão de agradecer quando indicação está fechada e é recebida', () => {
    const referralFechada: Referral = {
      ...mockReferral,
      status: 'fechada',
      membroIndicadoId: 'membro-2',
    };

    render(
      <ReferralCard referral={referralFechada} membroId="membro-2" tipo="recebida" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Agradecer pela Indicação')).toBeInTheDocument();
  });

  it('não deve exibir botão de agradecer quando indicação não está fechada', () => {
    render(
      <ReferralCard referral={mockReferral} membroId="membro-2" tipo="recebida" />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Agradecer pela Indicação')).not.toBeInTheDocument();
  });

  it('não deve exibir botão de agradecer quando é indicação feita', () => {
    const referralFechada: Referral = {
      ...mockReferral,
      status: 'fechada',
    };

    render(
      <ReferralCard referral={referralFechada} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Agradecer pela Indicação')).not.toBeInTheDocument();
  });

  it('deve abrir dialog de obrigado ao clicar no botão', async () => {
    const user = userEvent.setup();
    const referralFechada: Referral = {
      ...mockReferral,
      status: 'fechada',
      membroIndicadoId: 'membro-2',
    };

    render(
      <ReferralCard referral={referralFechada} membroId="membro-2" tipo="recebida" />,
      { wrapper: createWrapper() }
    );

    const botaoAgradecer = screen.getByText('Agradecer pela Indicação');
    await user.click(botaoAgradecer);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('obrigado-form')).toBeInTheDocument();
    });
  });

  it('deve fechar dialog ao chamar onSuccess do ObrigadoForm', async () => {
    const user = userEvent.setup();
    const referralFechada: Referral = {
      ...mockReferral,
      status: 'fechada',
      membroIndicadoId: 'membro-2',
    };

    render(
      <ReferralCard referral={referralFechada} membroId="membro-2" tipo="recebida" />,
      { wrapper: createWrapper() }
    );

    const botaoAgradecer = screen.getByText('Agradecer pela Indicação');
    await user.click(botaoAgradecer);

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    const botaoSalvar = screen.getByText('Salvar Obrigado');
    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('deve formatar valor monetário corretamente', () => {
    const referralComValor: Referral = {
      ...mockReferral,
      valorEstimado: 1234567.89,
    };

    render(
      <ReferralCard referral={referralComValor} membroId="membro-1" tipo="feita" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/R\$\s*1\.234\.567,89/)).toBeInTheDocument();
  });
});

