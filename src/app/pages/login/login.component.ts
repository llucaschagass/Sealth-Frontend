import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { SessionService } from '../../core/session.service';
import { LoginService } from '../../services/login.service';
import { ApiError } from '../../../types/api-error.type';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, TextFieldComponent],
  templateUrl: './login.component.html',
  styles: `
    .forgot {
      align-self: flex-end;
      font-size: var(--font-size-sm);
    }
  `,
})
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly loginService = inject(LoginService);

  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  formError: string | null = null;

  ngOnInit(): void {
    this.session.clear();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.formError = null;
    const { email, password } = this.form.getRawValue();
    this.loginService.login(email, password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error: ApiError) => {
        this.loading = false;
        this.formError = applyServerErrors(this.form, error);
      },
    });
  }
}
