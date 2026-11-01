import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SessionService } from './session.service';

function fakeToken(expSecondsFromNow: number): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }));
  return `header.${payload}.signature`;
}

describe('SessionService', () => {
  let service: SessionService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: router }] });
    service = TestBed.inject(SessionService);
  });

  afterEach(() => sessionStorage.clear());

  it('guarda e expõe os dados da sessão', () => {
    service.start({ token: 't', id: 'u1', name: 'Maria Souza' });

    expect(service.token).toBe('t');
    expect(service.userId).toBe('u1');
    expect(service.userName).toBe('Maria Souza');
    expect(service.firstName).toBe('Maria');
  });

  it('retorna valores vazios sem sessão', () => {
    expect(service.token).toBeNull();
    expect(service.firstName).toBe('');
  });

  it('considera autenticado apenas com token válido e não expirado', () => {
    expect(service.isAuthenticated()).toBeFalse();

    service.start({ token: fakeToken(3600), id: 'u1', name: 'A' });
    expect(service.isAuthenticated()).toBeTrue();

    service.start({ token: fakeToken(-60), id: 'u1', name: 'A' });
    expect(service.isAuthenticated()).toBeFalse();

    service.start({ token: 'lixo', id: 'u1', name: 'A' });
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('clear remove a sessão e dados pessoais antigos do localStorage', () => {
    service.start({ token: 't', id: 'u1', name: 'A' });
    localStorage.setItem('healthDefaults', '{}');
    localStorage.setItem('user-email', 'a@a.com');

    service.clear();

    expect(service.token).toBeNull();
    expect(localStorage.getItem('healthDefaults')).toBeNull();
    expect(localStorage.getItem('user-email')).toBeNull();
  });

  it('updateName troca o nome exibido sem afetar o resto da sessão', () => {
    service.start({ token: 't', id: 'u1', name: 'Maria Souza' });

    service.updateName('Ana Lima');

    expect(service.firstName).toBe('Ana');
    expect(service.token).toBe('t');
    expect(service.userId).toBe('u1');
  });

  it('logout limpa a sessão e navega para o login', () => {
    service.start({ token: 't', id: 'u1', name: 'A' });

    service.logout();

    expect(service.token).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
