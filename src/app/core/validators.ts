import { ValidatorFn } from '@angular/forms';

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
