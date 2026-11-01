import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { toApiError } from './api-error';
import { SessionService } from './session.service';

const PUBLIC_PATH = '/auth/';

/**
 * Anexa o token às chamadas à API, converte erros HTTP em ApiError
 * e encerra a sessão quando o backend responde 401 numa rota protegida.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const session = inject(SessionService);
  const isPublic = req.url.includes(PUBLIC_PATH);
  const token = session.token;
  const request =
    token && !isPublic ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublic) {
        session.logout();
      }
      return throwError(() => toApiError(error));
    }),
  );
};
