import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../../types/login-response.type';

const TOKEN_KEY = 'auth-token';
const USER_ID_KEY = 'user-id';
const USER_NAME_KEY = 'username';

/** Chaves de versões antigas que guardavam dados pessoais em localStorage. */
const LEGACY_LOCAL_KEYS = [
  'appointments',
  'healthDefaults',
  'medicinesPDFs',
  'user-name',
  'user-email',
];

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly router = inject(Router);

  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  get userId(): string | null {
    return sessionStorage.getItem(USER_ID_KEY);
  }

  get userName(): string {
    return sessionStorage.getItem(USER_NAME_KEY) ?? '';
  }

  get firstName(): string {
    return this.userName.split(' ')[0];
  }

  updateName(name: string): void {
    sessionStorage.setItem(USER_NAME_KEY, name);
  }

  start(session: LoginResponse): void {
    sessionStorage.setItem(TOKEN_KEY, session.token);
    sessionStorage.setItem(USER_ID_KEY, session.id);
    sessionStorage.setItem(USER_NAME_KEY, session.name);
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
    sessionStorage.removeItem(USER_NAME_KEY);
    LEGACY_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.token;
    return token !== null && !isTokenExpired(token);
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return exp !== undefined && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
