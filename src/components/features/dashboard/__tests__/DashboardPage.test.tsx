/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  it('deve renderizar o componente', () => {
    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/dashboard de performance/i)).toBeInTheDocument();
  });

  it('deve mostrar loading quando está carregando', () => {
    render(<DashboardPage adminToken="admin-token-123" />, {
      wrapper: createWrapper(),
    });

    // O componente deve renderizar mesmo durante o loading
    expect(screen.getByText(/dashboard de performance/i)).toBeInTheDocument();
  });
});

