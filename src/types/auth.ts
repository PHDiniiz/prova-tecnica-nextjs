/**
 * Tipos e interfaces para autenticação JWT
 */

/**
 * Payload do access token JWT
 */
export interface AccessTokenPayload {
  membroId: string;
  email: string;
  isActive: boolean;
  type: 'access';
}

/**
 * Payload do refresh token JWT
 */
export interface RefreshTokenPayload {
  membroId: string;
  email: string;
  type: 'refresh';
}

/**
 * Token decodificado após verificação
 */
export interface DecodedToken extends AccessTokenPayload {
  iat?: number;
  exp?: number;
}

/**
 * DTO para login
 */
export interface LoginDTO {
  email: string;
  password?: string; // Para futuro uso com senha
}

/**
 * Resposta de login
 */
export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  membro: {
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
  };
}

/**
 * DTO para refresh token
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * Resposta de refresh token
 */
export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
}

