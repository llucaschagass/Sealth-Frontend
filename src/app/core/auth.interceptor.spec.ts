import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiError } from '../../types/api-error.type';
import { authInterceptor } from './auth.interceptor';
import { SessionService } from './session.service';

describe('authInterceptor', () => {
  const api = environment.apiUrl;
  let http: HttpClient;
  let controller: HttpTestingController;
  let session: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['logout'], {
      token: 'abc',
    });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: session },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('anexa o token às rotas protegidas da API', () => {
    http.get(`${api}/appointments/all`).subscribe();

    const req = controller.expectOne(`${api}/appointments/all`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('não anexa token em /auth/', () => {
    http.post(`${api}/auth/login`, {}).subscribe();

    const req = controller.expectOne(`${api}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('não anexa token em URLs externas', () => {
    http.get('https://outro-site.com/dados').subscribe();

    const req = controller.expectOne('https://outro-site.com/dados');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('converte o erro do backend em ApiError', () => {
    let error: ApiError | undefined;
    http.post(`${api}/auth/register`, {}).subscribe({ error: (e) => (error = e) });

    controller
      .expectOne(`${api}/auth/register`)
      .flush(
        { status: 400, message: 'Dados inválidos', fieldErrors: { email: 'E-mail inválido' } },
        { status: 400, statusText: 'Bad Request' },
      );

    expect(error).toEqual({
      status: 400,
      message: 'Dados inválidos',
      fieldErrors: { email: 'E-mail inválido' },
    });
  });

  it('encerra a sessão ao receber 401 em rota protegida', () => {
    http.get(`${api}/appointments/all`).subscribe({ error: () => undefined });

    controller
      .expectOne(`${api}/appointments/all`)
      .flush({ message: 'Não autenticado' }, { status: 401, statusText: 'Unauthorized' });

    expect(session.logout).toHaveBeenCalled();
  });

  it('não encerra a sessão em 401 de login (credenciais erradas)', () => {
    let error: ApiError | undefined;
    http.post(`${api}/auth/login`, {}).subscribe({ error: (e) => (error = e) });

    controller
      .expectOne(`${api}/auth/login`)
      .flush({ message: 'E-mail ou senha inválidos' }, { status: 401, statusText: 'Unauthorized' });

    expect(session.logout).not.toHaveBeenCalled();
    expect(error?.message).toBe('E-mail ou senha inválidos');
  });

  it('devolve mensagem amigável quando o servidor está fora do ar', () => {
    let error: ApiError | undefined;
    http.get(`${api}/health/defaults`).subscribe({ error: (e) => (error = e) });

    controller.expectOne(`${api}/health/defaults`).error(new ProgressEvent('error'));

    expect(error?.status).toBe(0);
    expect(error?.message).toContain('conectar ao servidor');
  });
});
