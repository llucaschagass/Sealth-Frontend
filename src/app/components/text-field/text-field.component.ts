import { Component, Input, inject } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';

type FieldType = 'text' | 'email' | 'password';

let nextId = 0;

const ERROR_MESSAGES: Record<string, (error: unknown) => string> = {
  required: () => 'Campo obrigatório',
  email: () => 'Informe um e-mail válido',
  minlength: (error) =>
    `Mínimo de ${(error as { requiredLength: number }).requiredLength} caracteres`,
  mismatch: () => 'As senhas não coincidem',
  server: (error) => String(error),
};

/** Campo de texto acessível: label associada, erro anunciado e botão de mostrar senha. */
@Component({
  selector: 'app-text-field',
  standalone: true,
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
})
export class TextFieldComponent implements ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input() type: FieldType = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';

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
