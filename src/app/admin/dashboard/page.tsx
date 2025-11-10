'use client';

import { useState } from 'react';
import { DashboardPage } from '@/components/features/dashboard/DashboardPage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Página administrativa do dashboard
 * Proteção temporária com ADMIN_TOKEN via localStorage
 * TODO: Implementar autenticação JWT real
 */
export default function AdminDashboardPage() {
  // Inicialização do estado com valores do localStorage
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || '';
    }
    return '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('admin_token');
    }
    return false;
  });

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

