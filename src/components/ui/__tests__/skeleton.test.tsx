/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('deve renderizar skeleton básico', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('deve renderizar com variante rectangular (padrão)', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.querySelector('.rounded-md');
    expect(skeleton).toBeInTheDocument();
  });

  it('deve renderizar com variante circular', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('.rounded-full');
    expect(skeleton).toBeInTheDocument();
  });

  it('deve renderizar com variante text', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('.rounded');
    expect(skeleton).toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('.custom-class');
    expect(skeleton).toBeInTheDocument();
  });

  it('deve aplicar width customizado', () => {
    const { container } = render(<Skeleton width="200px" />);
    const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('deve aplicar height customizado', () => {
    const { container } = render(<Skeleton height="50px" />);
    const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('deve aplicar width e height numéricos', () => {
    const { container } = render(<Skeleton width={300} height={100} />);
    const skeleton = container.querySelector('.animate-pulse') as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '300px', height: '100px' });
  });

  it('deve ter animação pulse aplicada', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('deve ter cor de fundo padrão', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.bg-gray-300');
    expect(skeleton).toBeInTheDocument();
  });
});

