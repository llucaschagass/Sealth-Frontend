import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { HomeComponent } from './home.component';
import { HOME_SECTIONS } from './home-sections';
import { routes } from '../../app.routes';

describe('HomeComponent', () => {
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('cumprimenta o usuário pelo primeiro nome', () => {
    expect(element.querySelector('.welcome h2')?.textContent).toContain('Olá, Ana!');
  });

  it('oferece um link real para cada seção', () => {
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a.tile'));

    expect(links.map((a) => a.getAttribute('href'))).toEqual(HOME_SECTIONS.map((s) => s.path));
  });

  it('todas as seções apontam para rotas existentes e protegidas', () => {
    const paths = routes.map((r) => `/${r.path}`);

    for (const section of HOME_SECTIONS) {
      expect(paths).withContext(section.path).toContain(section.path);
    }
  });
});
