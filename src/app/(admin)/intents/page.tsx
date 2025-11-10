
'use client';

import { useState } from 'react';
import { IntentionList } from '@/components/features/intention/IntentionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

/**
 * Página administrativa para gerenciar intenções
 * Requer autenticação via ADMIN_TOKEN
 */
export default function AdminIntentsPage() {
  const { addToast } = useToast();
  // Inicialização lazy do estado para evitar setState em useEffect
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
    } else {
      addToast({
        variant: 'warning',
        title: 'Atenção',
        description: 'Por favor, insira um token válido',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken('');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Área Administrativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de Administrador
              </label>
              <Input
                type="password"
                placeholder="Insira o ADMIN_TOKEN"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Configure o ADMIN_TOKEN nas variáveis de ambiente
              </p>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Intenções
            </h1>
            <p className="text-gray-600 mt-1">
              Aprove ou recuse intenções de participação
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <IntentionList adminToken={adminToken} />
      </div>
    </div>
  );
}

