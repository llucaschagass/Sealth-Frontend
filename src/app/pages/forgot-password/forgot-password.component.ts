import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { LoginService } from '../../services/login.service';
import { ApiError } from '../../../types/api-error.type';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, TextFieldComponent],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly loginService = inject(LoginService);

  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);
  readonly formError = signal<string | null>(null);
  /** E-mail para o qual o pedido foi enviado; preenchido quando o backend confirma o recebimento. */
  readonly sentTo = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.formError.set(null);
    const { email } = this.form.getRawValue();
    this.loginService.forgotPassword(email.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.sentTo.set(email.trim());
      },
      error: (error: ApiError) => {
        this.loading.set(false);
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }

  /** Volta ao formulário para tentar outro e-mail. */
  retry(): void {
    this.sentTo.set(null);
  }
}
