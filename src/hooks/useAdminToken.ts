'use client';

import { useState, useEffect } from 'react';

/**
 * Hook useAdminToken
 * 
 * Retorna o token de administrador armazenado no localStorage.
 * Garante que só acessa localStorage após montagem no cliente.
 * Inclui estado de carregamento para evitar requisições antes do token estar disponível.
 */
export function useAdminToken(): string {
  const [adminToken, setAdminToken] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setAdminToken(storedToken);
    }
  }, []);

  // Retorna string vazia até que o componente esteja montado
  // Isso evita que requisições sejam feitas antes do token estar disponível
  if (!isMounted) {
    return '';
  }

  return adminToken;
}

