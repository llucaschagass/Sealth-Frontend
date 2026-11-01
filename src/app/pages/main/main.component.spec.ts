import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainComponent } from './main.component';
import { CONTACT, SERVICES } from './main-content';

describe('MainComponent', () => {
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MainComponent], providers: [provideRouter([])] });
    const fixture: ComponentFixture<MainComponent> = TestBed.createComponent(MainComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('tem um único h1 e um <main>', () => {
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.querySelector('main#conteudo')).not.toBeNull();
  });

  it('leva ao cadastro e ao login pelos botões principais', () => {
    const hrefs = Array.from(element.querySelectorAll<HTMLAnchorElement>('.hero__actions a')).map(
      (a) => a.getAttribute('href'),
    );

    expect(hrefs).toEqual(['/signup', '/login']);
  });

  it('cada link do menu aponta para uma seção que existe na página', () => {
    const fragments = Array.from(element.querySelectorAll<HTMLAnchorElement>('.topbar__nav a')).map(
      (a) => a.href.split('#')[1],
    );

    expect(fragments.length).toBe(3);
    for (const id of fragments) {
      expect(element.querySelector(`section#${id}`))
        .withContext(id)
        .not.toBeNull();
    }
  });

  it('lista todos os serviços', () => {
    expect(element.querySelectorAll('.service').length).toBe(SERVICES.length);
  });

  it('expõe o e-mail de contato como link mailto', () => {
    const link = element.querySelector<HTMLAnchorElement>('.contact a');

    expect(link?.getAttribute('href')).toBe(`mailto:${CONTACT.email}`);
  });
});
