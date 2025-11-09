'use client';

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CriarMembroDTO } from '@/types/member';

/**
 * Schema de validação para o formulário
 */
const memberFormSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')),
  empresa: z
    .string()
    .min(2, 'Empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Empresa deve ter no máximo 100 caracteres'),
  cargo: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .url('LinkedIn deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  areaAtuacao: z
    .string()
    .max(100, 'Área de atuação deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  initialData?: {
    nome: string;
    email: string;
    empresa: string;
    cargo?: string;
  };
  onSubmit: (data: CriarMembroDTO) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Componente de formulário para cadastro completo de membro
 */
export function MemberForm({
  initialData,
  onSubmit,
  isLoading = false,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: useMemo(
      () => ({
        nome: initialData?.nome || '',
        email: initialData?.email || '',
        empresa: initialData?.empresa || '',
        cargo: initialData?.cargo || '',
        telefone: '',
        linkedin: '',
        areaAtuacao: '',
      }),
      [initialData]
    ),
  });

  const onSubmitForm = useCallback(
    async (data: MemberFormData) => {
      // Remove campos vazios e converte para CriarMembroDTO
      // Nota: token e intencaoId devem ser fornecidos pelo componente pai
      const cleanedData: Partial<CriarMembroDTO> = {
        nome: data.nome,
        email: data.email,
        empresa: data.empresa,
        ...(data.telefone && { telefone: data.telefone }),
        ...(data.cargo && { cargo: data.cargo }),
        ...(data.linkedin && { linkedin: data.linkedin }),
        ...(data.areaAtuacao && { areaAtuacao: data.areaAtuacao }),
      };
      // O componente pai deve adicionar token e intencaoId antes de chamar onSubmit
      await onSubmit(cleanedData as CriarMembroDTO);
    },
    [onSubmit]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete seu Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome Completo *
              </label>
              <Input
                id="nome"
                {...register('nome')}
                error={errors.nome?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefone
              </label>
              <Input
                id="telefone"
                type="tel"
                {...register('telefone')}
                error={errors.telefone?.message}
                disabled={isSubmitting || isLoading}
                placeholder="+55 11 99999-9999"
              />
            </div>

            <div>
              <label
                htmlFor="empresa"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Empresa *
              </label>
              <Input
                id="empresa"
                {...register('empresa')}
                error={errors.empresa?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="cargo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cargo
              </label>
              <Input
                id="cargo"
                {...register('cargo')}
                error={errors.cargo?.message}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                LinkedIn
              </label>
              <Input
                id="linkedin"
                type="url"
                {...register('linkedin')}
                error={errors.linkedin?.message}
                disabled={isSubmitting || isLoading}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>

            <div>
              <label
                htmlFor="areaAtuacao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Área de Atuação
              </label>
              <Input
                id="areaAtuacao"
                {...register('areaAtuacao')}
                error={errors.areaAtuacao?.message}
                disabled={isSubmitting || isLoading}
                placeholder="Ex: Vendas e Marketing"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full"
              >
                {isSubmitting || isLoading
                  ? 'Cadastrando...'
                  : 'Finalizar Cadastro'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

