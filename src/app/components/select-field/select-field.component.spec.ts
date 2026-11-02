import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SelectFieldComponent, SelectOption } from './select-field.component';

const OPTIONS: SelectOption[] = [
  { value: '', label: 'Nenhum' },
  { value: '10', label: 'Dez' },
  { value: '20', label: 'Vinte' },
];

@Component({
  imports: [ReactiveFormsModule, SelectFieldComponent],
  template: `<app-select-field [formControl]="control" [options]="options" label="Valor" />`,
})
class HostComponent {
  options = OPTIONS;
  control = new FormControl('10');
}

describe('SelectFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const select = (): HTMLSelectElement =>
    fixture.debugElement.query(By.css('select')).nativeElement;
  const label = (): HTMLLabelElement => fixture.debugElement.query(By.css('label')).nativeElement;
  const error = (): HTMLElement | null => fixture.nativeElement.querySelector('.field__error');

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('associa a label ao select e lista as opções', () => {
    expect(label().htmlFor).toBe(select().id);
    expect(label().textContent).toContain('Valor');
    expect(Array.from(select().options).map((o) => o.text.trim())).toEqual([
      'Nenhum',
      'Dez',
      'Vinte',
    ]);
  });

  it('seleciona a opção correspondente ao valor do controle', () => {
    expect(select().value).toBe('10');

    host.control.setValue('20');
    fixture.detectChanges();

    expect(select().value).toBe('20');

    host.control.setValue(null);
    fixture.detectChanges();

    expect(select().value).toBe('');
  });

  it('propaga a escolha do usuário para o controle', () => {
    select().value = '20';
    select().dispatchEvent(new Event('change'));

    expect(host.control.value).toBe('20');
  });

  it('marca o controle como tocado ao sair do campo', () => {
    select().dispatchEvent(new Event('blur'));

    expect(host.control.touched).toBeTrue();
  });

  it('respeita o estado desabilitado', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(select().disabled).toBeTrue();
  });

  it('pede uma escolha quando o campo é obrigatório e está vazio', () => {
    host.control.setErrors({ required: true });
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()?.textContent).toContain('Selecione uma opção');
  });

  it('ignora erros desconhecidos', () => {
    host.control.setErrors({ outro: true });
    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()).toBeNull();
  });

  it('exibe o erro do servidor somente após interação e o liga por aria', () => {
    host.control.setErrors({ server: 'Valor recusado' });
    fixture.detectChanges();
    expect(error()).toBeNull();

    host.control.markAsTouched();
    fixture.detectChanges();

    expect(error()?.textContent).toContain('Valor recusado');
    expect(select().getAttribute('aria-invalid')).toBe('true');
    expect(select().getAttribute('aria-describedby')).toBe(error()?.id ?? null);
  });
});
