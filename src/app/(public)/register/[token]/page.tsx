'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { CriarMembroDTO } from '@/types/member';

// Dynamic import para reduzir bundle inicial
const MemberForm = dynamic(
  () => import('@/components/features/member/MemberForm').then((mod) => ({ default: mod.MemberForm })),
  {
    loading: () => (
      <Card variant="outlined">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

interface ValidarTokenResponse {
  success: boolean;
  data?: {
    token: string;
    valido: boolean;
    expiraEm: string;
    intencao: {
      nome: string;
      email: string;
      empresa: string;
      cargo?: string;
    };
  };
  error?: string;
}

/**
 * Página pública para cadastro completo usando token de convite
 */
export default function RegisterPage() {
  const params = useParams();
  const token = params.token as string;
  const { addToast } = useToast();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intentionData, setIntentionData] = useState<{
    nome: string;
    email: string;
    empresa: string;
    cargo?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const validarToken = async () => {
      try {
        const response = await fetch(`/api/invites/${token}`);
        const data: ValidarTokenResponse = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Token inválido ou expirado');
          setIsValid(false);
          return;
        }

        if (data.data?.valido && data.data.intencao) {
          setIsValid(true);
          setIntentionData(data.data.intencao);
        } else {
          setError('Token inválido');
          setIsValid(false);
        }
      } catch (error) {
        console.error('Erro ao validar token:', error);
        setError('Erro ao validar token. Tente novamente mais tarde.');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (token) {
      validarToken();
    } else {
      setError('Token não fornecido');
      setIsValidating(false);
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (data: CriarMembroDTO) => {
      try {
        setIsSubmitting(true);

        const response = await fetch('/api/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            token,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Erro ao cadastrar');
        }

        setIsSuccess(true);
      } catch (error) {
        console.error('Erro ao cadastrar membro:', error);
        addToast({
          variant: 'error',
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao cadastrar. Tente novamente.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [token]
  );

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Token Inválido
              </h1>
              <p className="text-gray-600 mb-4">
                {error ||
                  'Este link de cadastro é inválido ou já expirou. Entre em contato com o administrador para solicitar um novo convite.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                Cadastro Realizado com Sucesso!
              </h1>
              <p className="text-gray-600">
                Seu cadastro foi concluído. Em breve você receberá mais
                informações sobre o grupo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete seu Cadastro
          </h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para finalizar seu cadastro no grupo
          </p>
        </div>

        <MemberForm
          initialData={intentionData || undefined}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

