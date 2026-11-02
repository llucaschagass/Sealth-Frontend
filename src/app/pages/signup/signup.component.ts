import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { LoginService } from '../../services/login.service';
import { ApiError } from '../../../types/api-error.type';

const MIN_PASSWORD_LENGTH = 6;

function matchesPassword(confirm: AbstractControl): ValidationErrors | null {
  return confirm.value === confirm.parent?.get('password')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, TextFieldComponent],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    passwordConfirm: ['', [Validators.required, matchesPassword]],
  });

  loading = false;
  formError: string | null = null;

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

    this.loading = true;
    this.formError = null;
    const { name, email, password } = this.form.getRawValue();
    this.loginService.signup(name, email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error: ApiError) => {
        this.loading = false;
        this.formError = applyServerErrors(this.form, error);
      },
    });
  }
}
