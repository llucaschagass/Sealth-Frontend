import { Component, Input } from '@angular/core';

export type IconName =
  | 'calendar'
  | 'pill'
  | 'bell'
  | 'heart-pulse'
  | 'sliders'
  | 'info'
  | 'download'
  | 'user'
  | 'arrow-up-right'
  | 'external-link'
  | 'plus'
  | 'map-pin'
  | 'log-out';

/** Ícones de traço (24x24, estilo Lucide) que herdam a cor do texto e são decorativos. */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styles: `
    :host {
      display: inline-flex;
    }
    svg {
      width: var(--icon-size, 1.25em);
      height: var(--icon-size, 1.25em);
    }
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
}
