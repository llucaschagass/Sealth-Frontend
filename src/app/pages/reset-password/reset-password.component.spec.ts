import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let component: ResetPasswordComponent;
  let service: jasmine.SpyObj<LoginService>;
  const element = (): HTMLElement => fixture.nativeElement;

  const create = (token: string | null = 'tok-123') => {
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: LoginService, useValue: service },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(token === null ? {} : { token }) },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<LoginService>('LoginService', ['resetPassword']);
  });

  describe('sem token no link', () => {
    it('mostra o link inválido e leva a pedir um novo, sem exibir o formulário', () => {
      create(null);

      expect(element().querySelector('form')).toBeNull();
      expect(element().querySelector('.alert--danger')?.textContent).toContain(
        'Link inválido ou expirado',
      );
      expect(element().querySelector('a[href="/forgot-password"]')).not.toBeNull();
    });

    it('trata token em branco como ausente', () => {
      create('   ');

      expect(component.linkError()).toBe('Link inválido ou expirado');
    });
  });

  describe('com token', () => {
    beforeEach(() => create());

    it('mostra o formulário de nova senha', () => {
      expect(element().querySelector('form')).not.toBeNull();
      expect(component.linkError()).toBeNull();
    });

    it('não envia senha curta nem confirmação diferente', () => {
      component.form.setValue({ password: '123', passwordConfirm: '123' });
      component.submit();
      expect(component.form.controls.password.errors?.['minlength']).toBeDefined();

      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'outra-coisa' });
      component.submit();
      expect(component.form.controls.passwordConfirm.errors).toEqual({ mismatch: true });

      expect(service.resetPassword).not.toHaveBeenCalled();
      expect(component.form.controls.password.touched).toBeTrue();
    });

    it('revalida a confirmação quando a senha muda', () => {
      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'nova-senha' });
      expect(component.form.controls.passwordConfirm.errors).toBeNull();

      component.form.controls.password.setValue('mudou-senha');

      expect(component.form.controls.passwordConfirm.errors).toEqual({ mismatch: true });
    });

    it('envia o token do link com a nova senha e confirma o sucesso', () => {
      service.resetPassword.and.returnValue(of({ message: 'ok' }));
      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'nova-senha' });

      component.submit();
      fixture.detectChanges();

      expect(service.resetPassword).toHaveBeenCalledWith('tok-123', 'nova-senha');
      expect(component.loading()).toBeFalse();
      expect(element().querySelector('form')).toBeNull();
      expect(element().querySelector('[role=status]')?.textContent).toContain(
        'Senha redefinida com sucesso',
      );
      expect(element().querySelector('a[href="/login"].btn')).not.toBeNull();
    });

    it('troca o formulário pelo pedido de novo link quando o token é recusado', () => {
      service.resetPassword.and.returnValue(
        throwError(() => ({ status: 400, message: 'Link inválido ou expirado' })),
      );
      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'nova-senha' });

      component.submit();
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(element().querySelector('form')).toBeNull();
      expect(element().querySelector('.alert--danger')?.textContent).toContain(
        'Link inválido ou expirado',
      );
      expect(element().querySelector('a[href="/forgot-password"]')).not.toBeNull();
    });

    it('leva o erro de senha do backend para o campo e mantém o formulário', () => {
      service.resetPassword.and.returnValue(
        throwError(() => ({
          status: 400,
          message: 'Dados inválidos',
          fieldErrors: { password: 'A senha deve ter no mínimo 6 caracteres' },
        })),
      );
      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'nova-senha' });

      component.submit();
      fixture.detectChanges();

      expect(component.form.controls.password.errors).toEqual({
        server: 'A senha deve ter no mínimo 6 caracteres',
      });
      expect(component.linkError()).toBeNull();
      expect(element().querySelector('form')).not.toBeNull();
    });

    it('mostra o erro de conexão e mantém o formulário para tentar de novo', () => {
      service.resetPassword.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      component.form.setValue({ password: 'nova-senha', passwordConfirm: 'nova-senha' });

      component.submit();
      fixture.detectChanges();

      expect(component.formError()).toBe('Sem conexão.');
      expect(component.linkError()).toBeNull();
      expect(element().querySelector('form')).not.toBeNull();
    });
  });
});
