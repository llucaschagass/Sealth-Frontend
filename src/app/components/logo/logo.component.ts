import { Component, Input } from '@angular/core';

/** Marca do Sealth em SVG. O tamanho acompanha o font-size do elemento pai. */
@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  /** Use `true` quando a marca já tem um nome acessível ao redor (ex.: dentro de um link rotulado). */
  @Input() decorative = false;
}
