import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let component: SignupComponent;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: Router;

  const fill = (overrides: Partial<Record<string, string>> = {}) =>
    component.form.setValue({
      name: 'Maria Souza',
      email: 'maria@x.com',
      password: '123456',
      passwordConfirm: '123456',
      ...overrides,
    });

  beforeEach(() => {
    loginService = jasmine.createSpyObj<LoginService>('LoginService', ['signup']);
    TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [{ provide: LoginService, useValue: loginService }, provideRouter([])],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exige que a confirmação seja igual à senha', () => {
    fill({ passwordConfirm: '654321' });

    expect(component.form.controls.passwordConfirm.errors).toEqual({ mismatch: true });
  });

  it('revalida a confirmação quando a senha muda depois', () => {
    fill();
    component.form.controls.password.setValue('outra-senha');

    expect(component.form.controls.passwordConfirm.errors).toEqual({ mismatch: true });
  });

  it('não envia formulário inválido', () => {
    fill({ email: 'invalido' });

    component.submit();

    expect(loginService.signup).not.toHaveBeenCalled();
  });

  it('cadastra e vai direto para a home (o cadastro já inicia a sessão)', () => {
    loginService.signup.and.returnValue(of({ token: 't', id: '1', name: 'Maria Souza' }));
    fill();

    component.submit();

    expect(loginService.signup).toHaveBeenCalledWith('Maria Souza', 'maria@x.com', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('leva o erro de campo do backend para o campo certo', () => {
    loginService.signup.and.returnValue(
      throwError(() => ({
        status: 400,
        message: 'Dados inválidos',
        fieldErrors: { email: 'E-mail inválido' },
      })),
    );
    fill();

    component.submit();

    expect(component.form.controls.email.errors).toEqual({ server: 'E-mail inválido' });
    expect(component.formError).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('mostra a mensagem geral quando o e-mail já existe', () => {
    loginService.signup.and.returnValue(
      throwError(() => ({ status: 409, message: 'E-mail já cadastrado' })),
    );
    fill();

    component.submit();

    expect(component.formError).toBe('E-mail já cadastrado');
  });
});
