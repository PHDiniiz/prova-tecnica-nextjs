import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

// Mock do framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('MetricCard', () => {
  it('deve renderizar o card com título e valor', () => {
    render(<MetricCard titulo="Membros Ativos" valor={150} />);

    expect(screen.getByText('Membros Ativos')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('deve formatar números grandes corretamente', () => {
    render(<MetricCard titulo="Total" valor={1000000} />);

    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
  });

  it('deve exibir variação quando fornecida', () => {
    render(
      <MetricCard
        titulo="Membros Ativos"
        valor={150}
        variacao={{ valor: 5, tipo: 'positivo', periodo: 'vs mês anterior' }}
      />
    );

    expect(screen.getByText(/\+5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs mês anterior/)).toBeInTheDocument();
  });

  it('deve aplicar variantes de cor corretamente', () => {
    const { container } = render(
      <MetricCard titulo="Teste" valor={100} variant="primary" />
    );

    const card = container.querySelector('.border-blue-200');
    expect(card).toBeInTheDocument();
  });

  it('deve exibir ícone quando fornecido', () => {
    const icon = <span data-testid="icon">📊</span>;
    render(<MetricCard titulo="Teste" valor={100} icone={icon} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(
      <MetricCard titulo="Teste" valor={100} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

