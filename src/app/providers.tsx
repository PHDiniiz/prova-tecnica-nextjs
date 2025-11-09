'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Provider do React Query
 * Configura o QueryClient com refetch inteligente
 */
export function Providers({ children }: { children: ReactNode }) {
  // Cria o QueryClient uma vez e reutiliza
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetch quando a janela ganha foco
            refetchOnWindowFocus: true,
            // Refetch quando o componente monta
            refetchOnMount: true,
            // Não refetch em reconnect por padrão (pode ser sobrescrito)
            refetchOnReconnect: false,
            // Tempo que os dados ficam "frescos" antes de serem considerados stale
            staleTime: 1000 * 60 * 5, // 5 minutos
            // Tempo que os dados ficam no cache após não serem usados
            gcTime: 1000 * 60 * 10, // 10 minutos (antes era cacheTime)
            // Retry automático em caso de erro
            retry: 1,
          },
          mutations: {
            // Retry em mutações também
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

