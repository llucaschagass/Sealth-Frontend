import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { UserService } from '../../services/user.service';
import { ConfigComponent } from './config.component';

describe('ConfigComponent', () => {
  let fixture: ComponentFixture<ConfigComponent>;
  let component: ConfigComponent;
  let userService: jasmine.SpyObj<UserService>;
  let session: jasmine.SpyObj<SessionService>;

  const user = { id: '1', name: 'Maria Souza', email: 'maria@x.com' };
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    userService = jasmine.createSpyObj<UserService>('UserService', [
      'getUserData',
      'updateUserData',
    ]);
    userService.getUserData.and.returnValue(of(user));
    session = jasmine.createSpyObj<SessionService>('SessionService', ['updateName', 'logout'], {
      firstName: 'Maria',
    });
    TestBed.configureTestingModule({
      imports: [ConfigComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: SessionService, useValue: session },
        provideRouter([]),
      ],
    });
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('preenche o formulário com os dados atuais do usuário', () => {
    expect(component.form.getRawValue()).toEqual({
      name: 'Maria Souza',
      email: 'maria@x.com',
      password: '',
    });
  });

  it('avisa quando não há nada para salvar e não chama a API', () => {
    component.submit();

    expect(userService.updateUserData).not.toHaveBeenCalled();
    expect(component.formError()).toBe('Nenhuma alteração para salvar.');
  });

  it('envia apenas os campos alterados', () => {
    userService.updateUserData.and.returnValue(of({ ...user, name: 'Maria S.' }));
    component.form.patchValue({ name: 'Maria S.' });

    component.submit();

    expect(userService.updateUserData).toHaveBeenCalledWith({ name: 'Maria S.' });
  });

  it('inclui a senha somente quando preenchida', () => {
    userService.updateUserData.and.returnValue(of(user));
    component.form.patchValue({ password: 'nova-senha' });

    component.submit();

    expect(userService.updateUserData).toHaveBeenCalledWith({ password: 'nova-senha' });
  });

  it('após salvar, atualiza o nome da sessão, limpa a senha e mantém o usuário logado', () => {
    userService.updateUserData.and.returnValue(of({ ...user, name: 'Maria S.' }));
    component.form.patchValue({ name: 'Maria S.', password: 'nova-senha' });

    component.submit();
    fixture.detectChanges();

    expect(session.updateName).toHaveBeenCalledWith('Maria S.');
    expect(session.logout).not.toHaveBeenCalled();
    expect(component.form.controls.password.value).toBe('');
    expect(element().querySelector('.alert--success')?.textContent).toContain('atualizados');
  });

  it('não envia formulário inválido e marca os campos', () => {
    component.form.patchValue({ email: 'invalido' });

    component.submit();

    expect(userService.updateUserData).not.toHaveBeenCalled();
    expect(component.form.controls.email.touched).toBeTrue();
  });

  it('mostra o conflito de e-mail devolvido pelo backend', () => {
    userService.updateUserData.and.returnValue(
      throwError(() => ({ status: 409, message: 'E-mail já cadastrado' })),
    );
    component.form.patchValue({ email: 'outra@x.com' });

    component.submit();
    fixture.detectChanges();

    expect(component.saving()).toBeFalse();
    expect(element().querySelector('.alert--danger')?.textContent).toContain(
      'E-mail já cadastrado',
    );
  });
});
