import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { InfoComponent } from './info.component';
import { INFO_ARTICLES } from './info-articles';

describe('InfoComponent', () => {
  let fixture: ComponentFixture<InfoComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoComponent],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
    fixture = TestBed.createComponent(InfoComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renderiza um cartão para cada artigo', () => {
    expect(element.querySelectorAll('.article').length).toBe(INFO_ARTICLES.length);
  });

  it('usa o título de cada artigo como cabeçalho do cartão', () => {
    const titles = Array.from(element.querySelectorAll('.article h2')).map((h) => h.textContent);

    expect(titles).toEqual(INFO_ARTICLES.map((a) => a.title));
  });

  it('abre links externos em nova aba sem expor o opener', () => {
    element.querySelectorAll<HTMLAnchorElement>('.article__link').forEach((link) => {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect(link.getAttribute('aria-label')).toContain('nova aba');
    });
  });

  it('carrega as imagens otimizadas em webp', () => {
    element.querySelectorAll<HTMLImageElement>('.article__image').forEach((img) => {
      expect(img.getAttribute('src')).toMatch(/^\/assets\/images\/info\/[a-z-]+\.webp$/);
    });
  });

  it('cada artigo tem URL https e imagem exclusiva', () => {
    expect(INFO_ARTICLES.every((a) => a.url.startsWith('https://'))).toBeTrue();
    expect(new Set(INFO_ARTICLES.map((a) => a.image)).size).toBe(INFO_ARTICLES.length);
  });
});
