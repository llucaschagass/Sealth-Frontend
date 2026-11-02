import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MIN_PASSWORD_LENGTH = 6;

/** Confirmação de senha: precisa ser igual ao campo `password` do mesmo formulário. */
export function matchesPassword(confirm: AbstractControl): ValidationErrors | null {
  return confirm.value === confirm.parent?.get('password')?.value ? null : { mismatch: true };
}

/** Valida um número (aceita vírgula decimal) dentro de um intervalo. Vazio é tratado por `required`. */
export function numberBetween(min: number, max: number): ValidatorFn {
  return (control) => {
    const raw = String(control.value ?? '').trim();
    if (raw === '') {
      return null;
    }
    const value = Number(raw.replace(',', '.'));
    if (Number.isNaN(value)) {
      return { number: true };
    }
    return value < min || value > max ? { range: { min, max } } : null;
  };
}
