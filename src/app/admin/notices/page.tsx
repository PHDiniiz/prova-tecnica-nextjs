'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/features/admin/AdminPageHeader';
import { useAdminToken } from '@/hooks/useAdminToken';
import { Notice } from '@/types/notice';

// Dynamic imports para reduzir bundle inicial
const NoticeList = dynamic(
  () => import('@/components/features/notice/NoticeList').then((mod) => ({ default: mod.NoticeList })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const NoticeForm = dynamic(
  () => import('@/components/features/notice/NoticeForm').then((mod) => ({ default: mod.NoticeForm })),
  {
    ssr: false,
  }
);

/**
 * Página administrativa para CRUD de avisos
 * 
 * A autenticação é gerenciada pelo layout.tsx do admin.
 * Esta página apenas renderiza o conteúdo de gestão de avisos.
 */
export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const adminToken = useAdminToken();
  const [showForm, setShowForm] = useState(false);
  const [noticeEditando, setNoticeEditando] = useState<Notice | undefined>(undefined);

  const handleEdit = (notice: Notice) => {
    setNoticeEditando(notice);
    setShowForm(true);
  };

  const handleDelete = async (notice: Notice) => {
    if (!confirm(`Tem certeza que deseja deletar o aviso "${notice.titulo}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/notices/${notice._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar aviso');
      }

      addToast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Aviso deletado com sucesso!',
      });

      // Invalida queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao deletar aviso',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setNoticeEditando(undefined);
    // Invalida queries para atualizar a lista
    queryClient.invalidateQueries({ queryKey: ['notices'] });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setNoticeEditando(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Gestão de Avisos"
        description="Crie e gerencie avisos do sistema"
        action={
          <Button
            onClick={() => {
              setNoticeEditando(undefined);
              setShowForm(true);
            }}
            variant="primary"
          >
            Novo Aviso
          </Button>
        }
      />

      {/* Lista de avisos */}
      <div className="space-y-6">
        <NoticeList
          publico={false}
          adminToken={adminToken}
          showActions={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Dialog para criar/editar aviso */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>
                {noticeEditando ? 'Editar Aviso' : 'Novo Aviso'}
              </DialogTitle>
            </DialogHeader>
            <NoticeForm
              notice={noticeEditando}
              adminToken={adminToken}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

