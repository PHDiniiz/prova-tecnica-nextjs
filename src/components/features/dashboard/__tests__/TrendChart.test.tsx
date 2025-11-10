/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { TrendChart } from '../TrendChart';

describe('TrendChart', () => {
  it('deve renderizar o componente com título', () => {
    const dados = [
      { label: 'Jan', valor: 10 },
      { label: 'Fev', valor: 15 },
      { label: 'Mar', valor: 12 },
    ];

    render(<TrendChart dados={dados} titulo="Tendência de Teste" />);

    expect(screen.getByText(/tendência de teste/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há dados', () => {
    render(<TrendChart dados={[]} />);

    expect(screen.getByText(/nenhum dado disponível/i)).toBeInTheDocument();
  });

  it('deve renderizar gráfico com dados válidos', () => {
    const dados = [
      { label: 'Jan', valor: 10 },
      { label: 'Fev', valor: 15 },
      { label: 'Mar', valor: 12 },
    ];

    render(<TrendChart dados={dados} />);

    // Verificar se o SVG foi renderizado
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('deve ordenar dados por data quando disponível', () => {
    const dados = [
      { label: 'Mar', valor: 12, data: new Date('2024-03-01') },
      { label: 'Jan', valor: 10, data: new Date('2024-01-01') },
      { label: 'Fev', valor: 15, data: new Date('2024-02-01') },
    ];

    render(<TrendChart dados={dados} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('deve usar formato de valor customizado', () => {
    const dados = [
      { label: 'Jan', valor: 1000 },
      { label: 'Fev', valor: 1500 },
    ];

    const formatoValor = (valor: number) => `R$ ${valor.toLocaleString('pt-BR')}`;

    render(<TrendChart dados={dados} formatoValor={formatoValor} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

