'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Wand2 } from 'lucide-react';
import {
  AdminSidebar,
  AdminSidebarToggle,
} from '@/components/features/admin/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Props do layout admin
 */
interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Layout do painel administrativo
 * 
 * Centraliza a autenticação e fornece a estrutura com sidebar
 * para todas as páginas do admin.
 * Suporta responsividade completa com sidebar colapsável em mobile.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Verifica localStorage apenas após montagem no cliente
  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    // Limpa erro anterior
    setError('');

    // Valida se o token não está vazio
    if (!adminToken.trim()) {
      setError('Por favor, insira o token de administrador');
      return;
    }

    setIsValidating(true);

    try {
      // Valida o token fazendo uma requisição de teste
      const response = await fetch('/api/dashboard?periodo=mensal', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken.trim()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Token inválido. Verifique se o token está correto.');
        } else {
          setError('Erro ao validar token. Tente novamente.');
        }
        setIsValidating(false);
        return;
      }

      // Token válido - salva e autentica
      localStorage.setItem('admin_token', adminToken.trim());
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique sua conexão.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyToken = () => {
    const defaultToken = 'd021d22df2dfa077499ca09b19b3ad62c044ef3dcdd2517ea7c6f9f740d91682';
    setAdminToken(defaultToken);
    setError(''); // Limpa erro ao preencher token
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminToken(e.target.value);
    // Limpa erro quando o usuário começa a digitar
    if (error) {
      setError('');
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Renderiza loading até o componente estar montado no cliente
  // Isso evita diferenças entre SSR e CSR
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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

  // Tela de login se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="outlined" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Acesso Administrativo
                </h2>
                <p className="text-muted-foreground">
                  Digite o token de administrador para acessar o painel
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-col space-y-1.5">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Token de administrador"
                      value={adminToken}
                      onChange={handleTokenChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isValidating) {
                          handleLogin();
                        }
                      }}
                      className={cn(
                        'flex w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm',
                        'ring-offset-background',
                        'placeholder:text-muted-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-all duration-200',
                        error
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      )}
                      disabled={isValidating}
                      required
                      tabIndex={3}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyToken}
                      disabled={isValidating}
                      className={cn(
                        'absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 z-10',
                        'hover:bg-accent',
                        isValidating && 'opacity-50 cursor-not-allowed'
                      )}
                      aria-label="Preencher token"
                      tabIndex={1}
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {error && (
                    <p className="text-xs text-destructive font-medium">{error}</p>
                  )}
                  {!error && (
                    <p className="text-xs text-muted-foreground">
                      Use o botão ao lado para preencher automaticamente
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleLogin}
                  variant="primary"
                  className="w-full"
                  disabled={isValidating}
                  isLoading={isValidating}
                  tabIndex={2}
                >
                  {isValidating ? 'Validando...' : 'Entrar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Layout com sidebar quando autenticado
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <AdminSidebarToggle
        onToggle={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <main className="ml-0 lg:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

