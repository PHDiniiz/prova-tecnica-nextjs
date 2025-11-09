'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateObrigado } from '@/hooks/useObrigados';
import { useToast } from '@/components/ui/toast';
import { CriarObrigadoDTO } from '@/types/obrigado';

// Tipo para os dados do formulário (apenas campos editáveis pelo usuário)
type ObrigadoFormData = {
  mensagem: string;
  publico?: boolean;
};

const obrigadoSchema = z.object({
  mensagem: z
    .string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(500, 'Mensagem deve ter no máximo 500 caracteres'),
  publico: z.boolean().optional().default(true),
});

interface ObrigadoFormProps {
  indicacaoId: string;
  membroId: string;
  onSuccess?: () => void;
}

/**
 * Componente de formulário para criar agradecimento (obrigado)
 * 
 * @example
 * ```tsx
 * <ObrigadoForm
 *   indicacaoId="123"
 *   membroId="456"
 *   onSuccess={() => console.log('Agradecimento criado!')}
 * />
 * ```
 */
export function ObrigadoForm({
  indicacaoId,
  membroId,
  onSuccess,
}: ObrigadoFormProps) {
  const { addToast } = useToast();
  const createObrigado = useCreateObrigado();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ObrigadoFormData>({
    resolver: zodResolver(obrigadoSchema),
    defaultValues: {
      mensagem: '',
      publico: true,
    },
  });

  const onSubmit = async (data: ObrigadoFormData) => {
    try {
      // Converter ObrigadoFormData para CriarObrigadoDTO com membroId
      const criarObrigadoDTO: CriarObrigadoDTO & { membroId: string } = {
        mensagem: data.mensagem,
        publico: data.publico ?? true,
        indicacaoId,
        membroId,
      };

      await createObrigado.mutateAsync(criarObrigadoDTO);

      addToast({
        variant: 'success',
        title: 'Sucesso!',
        description: 'Agradecimento registrado com sucesso!',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível registrar o agradecimento',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="mensagem"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mensagem de Agradecimento *
        </label>
        <Textarea
          id="mensagem"
          {...register('mensagem')}
          placeholder="Escreva sua mensagem de agradecimento (mínimo 10 caracteres)..."
          error={errors.mensagem?.message}
          rows={4}
        />
        {errors.mensagem && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.mensagem.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          10-500 caracteres
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="publico"
          {...register('publico')}
          defaultChecked={true}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="publico"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Tornar este agradecimento público
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={createObrigado.isPending}
          disabled={createObrigado.isPending}
        >
          {createObrigado.isPending ? 'Registrando...' : 'Registrar Agradecimento'}
        </Button>
      </div>
    </form>
  );
}

