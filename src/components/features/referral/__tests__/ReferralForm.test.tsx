/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReferralForm } from '../ReferralForm';
import { Member } from '@/types/member';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { useReferrals } from '@/hooks/useReferrals';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock do hook useReferrals
jest.mock('@/hooks/useReferrals');

// Mock dos componentes UI
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, ...props }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, placeholder, error, helperText, ...props }: any) => (
    <div>
      <input id={id} placeholder={placeholder} {...props} />
      {error && <p className="text-red-600">{error}</p>}
      {helperText && <p className="text-gray-500">{helperText}</p>}
    </div>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ id, placeholder, error, ...props }: any) => (
    <div>
      <textarea id={id} placeholder={placeholder} {...props} />
      {error && <p className="text-red-600">{error}</p>}
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

const mockMembros: Member[] = [
  {
    _id: 'membro-1',
    nome: 'João Silva',
    email: 'joao@test.com',
    empresa: 'Empresa A',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    _id: 'membro-2',
    nome: 'Maria Santos',
    email: 'maria@test.com',
    empresa: 'Empresa B',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    _id: 'membro-3',
    nome: 'Pedro Costa',
    email: 'pedro@test.com',
    empresa: 'Empresa C',
    ativo: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
];

describe('ReferralForm', () => {
  const mockCriarIndicacao = jest.fn();
  const mockResetCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useReferrals as jest.Mock).mockReturnValue({
      criarIndicacao: mockCriarIndicacao,
      isCreating: false,
      isCreateSuccess: false,
      isCreateError: false,
      createError: null,
      resetCreate: mockResetCreate,
    });
  });

  it('deve renderizar todos os campos do formulário', () => {
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Nova Indicação')).toBeInTheDocument();
    expect(screen.getByLabelText(/Membro Indicado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa\/Contato/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor Estimado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Observações/i)).toBeInTheDocument();
    expect(screen.getByText('Criar Indicação')).toBeInTheDocument();
  });

  it('deve exibir membros ativos no select, excluindo o próprio membro', () => {
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    expect(select).toBeInTheDocument();

    // Deve ter opção para membro-2 (ativo e diferente de membro-1)
    // Não deve ter membro-1 (próprio membro) nem membro-3 (inativo)
    expect(select).toHaveTextContent('Maria Santos - Empresa B');
    expect(select).not.toHaveTextContent('João Silva');
    expect(select).not.toHaveTextContent('Pedro Costa');
  });

  it('deve exibir mensagem quando não há membros disponíveis', () => {
    const membrosSemDisponiveis: Member[] = [
      {
        _id: 'membro-1',
        nome: 'João Silva',
        email: 'joao@test.com',
        empresa: 'Empresa A',
        ativo: true,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    ];

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={membrosSemDisponiveis} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Nenhum membro ativo disponível/i)).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Selecione um membro/i)).toBeInTheDocument();
    });
  });

  it('deve validar descrição com mínimo de caracteres', async () => {
    const user = userEvent.setup();
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Curta'); // Menos de 10 caracteres

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Descrição deve ter pelo menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve validar valor estimado mínimo', async () => {
    const user = userEvent.setup();
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Descrição completa da indicação');

    const valorInput = screen.getByLabelText(/Valor Estimado/i);
    await user.type(valorInput, '500'); // Menor que 1000

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Valor estimado deve ser no mínimo R\$ 1\.000/i)).toBeInTheDocument();
    });
  });

  it('deve criar indicação com dados válidos', async () => {
    const user = userEvent.setup();
    mockCriarIndicacao.mockResolvedValueOnce({ success: true });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Descrição completa da indicação de teste');

    const valorInput = screen.getByLabelText(/Valor Estimado/i);
    await user.type(valorInput, '50000');

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCriarIndicacao).toHaveBeenCalledWith({
        membroIndicadoId: 'membro-2',
        empresaContato: 'Empresa Teste',
        descricao: 'Descrição completa da indicação de teste',
        valorEstimado: 50000,
        observacoes: undefined,
      });
    });
  });

  it('deve chamar onSuccess após criar indicação com sucesso', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    mockCriarIndicacao.mockResolvedValueOnce({ success: true });

    (useReferrals as jest.Mock).mockReturnValue({
      criarIndicacao: mockCriarIndicacao,
      isCreating: false,
      isCreateSuccess: true,
      isCreateError: false,
      createError: null,
      resetCreate: mockResetCreate,
    });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Descrição completa da indicação de teste');

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagem de erro quando criação falha', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      criarIndicacao: mockCriarIndicacao,
      isCreating: false,
      isCreateSuccess: false,
      isCreateError: true,
      createError: { message: 'Erro ao criar indicação' },
      resetCreate: mockResetCreate,
    });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Erro ao criar indicação/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de sucesso quando indicação é criada', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      criarIndicacao: mockCriarIndicacao,
      isCreating: false,
      isCreateSuccess: true,
      isCreateError: false,
      createError: null,
      resetCreate: mockResetCreate,
    });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Indicação criada com sucesso!/i)).toBeInTheDocument();
  });

  it('deve desabilitar botão de submit quando está criando', () => {
    (useReferrals as jest.Mock).mockReturnValue({
      criarIndicacao: mockCriarIndicacao,
      isCreating: true,
      isCreateSuccess: false,
      isCreateError: false,
      createError: null,
      resetCreate: mockResetCreate,
    });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Criar Indicação');
    expect(submitButton).toBeDisabled();
  });

  it('deve chamar onCancel quando botão cancelar é clicado', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} onCancel={onCancel} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('não deve exibir botão cancelar quando onCancel não é fornecido', () => {
    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });

  it('deve criar indicação sem valor estimado quando não fornecido', async () => {
    const user = userEvent.setup();
    mockCriarIndicacao.mockResolvedValueOnce({ success: true });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Descrição completa da indicação de teste');

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCriarIndicacao).toHaveBeenCalledWith({
        membroIndicadoId: 'membro-2',
        empresaContato: 'Empresa Teste',
        descricao: 'Descrição completa da indicação de teste',
        valorEstimado: undefined,
        observacoes: undefined,
      });
    });
  });

  it('deve criar indicação com observações quando fornecidas', async () => {
    const user = userEvent.setup();
    mockCriarIndicacao.mockResolvedValueOnce({ success: true });

    render(
      <ReferralForm membroId="membro-1" membrosAtivos={mockMembros} />,
      { wrapper: createWrapper() }
    );

    const select = screen.getByLabelText(/Membro Indicado/i);
    await user.selectOptions(select, 'membro-2');

    const empresaInput = screen.getByLabelText(/Empresa\/Contato/i);
    await user.type(empresaInput, 'Empresa Teste');

    const descricaoInput = screen.getByLabelText(/Descrição/i);
    await user.type(descricaoInput, 'Descrição completa da indicação de teste');

    const observacoesInput = screen.getByLabelText(/Observações/i);
    await user.type(observacoesInput, 'Observações importantes');

    const submitButton = screen.getByText('Criar Indicação');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCriarIndicacao).toHaveBeenCalledWith({
        membroIndicadoId: 'membro-2',
        empresaContato: 'Empresa Teste',
        descricao: 'Descrição completa da indicação de teste',
        valorEstimado: undefined,
        observacoes: 'Observações importantes',
      });
    });
  });
});

