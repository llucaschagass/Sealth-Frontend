import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { LoginService } from '../../services/login.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: Router;

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['login']);
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: LoginService, useValue: loginService },
        { provide: SessionService, useValue: jasmine.createSpyObj('SessionService', ['clear']) },
        provideRouter([]),
      ],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('não chama a API e marca os campos quando o formulário é inválido', () => {
    component.submit();

    expect(loginService.login).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBeTrue();
  });

  it('entra e vai para a home com credenciais válidas', () => {
    loginService.login.and.returnValue(of({ token: 't', id: '1', name: 'Ana' }));
    component.form.setValue({ email: 'ana@x.com', password: '123456' });

    component.submit();

    expect(loginService.login).toHaveBeenCalledWith('ana@x.com', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('mostra a mensagem do backend e libera o botão quando o login falha', () => {
    loginService.login.and.returnValue(
      throwError(() => ({ status: 401, message: 'E-mail ou senha inválidos' })),
    );
    component.form.setValue({ email: 'ana@x.com', password: 'errada1' });

    component.submit();
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(fixture.nativeElement.querySelector('.alert').textContent).toContain(
      'E-mail ou senha inválidos',
    );
  });

  it('oferece um link para recuperar a senha', () => {
    const link = fixture.nativeElement.querySelector('a.forgot') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/forgot-password');
  });
});
