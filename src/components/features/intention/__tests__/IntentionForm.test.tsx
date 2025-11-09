import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntentionForm } from '../IntentionForm';

// Mock do hook
jest.mock('@/hooks/useIntentions', () => ({
  useIntentions: jest.fn(),
}));

const { useIntentions } = require('@/hooks/useIntentions');

// Helper para criar QueryClient wrapper
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

describe('IntentionForm', () => {
  const mockCriarIntencao = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useIntentions.mockReturnValue({
      criarIntencao: mockCriarIntencao,
      isCreating: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: mockReset,
    });
  });

  it('deve renderizar o formulário corretamente', () => {
    render(<IntentionForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Solicitar Participação no Grupo')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar solicitação/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup();
    render(<IntentionForm />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve validar formato de email', async () => {
    const user = userEvent.setup();
    render(<IntentionForm />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'email-invalido');
    await user.tab(); // Sair do campo para triggerar validação

    const submitButton = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('deve validar tamanho mínimo do motivo', async () => {
    const user = userEvent.setup();
    render(<IntentionForm />, { wrapper: createWrapper() });

    const motivoInput = screen.getByLabelText(/motivo/i);
    await user.type(motivoInput, 'curto');

    const submitButton = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/motivo deve ter pelo menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve enviar formulário com dados válidos', async () => {
    const user = userEvent.setup();
    mockCriarIntencao.mockResolvedValueOnce({
      success: true,
      data: { _id: '123' },
      message: 'Sucesso',
    });

    render(<IntentionForm />, { wrapper: createWrapper() });

    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@example.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Empresa Teste');
    await user.type(screen.getByLabelText(/motivo/i), 'Quero participar do grupo de networking');

    const submitButton = screen.getByRole('button', { name: /enviar solicitação/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCriarIntencao).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@example.com',
        empresa: 'Empresa Teste',
        motivo: 'Quero participar do grupo de networking',
      });
    });
  });

  it('deve mostrar mensagem de sucesso após criar intenção', async () => {
    useIntentions.mockReturnValue({
      criarIntencao: mockCriarIntencao,
      isCreating: false,
      isSuccess: true,
      isError: false,
      error: null,
      reset: mockReset,
    });

    render(<IntentionForm />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/intenção criada com sucesso/i)
    ).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando falhar', async () => {
    const error = new Error('Erro ao criar intenção');
    useIntentions.mockReturnValue({
      criarIntencao: mockCriarIntencao,
      isCreating: false,
      isSuccess: false,
      isError: true,
      error,
      reset: mockReset,
    });

    render(<IntentionForm />, { wrapper: createWrapper() });

    expect(screen.getByText(/erro ao criar intenção/i)).toBeInTheDocument();
  });

  it('deve desabilitar campos durante o envio', async () => {
    useIntentions.mockReturnValue({
      criarIntencao: mockCriarIntencao,
      isCreating: true,
      isSuccess: false,
      isError: false,
      error: null,
      reset: mockReset,
    });

    render(<IntentionForm />, { wrapper: createWrapper() });

    const nomeInput = screen.getByLabelText(/nome completo/i);
    expect(nomeInput).toBeDisabled();

    expect(screen.getByRole('button', { name: /enviando/i })).toBeInTheDocument();
  });
});

