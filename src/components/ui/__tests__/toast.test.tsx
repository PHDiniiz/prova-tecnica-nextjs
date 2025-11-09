import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Componente de teste que usa o hook useToast
function TestComponent() {
  const { addToast, removeToast, toasts } = useToast();

  return (
    <div>
      <button onClick={() => addToast({ description: 'Teste toast', variant: 'info' })}>
        Adicionar Toast
      </button>
      <button onClick={() => toasts[0] && removeToast(toasts[0].id)}>
        Remover Toast
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
}

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

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('deve adicionar um toast quando addToast é chamado', async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestComponent />, { wrapper: createWrapper() });

    const addButton = screen.getByText('Adicionar Toast');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Teste toast')).toBeInTheDocument();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('deve remover um toast quando removeToast é chamado', async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestComponent />, { wrapper: createWrapper() });

    // Adicionar toast
    await user.click(screen.getByText('Adicionar Toast'));
    await waitFor(() => {
      expect(screen.getByText('Teste toast')).toBeInTheDocument();
    });

    // Remover toast
    await user.click(screen.getByText('Remover Toast'));
    await waitFor(() => {
      expect(screen.queryByText('Teste toast')).not.toBeInTheDocument();
    });
  });

  it('deve remover toast automaticamente após duration', async () => {
    const user = userEvent.setup({ delay: null });
    render(<TestComponent />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Adicionar Toast'));
    await waitFor(() => {
      expect(screen.getByText('Teste toast')).toBeInTheDocument();
    });

    // Avançar o tempo (default duration é 5000ms + animação de saída ~200ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Aguardar que o estado seja atualizado (toast removido do array)
    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });

    // Avançar o tempo da animação de saída (200ms)
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Aguardar a remoção do toast do DOM após a animação
    await waitFor(
      () => {
        expect(screen.queryByText('Teste toast')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('deve renderizar diferentes variantes de toast', async () => {
    function VariantTestComponent() {
      const { addToast } = useToast();
      return (
        <div>
          <button onClick={() => addToast({ description: 'Success Toast', variant: 'success' })}>
            Success
          </button>
          <button onClick={() => addToast({ description: 'Error Toast', variant: 'error' })}>
            Error
          </button>
          <button onClick={() => addToast({ description: 'Warning Toast', variant: 'warning' })}>
            Warning
          </button>
        </div>
      );
    }

    const user = userEvent.setup({ delay: null });
    render(<VariantTestComponent />, { wrapper: createWrapper() });

    await user.click(screen.getByText('Success'));
    await waitFor(() => {
      expect(screen.getByText('Success Toast')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Error'));
    await waitFor(() => {
      expect(screen.getByText('Error Toast')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Warning'));
    await waitFor(() => {
      expect(screen.getByText('Warning Toast')).toBeInTheDocument();
    });
  });
});

