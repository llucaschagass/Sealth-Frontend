import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { SessionService } from '../../core/session.service';
import { UserService } from '../../services/user.service';
import { ApiError } from '../../../types/api-error.type';
import { UpdateUserRequest } from '../../../types/user.type';

const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-config',
  imports: [ReactiveFormsModule, AppShellComponent, TextFieldComponent],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly session = inject(SessionService);

  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(MIN_PASSWORD_LENGTH)]],
  });

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  private current = { name: '', email: '' };

  ngOnInit(): void {
    this.userService.getUserData().subscribe({
      next: (user) => {
        this.current = { name: user.name, email: user.email };
        this.form.patchValue(this.current);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.formError.set(error.message);
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.success.set(null);
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const changes = this.pendingChanges();
    if (Object.keys(changes).length === 0) {
      this.formError.set('Nenhuma alteração para salvar.');
      return;
    }

    this.saving.set(true);
    this.userService.updateUserData(changes).subscribe({
      next: (user) => {
        this.current = { name: user.name, email: user.email };
        this.session.updateName(user.name);
        this.form.patchValue({ ...this.current, password: '' });
        this.form.markAsPristine();
        this.saving.set(false);
        this.success.set('Dados atualizados com sucesso!');
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }

  /** Apenas campos diferentes dos atuais são enviados; senha só quando preenchida. */
  private pendingChanges(): UpdateUserRequest {
    const { name, email, password } = this.form.getRawValue();
    const changes: UpdateUserRequest = {};
    if (name.trim() !== this.current.name) {
      changes.name = name.trim();
    }
    if (email.trim() !== this.current.email) {
      changes.email = email.trim();
    }
    if (password) {
      changes.password = password;
    }
    return changes;
  }
}
