import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { describeError } from '../../core/api-error';
import { SessionService } from '../../core/session.service';
import { UserService } from '../../services/user.service';
import { UpdateUserRequest } from '../../../types/user.type';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class ConfigComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  username = '';
  currentName = '';
  currentEmail = '';
  form = { name: '', email: '', password: '' };

  ngOnInit(): void {
    this.username = this.session.firstName;
    this.loadUser();
  }

  private loadUser(): void {
    this.userService.getUserData().subscribe({
      next: (user) => {
        this.currentName = user.name;
        this.currentEmail = user.email;
      },
      error: (error) => this.showError('Não foi possível obter os dados do usuário.', error),
    });
  }

  updateUser(): void {
    const changes = this.pendingChanges();
    if (Object.keys(changes).length === 0) {
      Swal.fire({
        title: 'Atenção',
        text: 'Preencha ao menos um campo com um valor diferente do atual.',
        icon: 'warning',
        confirmButtonColor: '#046B46',
      });
      return;
    }

    this.userService.updateUserData(changes).subscribe({
      next: () => {
        Swal.fire({
          title: 'Sucesso',
          text: 'Dados atualizados! Entre novamente para continuar.',
          icon: 'success',
          confirmButtonColor: '#046B46',
        }).then(() => this.session.logout());
      },
      error: (error) => this.showError('Não foi possível atualizar os dados do usuário.', error),
    });
  }

  /** Apenas campos preenchidos e diferentes dos atuais são enviados. */
  private pendingChanges(): UpdateUserRequest {
    const name = this.form.name.trim();
    const email = this.form.email.trim();
    const changes: UpdateUserRequest = {};
    if (name && name !== this.currentName) {
      changes.name = name;
    }
    if (email && email !== this.currentEmail) {
      changes.email = email;
    }
    if (this.form.password) {
      changes.password = this.form.password;
    }
    return changes;
  }

  private showError(fallback: string, error: unknown): void {
    Swal.fire({
      title: 'Erro',
      text: describeError(error, fallback),
      icon: 'error',
      confirmButtonColor: '#046B46',
    });
  }

  redirectToHome(): void {
    this.router.navigate(['/home']);
  }

  confirmLogout(): void {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Deseja realmente sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#046B46',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Certeza',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.session.logout();
      }
    });
  }
}
