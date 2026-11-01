import { HttpErrorResponse } from '@angular/common/http';
import { describeError, isApiError, toApiError } from './api-error';

describe('api-error', () => {
  it('toApiError usa o corpo JSON do backend', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { status: 409, message: 'E-mail já cadastrado' },
    });

    expect(toApiError(error)).toEqual({
      status: 409,
      message: 'E-mail já cadastrado',
      fieldErrors: undefined,
    });
  });

  it('toApiError usa mensagem genérica quando o corpo não é JSON', () => {
    const error = new HttpErrorResponse({ status: 500, error: 'Internal Server Error' });

    expect(toApiError(error).message).toContain('erro inesperado');
  });

  it('isApiError reconhece apenas objetos no formato esperado', () => {
    expect(isApiError({ status: 400, message: 'x' })).toBeTrue();
    expect(isApiError(new Error('x'))).toBeFalse();
    expect(isApiError(null)).toBeFalse();
  });

  it('describeError inclui os erros por campo', () => {
    const error = {
      status: 400,
      message: 'Dados inválidos',
      fieldErrors: { password: 'A senha deve ter no mínimo 6 caracteres' },
    };

    expect(describeError(error)).toBe('Dados inválidos: A senha deve ter no mínimo 6 caracteres');
  });

  it('describeError usa o fallback para erros desconhecidos', () => {
    expect(describeError(new Error('x'), 'falhou')).toBe('falhou');
  });
});
