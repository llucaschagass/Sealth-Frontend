import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  let service: jasmine.SpyObj<LoginService>;
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    service = jasmine.createSpyObj<LoginService>('LoginService', ['forgotPassword']);
    TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [{ provide: LoginService, useValue: service }, provideRouter([])],
    });
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('não envia e marca os campos quando o e-mail é inválido', () => {
    component.form.setValue({ email: 'invalido' });

    component.submit();

    expect(service.forgotPassword).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBeTrue();
  });

  it('envia o e-mail e mostra a confirmação, sem revelar se a conta existe', () => {
    service.forgotPassword.and.returnValue(of({ message: 'ok' }));
    component.form.setValue({ email: 'ana@x.com' });

    component.submit();
    fixture.detectChanges();

    expect(service.forgotPassword).toHaveBeenCalledWith('ana@x.com');
    expect(component.loading()).toBeFalse();
    expect(element().querySelector('form')).toBeNull();
    const status = element().querySelector('[role=status]')?.textContent;
    expect(status).toContain('Se ana@x.com estiver cadastrado');
    expect(status).toContain('30 minutos');
  });

  it('permite voltar ao formulário para tentar outro e-mail', () => {
    service.forgotPassword.and.returnValue(of({ message: 'ok' }));
    component.form.setValue({ email: 'ana@x.com' });
    component.submit();
    fixture.detectChanges();

    element().querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();

    expect(component.sentTo()).toBeNull();
    expect(element().querySelector('form')).not.toBeNull();
  });

  it('mostra o erro e libera o botão quando o envio falha', () => {
    service.forgotPassword.and.returnValue(
      throwError(() => ({ status: 0, message: 'Não foi possível conectar ao servidor.' })),
    );
    component.form.setValue({ email: 'ana@x.com' });

    component.submit();
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(element().querySelector('.alert--danger')?.textContent).toContain(
      'conectar ao servidor',
    );
    expect(element().querySelector('form')).not.toBeNull();
  });

  it('leva o erro de campo do backend para o formulário', () => {
    service.forgotPassword.and.returnValue(
      throwError(() => ({
        status: 400,
        message: 'Dados inválidos',
        fieldErrors: { email: 'E-mail inválido' },
      })),
    );
    component.form.setValue({ email: 'ana@x.com' });

    component.submit();

    expect(component.form.controls.email.errors).toEqual({ server: 'E-mail inválido' });
    expect(component.formError()).toBeNull();
  });

  it('oferece o caminho de volta para o login', () => {
    const link = element().querySelector('a[href="/login"]');

    expect(link).not.toBeNull();
  });
});
