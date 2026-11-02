import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TextFieldComponent } from './text-field.component';

@Component({
  // O host de teste muta propriedades planas; precisa de checagem Eager.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, TextFieldComponent],
  template: `<app-text-field [formControl]="control" [type]="type" label="E-mail" />`,
})
class HostComponent {
  type: 'text' | 'email' | 'password' = 'email';
  control = new FormControl('', [Validators.required, Validators.email]);
}

describe('TextFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const input = (): HTMLInputElement => fixture.debugElement.query(By.css('input')).nativeElement;
  const label = (): HTMLLabelElement => fixture.debugElement.query(By.css('label')).nativeElement;
  const error = (): HTMLElement | null => fixture.nativeElement.querySelector('.field__error');

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('associa a label ao input pelo id', () => {
    expect(label().htmlFor).toBe(input().id);
    expect(label().textContent).toContain('E-mail');
  });

  it('propaga o que o usuário digita para o controle', () => {
    input().value = 'a@a.com';
    input().dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('a@a.com');
  });

  it('exibe no input o valor definido no controle', () => {
    host.control.setValue('b@b.com');
    fixture.detectChanges();

    expect(input().value).toBe('b@b.com');
  });

  it('não mostra erro antes de o usuário interagir', () => {
    expect(error()).toBeNull();
  });

  it('mostra o erro ao sair do campo e o liga ao input por aria', () => {
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(error()?.textContent).toContain('Campo obrigatório');
    expect(error()?.getAttribute('role')).toBe('alert');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBe(error()?.id ?? null);
  });

  it('traduz erros de validação conhecidos', () => {
    host.control.setValue('invalido');
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()?.textContent).toContain('e-mail válido');
  });

  it('exibe erros vindos do servidor', () => {
    host.control.setErrors({ server: 'E-mail já cadastrado' });
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()?.textContent).toContain('E-mail já cadastrado');
  });

  it('traduz cada tipo de erro para uma mensagem em português', () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ minlength: { requiredLength: 6, actualLength: 2 } }, 'Mínimo de 6 caracteres'],
      [{ mismatch: true }, 'As senhas não coincidem'],
      [{ number: true }, 'Informe um número'],
      [{ future: true }, 'A data não pode ser futura'],
      [{ times: true }, 'Use horários HH:mm separados por vírgula'],
      [{ range: { min: 20, max: 400 } }, 'Informe um valor entre 20 e 400'],
      [{ algoNaoMapeado: true }, 'Valor inválido'],
    ];
    host.control.markAsTouched();

    for (const [errors, message] of cases) {
      host.control.setErrors(errors);
      fixture.detectChanges();

      expect(error()?.textContent).withContext(message).toContain(message);
    }
  });

  it('mostra o erro assim que o usuário altera o campo, mesmo sem sair dele', () => {
    host.control.setValue('x');
    host.control.markAsDirty();
    fixture.detectChanges();

    expect(error()).not.toBeNull();
  });

  it('trata valor nulo do controle como campo vazio', () => {
    host.control.setValue(null);
    fixture.detectChanges();

    expect(input().value).toBe('');
  });

  it('respeita o estado desabilitado do controle', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(input().disabled).toBeTrue();
  });

  it('alterna a visibilidade da senha', () => {
    host.type = 'password';
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.field__toggle'));

    expect(input().type).toBe('password');
    toggle.nativeElement.click();
    fixture.detectChanges();

    expect(input().type).toBe('text');
    expect(toggle.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });

  it('não mostra o botão de senha em campos de texto', () => {
    expect(fixture.nativeElement.querySelector('.field__toggle')).toBeNull();
  });
});
