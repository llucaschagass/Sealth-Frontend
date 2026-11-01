import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SessionService } from '../core/session.service';
import { UserService } from './user.service';

describe('UserService', () => {
  const base = `${environment.apiUrl}/user`;
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', [], { userId: 'u1' }),
        },
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca o usuário logado com GET /user/{id}', () => {
    service.getUserData().subscribe();

    const req = http.expectOne(`${base}/u1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'u1', name: 'Maria', email: 'maria@x.com' });
  });

  it('atualiza com PUT /user/update/{id} enviando só o que mudou', () => {
    service.updateUserData({ name: 'Maria S.' }).subscribe();

    const req = http.expectOne(`${base}/update/u1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Maria S.' });
    req.flush({ id: 'u1', name: 'Maria S.', email: 'maria@x.com' });
  });
});
