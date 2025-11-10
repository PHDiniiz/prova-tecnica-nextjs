'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Dynamic import para reduzir bundle inicial
const IntentionForm = dynamic(
  () => import('./IntentionForm').then((mod) => ({ default: mod.IntentionForm })),
  {
    loading: () => (
      <Card variant="outlined">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

/**
 * Wrapper Client Component para IntentionForm com lazy loading
 */
export function IntentionFormWrapper() {
  return <IntentionForm />;
}

