import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { SessionService } from './session.service';

describe('authGuard', () => {
  let session: jasmine.SpyObj<SessionService>;
  const loginTree = new UrlTree();

  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['isAuthenticated', 'clear']);
    const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue(loginTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('permite o acesso com sessão válida', () => {
    session.isAuthenticated.and.returnValue(true);

    expect(run()).toBeTrue();
  });

  it('redireciona para o login e limpa a sessão quando inválida', () => {
    session.isAuthenticated.and.returnValue(false);

    expect(run()).toBe(loginTree);
    expect(session.clear).toHaveBeenCalled();
  });
});
