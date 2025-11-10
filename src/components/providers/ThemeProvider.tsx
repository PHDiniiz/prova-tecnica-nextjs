'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ComponentProps } from 'react';

/**
 * Wrapper do ThemeProvider do next-themes
 * Configura o gerenciamento de temas dark/light com persistência
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

