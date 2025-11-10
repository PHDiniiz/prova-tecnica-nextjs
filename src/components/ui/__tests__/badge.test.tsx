import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('deve renderizar o badge com conteúdo', () => {
    render(<Badge>Teste</Badge>);
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });

  it('deve aplicar variante default', () => {
    const { container } = render(<Badge variant="default">Teste</Badge>);
    const badge = container.querySelector('.bg-gray-100');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar variante success', () => {
    const { container } = render(<Badge variant="success">Sucesso</Badge>);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar variante warning', () => {
    const { container } = render(<Badge variant="warning">Aviso</Badge>);
    const badge = container.querySelector('.bg-yellow-100');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar variante error', () => {
    const { container } = render(<Badge variant="error">Erro</Badge>);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar variante info', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar tamanho sm', () => {
    const { container } = render(<Badge size="sm">Pequeno</Badge>);
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar tamanho md', () => {
    const { container } = render(<Badge size="md">Médio</Badge>);
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<Badge className="custom-class">Teste</Badge>);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });
});

