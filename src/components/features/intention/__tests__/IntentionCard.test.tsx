/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntentionCard } from '../IntentionCard';
import { Intention } from '@/types/intention';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock do Button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const mockIntencao: Intention = {
  _id: 'intention-1',
  nome: 'João Silva',
  email: 'joao@example.com',
  empresa: 'Empresa Teste',
  motivo: 'Quero participar do grupo de networking',
  status: 'pending' as const,
  criadoEm: new Date('2024-01-15T10:00:00Z'),
  atualizadoEm: new Date('2024-01-15T10:00:00Z'),
};

describe('IntentionCard', () => {
  it('deve renderizar informações da intenção', () => {
    render(<IntentionCard intencao={mockIntencao} />);

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByText('Quero participar do grupo de networking')).toBeInTheDocument();
  });

  it('deve exibir badge de status pendente', () => {
    render(<IntentionCard intencao={mockIntencao} />);

    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir badge de status aprovado', () => {
    const intencaoAprovada = { ...mockIntencao, status: 'approved' as const };
    render(<IntentionCard intencao={intencaoAprovada} />);

    expect(screen.getByText('Aprovada')).toBeInTheDocument();
  });

  it('deve exibir botões de ação quando status é pending', () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();

    render(
      <IntentionCard
        intencao={mockIntencao}
        onApprove={onApprove}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Aprovar')).toBeInTheDocument();
    expect(screen.getByText('Recusar')).toBeInTheDocument();
  });

  it('não deve exibir botões de ação quando status não é pending', () => {
    const intencaoAprovada = { ...mockIntencao, status: 'approved' as const };
    render(<IntentionCard intencao={intencaoAprovada} />);

    expect(screen.queryByText('Aprovar')).not.toBeInTheDocument();
    expect(screen.queryByText('Recusar')).not.toBeInTheDocument();
  });

  it('deve chamar onApprove ao clicar no botão Aprovar', async () => {
    const user = userEvent.setup();
    const onApprove = jest.fn();

    render(<IntentionCard intencao={mockIntencao} onApprove={onApprove} />);

    const aprovarButton = screen.getByText('Aprovar');
    await user.click(aprovarButton);

    expect(onApprove).toHaveBeenCalledWith('intention-1');
  });

  it('deve chamar onReject ao clicar no botão Recusar', async () => {
    const user = userEvent.setup();
    const onReject = jest.fn();

    render(<IntentionCard intencao={mockIntencao} onReject={onReject} />);

    const recusarButton = screen.getByText('Recusar');
    await user.click(recusarButton);

    expect(onReject).toHaveBeenCalledWith('intention-1');
  });

  it('deve desabilitar botões quando isUpdating é true', () => {
    render(<IntentionCard intencao={mockIntencao} isUpdating={true} />);

    const botoes = screen.getAllByText('Processando...');
    expect(botoes.length).toBe(2); // Dois botões (Aprovar e Recusar)
    botoes.forEach((botao) => {
      expect(botao).toBeDisabled();
    });
  });

  it('deve formatar data corretamente', () => {
    render(<IntentionCard intencao={mockIntencao} />);

    expect(screen.getByText(/Criado em:/)).toBeInTheDocument();
  });
});

