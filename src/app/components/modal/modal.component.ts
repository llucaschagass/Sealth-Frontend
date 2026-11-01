import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

let nextId = 0;

/** Diálogo modal sobre o <dialog> nativo: foco preso, Esc fecha e clique fora fecha. */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input({ required: true }) heading!: string;
  /** Emitido sempre que o diálogo fecha (botão, Esc ou clique fora). */
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;

  readonly titleId = `modal-title-${nextId++}`;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  get isOpen(): boolean {
    return this.dialog.nativeElement.open;
  }

  onClick(event: MouseEvent): void {
    // o backdrop pertence ao próprio <dialog>, então event.target é ele quando o clique é fora do conteúdo
    if (event.target === this.dialog.nativeElement) {
      this.close();
    }
  }
}
