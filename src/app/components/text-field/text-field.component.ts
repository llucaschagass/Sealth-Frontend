import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';

type FieldType = 'text' | 'email' | 'password' | 'date' | 'time' | 'number';

let nextId = 0;

const ERROR_MESSAGES: Record<string, (error: unknown) => string> = {
  required: () => 'Campo obrigatório',
  email: () => 'Informe um e-mail válido',
  minlength: (error) =>
    `Mínimo de ${(error as { requiredLength: number }).requiredLength} caracteres`,
  mismatch: () => 'As senhas não coincidem',
  times: () => 'Use horários HH:mm separados por vírgula (máximo de 12)',
  number: () => 'Informe um número',
  range: (error) => {
    const { min, max } = error as { min: number; max: number };
    return `Informe um valor entre ${min} e ${max}`;
  },
  server: (error) => String(error),
};

/** Campo de texto acessível: label associada, erro anunciado e botão de mostrar senha. */
@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
  // Lê o estado do NgControl (touched/dirty/errors), que não são signals: precisa de checagem Eager.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TextFieldComponent implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input() type: FieldType = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';
  /** Unidade exibida dentro do campo (ex.: kg, cm). */
  @Input() suffix = '';
  @Input() step: string | null = null;

  readonly id = `field-${nextId++}`;
  value = '';
  disabled = false;
  passwordVisible = false;

  private readonly control = inject(NgControl, { self: true, optional: true });
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  get inputType(): FieldType {
    return this.type === 'password' && this.passwordVisible ? 'text' : this.type;
  }

  /** Primeira mensagem de erro, exibida somente após o usuário interagir com o campo. */
  get errorMessage(): string | null {
    const control = this.control?.control;
    if (!control?.errors || !(control.touched || control.dirty)) {
      return null;
    }
    return this.firstMessage(control.errors);
  }

  onInput(event: Event): void {
    this.onChange((event.target as HTMLInputElement).value);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private firstMessage(errors: ValidationErrors): string {
    const [key, detail] = Object.entries(errors)[0];
    return ERROR_MESSAGES[key]?.(detail) ?? 'Valor inválido';
  }
}
