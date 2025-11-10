/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { NoticeTypeBadge } from '../NoticeTypeBadge';

describe('NoticeTypeBadge', () => {
  it('deve renderizar badge de informação', () => {
    render(<NoticeTypeBadge tipo="info" />);
    expect(screen.getByText(/informação/i)).toBeInTheDocument();
  });

  it('deve renderizar badge de sucesso', () => {
    render(<NoticeTypeBadge tipo="success" />);
    expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
  });

  it('deve renderizar badge de aviso', () => {
    render(<NoticeTypeBadge tipo="warning" />);
    expect(screen.getByText(/aviso/i)).toBeInTheDocument();
  });

  it('deve renderizar badge de urgente', () => {
    render(<NoticeTypeBadge tipo="urgent" />);
    expect(screen.getByText(/urgente/i)).toBeInTheDocument();
  });
});

