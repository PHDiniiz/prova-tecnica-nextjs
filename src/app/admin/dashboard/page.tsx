'use client';

import dynamic from 'next/dynamic';
import { useAdminToken } from '@/hooks/useAdminToken';
import { AdminPageHeader } from '@/components/features/admin/AdminPageHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import para reduzir bundle inicial
const DashboardPage = dynamic(
  () => import('@/components/features/dashboard/DashboardPage').then((mod) => ({ default: mod.DashboardPage })),
  {
    loading: () => (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Página administrativa do dashboard
 * 
 * A autenticação é gerenciada pelo layout.tsx do admin.
 * Esta página renderiza o header padronizado e o conteúdo do dashboard.
 */
export default function AdminDashboardPage() {
  const adminToken = useAdminToken();

  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Dashboard"
        description="Visão geral e métricas do sistema"
      />
      <DashboardPage adminToken={adminToken} />
    </div>
  );
}

