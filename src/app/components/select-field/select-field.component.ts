import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

let nextId = 0;

/** Lista de opções acessível (select nativo) com label associada; usa o valor como texto. */
@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
  // Lê o estado do NgControl (touched/dirty/errors), que não são signals: precisa de checagem Eager.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SelectFieldComponent implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) options!: readonly SelectOption[];

  readonly id = `select-${nextId++}`;
  readonly value = signal('');
  readonly disabled = signal(false);

  private readonly control = inject(NgControl, { self: true, optional: true });
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  /** Erro devolvido pelo servidor para este campo, exibido após o usuário interagir. */
  get errorMessage(): string | null {
    const control = this.control?.control;
    const server = control?.errors?.['server'];
    return server && (control.touched || control.dirty) ? String(server) : null;
  }

  onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
