'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
 * Proteção temporária com ADMIN_TOKEN via localStorage
 * TODO: Implementar autenticação JWT real
 */
export default function AdminDashboardPage() {
  // Estados sempre inicializados com valores padrão para evitar diferenças SSR/CSR
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Verifica localStorage apenas após montagem no cliente
  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (adminToken.trim()) {
      localStorage.setItem('admin_token', adminToken);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
  };

  // Renderiza loading até o componente estar montado no cliente
  // Isso evita diferenças entre SSR e CSR
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card variant="outlined" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="outlined" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Acesso Administrativo
                </h2>
                <p className="text-gray-600">
                  Digite o token de administrador para acessar o dashboard
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Token de administrador"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
                <Button onClick={handleLogin} variant="primary" className="w-full">
                  Entrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Button onClick={handleLogout} variant="outline" size="sm">
          Sair
        </Button>
      </div>
      <DashboardPage adminToken={adminToken} />
    </div>
  );
}

