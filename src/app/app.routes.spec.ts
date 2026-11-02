import { Route } from '@angular/router';
import { routes } from './app.routes';
import { authGuard } from './core/auth.guard';

const PROTECTED = ['home', 'info', 'config', 'health', 'appointment', 'medicines', 'vaccines'];
const PUBLIC = ['', 'login', 'signup', 'forgot-password', 'reset-password'];

const byPath = (path: string): Route => routes.find((r) => r.path === path)!;

describe('routes', () => {
  it('declara exatamente as páginas esperadas, mais a rota coringa', () => {
    const paths = routes.map((r) => r.path);

    expect(paths).toEqual([...PUBLIC, ...PROTECTED, '**']);
  });

  it('protege com authGuard todas as páginas autenticadas', () => {
    for (const path of PROTECTED) {
      expect(byPath(path).canActivate).withContext(path).toEqual([authGuard]);
    }
  });

  it('deixa as páginas públicas sem guard', () => {
    for (const path of PUBLIC) {
      expect(byPath(path).canActivate).withContext(`"${path}"`).toBeUndefined();
    }
  });

  it('dá um título a cada página', () => {
    for (const route of routes.filter((r) => r.path !== '**')) {
      expect(route.title)
        .withContext(`"${route.path}"`)
        .toMatch(/Sealth/);
    }
  });

  it('carrega cada página sob demanda (lazy loading)', async () => {
    for (const route of routes.filter((r) => r.loadComponent)) {
      const loaded = await (route.loadComponent as () => Promise<unknown>)();

      expect(loaded).withContext(`"${route.path}"`).toBeTruthy();
    }
  });

  it('envia rotas desconhecidas para a página inicial', () => {
    expect(byPath('**').redirectTo).toBe('');
  });
});
