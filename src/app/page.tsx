import Link from 'next/link';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Componente ButtonLink - Link estilizado como Button
 */
function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: {
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
} & React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variant === 'primary' &&
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        variant === 'secondary' &&
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        variant === 'outline' &&
          'border-2 border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        variant === 'ghost' &&
          'text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Plataforma de Networking
          </h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/intention"
              prefetch={true}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Quero Participar
            </Link>
            <Link
              href="/notices"
              prefetch={true}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Avisos
            </Link>
            <Link
              href="/admin/dashboard"
              className={cn(
                'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'border-2 border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
                'px-3 py-1.5 text-sm'
              )}
            >
              <User className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Plataforma de Gestão para
            <br />
            <span className="text-primary">Grupos de Networking</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo para digitalizar e otimizar a gestão de grupos de networking,
            eliminando planilhas e controles manuais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/intention" variant="primary" size="lg" prefetch={true}>
              Quero Participar do Grupo
            </ButtonLink>
            <ButtonLink href="/notices" variant="outline" size="lg" prefetch={true}>
              Ver Avisos e Comunicados
            </ButtonLink>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Gestão de Membros
              </h3>
              <p className="text-muted-foreground">
                Fluxo completo de admissão: intenção, aprovação e cadastro de novos membros.
              </p>
            </div>
            <ButtonLink href="/intention" variant="ghost" size="sm">
              Participar →
            </ButtonLink>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Sistema de Indicações
              </h3>
              <p className="text-muted-foreground">
                Crie e acompanhe indicações de negócios entre membros do grupo.
              </p>
            </div>
            <ButtonLink href="/referrals" variant="ghost" size="sm">
              Ver Indicações →
            </ButtonLink>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Avisos e Comunicados
              </h3>
              <p className="text-muted-foreground">
                Mantenha-se informado sobre eventos, reuniões e novidades do grupo.
              </p>
            </div>
            <ButtonLink href="/notices" variant="ghost" size="sm">
              Ver Avisos →
            </ButtonLink>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Reuniões
              </h3>
              <p className="text-muted-foreground">
                Agende e gerencie reuniões 1:1 entre membros do grupo.
              </p>
            </div>
            <ButtonLink href="/meetings" variant="ghost" size="sm">
              Ver Reuniões →
            </ButtonLink>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                UI Otimista
              </h3>
              <p className="text-muted-foreground">
                Feedback instantâneo e atualizações em tempo real para melhor experiência.
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-destructive"
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
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Mobile First
              </h3>
              <p className="text-muted-foreground">
                Design responsivo e otimizado para todos os dispositivos.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Pronto para fazer parte do grupo?
            </h3>
            <p className="text-muted-foreground mb-6">
              Preencha o formulário de intenção e aguarde a aprovação dos administradores.
            </p>
            <ButtonLink href="/intention" variant="primary" size="lg">
              Preencher Formulário de Intenção
            </ButtonLink>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Plataforma de Gestão para Grupos de Networking
            <br />
            Desenvolvido com ❤️ por Pedro Henrique Diniz &lt;Durch Soluções&gt;
          </p>
        </div>
      </footer>
    </div>
  );
}
