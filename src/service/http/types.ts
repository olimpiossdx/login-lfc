// Definições de Tipos e Interfaces para o Serviço HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IApiError {
  code: string;
  message: string;
  details?: any;
}

export interface IApiNotification {
  status: 'success' | 'error' | 'info' | 'warning';
  campo?: string;
  mensagem: string;
  code?: string;
}

// O Nosso Envelope Padrão (A verdade única da aplicação)
export interface IApiResponse<T = any> {
  data: T | null;
  error: IApiError | null;
  isSuccess: boolean;
  status: number;
  headers: Headers;
  notifications: IApiNotification[];
  request?: {
   url?: string;
   method?: HttpMethod;
  };
}

// Assinatura do Adaptador
export type ResponseAdapter = <T>(response: Response, body: any) => IApiResponse<T>;

// Configuração Global da Instância (Construtor)
export interface HttpClientOptions {
  baseURL?: string;
  headers?: Record<string, string>;

  // O padrão que esta instância vai usar sempre
  defaultAdapter?: ResponseAdapter;

  // Defaults de resiliência
  defaultRetries?: number;
  defaultRetryDelay?: number;  
  defaultCredentials?: RequestCredentials;
}

export interface HttpRequestConfig extends RequestInit {
  baseURL?: string;
  url?: string; // URL completa ou relativa (Injetada pelo HttpClient)
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;

  // Features DX
  notifyOnError?: boolean;

  // Resiliência
  retries?: number;
  retryDelay?: number;
  retryBackoff?: boolean;

  // Estratégia de Parsing
  adapter?: ResponseAdapter;
}

export type RequestInterceptor = (config: HttpRequestConfig) => Promise<HttpRequestConfig> | HttpRequestConfig;
export type ResponseInterceptor = (response: IApiResponse) => Promise<IApiResponse> | IApiResponse;
