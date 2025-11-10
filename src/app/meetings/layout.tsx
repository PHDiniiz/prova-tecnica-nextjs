'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  AdminSidebar,
  AdminSidebarToggle,
} from '@/components/features/admin/AdminSidebar';

/**
 * Props do layout de meetings
 */
interface MeetingsLayoutProps {
  children: ReactNode;
}

/**
 * Layout para a página de meetings
 * Reutiliza a sidebar e estrutura do admin
 */
export default function MeetingsLayout({ children }: MeetingsLayoutProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Verifica localStorage apenas após montagem no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Renderiza loading até o componente estar montado no cliente
  if (!isMounted) {
    return <div className="min-h-screen bg-background" />;
  }

  // Layout com sidebar
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

