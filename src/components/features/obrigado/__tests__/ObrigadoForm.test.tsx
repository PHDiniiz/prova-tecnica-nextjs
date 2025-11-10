/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObrigadoForm } from '../ObrigadoForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock do useCreateObrigado
jest.mock('@/hooks/useObrigados', () => ({
  useCreateObrigado: jest.fn(),
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

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ label, error, placeholder, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <textarea placeholder={placeholder} {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

const { useCreateObrigado } = require('@/hooks/useObrigados');

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

describe('ObrigadoForm', () => {
  const mockMutateAsync = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCreateObrigado.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('deve renderizar formulário com campos obrigatórios', () => {
    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/Mensagem de Agradecimento/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrar Agradecimento/i)).toBeInTheDocument();
  });

  it('deve validar mensagem mínima de 10 caracteres', async () => {
    const user = userEvent.setup();

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByLabelText(/Mensagem de Agradecimento/i);
    const submitButton = screen.getByText(/Registrar Agradecimento/i);

    await user.type(textarea, 'curto');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/deve ter pelo menos 10 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve validar mensagem máxima de 500 caracteres', async () => {
    const user = userEvent.setup();

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByLabelText(/Mensagem de Agradecimento/i);
    const submitButton = screen.getByText(/Registrar Agradecimento/i);

    const longMessage = 'a'.repeat(501);
    await user.type(textarea, longMessage);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/deve ter no máximo 500 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ success: true });

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByLabelText(/Mensagem de Agradecimento/i);
    const submitButton = screen.getByText(/Registrar Agradecimento/i);

    await user.type(textarea, 'Esta é uma mensagem de agradecimento válida!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        mensagem: 'Esta é uma mensagem de agradecimento válida!',
        publico: true,
        indicacaoId: 'ind-1',
        membroId: 'membro-1',
      });
    });
  });

  it('deve chamar onSuccess após sucesso', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ success: true });

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByLabelText(/Mensagem de Agradecimento/i);
    const submitButton = screen.getByText(/Registrar Agradecimento/i);

    await user.type(textarea, 'Mensagem válida de agradecimento');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir estado de loading durante submissão', () => {
    useCreateObrigado.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Registrando.../i)).toBeInTheDocument();
  });

  it('deve resetar formulário após submissão bem-sucedida', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ success: true });

    render(
      <ObrigadoForm indicacaoId="ind-1" membroId="membro-1" onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByLabelText(/Mensagem de Agradecimento/i) as HTMLTextAreaElement;
    const submitButton = screen.getByText(/Registrar Agradecimento/i);

    await user.type(textarea, 'Mensagem válida');
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });
});

