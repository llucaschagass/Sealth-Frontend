import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent, IconName } from './icon.component';

const ALL_ICONS: IconName[] = [
  'calendar',
  'pill',
  'bell',
  'heart-pulse',
  'sliders',
  'info',
  'download',
  'user',
  'arrow-up-right',
  'external-link',
];

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
  });

  it('desenha pelo menos um traço para cada ícone disponível', () => {
    for (const name of ALL_ICONS) {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();

      const shapes = fixture.nativeElement.querySelectorAll('path, rect, circle');
      expect(shapes.length).withContext(name).toBeGreaterThan(0);
    }
  });

  it('é decorativo para tecnologias assistivas', () => {
    fixture.componentRef.setInput('name', 'calendar');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });
});
