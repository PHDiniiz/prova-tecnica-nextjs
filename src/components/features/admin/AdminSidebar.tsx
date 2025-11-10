'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Bell, LogOut, Menu, X, Handshake, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Interface para itens de navegação
 */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props do componente AdminSidebar
 */
interface AdminSidebarProps {
  /** Estado de abertura da sidebar (mobile) */
  isOpen?: boolean;
  /** Callback para fechar a sidebar */
  onClose?: () => void;
}

/**
 * Itens de navegação do painel admin
 */
const navItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/notices',
    label: 'Avisos',
    icon: Bell,
  },
  {
    href: '/referrals',
    label: 'Indicações',
    icon: Handshake,
  },
  {
    href: '/meetings',
    label: 'Reuniões',
    icon: Calendar,
  },
];

/**
 * Componente AdminSidebar
 * 
 * Sidebar de navegação para o painel administrativo.
 * Responsiva: oculta em mobile, visível em desktop.
 * Exibe links para as rotas do admin com indicador de rota ativa.
 * 
 * @example
 * ```tsx
 * <AdminSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/dashboard';
  };

  const handleLinkClick = () => {
    // Fecha a sidebar ao clicar em um link (mobile)
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Painel Admin</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Área Administrativa
            </p>
          </div>
          {/* Botão de fechar (mobile) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'text-foreground/80',
                  'hover:bg-accent hover:text-foreground',
                  isActive &&
                    'bg-primary/10 text-primary font-medium hover:bg-primary/15'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer com botão de logout */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>
    </>
  );
}

/**
 * Componente AdminSidebarToggle
 * 
 * Botão hambúrguer para abrir/fechar a sidebar em mobile.
 * Visível apenas quando a sidebar está fechada.
 */
export function AdminSidebarToggle({
  onToggle,
  isSidebarOpen,
}: {
  onToggle: () => void;
  isSidebarOpen?: boolean;
}) {
  // Não renderiza se a sidebar estiver aberta (mobile)
  if (isSidebarOpen) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50"
      aria-label="Abrir menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

