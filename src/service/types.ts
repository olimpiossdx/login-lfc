// Tipos do padrão de resposta da API
export type TypeResponseStatus = 'success' | 'erro';
export type TypeNotificationStatus = 'error' | 'warning' | 'success';

export interface INotification {
  mensagem: string;
  status: TypeNotificationStatus;
  campo?: string;
}

/**
 * O objeto User (retornado pela API)
 */
export interface User {
  id: number | string;
  username: string; // ou email
  name: string;
  // ...outros campos como 'roles', 'avatarUrl', etc.
}

/**
 * Os "Metadados Legíveis" que o backend retorna no body
 * e que o AuthManager armazena no localStorage.
 */
export interface AuthMetadata {
  user: User;
  accessTokenExpiresAt: number;  // Timestamp em milissegundos
  refreshTokenExpiresAt: number; // Timestamp em milissegundos
}

export interface IResponse<T = any> {
  data: T;
  status: TypeResponseStatus;
  notificacoes: INotification[];
}

// Objeto de retorno padronizado da nossa camada de serviço para a UI
export interface IApiResponse<T> {
  data: T | null;
  error: ApiBusinessError | null;
  success: boolean;
}

// Classe de Erro unificada que a UI sempre receberá
export class ApiBusinessError extends Error {
  public readonly notifications: INotification[];

  constructor(notifications: INotification[]) {
    const message = notifications.find(n => n.status === 'error')?.mensagem || 'Erro de negócio da API.';
    super(message);
    this.name = 'ApiBusinessError';
    this.notifications = notifications;
  }
}

// Tipos de dados da aplicação
export interface Imovel {
  id: string;
  name: string;
  value: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  logradouro: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  cpfCnpj: string;
  urlImage: string | null;
  tipoCpfCnpj: 'cpf' | 'cnpj';
  imoveis: Imovel[];
}

export interface AuthResponse {
  id: number;
  nome: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  userName?: string;
  password?: string;
}