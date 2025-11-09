import { IntentionForm } from '@/components/features/intention/IntentionForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solicitar Participação | Plataforma de Networking',
  description:
    'Solicite sua participação no grupo de networking e geração de negócios',
};

/**
 * Página pública para solicitar participação no grupo
 * Server Component
 */
export default function IntentionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Junte-se ao Nosso Grupo
          </h1>
          <p className="text-lg text-gray-600">
            Faça parte de uma comunidade de networking e geração de negócios
          </p>
        </div>

        <IntentionForm />
      </div>
    </div>
  );
}

