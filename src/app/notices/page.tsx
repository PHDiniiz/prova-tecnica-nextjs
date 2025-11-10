'use client';

import { NoticeList } from '@/components/features/notice/NoticeList';

/**
 * Página pública de avisos
 * Exibe apenas avisos ativos
 */
export default function NoticesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Avisos e Comunicados</h1>
          <p className="text-gray-600 mt-1">Fique por dentro das últimas informações</p>
        </div>

        <NoticeList publico={true} />
      </div>
    </div>
  );
}

