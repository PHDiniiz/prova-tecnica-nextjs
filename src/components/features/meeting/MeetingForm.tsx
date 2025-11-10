'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/useMeetings';
import { useToast } from '@/components/ui/toast';
import { Meeting, CriarMeetingDTO, AtualizarMeetingDTO } from '@/types/meeting';
import { Member } from '@/types/member';

/**
 * Schema de validação do formulário
 */
const meetingFormSchema = z.object({
  membro1Id: z.string().min(1, 'Membro 1 é obrigatório'),
  membro2Id: z.string().min(1, 'Membro 2 é obrigatório'),
  dataReuniao: z.string().min(1, 'Data da reunião é obrigatória'),
  local: z.string().max(200, 'Local deve ter no máximo 200 caracteres').optional(),
  observacoes: z.string().max(1000, 'Observações deve ter no máximo 1000 caracteres').optional(),
});

type MeetingFormData = z.infer<typeof meetingFormSchema>;

/**
 * Props do componente MeetingForm
 */
interface MeetingFormProps {
  meeting?: Meeting; // Se fornecido, é edição
  membrosAtivos: Member[];
  membroToken: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Componente de formulário para criar/editar reunião
 * Implementa UI otimista com validação em tempo real
 * 
 * @example
 * ```tsx
 * <MeetingForm 
 *   membrosAtivos={membros}
 *   membroToken={token}
 *   onSuccess={() => console.log('Criada!')}
 * />
 * ```
 */
export function MeetingForm({
  meeting,
  membrosAtivos,
  membroToken,
  onSuccess,
  onCancel,
}: MeetingFormProps) {
  const { addToast } = useToast();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();

  const isEditMode = !!meeting;

  // Formatar data para input type="datetime-local"
  const formatarDataParaInput = (data: Date | string | undefined): string => {
    if (!data) return '';
    const date = typeof data === 'string' ? new Date(data) : data;
    if (isNaN(date.getTime())) return '';
    
    // Formato: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      membro1Id: meeting?.membro1Id || '',
      membro2Id: meeting?.membro2Id || '',
      dataReuniao: formatarDataParaInput(meeting?.dataReuniao),
      local: meeting?.local || '',
      observacoes: meeting?.observacoes || '',
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    try {
      if (isEditMode) {
        const dto: AtualizarMeetingDTO = {
          dataReuniao: new Date(data.dataReuniao),
          local: data.local || undefined,
          observacoes: data.observacoes || undefined,
        };

        await updateMeeting.mutateAsync({
          id: meeting._id!,
          dto,
          membroToken,
        });

        addToast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Reunião atualizada com sucesso!',
        });
      } else {
        const dto: CriarMeetingDTO = {
          membro1Id: data.membro1Id,
          membro2Id: data.membro2Id,
          dataReuniao: new Date(data.dataReuniao),
          local: data.local || undefined,
          observacoes: data.observacoes || undefined,
        };

        await createMeeting.mutateAsync({
          ...dto,
          membroToken,
        });

        addToast({
          variant: 'success',
          title: 'Sucesso!',
          description: 'Reunião criada com sucesso!',
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
            : `Não foi possível ${isEditMode ? 'atualizar' : 'criar'} a reunião`,
      });
    }
  };

  const isLoading = createMeeting.isPending || updateMeeting.isPending;

  return (
    <Form
      schema={meetingFormSchema}
      defaultValues={form.formState.defaultValues}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {(methods) => (
        <>
          <FormField
            control={methods.control}
            name="membro1Id"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Membro 1</FormLabel>
                <select
                  {...field}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione um membro</option>
                  {membrosAtivos.map((membro) => (
                    <option key={membro._id} value={membro._id}>
                      {membro.nome} - {membro.empresa}
                    </option>
                  ))}
                </select>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="membro2Id"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Membro 2</FormLabel>
                <select
                  {...field}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione um membro</option>
                  {membrosAtivos.map((membro) => (
                    <option key={membro._id} value={membro._id}>
                      {membro.nome} - {membro.empresa}
                    </option>
                  ))}
                </select>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="dataReuniao"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel required>Data e Hora da Reunião</FormLabel>
                <Input
                  {...field}
                  type="datetime-local"
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="local"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel>Local</FormLabel>
                <Input
                  {...field}
                  placeholder="Ex: Escritório Central, Online, etc."
                  error={fieldState.error?.message}
                />
              </div>
            )}
          />

          <FormField
            control={methods.control}
            name="observacoes"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FormLabel>Observações</FormLabel>
                <Textarea
                  {...field}
                  placeholder="Observações sobre a reunião..."
                  rows={4}
                  error={fieldState.error?.message}
                />
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
              {isLoading ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Criar Reunião'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}

