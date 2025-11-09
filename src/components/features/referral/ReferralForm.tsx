'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReferrals } from '@/hooks/useReferrals';
import { CriarIndicacaoDTO } from '@/types/referral';
import { Member } from '@/types/member';

/**
 * Schema de validação para o formulário
 */
const referralFormSchema = z.object({
  membroIndicadoId: z.string().min(1, 'Selecione um membro'),
  empresaContato: z
    .string()
    .min(2, 'Empresa/Contato deve ter pelo menos 2 caracteres')
    .max(100, 'Empresa/Contato deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  valorEstimado: z
    .number()
    .min(1000, 'Valor estimado deve ser no mínimo R$ 1.000')
    .max(10000000, 'Valor estimado deve ser no máximo R$ 10.000.000')
    .optional()
    .or(z.literal('')),
  observacoes: z
    .string()
    .max(500, 'Observações deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type ReferralFormData = z.infer<typeof referralFormSchema>;

interface ReferralFormProps {
  membroId: string;
  membrosAtivos: Member[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Componente de formulário para criar indicação
 */
export function ReferralForm({
  membroId,
  membrosAtivos,
  onSuccess,
  onCancel,
}: ReferralFormProps) {
  const {
    criarIndicacao,
    isCreating,
    isCreateSuccess,
    isCreateError,
    createError,
    resetCreate,
  } = useReferrals(membroId);

  // Filtra membros ativos excluindo o próprio membro
  const membrosDisponiveis = useMemo(
    () => membrosAtivos.filter((m) => m._id !== membroId && m.ativo),
    [membrosAtivos, membroId]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
    setValue,
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralFormSchema),
    defaultValues: {
      membroIndicadoId: '',
      empresaContato: '',
      descricao: '',
      valorEstimado: undefined,
      observacoes: '',
    },
  });

  const valorEstimado = watch('valorEstimado');

  // Converte valorEstimado para número quando necessário
  useEffect(() => {
    if (valorEstimado === '') {
      setValue('valorEstimado', undefined);
    }
  }, [valorEstimado, setValue]);

  /**
   * Handler de submit do formulário
   */
  const onSubmit = useCallback(
    async (data: ReferralFormData) => {
      try {
        const dto: CriarIndicacaoDTO = {
          membroIndicadoId: data.membroIndicadoId.trim(),
          empresaContato: data.empresaContato.trim(),
          descricao: data.descricao.trim(),
          valorEstimado:
            data.valorEstimado && typeof data.valorEstimado === 'number'
              ? data.valorEstimado
              : undefined,
          observacoes: data.observacoes?.trim() || undefined,
        };

        await criarIndicacao(dto);
        resetForm();
        onSuccess?.();
      } catch (err) {
        // Erro já é tratado pelo hook
        console.error('Erro ao criar indicação:', err);
      }
    },
    [criarIndicacao, resetForm, onSuccess]
  );

  // Reset do formulário quando sucesso
  useEffect(() => {
    if (isCreateSuccess) {
      resetForm();
      resetCreate();
    }
  }, [isCreateSuccess, resetForm, resetCreate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Nova Indicação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Seleção de membro indicado */}
            <div>
              <label
                htmlFor="membroIndicadoId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Membro Indicado <span className="text-red-500">*</span>
              </label>
              <select
                id="membroIndicadoId"
                {...register('membroIndicadoId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um membro</option>
                {membrosDisponiveis.map((membro) => (
                  <option key={membro._id} value={membro._id}>
                    {membro.nome} - {membro.empresa}
                  </option>
                ))}
              </select>
              {errors.membroIndicadoId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.membroIndicadoId.message}
                </p>
              )}
              {membrosDisponiveis.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  Nenhum membro ativo disponível para indicação
                </p>
              )}
            </div>

            {/* Empresa/Contato */}
            <div>
              <label
                htmlFor="empresaContato"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Empresa/Contato <span className="text-red-500">*</span>
              </label>
              <Input
                id="empresaContato"
                {...register('empresaContato')}
                placeholder="Nome da empresa ou contato"
                error={errors.empresaContato?.message}
              />
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="descricao"
                {...register('descricao')}
                placeholder="Descreva a oportunidade de negócio..."
                rows={5}
                error={errors.descricao?.message}
              />
            </div>

            {/* Valor Estimado */}
            <div>
              <label
                htmlFor="valorEstimado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Valor Estimado (opcional)
              </label>
              <Input
                id="valorEstimado"
                type="number"
                {...register('valorEstimado', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v)),
                })}
                placeholder="R$ 0,00"
                min={1000}
                max={10000000}
                step={1000}
                error={errors.valorEstimado?.message}
                helperText="Mínimo: R$ 1.000 | Máximo: R$ 10.000.000"
              />
            </div>

            {/* Observações */}
            <div>
              <label
                htmlFor="observacoes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Observações (opcional)
              </label>
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Informações adicionais sobre a indicação..."
                rows={3}
                maxLength={500}
                error={errors.observacoes?.message}
              />
            </div>

            {/* Mensagens de erro */}
            {isCreateError && createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {createError.message || 'Erro ao criar indicação'}
                </p>
              </div>
            )}

            {/* Mensagem de sucesso */}
            {isCreateSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <p className="text-sm text-green-600">
                  Indicação criada com sucesso!
                </p>
              </motion.div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isCreating}
                disabled={isCreating || membrosDisponiveis.length === 0}
                className="flex-1"
              >
                Criar Indicação
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

