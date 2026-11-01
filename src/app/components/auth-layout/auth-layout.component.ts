import { Component, Input } from '@angular/core';

/** Layout das telas públicas de autenticação: formulário à esquerda e painel de destaque à direita. */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
