'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NoticeList } from '@/components/features/notice/NoticeList';
import { NoticeForm } from '@/components/features/notice/NoticeForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Notice } from '@/types/notice';

/**
 * Página administrativa para CRUD de avisos
 * Proteção temporária com ADMIN_TOKEN via localStorage
 * TODO: Implementar autenticação JWT real
 */
export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [noticeEditando, setNoticeEditando] = useState<Notice | undefined>(undefined);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
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
                  Digite o token de administrador para gerenciar avisos
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Token de administrador"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Avisos</h1>
            <p className="text-gray-600 mt-1">Crie e gerencie avisos do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setNoticeEditando(undefined);
                setShowForm(true);
              }}
              variant="primary"
            >
              Novo Aviso
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>

        {/* Lista de avisos */}
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

