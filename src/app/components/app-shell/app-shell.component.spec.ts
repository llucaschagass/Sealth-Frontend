import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let session: jasmine.SpyObj<SessionService>;

  const dialog = (): HTMLDialogElement => fixture.nativeElement.querySelector('dialog');
  const button = (text: string): HTMLButtonElement =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === text,
    )!;

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionService>('SessionService', ['logout'], {
      firstName: 'Maria',
    });
    TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [{ provide: SessionService, useValue: session }, provideRouter([])],
    });
    fixture = TestBed.createComponent(AppShellComponent);
    fixture.componentRef.setInput('title', 'Minhas Consultas');
    fixture.detectChanges();
  });

  it('exibe o título da página e o nome do usuário', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Minhas Consultas');
    expect(fixture.nativeElement.querySelector('.shell__greeting').textContent).toContain('Maria');
  });

  it('oferece um <main> e um link para pular ao conteúdo', () => {
    expect(fixture.nativeElement.querySelector('main#main-content')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.skip-link').getAttribute('href')).toBe(
      '#main-content',
    );
  });

  it('abre o diálogo de confirmação ao clicar em Sair, sem encerrar a sessão', () => {
    button('Sair').click();

    expect(dialog().open).toBeTrue();
    expect(session.logout).not.toHaveBeenCalled();
  });

  it('cancelar fecha o diálogo e mantém a sessão', () => {
    button('Sair').click();
    button('Cancelar').click();

    expect(dialog().open).toBeFalse();
    expect(session.logout).not.toHaveBeenCalled();
  });

  it('confirmar encerra a sessão', () => {
    button('Sair').click();
    const confirm = dialog().querySelectorAll('button')[1] as HTMLButtonElement;
    confirm.click();

    expect(dialog().open).toBeFalse();
    expect(session.logout).toHaveBeenCalled();
  });
});
