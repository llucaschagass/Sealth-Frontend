import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SessionService } from '../core/session.service';
import { LoginService } from './login.service';

describe('LoginService', () => {
  const response = { token: 'abc', id: 'u1', name: 'Maria Souza' };
  let service: LoginService;
  let http: HttpTestingController;
  let session: jasmine.SpyObj<SessionService>;

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['start']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: session },
      ],
    });
    service = TestBed.inject(LoginService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login: POST /auth/login e inicia a sessão com a resposta', () => {
    service.login('maria@x.com', '123456').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'maria@x.com', password: '123456' });
    req.flush(response);

    expect(session.start).toHaveBeenCalledWith(response);
  });

  it('signup: POST /auth/register e já inicia a sessão', () => {
    service.signup('Maria Souza', 'maria@x.com', '123456').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({
      name: 'Maria Souza',
      email: 'maria@x.com',
      password: '123456',
    });
    req.flush(response);

    expect(session.start).toHaveBeenCalledWith(response);
  });

  it('não inicia sessão quando o login falha', () => {
    service.login('maria@x.com', 'errada').subscribe({ error: () => undefined });

    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ message: 'inválido' }, { status: 401, statusText: 'Unauthorized' });

    expect(session.start).not.toHaveBeenCalled();
  });
});
