/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '../MemberForm';
import { ReactNode } from 'react';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock dos componentes UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ label, error, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ label, error, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <textarea {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('MemberForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar formulário com campos obrigatórios', () => {
    render(<MemberForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Empresa/i)).toBeInTheDocument();
    expect(screen.getByText(/Finalizar Cadastro/i)).toBeInTheDocument();
  });

  it('deve preencher campos com initialData', () => {
    const initialData = {
      nome: 'João Silva',
      email: 'joao@test.com',
      empresa: 'Empresa Teste',
      cargo: 'Desenvolvedor',
    };

    render(<MemberForm initialData={initialData} onSubmit={mockOnSubmit} />);

    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desenvolvedor')).toBeInTheDocument();
  });

  it('deve validar nome mínimo de 2 caracteres', async () => {
    const user = userEvent.setup();

    render(<MemberForm onSubmit={mockOnSubmit} />);

    const nomeInput = screen.getByLabelText(/Nome Completo/i);
    const submitButton = screen.getByText(/Finalizar Cadastro/i);

    await user.type(nomeInput, 'A');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve validar email válido', async () => {
    const user = userEvent.setup();

    render(<MemberForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByText(/Finalizar Cadastro/i);

    await user.type(emailInput, 'email-invalido');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });
  });

  it('deve validar empresa mínima de 2 caracteres', async () => {
    const user = userEvent.setup();

    render(<MemberForm onSubmit={mockOnSubmit} />);

    const empresaInput = screen.getByLabelText(/Empresa/i);
    const submitButton = screen.getByText(/Finalizar Cadastro/i);

    await user.type(empresaInput, 'A');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve validar LinkedIn como URL válida', async () => {
    const user = userEvent.setup();

    render(<MemberForm onSubmit={mockOnSubmit} />);

    const linkedinInput = screen.getByLabelText(/LinkedIn/i);
    const submitButton = screen.getByText(/Finalizar Cadastro/i);

    await user.type(linkedinInput, 'nao-e-uma-url');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/deve ser uma URL válida/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<MemberForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome Completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/Email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/Empresa/i), 'Empresa Teste');
    await user.type(screen.getByLabelText(/Telefone/i), '+55 11 99999-9999');
    await user.type(screen.getByLabelText(/Cargo/i), 'Desenvolvedor');
    await user.type(
      screen.getByLabelText(/LinkedIn/i),
      'https://linkedin.com/in/joao-silva'
    );

    const submitButton = screen.getByText(/Finalizar Cadastro/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@test.com',
        empresa: 'Empresa Teste',
        telefone: '+55 11 99999-9999',
        cargo: 'Desenvolvedor',
        linkedin: 'https://linkedin.com/in/joao-silva',
      });
    });
  });

  it('deve excluir campos vazios opcionais na submissão', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<MemberForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome Completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/Email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/Empresa/i), 'Empresa Teste');

    const submitButton = screen.getByText(/Finalizar Cadastro/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@test.com',
        empresa: 'Empresa Teste',
      });
    });
  });

  it('deve exibir estado de loading durante submissão', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(() => new Promise(() => {})); // Nunca resolve

    render(<MemberForm onSubmit={mockOnSubmit} isLoading={false} />);

    await user.type(screen.getByLabelText(/Nome Completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/Email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/Empresa/i), 'Empresa Teste');

    const submitButton = screen.getByText(/Finalizar Cadastro/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Cadastrando.../i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar campos durante loading externo', () => {
    render(<MemberForm onSubmit={mockOnSubmit} isLoading={true} />);

    const nomeInput = screen.getByLabelText(/Nome Completo/i) as HTMLInputElement;
    expect(nomeInput).toBeDisabled();
  });
});

