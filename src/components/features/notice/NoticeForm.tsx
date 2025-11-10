'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import { useCreateNotice, useUpdateNotice } from '@/hooks/useNotices';
import { useToast } from '@/components/ui/toast';
import { Notice, CriarNoticeDTO, AtualizarNoticeDTO } from '@/types/notice';

/**
 * Schema de validação do formulário
 */
const noticeFormSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  conteudo: z
    .string()
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(2000, 'Conteúdo deve ter no máximo 2000 caracteres'),
  tipo: z.enum(['info', 'warning', 'success', 'urgent']),
  ativo: z.boolean().default(true),
});

type NoticeFormData = z.infer<typeof noticeFormSchema>;

/**
 * Props do componente NoticeForm
 */
interface NoticeFormProps {
  notice?: Notice; // Se fornecido, é edição
  adminToken: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Componente de formulário para criar/editar aviso
 * Implementa UI otimista com validação em tempo real
 * 
 * @example
 * ```tsx
 * // Criar novo
 * <NoticeForm 
 *   adminToken={token}
 *   onSuccess={() => console.log('Criado!')}
 * />
 * 
 * // Editar existente
 * <NoticeForm 
 *   notice={avisoExistente}
 *   adminToken={token}
 *   onSuccess={() => console.log('Atualizado!')}
 * />
 * ```
 */
export function NoticeForm({ notice, adminToken, onSuccess, onCancel }: NoticeFormProps) {
  const { addToast } = useToast();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();

  const isEditMode = !!notice;

  const form = useForm<NoticeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(noticeFormSchema) as any,
    defaultValues: {
      titulo: notice?.titulo || '',
      conteudo: notice?.conteudo || '',
      tipo: notice?.tipo || 'info',
      ativo: notice?.ativo ?? true,
    },
  });

  const onSubmit = async (data: NoticeFormData) => {
    try {
      if (isEditMode) {
        const dto: AtualizarNoticeDTO = {
          titulo: data.titulo,
          conteudo: data.conteudo,
          tipo: data.tipo,
          ativo: data.ativo,
        };

        await updateNotice.mutateAsync({
          id: notice._id!,
          dto,
          adminToken,
        });

        addToast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Aviso atualizado com sucesso!',
        });
      } else {
        const dto: CriarNoticeDTO = {
          titulo: data.titulo,
          conteudo: data.conteudo,
          tipo: data.tipo,
          ativo: data.ativo,
        };

        await createNotice.mutateAsync({
          ...dto,
          adminToken,
        });

        addToast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Aviso criado com sucesso!',
        });
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : `Não foi possível ${isEditMode ? 'atualizar' : 'criar'} o aviso`,
      });
    }
  };

  const isLoading = createNotice.isPending || updateNotice.isPending;

  return (
    <Form
      schema={noticeFormSchema}
      defaultValues={form.formState.defaultValues}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {(methods) => (
        <>
          <FormField
            control={methods.control}
            name="titulo"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Título</FormLabel>
                <Input
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  placeholder="Digite o título do aviso"
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="conteudo"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Conteúdo</FormLabel>
                <Textarea
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  placeholder="Digite o conteúdo do aviso"
                  rows={6}
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="tipo"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Tipo</FormLabel>
                <select
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Informação</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Aviso</option>
                  <option value="urgent">Urgente</option>
                </select>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="ativo"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.value as boolean}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <FormLabel>Aviso ativo</FormLabel>
              </div>
            )}
          />

          <div className="flex gap-2 justify-end pt-4">
            {onCancel && (
              <Button type="button" onClick={onCancel} variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}

