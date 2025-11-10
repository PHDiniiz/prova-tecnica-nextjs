import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  it('deve renderizar children corretamente', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('deve aceitar props do next-themes', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

