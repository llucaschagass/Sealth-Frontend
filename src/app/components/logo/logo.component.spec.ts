import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;
  const logo = (): HTMLElement => fixture.nativeElement.querySelector('.logo');

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoComponent);
  });

  it('tem nome acessível "Sealth" por padrão', () => {
    fixture.detectChanges();

    expect(logo().getAttribute('role')).toBe('img');
    expect(logo().getAttribute('aria-label')).toBe('Sealth');
  });

  it('fica oculta para leitores de tela quando decorativa', () => {
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();

    expect(logo().getAttribute('aria-hidden')).toBe('true');
    expect(logo().getAttribute('role')).toBeNull();
  });
});
