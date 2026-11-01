import { AbstractControl, FormGroup } from '@angular/forms';
import { ApiError } from '../../types/api-error.type';

/**
 * Leva os erros por campo do backend para os controles do formulário.
 * Retorna a mensagem geral quando não há erro de campo para exibir.
 */
export function applyServerErrors(form: FormGroup, error: ApiError): string | null {
  let applied = false;
  for (const [field, message] of Object.entries(error.fieldErrors ?? {})) {
    const control: AbstractControl | null = form.get(field);
    if (control) {
      control.setErrors({ server: message });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied ? null : error.message;
}
