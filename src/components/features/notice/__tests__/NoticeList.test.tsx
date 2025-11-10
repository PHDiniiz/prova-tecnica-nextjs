/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NoticeList } from '../NoticeList';
import { useNotices } from '@/hooks/useNotices';

jest.mock('@/hooks/useNotices', () => ({
  useNotices: jest.fn(),
}));

const { useNotices: mockUseNotices } = require('@/hooks/useNotices');

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

describe('NoticeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve mostrar loading quando está carregando', () => {
    mockUseNotices.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<NoticeList publico={true} />, { wrapper: createWrapper() });

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve mostrar mensagem quando não há avisos', () => {
    mockUseNotices.mockReturnValue({
      data: { data: [] },
      isLoading: false,
      error: null,
    });

    render(<NoticeList publico={true} />, { wrapper: createWrapper() });

    expect(screen.getByText(/nenhum aviso encontrado/i)).toBeInTheDocument();
  });
});

