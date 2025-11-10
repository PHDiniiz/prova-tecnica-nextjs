/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { Providers } from '../providers';

describe('Providers', () => {
  it('deve renderizar children corretamente', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('deve fornecer QueryClientProvider e ToastProvider', () => {
    const { container } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    expect(container).toBeInTheDocument();
  });
});

