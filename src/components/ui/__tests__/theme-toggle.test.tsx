import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ThemeToggle } from '../theme-toggle';

// Mock do next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('ThemeToggle', () => {
  it('deve renderizar o botão de alternar tema', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('deve ter texto acessível para leitores de tela', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByText('Alternar tema')).toBeInTheDocument();
  });
});

