import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';

/** Moldura das telas autenticadas: cabeçalho com marca, título da página e saída da conta. */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  @Input({ required: true }) title!: string;
  @ViewChild('logoutDialog', { static: true }) private logoutDialog!: ElementRef<HTMLDialogElement>;

  private readonly session = inject(SessionService);

  get firstName(): string {
    return this.session.firstName;
  }

  openLogout(): void {
    this.logoutDialog.nativeElement.showModal();
  }

  closeLogout(): void {
    this.logoutDialog.nativeElement.close();
  }

  confirmLogout(): void {
    this.closeLogout();
    this.session.logout();
  }

  /** Clique no backdrop (o próprio <dialog>) fecha o diálogo. */
  onDialogClick(event: MouseEvent): void {
    if (event.target === this.logoutDialog.nativeElement) {
      this.closeLogout();
    }
  }
}
