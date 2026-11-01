import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `<app-modal heading="Título de teste" (closed)="closedCount = closedCount + 1">
    <button type="button">Dentro</button>
  </app-modal>`,
})
class HostComponent {
  @ViewChild(ModalComponent, { static: true }) modal!: ModalComponent;
  closedCount = 0;
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const dialog = (): HTMLDialogElement => fixture.nativeElement.querySelector('dialog');

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('começa fechado e usa o título como nome acessível', () => {
    expect(dialog().open).toBeFalse();
    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toContain('Título de teste');
    expect(dialog().getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('abre e fecha de forma programática', () => {
    host.modal.open();
    expect(dialog().open).toBeTrue();
    expect(host.modal.isOpen).toBeTrue();

    host.modal.close();
    expect(dialog().open).toBeFalse();
  });

  it('avisa o pai quando fecha', async () => {
    host.modal.open();
    // o evento "close" do <dialog> é disparado de forma assíncrona pelo navegador
    const closed = new Promise((resolve) =>
      dialog().addEventListener('close', resolve, { once: true }),
    );

    host.modal.close();
    await closed;

    expect(host.closedCount).toBe(1);
  });

  it('fecha ao clicar no backdrop, mas não ao clicar no conteúdo', () => {
    host.modal.open();

    fixture.nativeElement.querySelector('button').click();
    expect(dialog().open).toBeTrue();

    dialog().click();
    expect(dialog().open).toBeFalse();
  });
});
