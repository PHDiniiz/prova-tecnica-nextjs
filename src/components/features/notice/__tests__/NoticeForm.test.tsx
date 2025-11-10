/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NoticeForm } from '../NoticeForm';
// import { useCreateNotice, useUpdateNotice } from '@/hooks/useNotices';
import { useToast } from '@/components/ui/toast';

jest.mock('@/hooks/useNotices', () => ({
  useCreateNotice: jest.fn(),
  useUpdateNotice: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(),
}));

const mockUseCreateNotice = jest.fn();
const mockUseUpdateNotice = jest.fn();

jest.mock('@/hooks/useNotices', () => ({
  useCreateNotice: () => mockUseCreateNotice(),
  useUpdateNotice: () => mockUseUpdateNotice(),
}));

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

describe('NoticeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({
      addToast: jest.fn(),
    });
    mockUseCreateNotice.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    mockUseUpdateNotice.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('deve renderizar formulário de criação', () => {
    render(<NoticeForm adminToken="token-123" />, { wrapper: createWrapper() });

    expect(screen.getByText(/título/i)).toBeInTheDocument();
    expect(screen.getByText(/conteúdo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
  });
});

