'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ReferralList } from '@/components/features/referral/ReferralList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Member } from '@/types/member';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import para reduzir bundle inicial
const ReferralForm = dynamic(
  () => import('@/components/features/referral/ReferralForm').then((mod) => ({ default: mod.ReferralForm })),
  {
    loading: () => (
      <Card variant="outlined">
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

/**
 * Página para gestão de indicações
 * Por enquanto aceita membroId via localStorage ou input
 * TODO: Implementar autenticação JWT
 */
export default function ReferralsPage() {
  const { addToast } = useToast();
  const [membroId, setMembroId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [membrosAtivos, setMembrosAtivos] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Tenta recuperar o membroId do localStorage
    const savedMembroId = localStorage.getItem('membro_id');
    if (savedMembroId) {
      setMembroId(savedMembroId);
      setIsAuthenticated(true);
      carregarMembrosAtivos(savedMembroId);
    }
  }, []);

  const carregarMembrosAtivos = useCallback(async (adminToken: string) => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch('/api/members?ativos=true', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembrosAtivos(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  const handleLogin = () => {
    if (membroId.trim()) {
      localStorage.setItem('membro_id', membroId);
      setIsAuthenticated(true);
      // Para carregar membros, precisa do ADMIN_TOKEN
      // Por enquanto, vamos usar o mesmo token
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        carregarMembrosAtivos(adminToken);
      }
    } else {
      addToast({
        variant: 'warning',
        title: 'Atenção',
        description: 'Por favor, insira um ID de membro válido',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('membro_id');
    setMembroId('');
    setIsAuthenticated(false);
    setMembrosAtivos([]);
    setShowForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Área de Indicações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Membro
              </label>
              <Input
                type="text"
                placeholder="Insira o ID do membro"
                value={membroId}
                onChange={(e) => setMembroId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Por enquanto, use o ID do membro para acessar.
                <br />
                TODO: Implementar autenticação JWT
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
              Sistema de Indicações
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas indicações de negócios
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'outline' : 'primary'}
            >
              {showForm ? 'Cancelar' : 'Nova Indicação'}
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>

        {/* Formulário de nova indicação */}
        {showForm && (
          <div className="mb-6">
            {isLoadingMembers ? (
              <Card variant="outlined">
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ) : (
              <ReferralForm
                membroId={membroId}
                membrosAtivos={membrosAtivos}
                onSuccess={() => {
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
        )}

        {/* Lista de indicações */}
        <ReferralList membroId={membroId} />
      </div>
    </div>
  );
}

