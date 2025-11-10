/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { ReferralStatusBadge } from '../ReferralStatusBadge';
import { ReferralStatus } from '@/types/referral';

// Mock do componente Badge
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, size, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} data-size={size} {...props}>
      {children}
    </span>
  ),
}));

describe('ReferralStatusBadge', () => {
  it('deve renderizar badge para status "nova"', () => {
    render(<ReferralStatusBadge status="nova" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Nova');
    expect(badge).toHaveAttribute('data-variant', 'info');
  });

  it('deve renderizar badge para status "em-contato"', () => {
    render(<ReferralStatusBadge status="em-contato" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Em Contato');
    expect(badge).toHaveAttribute('data-variant', 'warning');
  });

  it('deve renderizar badge para status "fechada"', () => {
    render(<ReferralStatusBadge status="fechada" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Fechada');
    expect(badge).toHaveAttribute('data-variant', 'success');
  });

  it('deve renderizar badge para status "recusada"', () => {
    render(<ReferralStatusBadge status="recusada" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Recusada');
    expect(badge).toHaveAttribute('data-variant', 'error');
  });

  it('deve usar tamanho "md" por padrão', () => {
    render(<ReferralStatusBadge status="nova" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-size', 'md');
  });

  it('deve usar tamanho "sm" quando especificado', () => {
    render(<ReferralStatusBadge status="nova" size="sm" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-size', 'sm');
  });

  it('deve usar tamanho "md" quando especificado', () => {
    render(<ReferralStatusBadge status="nova" size="md" />);
    
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-size', 'md');
  });
});

