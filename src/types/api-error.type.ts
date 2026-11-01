/** Formato de erro padronizado, montado pelo interceptor a partir da resposta do backend. */
export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
