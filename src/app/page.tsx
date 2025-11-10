import Link from 'next/link';
import { Card } from '@/components/ui/card';

/**
 * Página inicial da Plataforma de Gestão para Grupos de Networking
 * 
 * Apresenta a plataforma e direciona usuários para as principais funcionalidades:
 * - Formulário de intenção de participação
 * - Área de indicações
 * - Avisos e comunicados
 * - Reuniões
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Plataforma de Networking
          </h1>
          <nav className="flex gap-4">
            <Link
              href="/intention"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Quero Participar
            </Link>
            <Link
              href="/notices"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Avisos
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Plataforma de Gestão para
            <br />
            <span className="text-blue-600 dark:text-blue-400">Grupos de Networking</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Sistema completo para digitalizar e otimizar a gestão de grupos de networking,
            eliminando planilhas e controles manuais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/intention"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 px-8 py-6 text-base"
            >
              Quero Participar do Grupo
            </Link>
            <Link
              href="/notices"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-8 py-6 text-base"
            >
              Ver Avisos e Comunicados
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Gestão de Membros
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Fluxo completo de admissão: intenção, aprovação e cadastro de novos membros.
              </p>
            </div>
            <Link
              href="/intention"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 text-sm"
            >
              Participar →
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Sistema de Indicações
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Crie e acompanhe indicações de negócios entre membros do grupo.
              </p>
            </div>
            <Link
              href="/referrals"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 text-sm"
            >
              Ver Indicações →
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Avisos e Comunicados
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Mantenha-se informado sobre eventos, reuniões e novidades do grupo.
              </p>
            </div>
            <Link
              href="/notices"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 text-sm"
            >
              Ver Avisos →
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Reuniões
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Agende e gerencie reuniões 1:1 entre membros do grupo.
              </p>
            </div>
            <Link
              href="/meetings"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 text-sm"
            >
              Ver Reuniões →
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                UI Otimista
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Feedback instantâneo e atualizações em tempo real para melhor experiência.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Mobile First
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Design responsivo e otimizado para todos os dispositivos.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Pronto para fazer parte do grupo?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Preencha o formulário de intenção e aguarde a aprovação dos administradores.
            </p>
            <Link
              href="/intention"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 px-6 py-3 text-lg"
            >
              Preencher Formulário de Intenção
            </Link>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Plataforma de Gestão para Grupos de Networking
            <br />
            Desenvolvido com ❤️ pela equipe Durch Soluções
          </p>
        </div>
      </footer>
    </div>
  );
}
