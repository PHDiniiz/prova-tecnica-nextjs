'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useIntentions } from '@/hooks/useIntentions';
import { CriarIntencaoDTO } from '@/types/intention';

/**
 * Schema de validação para o formulário
 */
const intentionFormSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  empresa: z
    .string()
    .min(2, 'Empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Empresa deve ter no máximo 100 caracteres'),
  motivo: z
    .string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(1000, 'Motivo deve ter no máximo 1000 caracteres'),
});

type IntentionFormData = z.infer<typeof intentionFormSchema>;

/**
 * Componente de formulário para criar intenção de participação
 */
export function IntentionForm() {
  const {
    criarIntencao,
    isCreating,
    isCreateSuccess,
    isCreateError,
    createError,
    resetCreate,
  } = useIntentions(undefined, 1, 20, undefined);

  const [validationStep, setValidationStep] = useState<'idle' | 'validating' | 'sending'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<IntentionFormData>({
    resolver: zodResolver(intentionFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      empresa: '',
      motivo: '',
    },
  });

  /**
   * Handler de submit do formulário
   */
  const onSubmit = useCallback(
    async (data: IntentionFormData) => {
      try {
        setValidationStep('validating');
        // Simula validação rápida
        await new Promise((resolve) => setTimeout(resolve, 300));

        setValidationStep('sending');
        const dto: CriarIntencaoDTO = {
          nome: data.nome.trim(),
          email: data.email.trim().toLowerCase(),
          empresa: data.empresa.trim(),
          motivo: data.motivo.trim(),
        };

        await criarIntencao(dto);
        resetForm();
        setValidationStep('idle');
      } catch (err) {
        // Erro já é tratado pelo hook
        console.error('Erro ao criar intenção:', err);
        setValidationStep('idle');
      }
    },
    [criarIntencao, resetForm]
  );

  /**
   * Handler para resetar o estado de sucesso
   */
  const handleResetSuccess = useCallback(() => {
    resetCreate();
  }, [resetCreate]);

  return (
    <Card variant="default" className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Solicitar Participação no Grupo
        </CardTitle>
        <p className="text-center text-gray-600 mt-2">
          Preencha o formulário abaixo para solicitar sua participação no grupo
          de networking
        </p>
      </CardHeader>
      <CardContent>
        {isCreateSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-800 font-medium">
              ✓ Intenção criada com sucesso! Aguarde a análise do
              administrador.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSuccess}
              className="mt-2 text-green-700 hover:text-green-800"
            >
              Enviar outra solicitação
            </Button>
          </motion.div>
        )}

        {isCreateError && createError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800 font-medium">
              ✗ {createError.message || 'Erro ao criar intenção. Tente novamente.'}
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {(validationStep === 'validating' || validationStep === 'sending') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {validationStep === 'validating' ? 'Validando dados...' : 'Enviando solicitação...'}
                  </span>
                </div>
                <Progress variant="default" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Seu nome completo"
            error={errors.nome?.message}
            {...register('nome')}
            disabled={isCreating || isCreateSuccess || validationStep !== 'idle'}
          />

          <Input
            label="Email *"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            helperText="Usaremos este email para contato"
            {...register('email')}
            disabled={isCreating || isCreateSuccess || validationStep !== 'idle'}
          />

          <Input
            label="Empresa *"
            placeholder="Nome da sua empresa"
            error={errors.empresa?.message}
            {...register('empresa')}
            disabled={isCreating || isCreateSuccess || validationStep !== 'idle'}
          />

          <Textarea
            label="Motivo da Participação *"
            placeholder="Conte-nos por que você deseja participar do grupo..."
            error={errors.motivo?.message}
            helperText="Mínimo de 10 caracteres"
            rows={6}
            {...register('motivo')}
            disabled={isCreating || isCreateSuccess || validationStep !== 'idle'}
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isCreating || validationStep !== 'idle'}
              disabled={isCreateSuccess || validationStep !== 'idle'}
              className="w-full"
            >
              {validationStep === 'validating'
                ? 'Validando...'
                : validationStep === 'sending'
                  ? 'Enviando...'
                  : isCreating
                    ? 'Enviando...'
                    : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

