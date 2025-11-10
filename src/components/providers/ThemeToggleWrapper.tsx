'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Wrapper Client Component para o ThemeToggle
 * Necessário porque o Layout é um Server Component
 */
export function ThemeToggleWrapper() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}

