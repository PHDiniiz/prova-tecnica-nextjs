/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../card';

describe('Card', () => {
  it('deve renderizar o card com conteúdo', () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('deve aplicar variante default', () => {
    const { container } = render(<Card variant="default">Teste</Card>);
    const card = container.querySelector('.shadow-sm');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar variante outlined', () => {
    const { container } = render(<Card variant="outlined">Teste</Card>);
    const card = container.querySelector('.border');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar variante elevated', () => {
    const { container } = render(<Card variant="elevated">Teste</Card>);
    const card = container.querySelector('.shadow-lg');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<Card className="custom-class">Teste</Card>);
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

describe('CardHeader', () => {
  it('deve renderizar o header', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
  });
});

describe('CardTitle', () => {
  it('deve renderizar o título', () => {
    render(
      <Card>
        <CardTitle>Título</CardTitle>
      </Card>
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('deve renderizar o conteúdo', () => {
    render(
      <Card>
        <CardContent>Conteúdo</CardContent>
      </Card>
    );
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });
});

