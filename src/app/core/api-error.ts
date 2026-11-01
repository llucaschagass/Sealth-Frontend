import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../types/api-error.type';

const NETWORK_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const GENERIC_ERROR = 'Ocorreu um erro inesperado. Tente novamente.';

export function toApiError(error: HttpErrorResponse): ApiError {
  if (error.status === 0) {
    return { status: 0, message: NETWORK_ERROR };
  }
  const body = error.error as Partial<ApiError> | null;
  return {
    status: error.status,
    message: body?.message ?? GENERIC_ERROR,
    fieldErrors: body?.fieldErrors,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'status' in value && 'message' in value;
}

/** Mensagem pronta para exibir ao usuário, incluindo erros por campo quando existirem. */
export function describeError(error: unknown, fallback = GENERIC_ERROR): string {
  if (!isApiError(error)) {
    return fallback;
  }
  const details = Object.values(error.fieldErrors ?? {});
  return details.length > 0 ? `${error.message}: ${details.join('; ')}` : error.message;
}
