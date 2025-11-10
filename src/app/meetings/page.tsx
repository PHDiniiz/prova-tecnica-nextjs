'use client';

import { useState, useEffect, useCallback } from 'react';
import { MeetingList } from '@/components/features/meeting/MeetingList';
import { MeetingForm } from '@/components/features/meeting/MeetingForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Member } from '@/types/member';

/**
 * Página para gestão de reuniões
 * Por enquanto aceita membroId via localStorage ou input
 * TODO: Implementar autenticação JWT
 */
export default function MeetingsPage() {
  const [membroId, setMembroId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [membrosAtivos, setMembrosAtivos] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  useEffect(() => {
    setIsMounted(true);
    
    // Verifica se está no contexto admin
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      // Se admin_token existe, permite acesso direto
      setIsAuthenticated(true);
      carregarMembrosAtivos(adminToken);
      return;
    }

    // Tenta recuperar o membroId do localStorage
    const savedMembroId = localStorage.getItem('membro_id');
    if (savedMembroId) {
      setMembroId(savedMembroId);
      setIsAuthenticated(true);
      carregarMembrosAtivos(savedMembroId);
    }
  }, [carregarMembrosAtivos]);

  const handleLogin = () => {
    if (membroId.trim()) {
      localStorage.setItem('membro_id', membroId);
      setIsAuthenticated(true);
      carregarMembrosAtivos(membroId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('membro_id');
    setMembroId('');
    setIsAuthenticated(false);
    setMembrosAtivos([]);
  };

  // Renderiza loading até o componente estar montado no cliente
  // Isso evita diferenças entre SSR e CSR
  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card variant="outlined" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Acesso ao Sistema
                </h2>
                <p className="text-gray-600">
                  Digite seu ID de membro para acessar as reuniões
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="ID do membro"
                  value={membroId}
                  onChange={(e) => setMembroId(e.target.value)}
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
    <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reuniões 1:1</h1>
            <p className="text-gray-600 mt-1">Gerencie suas reuniões e registre check-ins</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              variant="primary"
            >
              Nova Reunião
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Sair
            </Button>
          </div>
        </div>

        {/* Formulário de nova reunião */}
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
              <Card variant="outlined">
                <CardHeader>
                  <CardTitle>Nova Reunião</CardTitle>
                </CardHeader>
                <CardContent>
                  <MeetingForm
                    membrosAtivos={membrosAtivos}
                    membroToken={membroId}
                    onSuccess={() => {
                      setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lista de reuniões */}
        <MeetingList 
          membroId={membroId || ''} 
          membroToken={membroId || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '')} 
        />
    </div>
  );
}

