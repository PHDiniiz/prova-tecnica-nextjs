/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { NoticeCard } from '../NoticeCard';
import { Notice } from '@/types/notice';

describe('NoticeCard', () => {
  const mockNotice: Notice = {
    _id: 'notice-123',
    titulo: 'Aviso Importante',
    conteudo: 'Este é um aviso importante',
    tipo: 'info',
    ativo: true,
    criadoEm: new Date('2025-01-01T00:00:00Z'),
    atualizadoEm: new Date('2025-01-01T00:00:00Z'),
  };

  it('deve renderizar informações do aviso', () => {
    render(<NoticeCard notice={mockNotice} />);

    expect(screen.getByText(/aviso importante/i)).toBeInTheDocument();
    expect(screen.getByText(/este é um aviso importante/i)).toBeInTheDocument();
  });

  it('deve mostrar botões de ação quando showActions é true', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <NoticeCard
        notice={mockNotice}
        showActions={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deletar/i })).toBeInTheDocument();
  });
});

