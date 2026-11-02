import { Component, Input, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { LogoComponent } from '../logo/logo.component';
import { ModalComponent } from '../modal/modal.component';

/** Moldura das telas autenticadas: cabeçalho com marca, título da página e saída da conta. */
@Component({
  selector: 'app-shell',
  imports: [RouterLink, LogoComponent, ModalComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  @Input({ required: true }) title!: string;
  @ViewChild('logoutModal', { static: true }) private logoutModal!: ModalComponent;

  private readonly session = inject(SessionService);

  get firstName(): string {
    return this.session.firstName;
  }

  openLogout(): void {
    this.logoutModal.open();
  }

  closeLogout(): void {
    this.logoutModal.close();
  }

  confirmLogout(): void {
    this.closeLogout();
    this.session.logout();
  }
}
