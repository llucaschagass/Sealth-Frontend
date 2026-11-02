import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { MIN_PASSWORD_LENGTH, matchesPassword } from '../../core/validators';
import { LoginService } from '../../services/login.service';
import { ApiError } from '../../../types/api-error.type';

const INVALID_LINK = 'Link inválido ou expirado';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, TextFieldComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly loginService = inject(LoginService);

  /** Token do link recebido por e-mail (`?token=...`); ausente quando a página é aberta sem ele. */
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token')?.trim() ?? '';

  readonly form = inject(NonNullableFormBuilder).group({
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    passwordConfirm: ['', [Validators.required, matchesPassword]],
  });

  readonly loading = signal(false);
  readonly done = signal(false);
  /** Motivo pelo qual o link não pode ser usado; sem token, já começa assim. */
  readonly linkError = signal<string | null>(this.token ? null : INVALID_LINK);
  readonly formError = signal<string | null>(null);

  constructor() {
    this.form.controls.password.valueChanges.subscribe(() =>
      this.form.controls.passwordConfirm.updateValueAndValidity(),
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.formError.set(null);
    this.loginService.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (error: ApiError) => {
        this.loading.set(false);
        if (error.status === 400 && !error.fieldErrors) {
          // token inválido, expirado ou já usado: não adianta tentar de novo com este link
          this.linkError.set(error.message);
          return;
        }
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }
}
